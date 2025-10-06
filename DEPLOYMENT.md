# TripGo Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying TripGo to production using Docker and Docker Compose. The setup includes a highly optimized, secure, and monitored production environment.

## Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│     Nginx       │────│   Backend    │────│   PostgreSQL    │
│  Reverse Proxy  │    │   API Server │    │    Database     │
│    + SSL/TLS    │    │   (Node.js)  │    │                 │
└─────────────────┘    └──────────────┘    └─────────────────┘
         │                      │                      │
         │              ┌──────────────┐              │
         │              │    Redis     │              │
         │              │    Cache     │              │
         │              └──────────────┘              │
         │                      │                      │
    ┌─────────────────────────────────────────────────────┐
    │              Monitoring Stack                       │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
    │  │ Prometheus  │  │   Grafana   │  │    Loki     │ │
    │  │  Metrics    │  │ Dashboards  │  │    Logs     │ │
    │  └─────────────┘  └─────────────┘  └─────────────┘ │
    └─────────────────────────────────────────────────────┘
```

## Prerequisites

### System Requirements

- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 50GB minimum, SSD recommended
- **Network**: Static IP address (for production)

### Software Requirements

1. **Docker** (v20.10+)
2. **Docker Compose** (v2.0+)
3. **Git**
4. **OpenSSL** (for SSL certificates)

### Installation Commands

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose git openssl curl

# CentOS/RHEL
sudo yum update -y
sudo yum install -y docker docker-compose git openssl curl

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER
```

## Pre-Deployment Setup

### 1. Clone Repository

```bash
git clone <your-repository-url>
cd tripgo-full-project
```

### 2. Environment Configuration

```bash
# Copy production environment template
cp .env.production.example .env.production

# Edit environment file
nano .env.production
```

#### Required Environment Variables

```bash
# Database Configuration
POSTGRES_DB=tripgo_prod
POSTGRES_USER=tripgo_user
POSTGRES_PASSWORD=your_strong_password_here

# Redis Configuration
REDIS_PASSWORD=your_redis_password_here

# JWT Secrets (generate strong secrets)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here

# Domain Configuration
FRONTEND_URL=https://yourdomain.com

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Monitoring
GRAFANA_PASSWORD=your_grafana_password
```

### 3. SSL Certificate Setup

#### Option A: Self-Signed Certificate (Development/Testing)

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/private.key \
    -out nginx/ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=yourdomain.com"
```

#### Option B: Let's Encrypt Certificate (Production)

```bash
# Install Certbot
sudo apt install certbot

# Obtain certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/private.key
```

### 4. DNS Configuration

Point your domain to the server IP:

```
A    yourdomain.com        → YOUR_SERVER_IP
A    www.yourdomain.com    → YOUR_SERVER_IP
A    api.yourdomain.com    → YOUR_SERVER_IP
```

## Deployment

### Quick Deployment

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

### Manual Deployment

```bash
# Load environment variables
export $(grep -v '^#' .env.production | xargs)

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

## Post-Deployment Verification

### 1. Health Checks

```bash
# API Health Check
curl -k https://localhost/health

# Database Connection
docker-compose -f docker-compose.prod.yml exec backend npx prisma db push

# Redis Connection
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

### 2. Service Status

```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# Expected output:
# NAME                 SERVICE    STATUS         PORTS
# tripgo-backend-prod  backend    Up (healthy)   0.0.0.0:4000->4000/tcp
# tripgo-postgres-prod postgres   Up (healthy)   0.0.0.0:5432->5432/tcp
# tripgo-redis-prod    redis      Up (healthy)   0.0.0.0:6379->6379/tcp
# tripgo-nginx-prod    nginx      Up (healthy)   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### 3. Access Points

- **API**: https://yourdomain.com/api
- **Health Check**: https://yourdomain.com/health
- **API Documentation**: https://yourdomain.com/api/docs
- **Grafana Dashboard**: https://yourdomain.com:3001

## Monitoring & Logging

### Grafana Dashboard

1. Access: `https://yourdomain.com:3001`
2. Login: `admin` / `your_grafana_password`
3. Import TripGo dashboard from `/monitoring/grafana/dashboards/`

### Prometheus Metrics

- **URL**: `http://yourdomain.com:9090`
- **Metrics**: API performance, database stats, system metrics

### Log Management

```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f backend

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f postgres

# View all logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Backup & Recovery

### Automated Backups

```bash
# Database backup (runs daily via cron)
./scripts/deploy.sh backup

# Manual backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump \
    -U tripgo_user -d tripgo_prod > backup_$(date +%Y%m%d).sql
```

### Recovery

```bash
# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql \
    -U tripgo_user -d tripgo_prod < backup_20240101.sql
```

## Maintenance

### Regular Updates

```bash
# Update application
./scripts/deploy.sh update

# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose -f docker-compose.prod.yml pull
```

### Database Migrations

```bash
# Run pending migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Check migration status
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status
```

### Certificate Renewal

```bash
# Renew Let's Encrypt certificates
sudo certbot renew --quiet

# Copy renewed certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/private.key

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

## Security Hardening

### 1. Firewall Configuration

```bash
# Enable UFW firewall
sudo ufw enable

# Allow essential ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Block direct access to application ports
sudo ufw deny 4000/tcp  # Backend
sudo ufw deny 5432/tcp  # PostgreSQL
sudo ufw deny 6379/tcp  # Redis
```

### 2. System Security

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install security updates automatically
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Configure fail2ban
sudo apt install fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

### 3. Docker Security

```bash
# Run containers as non-root user (already configured)
# Limit container resources (configured in docker-compose.prod.yml)
# Use read-only file systems where possible
# Regular security scanning

docker scan tripgo-backend:latest
```

## Troubleshooting

### Common Issues

#### 1. Container Won't Start

```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs container_name

# Check Docker daemon
sudo systemctl status docker

# Restart Docker service
sudo systemctl restart docker
```

#### 2. Database Connection Issues

```bash
# Check PostgreSQL logs
docker-compose -f docker-compose.prod.yml logs postgres

# Test database connection
docker-compose -f docker-compose.prod.yml exec postgres psql -U tripgo_user -d tripgo_prod -c "SELECT 1;"

# Reset database password
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "ALTER USER tripgo_user PASSWORD 'new_password';"
```

#### 3. SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Test SSL connection
openssl s_client -connect yourdomain.com:443

# Renew Let's Encrypt certificate
sudo certbot renew --force-renewal
```

#### 4. Performance Issues

```bash
# Check system resources
docker stats

# Check database performance
docker-compose -f docker-compose.prod.yml exec postgres psql -U tripgo_user -d tripgo_prod -c "SELECT * FROM pg_stat_activity;"

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

## Performance Tuning

### 1. Database Optimization

```sql
-- Connect to database
docker-compose -f docker-compose.prod.yml exec postgres psql -U tripgo_user -d tripgo_prod

-- Check database size
SELECT pg_size_pretty(pg_database_size('tripgo_prod'));

-- Analyze database
ANALYZE;

-- Vacuum database
VACUUM;
```

### 2. Redis Configuration

```bash
# Check Redis memory usage
docker-compose -f docker-compose.prod.yml exec redis redis-cli info memory

# Monitor Redis commands
docker-compose -f docker-compose.prod.yml exec redis redis-cli monitor
```

### 3. Nginx Optimization

```bash
# Check Nginx status
curl http://localhost:8080/nginx_status

# Test Nginx configuration
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

## Scaling

### Horizontal Scaling

```yaml
# In docker-compose.prod.yml
backend:
  deploy:
    replicas: 3  # Scale to 3 instances
```

### Load Balancing

```nginx
# In nginx configuration
upstream backend {
    least_conn;
    server backend_1:4000;
    server backend_2:4000;
    server backend_3:4000;
}
```

## Support & Monitoring

### Key Metrics to Monitor

1. **API Response Time** (< 500ms target)
2. **Database Connections** (< 80% of max)
3. **Memory Usage** (< 80% of available)
4. **Disk Space** (< 85% full)
5. **Error Rates** (< 1% of requests)

### Alerting

Configure alerts in Grafana for:
- High response times
- Database connection issues
- Memory/disk usage
- Service downtime
- SSL certificate expiration

### Log Aggregation

- **Application Logs**: `/app/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **Database Logs**: PostgreSQL container logs
- **System Logs**: Host system logs

## Conclusion

This deployment guide provides a production-ready setup for TripGo with:

✅ **Security**: SSL/TLS, firewall, non-root containers
✅ **Performance**: Optimized configurations, caching, load balancing
✅ **Monitoring**: Prometheus, Grafana, logging
✅ **Reliability**: Health checks, auto-restart, backup strategies
✅ **Maintainability**: Automated scripts, documentation, troubleshooting guides

For additional support or questions, refer to the troubleshooting section or contact the development team.