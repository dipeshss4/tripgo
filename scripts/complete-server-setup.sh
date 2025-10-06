#!/bin/bash

# =======================================================
# TripGo Complete Server Setup Script
# Automated setup for fresh Ubuntu server
# =======================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="75.119.151.132"
DOMAIN="${DOMAIN:-$SERVER_IP}"
PROJECT_DIR="/home/tripgo/tripgo-full-project"
TRIPGO_USER="tripgo"
DB_PASSWORD="TripGo2024@SecureDB!"
REDIS_PASSWORD="TripGo2024@Redis!"
JWT_SECRET="TripGo-JWT-Secret-256-Bit-Key-For-Production-2024"
JWT_REFRESH_SECRET="TripGo-Refresh-Secret-256-Bit-Key-For-Production-2024"
GRAFANA_PASSWORD="TripGo2024@Monitor!"

# Logging
LOG_FILE="/var/log/tripgo-setup.log"
exec > >(tee -a "$LOG_FILE")
exec 2>&1

# =======================================================
# Helper Functions
# =======================================================

show_banner() {
    clear
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                  ║"
    echo "║                 🚀 TripGo Complete Server Setup 🚀                ║"
    echo "║                                                                  ║"
    echo "║           Automated deployment for Ubuntu VPS                    ║"
    echo "║                                                                  ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
}

log_step() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root. Use: sudo $0"
    fi
}

# =======================================================
# System Setup Functions
# =======================================================

update_system() {
    log_step "Updating system packages..."
    apt update -y
    apt upgrade -y
    apt autoremove -y
    log_success "System updated successfully"
}

install_prerequisites() {
    log_step "Installing prerequisites..."

    # Essential packages
    apt install -y \
        curl \
        wget \
        git \
        openssl \
        ufw \
        unzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        fail2ban \
        htop \
        nano \
        certbot \
        python3-certbot-nginx

    log_success "Prerequisites installed"
}

install_docker() {
    log_step "Installing Docker..."

    # Remove old versions
    apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker
    apt update -y
    apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Install Docker Compose standalone
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    # Start and enable Docker
    systemctl start docker
    systemctl enable docker

    log_success "Docker installed successfully"
}

create_user() {
    log_step "Creating tripgo user..."

    # Create user if doesn't exist
    if ! id "$TRIPGO_USER" &>/dev/null; then
        useradd -m -s /bin/bash "$TRIPGO_USER"
        usermod -aG sudo,docker "$TRIPGO_USER"

        # Set up SSH directory
        mkdir -p "/home/$TRIPGO_USER/.ssh"
        chown -R "$TRIPGO_USER:$TRIPGO_USER" "/home/$TRIPGO_USER/.ssh"
        chmod 700 "/home/$TRIPGO_USER/.ssh"

        log_success "User $TRIPGO_USER created"
    else
        log_warning "User $TRIPGO_USER already exists"
    fi
}

setup_firewall() {
    log_step "Configuring firewall..."

    # Reset UFW
    ufw --force reset

    # Default policies
    ufw default deny incoming
    ufw default allow outgoing

    # Allow essential ports
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp

    # Enable firewall
    ufw --force enable

    log_success "Firewall configured"
}

setup_fail2ban() {
    log_step "Configuring Fail2Ban..."

    # Create custom jail configuration
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

    # Restart fail2ban
    systemctl restart fail2ban
    systemctl enable fail2ban

    log_success "Fail2Ban configured"
}

# =======================================================
# Application Setup Functions
# =======================================================

clone_repository() {
    log_step "Cloning TripGo repository..."

    # Switch to tripgo user
    sudo -u "$TRIPGO_USER" bash << EOF
    cd /home/$TRIPGO_USER

    # Remove existing directory if it exists
    if [ -d "tripgo-full-project" ]; then
        rm -rf tripgo-full-project
    fi

    # Clone repository (you'll need to update this URL)
    git clone https://github.com/yourusername/tripgo-full-project.git
    cd tripgo-full-project

    # Make scripts executable
    chmod +x scripts/*.sh
EOF

    log_success "Repository cloned"
}

setup_environment() {
    log_step "Setting up environment configuration..."

    sudo -u "$TRIPGO_USER" bash << EOF
    cd "$PROJECT_DIR"

    # Create production environment file
    cat > .env.production << EOL
# =======================================================
# TripGo Production Configuration
# =======================================================

# Database Configuration
POSTGRES_DB=tripgo_prod
POSTGRES_USER=tripgo_user
POSTGRES_PASSWORD=$DB_PASSWORD

# Redis Configuration
REDIS_PASSWORD=$REDIS_PASSWORD

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

# Domain Configuration
FRONTEND_URL=https://$DOMAIN

# Email Configuration (Update with your details)
EMAIL_FROM=noreply@$DOMAIN
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment Configuration (Update with your Stripe keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Monitoring
GRAFANA_PASSWORD=$GRAFANA_PASSWORD

# Server Configuration
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
EOL

EOF

    log_success "Environment configured"
}

setup_ssl() {
    log_step "Setting up SSL certificates..."

    sudo -u "$TRIPGO_USER" bash << EOF
    cd "$PROJECT_DIR"

    # Create SSL directory
    mkdir -p nginx/ssl

    # Generate self-signed certificate for immediate deployment
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/private.key \
        -out nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=TripGo/CN=$DOMAIN"

    chmod 600 nginx/ssl/private.key
    chmod 644 nginx/ssl/cert.pem
EOF

    log_success "SSL certificates generated"
}

optimize_system() {
    log_step "Optimizing system for production..."

    # Increase file limits
    cat >> /etc/security/limits.conf << EOF
* soft nofile 65536
* hard nofile 65536
root soft nofile 65536
root hard nofile 65536
EOF

    # Optimize kernel parameters
    cat >> /etc/sysctl.conf << EOF
# TripGo optimizations
net.core.somaxconn = 4096
net.core.netdev_max_backlog = 4096
net.ipv4.tcp_max_syn_backlog = 4096
vm.swappiness = 10
EOF

    sysctl -p

    # Create swap if not exists and system has less than 4GB RAM
    if [ ! -f /swapfile ] && [ $(free -m | awk '/^Mem:/{print $2}') -lt 4096 ]; then
        log_step "Creating swap file..."
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        log_success "Swap file created"
    fi

    log_success "System optimized"
}

deploy_application() {
    log_step "Deploying TripGo application..."

    sudo -u "$TRIPGO_USER" bash << EOF
    cd "$PROJECT_DIR"

    # Load environment variables
    export \$(grep -v '^#' .env.production | xargs)

    # Build and start services
    docker-compose -f docker-compose.vps.yml up -d --build

    # Wait for services to start
    sleep 30

    # Check if services are running
    docker-compose -f docker-compose.vps.yml ps
EOF

    log_success "Application deployed"
}

setup_monitoring() {
    log_step "Setting up monitoring..."

    sudo -u "$TRIPGO_USER" bash << EOF
    cd "$PROJECT_DIR"

    # Enable monitoring profile
    docker-compose -f docker-compose.vps.yml --profile monitoring up -d
EOF

    log_success "Monitoring enabled"
}

setup_automatic_updates() {
    log_step "Setting up automatic updates..."

    # Install unattended upgrades
    apt install -y unattended-upgrades

    # Configure automatic security updates
    cat > /etc/apt/apt.conf.d/50unattended-upgrades << EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id} ESMApps:\${distro_codename}-apps-security";
    "\${distro_id} ESM:\${distro_codename}-infra-security";
};
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

    # Enable automatic updates
    cat > /etc/apt/apt.conf.d/20auto-upgrades << EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF

    log_success "Automatic updates configured"
}

setup_cron_jobs() {
    log_step "Setting up maintenance cron jobs..."

    # Create backup script
    cat > /home/$TRIPGO_USER/backup.sh << EOF
#!/bin/bash
cd $PROJECT_DIR
./scripts/vps-deploy.sh backup
# Clean old backups (keep last 7 days)
find /home/$TRIPGO_USER/backups -name "*.sql" -mtime +7 -delete 2>/dev/null || true
EOF

    chmod +x /home/$TRIPGO_USER/backup.sh
    chown $TRIPGO_USER:$TRIPGO_USER /home/$TRIPGO_USER/backup.sh

    # Add cron jobs for tripgo user
    sudo -u "$TRIPGO_USER" bash << 'EOF'
(crontab -l 2>/dev/null; echo "0 2 * * * /home/tripgo/backup.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * 0 docker system prune -f") | crontab -
EOF

    log_success "Cron jobs configured"
}

# =======================================================
# Health Checks and Verification
# =======================================================

perform_health_checks() {
    log_step "Performing health checks..."

    # Wait for services to be fully ready
    sleep 60

    local max_attempts=10
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        log_step "Health check attempt $attempt/$max_attempts..."

        # Check if API is responding
        if curl -k -f "https://$SERVER_IP/health" >/dev/null 2>&1; then
            log_success "API health check passed"
            break
        else
            if [ $attempt -eq $max_attempts ]; then
                log_warning "API health check failed after $max_attempts attempts"
                log_step "Checking service logs..."
                sudo -u "$TRIPGO_USER" docker-compose -f "$PROJECT_DIR/docker-compose.vps.yml" logs --tail=20 backend
            else
                log_step "Waiting for services to start..."
                sleep 30
            fi
        fi

        ((attempt++))
    done

    # Check Docker services
    sudo -u "$TRIPGO_USER" bash << EOF
cd "$PROJECT_DIR"
echo "=== Docker Services Status ==="
docker-compose -f docker-compose.vps.yml ps
echo ""
echo "=== Resource Usage ==="
docker stats --no-stream
EOF
}

show_deployment_info() {
    local api_status="❌ Not responding"
    if curl -k -f "https://$SERVER_IP/health" >/dev/null 2>&1; then
        api_status="✅ Running"
    fi

    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                  ║"
    echo "║                  🎉 DEPLOYMENT COMPLETED! 🎉                     ║"
    echo "║                                                                  ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${CYAN}📋 Deployment Summary:${NC}"
    echo "┌─────────────────────────────────────────────────────────────────┐"
    echo "│ Server IP       : $SERVER_IP"
    echo "│ Domain          : $DOMAIN"
    echo "│ API Status      : $api_status"
    echo "│ User Account    : $TRIPGO_USER"
    echo "│ Project Path    : $PROJECT_DIR"
    echo "└─────────────────────────────────────────────────────────────────┘"
    echo ""
    echo -e "${CYAN}🌐 Access Points:${NC}"
    echo "┌─────────────────────────────────────────────────────────────────┐"
    echo "│ API Base        : https://$DOMAIN/api"
    echo "│ Health Check    : https://$DOMAIN/health"
    echo "│ API Docs        : https://$DOMAIN/api/docs"
    echo "│ Monitoring      : http://$DOMAIN:3001 (admin/$GRAFANA_PASSWORD)"
    echo "└─────────────────────────────────────────────────────────────────┘"
    echo ""
    echo -e "${CYAN}🔧 Management Commands:${NC}"
    echo "┌─────────────────────────────────────────────────────────────────┐"
    echo "│ Switch to tripgo user: sudo su - tripgo"
    echo "│ Project directory    : cd $PROJECT_DIR"
    echo "│ View logs           : ./scripts/vps-deploy.sh logs backend"
    echo "│ Restart services    : ./scripts/vps-deploy.sh restart"
    echo "│ Health check        : ./scripts/vps-deploy.sh health"
    echo "│ Create backup       : ./scripts/vps-deploy.sh backup"
    echo "└─────────────────────────────────────────────────────────────────┘"
    echo ""
    echo -e "${CYAN}🔒 Security Information:${NC}"
    echo "┌─────────────────────────────────────────────────────────────────┐"
    echo "│ Firewall         : ✅ Enabled (UFW)"
    echo "│ Fail2Ban         : ✅ Enabled"
    echo "│ SSL/TLS          : ✅ Self-signed (consider Let's Encrypt)"
    echo "│ Auto Updates     : ✅ Enabled"
    echo "│ Non-root User    : ✅ $TRIPGO_USER"
    echo "└─────────────────────────────────────────────────────────────────┘"
    echo ""
    echo -e "${YELLOW}📝 Next Steps:${NC}"
    echo "1. Update email settings in .env.production"
    echo "2. Configure Stripe payment keys"
    echo "3. Set up domain name and Let's Encrypt SSL"
    echo "4. Configure monitoring alerts"
    echo "5. Set up regular backups to external storage"
    echo ""
    echo -e "${GREEN}🎉 Your TripGo travel booking platform is ready! 🌍✈️🏨${NC}"
}

# =======================================================
# Main Deployment Function
# =======================================================

deploy_full() {
    show_banner

    log_step "Starting complete server setup for TripGo..."
    echo "Server IP: $SERVER_IP"
    echo "Domain: $DOMAIN"
    echo "Log file: $LOG_FILE"
    echo ""

    check_root

    # System setup
    update_system
    install_prerequisites
    install_docker
    create_user
    setup_firewall
    setup_fail2ban
    optimize_system
    setup_automatic_updates

    # Application deployment
    clone_repository
    setup_environment
    setup_ssl
    deploy_application
    setup_monitoring
    setup_cron_jobs

    # Verification
    perform_health_checks
    show_deployment_info
}

# =======================================================
# Script Entry Point
# =======================================================

case "${1:-deploy}" in
    "deploy")
        deploy_full
        ;;
    "health")
        perform_health_checks
        ;;
    "info")
        show_deployment_info
        ;;
    *)
        echo "Usage: $0 [deploy|health|info]"
        echo ""
        echo "Commands:"
        echo "  deploy  - Complete server setup and deployment (default)"
        echo "  health  - Run health checks"
        echo "  info    - Show deployment information"
        exit 1
        ;;
esac