#!/bin/bash

# =======================================================
# TripGo Production Deployment Script
# =======================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="tripgo"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="./backups"

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

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root for security reasons"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check if environment file exists
    if [[ ! -f "$ENV_FILE" ]]; then
        log_error "Environment file $ENV_FILE not found. Please create it from .env.production.example"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."

    mkdir -p logs
    mkdir -p uploads
    mkdir -p "$BACKUP_DIR"
    mkdir -p nginx/ssl
    mkdir -p monitoring

    log_success "Directories created"
}

# Generate SSL certificate (self-signed for development)
generate_ssl_cert() {
    if [[ ! -f "nginx/ssl/cert.pem" ]] || [[ ! -f "nginx/ssl/private.key" ]]; then
        log_info "Generating self-signed SSL certificate..."

        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/private.key \
            -out nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

        chmod 600 nginx/ssl/private.key
        chmod 644 nginx/ssl/cert.pem

        log_success "SSL certificate generated"
    else
        log_info "SSL certificate already exists"
    fi
}

# Backup database
backup_database() {
    if docker-compose -f "$COMPOSE_FILE" ps postgres | grep -q "Up"; then
        log_info "Creating database backup..."

        BACKUP_FILE="$BACKUP_DIR/tripgo_backup_$(date +%Y%m%d_%H%M%S).sql"

        docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump \
            -U "${POSTGRES_USER:-tripgo}" \
            -d "${POSTGRES_DB:-tripgo_prod}" > "$BACKUP_FILE"

        gzip "$BACKUP_FILE"

        log_success "Database backup created: ${BACKUP_FILE}.gz"

        # Keep only last 7 backups
        find "$BACKUP_DIR" -name "tripgo_backup_*.sql.gz" -type f -mtime +7 -delete
    else
        log_info "Database not running, skipping backup"
    fi
}

# Build and deploy
deploy() {
    log_info "Starting deployment..."

    # Load environment variables
    export $(grep -v '^#' "$ENV_FILE" | xargs)

    # Pull latest images
    log_info "Pulling latest images..."
    docker-compose -f "$COMPOSE_FILE" pull

    # Build application
    log_info "Building application..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache backend

    # Start services
    log_info "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d

    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."

    # Wait for database
    timeout=60
    while ! docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U "${POSTGRES_USER:-tripgo}" >/dev/null 2>&1; do
        timeout=$((timeout - 1))
        if [[ $timeout -le 0 ]]; then
            log_error "Database health check timeout"
            exit 1
        fi
        sleep 1
    done

    # Wait for backend
    timeout=60
    while ! docker-compose -f "$COMPOSE_FILE" exec -T backend node -e "require('http').get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" >/dev/null 2>&1; do
        timeout=$((timeout - 1))
        if [[ $timeout -le 0 ]]; then
            log_error "Backend health check timeout"
            exit 1
        fi
        sleep 2
    done

    log_success "All services are healthy"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."

    docker-compose -f "$COMPOSE_FILE" exec -T backend npx prisma migrate deploy

    log_success "Database migrations completed"
}

# Health check
health_check() {
    log_info "Performing health checks..."

    # Check if all containers are running
    if ! docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        log_error "Some containers are not running"
        docker-compose -f "$COMPOSE_FILE" ps
        exit 1
    fi

    # Check API health
    if curl -f http://localhost/health >/dev/null 2>&1; then
        log_success "API health check passed"
    else
        log_error "API health check failed"
        exit 1
    fi

    log_success "All health checks passed"
}

# Cleanup old images and containers
cleanup() {
    log_info "Cleaning up old Docker images and containers..."

    # Remove unused images
    docker image prune -f

    # Remove unused volumes
    docker volume prune -f

    # Remove unused networks
    docker network prune -f

    log_success "Cleanup completed"
}

# Show deployment info
show_info() {
    log_success "Deployment completed successfully!"
    echo
    echo "🚀 TripGo is now running:"
    echo "   🌐 API: https://localhost/api"
    echo "   📚 Docs: https://localhost/api/docs"
    echo "   🔍 Health: https://localhost/health"
    echo "   📊 Monitoring: https://localhost:3001 (Grafana)"
    echo
    echo "📋 Useful commands:"
    echo "   docker-compose -f $COMPOSE_FILE logs -f backend"
    echo "   docker-compose -f $COMPOSE_FILE ps"
    echo "   docker-compose -f $COMPOSE_FILE down"
    echo
    echo "🔐 Default credentials:"
    echo "   Grafana: admin / ${GRAFANA_PASSWORD:-admin123}"
}

# Main deployment process
main() {
    echo "🚀 TripGo Production Deployment"
    echo "================================"

    check_root
    check_prerequisites
    create_directories
    generate_ssl_cert

    # Backup database if it exists
    backup_database

    # Deploy application
    deploy

    # Run migrations
    run_migrations

    # Health checks
    health_check

    # Cleanup
    cleanup

    # Show deployment info
    show_info
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "backup")
        backup_database
        ;;
    "health")
        health_check
        ;;
    "cleanup")
        cleanup
        ;;
    "logs")
        docker-compose -f "$COMPOSE_FILE" logs -f "${2:-backend}"
        ;;
    "restart")
        log_info "Restarting services..."
        docker-compose -f "$COMPOSE_FILE" restart "${2:-}"
        log_success "Services restarted"
        ;;
    "stop")
        log_info "Stopping services..."
        docker-compose -f "$COMPOSE_FILE" down
        log_success "Services stopped"
        ;;
    "update")
        log_info "Updating application..."
        docker-compose -f "$COMPOSE_FILE" pull
        docker-compose -f "$COMPOSE_FILE" build --no-cache backend
        docker-compose -f "$COMPOSE_FILE" up -d
        health_check
        log_success "Application updated"
        ;;
    *)
        echo "Usage: $0 {deploy|backup|health|cleanup|logs|restart|stop|update}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Full deployment (default)"
        echo "  backup  - Backup database"
        echo "  health  - Run health checks"
        echo "  cleanup - Clean up Docker resources"
        echo "  logs    - Show logs [service]"
        echo "  restart - Restart services [service]"
        echo "  stop    - Stop all services"
        echo "  update  - Update and restart application"
        exit 1
        ;;
esac