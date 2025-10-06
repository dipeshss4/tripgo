# 🚀 TripGo VPS Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying TripGo to a VPS (Virtual Private Server) in production. The setup is optimized for small to medium VPS instances with automated deployment scripts.

## 📋 Prerequisites

### VPS Requirements

**Minimum Specifications:**
- **CPU**: 1 core
- **RAM**: 2GB (4GB recommended)
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **Network**: Public IP address

**Recommended Specifications:**
- **CPU**: 2+ cores
- **RAM**: 4GB+
- **Storage**: 50GB+ SSD
- **Bandwidth**: Unmetered or 2TB+

### Domain Setup (Optional but Recommended)

1. Purchase a domain name
2. Point DNS to your VPS IP:
   ```
   A    yourdomain.com        → YOUR_VPS_IP
   A    www.yourdomain.com    → YOUR_VPS_IP
   A    api.yourdomain.com    → YOUR_VPS_IP
   ```

## 🛠️ Quick Deployment (5 Minutes)

### Step 1: Connect to Your VPS

```bash
ssh root@your-vps-ip
# or
ssh your-username@your-vps-ip
```

### Step 2: Download and Run Deployment Script

```bash
# Clone the repository
git clone https://github.com/yourusername/tripgo-full-project.git
cd tripgo-full-project

# Make deployment script executable
chmod +x scripts/vps-deploy.sh

# Run automated deployment
./scripts/vps-deploy.sh deploy
```

### Step 3: Configure Environment

The script will create `.env.production` for you. Edit it with your settings:

```bash
nano .env.production
```

**Required Settings:**
```env
# Database
POSTGRES_PASSWORD=your_secure_database_password

# JWT Secrets (generate strong random strings)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here

# Your domain (or VPS IP)
FRONTEND_URL=https://yourdomain.com

# Email (for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Payment (if using Stripe)
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Step 4: Complete Deployment

```bash
# Run quick deployment with your settings
./scripts/vps-deploy.sh quick
```

That's it! 🎉 Your TripGo API is now running at `https://yourdomain.com/api`

## 📚 Detailed Manual Setup

### 1. System Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install prerequisites
sudo apt install -y curl wget git openssl ufw

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for Docker group changes
exit
```

### 2. Firewall Configuration

```bash
# Enable and configure UFW firewall
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

### 3. Project Setup

```bash
# Clone repository
git clone https://github.com/yourusername/tripgo-full-project.git
cd tripgo-full-project

# Create environment file
cp .env.production.example .env.production
nano .env.production
```

### 4. SSL Certificate Setup

#### Option A: Let's Encrypt (Recommended for Production)

```bash
# Install Certbot
sudo apt install certbot

# Get certificate (replace with your domain)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to project
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/private.key
sudo chown $USER:$USER nginx/ssl/*
```

#### Option B: Self-Signed Certificate (Development/Testing)

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/private.key \
    -out nginx/ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=TripGo/CN=yourdomain.com"
```

### 5. Deploy Application

```bash
# Deploy using VPS-optimized configuration
docker-compose -f docker-compose.vps.yml up -d --build

# Check status
docker-compose -f docker-compose.vps.yml ps

# View logs
docker-compose -f docker-compose.vps.yml logs -f backend
```

## 🔧 Configuration Files

### Environment Variables (.env.production)

```env
# =======================================================
# TripGo VPS Production Configuration
# =======================================================

# Database Configuration
POSTGRES_DB=tripgo
POSTGRES_USER=tripgo
POSTGRES_PASSWORD=CHANGE_THIS_STRONG_PASSWORD

# Redis Configuration
REDIS_PASSWORD=CHANGE_THIS_REDIS_PASSWORD

# JWT Configuration (generate strong secrets)
JWT_SECRET=your-256-bit-secret-key-here
JWT_REFRESH_SECRET=your-256-bit-refresh-secret-here

# Domain Configuration
FRONTEND_URL=https://yourdomain.com

# Email Configuration (Gmail example)
EMAIL_FROM=noreply@yourdomain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Payment Configuration (Stripe)
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Optional: Monitoring
GRAFANA_PASSWORD=your_grafana_password
```

### Nginx Configuration Highlights

The VPS Nginx config includes:
- **SSL/TLS termination** with modern security
- **Rate limiting** to prevent abuse
- **Gzip compression** for better performance
- **Caching** for static assets and API responses
- **Security headers** for protection
- **File upload handling** with security restrictions

## 📊 Monitoring & Health Checks

### Built-in Endpoints

- **Health Check**: `https://yourdomain.com/health`
- **API Documentation**: `https://yourdomain.com/api/docs`
- **API Status**: `https://yourdomain.com/api/version`

### Optional Monitoring Stack

Enable monitoring with:
```bash
docker-compose -f docker-compose.vps.yml --profile monitoring up -d
```

**Access Points:**
- **Grafana**: `http://your-vps-ip:3001` (admin/your_grafana_password)
- **Prometheus**: `http://your-vps-ip:9090`

### Health Check Script

```bash
#!/bin/bash
# Save as health-check.sh

API_URL="https://yourdomain.com"

# Check API health
if curl -f "$API_URL/health" >/dev/null 2>&1; then
    echo "✅ API is healthy"
else
    echo "❌ API is down"
    exit 1
fi

# Check database
if docker-compose -f docker-compose.vps.yml exec -T postgres pg_isready >/dev/null 2>&1; then
    echo "✅ Database is healthy"
else
    echo "❌ Database is down"
    exit 1
fi

echo "🎉 All services are healthy"
```

## 🔄 Maintenance & Updates

### Regular Updates

```bash
# Update application
./scripts/vps-deploy.sh update

# View logs
./scripts/vps-deploy.sh logs backend

# Restart services
./scripts/vps-deploy.sh restart

# Create backup
./scripts/vps-deploy.sh backup
```

### SSL Certificate Renewal (Let's Encrypt)

```bash
# Renew certificates
sudo certbot renew --quiet

# Update certificates in project
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/private.key

# Restart nginx
docker-compose -f docker-compose.vps.yml restart nginx
```

### Database Backup

```bash
# Manual backup
docker-compose -f docker-compose.vps.yml exec postgres pg_dump -U tripgo tripgo > backup_$(date +%Y%m%d).sql

# Automated daily backup (add to crontab)
echo "0 2 * * * cd /path/to/tripgo && ./scripts/vps-deploy.sh backup" | crontab -
```

## 🛡️ Security Best Practices

### 1. System Security

```bash
# Keep system updated
sudo apt update && sudo apt upgrade -y

# Configure automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades

# Install fail2ban for brute force protection
sudo apt install fail2ban
```

### 2. Docker Security

```bash
# Regular security scanning
docker scan tripgo-backend:latest

# Remove unused images/containers
docker system prune -af
```

### 3. Application Security

- Change default passwords in `.env.production`
- Use strong JWT secrets (256-bit random strings)
- Enable HTTPS only
- Regular security updates
- Monitor logs for suspicious activity

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using port 80/443
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Stop conflicting services
sudo systemctl stop apache2  # or nginx
```

#### 2. Docker Permission Denied
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again
exit
```

#### 3. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Test SSL
curl -I https://yourdomain.com
```

#### 4. Database Connection Issues
```bash
# Check database logs
docker-compose -f docker-compose.vps.yml logs postgres

# Test database connection
docker-compose -f docker-compose.vps.yml exec postgres psql -U tripgo -d tripgo -c "SELECT 1;"
```

#### 5. Out of Memory Issues
```bash
# Check memory usage
free -h
docker stats

# Reduce resource limits in docker-compose.vps.yml
# Add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Log Analysis

```bash
# View application logs
docker-compose -f docker-compose.vps.yml logs -f --tail=100 backend

# View nginx logs
docker-compose -f docker-compose.vps.yml logs -f --tail=100 nginx

# View database logs
docker-compose -f docker-compose.vps.yml logs -f --tail=100 postgres

# Check system logs
sudo journalctl -u docker -f
```

## 📈 Performance Optimization

### 1. Database Optimization

```sql
-- Connect to database
docker-compose -f docker-compose.vps.yml exec postgres psql -U tripgo -d tripgo

-- Check database performance
SELECT * FROM pg_stat_activity;

-- Optimize tables
VACUUM ANALYZE;

-- Check slow queries
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

### 2. Redis Optimization

```bash
# Check Redis memory usage
docker-compose -f docker-compose.vps.yml exec redis redis-cli info memory

# Monitor Redis performance
docker-compose -f docker-compose.vps.yml exec redis redis-cli --latency
```

### 3. Nginx Optimization

```bash
# Check Nginx status
curl http://localhost:8080/nginx_status

# Analyze access logs
docker-compose -f docker-compose.vps.yml exec nginx tail -f /var/log/nginx/access.log
```

## 🚀 Scaling & Advanced Configuration

### Horizontal Scaling

For higher traffic, consider:

1. **Load Balancer**: Use multiple backend instances
2. **Database Replica**: Read replicas for better performance
3. **CDN**: CloudFlare or AWS CloudFront for static assets
4. **Caching**: Redis Cluster for distributed caching

### Vertical Scaling

Upgrade your VPS resources:
- **CPU**: More cores for better concurrency
- **RAM**: More memory for caching and performance
- **SSD**: Faster storage for database operations

### External Services

Consider using managed services:
- **Database**: AWS RDS, Google Cloud SQL
- **Cache**: AWS ElastiCache, Redis Cloud
- **File Storage**: AWS S3, Google Cloud Storage
- **Email**: SendGrid, AWS SES
- **Monitoring**: Datadog, New Relic

## 📞 Support & Resources

### Quick Commands Reference

```bash
# Deploy/Update
./scripts/vps-deploy.sh deploy    # Full deployment
./scripts/vps-deploy.sh quick     # Quick deployment
./scripts/vps-deploy.sh update    # Update only

# Management
./scripts/vps-deploy.sh logs      # View logs
./scripts/vps-deploy.sh restart   # Restart services
./scripts/vps-deploy.sh backup    # Create backup
./scripts/vps-deploy.sh health    # Health check

# SSL
./scripts/vps-deploy.sh ssl       # Setup SSL certificates

# Monitoring
./scripts/vps-deploy.sh monitoring # Enable monitoring
```

### Important URLs

- **API Base**: `https://yourdomain.com/api`
- **Documentation**: `https://yourdomain.com/api/docs`
- **Health Check**: `https://yourdomain.com/health`
- **Monitoring**: `http://yourdomain.com:3001` (if enabled)

---

## 🎉 Congratulations!

Your TripGo application is now running in production on your VPS with:

✅ **High Performance**: Optimized for VPS resources
✅ **Security**: SSL, firewall, and security headers
✅ **Reliability**: Health checks and auto-restart
✅ **Monitoring**: Optional Grafana/Prometheus
✅ **Maintainability**: Automated scripts and backups

Your travel booking platform is ready for users! 🌍✈️🏨