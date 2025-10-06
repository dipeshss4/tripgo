#!/bin/bash

# =======================================================
# TripGo VPS Production Deployment Script
# Optimized for small to medium VPS instances
# =======================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="tripgo"
COMPOSE_FILE="docker-compose.vps.yml"
ENV_FILE=".env.production"
BACKUP_DIR="./backups"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Banner
show_banner() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                    TripGo VPS Deployment                       ║"
    echo "║                   Production Ready Setup                       ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check system requirements
check_system_requirements() {
    log_step "Checking system requirements..."

    # Check available memory
    AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')

    log_info "Available memory: ${AVAILABLE_MEM}MB / Total: ${TOTAL_MEM}MB"

    if [ "$TOTAL_MEM" -lt 1024 ]; then
        log_warning "System has less than 1GB RAM. Performance may be limited."
        log_warning "Consider upgrading to a VPS with at least 2GB RAM for optimal performance."
    fi

    # Check available disk space
    AVAILABLE_DISK=$(df -h . | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "${AVAILABLE_DISK%.*}" -lt 5 ]; then
        log_error "Less than 5GB disk space available. Please free up disk space."
        exit 1
    fi

    log_success "System requirements check passed"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root for security reasons"
        log_info "Please run as a regular user with sudo privileges"
        exit 1
    fi
}

# Install prerequisites
install_prerequisites() {
    log_step "Installing prerequisites..."

    # Update system packages
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y curl wget git openssl
    elif command -v yum &> /dev/null; then
        sudo yum update -y
        sudo yum install -y curl wget git openssl
    fi

    # Install Docker if not present
    if ! command -v docker &> /dev/null; then
        log_info "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        log_success "Docker installed"
    else
        log_info "Docker already installed"
    fi

    # Install Docker Compose if not present
    if ! command -v docker-compose &> /dev/null; then
        log_info "Installing Docker Compose..."
        DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep tag_name | cut -d '"' -f 4)
        sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        log_success "Docker Compose installed"
    else
        log_info "Docker Compose already installed"
    fi

    # Verify installations
    docker --version
    docker-compose --version

    log_success "Prerequisites installed successfully"
}

# Setup environment
setup_environment() {
    log_step "Setting up environment..."

    cd "$PROJECT_DIR"

    # Check if environment file exists
    if [[ ! -f "$ENV_FILE" ]]; then
        if [[ -f ".env.production.example" ]]; then
            cp .env.production.example "$ENV_FILE"
            log_warning "Created $ENV_FILE from example. Please edit it with your actual values."
        else
            log_error "Environment file $ENV_FILE not found and no example available."
            exit 1
        fi
    fi

    # Create necessary directories
    mkdir -p logs uploads backups nginx/ssl monitoring

    log_success "Environment setup completed"
}

# Generate SSL certificates
setup_ssl() {
    log_step "Setting up SSL certificates..."

    cd "$PROJECT_DIR"

    if [[ ! -f "nginx/ssl/cert.pem" ]] || [[ ! -f "nginx/ssl/private.key" ]]; then
        read -p "Do you want to use Let's Encrypt for SSL certificates? (y/n): " use_letsencrypt

        if [[ $use_letsencrypt == "y" || $use_letsencrypt == "Y" ]]; then
            read -p "Enter your domain name: " domain_name
            read -p "Enter your email address: " email_address

            # Install certbot
            if ! command -v certbot &> /dev/null; then
                if command -v apt-get &> /dev/null; then
                    sudo apt-get install -y certbot
                elif command -v yum &> /dev/null; then
                    sudo yum install -y certbot
                fi
            fi

            # Get Let's Encrypt certificate
            sudo certbot certonly --standalone -d "$domain_name" --email "$email_address" --agree-tos --non-interactive

            # Copy certificates
            sudo cp "/etc/letsencrypt/live/$domain_name/fullchain.pem" nginx/ssl/cert.pem
            sudo cp "/etc/letsencrypt/live/$domain_name/privkey.pem" nginx/ssl/private.key
            sudo chown $USER:$USER nginx/ssl/*

            log_success "Let's Encrypt certificate installed"
        else
            # Generate self-signed certificate
            log_info "Generating self-signed SSL certificate..."

            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout nginx/ssl/private.key \
                -out nginx/ssl/cert.pem \
                -subj "/C=US/ST=State/L=City/O=TripGo/CN=localhost" \
                2>/dev/null

            chmod 600 nginx/ssl/private.key
            chmod 644 nginx/ssl/cert.pem

            log_success "Self-signed certificate generated"
        fi
    else
        log_info "SSL certificates already exist"
    fi
}

# Configure firewall
setup_firewall() {
    log_step "Configuring firewall..."

    if command -v ufw &> /dev/null; then
        # Configure UFW firewall
        sudo ufw --force enable
        sudo ufw default deny incoming
        sudo ufw default allow outgoing
        sudo ufw allow ssh
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp

        log_success "UFW firewall configured"
    elif command -v firewall-cmd &> /dev/null; then
        # Configure firewalld
        sudo systemctl enable firewalld
        sudo systemctl start firewalld
        sudo firewall-cmd --permanent --add-service=ssh
        sudo firewall-cmd --permanent --add-service=http
        sudo firewall-cmd --permanent --add-service=https
        sudo firewall-cmd --reload

        log_success "Firewalld configured"
    else
        log_warning "No firewall tool found. Please configure firewall manually."
    fi
}

# Optimize system for containers
optimize_system() {
    log_step "Optimizing system for containers..."

    # Increase file limits
    echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
    echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

    # Optimize kernel parameters
    echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
    echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
    echo "net.core.somaxconn=1024" | sudo tee -a /etc/sysctl.conf

    sudo sysctl -p

    log_success "System optimization completed"
}

# Backup existing data
backup_data() {
    if docker-compose -f "$COMPOSE_FILE" ps postgres 2>/dev/null | grep -q "Up"; then
        log_step "Creating database backup..."

        BACKUP_FILE="$BACKUP_DIR/tripgo_backup_$(date +%Y%m%d_%H%M%S).sql"

        docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump \
            -U "${POSTGRES_USER:-tripgo}" \
            -d "${POSTGRES_DB:-tripgo}" > "$BACKUP_FILE" 2>/dev/null || true

        if [[ -f "$BACKUP_FILE" ]] && [[ -s "$BACKUP_FILE" ]]; then
            gzip "$BACKUP_FILE"
            log_success "Database backup created: ${BACKUP_FILE}.gz"
        else
            log_info "No existing database to backup"
        fi
    fi
}

# Deploy application
deploy_application() {
    log_step "Deploying TripGo application..."

    cd "$PROJECT_DIR"

    # Load environment variables
    export $(grep -v '^#' "$ENV_FILE" | xargs)

    # Stop existing services
    docker-compose -f "$COMPOSE_FILE" down 2>/dev/null || true

    # Pull latest images
    log_info "Pulling latest images..."
    docker-compose -f "$COMPOSE_FILE" pull

    # Build backend
    log_info "Building backend application..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache backend

    # Start core services first
    log_info "Starting database and cache..."
    docker-compose -f "$COMPOSE_FILE" up -d postgres redis

    # Wait for database to be ready
    log_info "Waiting for database to be ready..."
    timeout=60
    while ! docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U "${POSTGRES_USER:-tripgo}" >/dev/null 2>&1; do
        timeout=$((timeout - 1))
        if [[ $timeout -le 0 ]]; then
            log_error "Database startup timeout"
            exit 1
        fi
        sleep 1
        echo -n "."
    done
    echo

    # Run database migrations
    log_info "Running database migrations..."
    docker-compose -f "$COMPOSE_FILE" up -d backend
    sleep 10
    docker-compose -f "$COMPOSE_FILE" exec -T backend npx prisma migrate deploy || log_warning "Migration failed or no migrations to run"

    # Start all services
    log_info "Starting all services..."
    docker-compose -f "$COMPOSE_FILE" up -d

    log_success "Application deployed successfully"
}

# Health checks
perform_health_checks() {
    log_step "Performing health checks..."

    sleep 30  # Give services time to start

    # Check if containers are running
    if ! docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        log_error "Some containers are not running"
        docker-compose -f "$COMPOSE_FILE" ps
        return 1
    fi

    # Check API health
    log_info "Checking API health..."
    for i in {1..30}; do
        if curl -k -f https://localhost/health >/dev/null 2>&1 || curl -f http://localhost/health >/dev/null 2>&1; then
            log_success "API health check passed"
            break
        fi
        if [[ $i -eq 30 ]]; then
            log_error "API health check failed"
            return 1
        fi
        sleep 2
    done

    # Check database connectivity
    if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U "${POSTGRES_USER:-tripgo}" >/dev/null 2>&1; then
        log_success "Database connectivity check passed"
    else
        log_error "Database connectivity check failed"
        return 1
    fi

    # Check Redis connectivity
    if docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping >/dev/null 2>&1; then
        log_success "Redis connectivity check passed"
    else
        log_error "Redis connectivity check failed"
        return 1
    fi

    log_success "All health checks passed"
}

# Setup monitoring (optional)
setup_monitoring() {
    read -p "Do you want to enable monitoring (Prometheus/Grafana)? (y/n): " enable_monitoring

    if [[ $enable_monitoring == "y" || $enable_monitoring == "Y" ]]; then
        log_step "Setting up monitoring..."

        docker-compose -f "$COMPOSE_FILE" --profile monitoring up -d

        log_success "Monitoring enabled"
        log_info "Grafana will be available at: http://your-server-ip:3001"
        log_info "Prometheus will be available at: http://your-server-ip:9090"
    fi
}

# Cleanup
cleanup_system() {
    log_step "Cleaning up system..."

    # Remove unused Docker images
    docker image prune -f >/dev/null 2>&1 || true

    # Clean package cache
    if command -v apt-get &> /dev/null; then
        sudo apt-get autoremove -y >/dev/null 2>&1 || true
        sudo apt-get autoclean >/dev/null 2>&1 || true
    elif command -v yum &> /dev/null; then
        sudo yum autoremove -y >/dev/null 2>&1 || true
        sudo yum clean all >/dev/null 2>&1 || true
    fi

    log_success "System cleanup completed"
}

# Show deployment summary
show_deployment_info() {
    log_success "🎉 TripGo deployment completed successfully!"
    echo
    echo -e "${CYAN}📊 Deployment Summary:${NC}"
    echo "================================"
    echo "🌐 API Base URL: https://your-domain.com/api"
    echo "📚 API Documentation: https://your-domain.com/api/docs"
    echo "🔍 Health Check: https://your-domain.com/health"
    echo "📁 File Uploads: https://your-domain.com/uploads/"
    echo
    echo -e "${CYAN}🔧 Management Commands:${NC}"
    echo "================================"
    echo "View logs:     docker-compose -f $COMPOSE_FILE logs -f [service]"
    echo "Restart:       docker-compose -f $COMPOSE_FILE restart [service]"
    echo "Stop all:      docker-compose -f $COMPOSE_FILE down"
    echo "Update:        $0 update"
    echo "Backup:        $0 backup"
    echo "Health check:  $0 health"
    echo
    echo -e "${CYAN}📂 Important Directories:${NC}"
    echo "================================"
    echo "Logs:          ./logs/"
    echo "Uploads:       ./uploads/"
    echo "Backups:       ./backups/"
    echo "SSL Certs:     ./nginx/ssl/"
    echo
    echo -e "${CYAN}🔐 Security Notes:${NC}"
    echo "================================"
    echo "• Update passwords in $ENV_FILE"
    echo "• Consider setting up automated backups"
    echo "• Monitor logs regularly"
    echo "• Keep SSL certificates updated"
    echo
    echo -e "${GREEN}✅ TripGo is now running in production mode!${NC}"
}

# Main deployment function
deploy_full() {
    show_banner
    check_root
    check_system_requirements
    install_prerequisites
    setup_environment
    setup_ssl
    setup_firewall
    optimize_system
    backup_data
    deploy_application
    perform_health_checks
    setup_monitoring
    cleanup_system
    show_deployment_info
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        deploy_full
        ;;
    "quick")
        log_info "Quick deployment (skipping system setup)..."
        cd "$PROJECT_DIR"
        setup_environment
        backup_data
        deploy_application
        perform_health_checks
        show_deployment_info
        ;;
    "update")
        log_info "Updating application..."
        cd "$PROJECT_DIR"
        backup_data
        docker-compose -f "$COMPOSE_FILE" pull
        docker-compose -f "$COMPOSE_FILE" build --no-cache backend
        docker-compose -f "$COMPOSE_FILE" up -d
        perform_health_checks
        log_success "Application updated successfully"
        ;;
    "backup")
        cd "$PROJECT_DIR"
        backup_data
        ;;
    "health")
        cd "$PROJECT_DIR"
        perform_health_checks
        ;;
    "logs")
        cd "$PROJECT_DIR"
        docker-compose -f "$COMPOSE_FILE" logs -f "${2:-}"
        ;;
    "restart")
        cd "$PROJECT_DIR"
        docker-compose -f "$COMPOSE_FILE" restart "${2:-}"
        log_success "Service(s) restarted"
        ;;
    "stop")
        cd "$PROJECT_DIR"
        docker-compose -f "$COMPOSE_FILE" down
        log_success "All services stopped"
        ;;
    "ssl")
        cd "$PROJECT_DIR"
        setup_ssl
        docker-compose -f "$COMPOSE_FILE" restart nginx
        ;;
    "monitoring")
        cd "$PROJECT_DIR"
        docker-compose -f "$COMPOSE_FILE" --profile monitoring up -d
        log_success "Monitoring services started"
        ;;
    *)
        echo "Usage: $0 {deploy|quick|update|backup|health|logs|restart|stop|ssl|monitoring}"
        echo ""
        echo "Commands:"
        echo "  deploy     - Full production deployment with system setup"
        echo "  quick      - Quick deployment (skip system setup)"
        echo "  update     - Update application to latest version"
        echo "  backup     - Create database backup"
        echo "  health     - Run health checks"
        echo "  logs       - Show service logs [service]"
        echo "  restart    - Restart services [service]"
        echo "  stop       - Stop all services"
        echo "  ssl        - Setup/renew SSL certificates"
        echo "  monitoring - Enable monitoring services"
        exit 1
        ;;
esac