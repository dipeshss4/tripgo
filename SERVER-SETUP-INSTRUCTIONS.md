# 🚀 TripGo Server Setup Instructions

## Complete Automated Setup for Ubuntu VPS

Your server: `75.119.151.132`

### Option 1: Complete Automated Setup (Recommended)

1. **Connect to your server:**
   ```bash
   ssh root@75.119.151.132
   ```

2. **Download and run the complete setup:**
   ```bash
   # Download the complete setup script
   curl -o complete-server-setup.sh https://raw.githubusercontent.com/yourusername/tripgo-full-project/main/scripts/complete-server-setup.sh

   # Make it executable
   chmod +x complete-server-setup.sh

   # Run the complete setup
   ./complete-server-setup.sh deploy
   ```

### Option 2: Manual Upload Method

1. **Upload the project to your server using SCP:**
   ```bash
   # From your local machine
   scp -r /Users/dipeshsharma/Downloads/tripgo-full-project root@75.119.151.132:/root/
   ```

2. **Connect and run setup:**
   ```bash
   ssh root@75.119.151.132
   cd tripgo-full-project
   chmod +x scripts/complete-server-setup.sh
   ./scripts/complete-server-setup.sh deploy
   ```

### Option 3: Step-by-Step Manual Setup

If you prefer manual control, follow these commands:

```bash
# 1. Connect to server
ssh root@75.119.151.132

# 2. Update system
apt update && apt upgrade -y

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 4. Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 5. Install other tools
apt install -y git openssl ufw

# 6. Create user
useradd -m -s /bin/bash tripgo
usermod -aG sudo,docker tripgo

# 7. Setup firewall
ufw enable
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

# 8. Switch to tripgo user
su - tripgo

# 9. Clone project (update with your repo URL)
git clone https://github.com/yourusername/tripgo-full-project.git
cd tripgo-full-project

# 10. Setup environment
cp .env.production.example .env.production
nano .env.production  # Edit with your settings

# 11. Generate SSL certificate
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/private.key \
    -out nginx/ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=TripGo/CN=75.119.151.132"

# 12. Deploy application
docker-compose -f docker-compose.vps.yml up -d --build

# 13. Check status
docker-compose -f docker-compose.vps.yml ps
```

## What the Automated Setup Does

The complete setup script automatically:

✅ **System Updates** - Updates Ubuntu to latest packages
✅ **Docker Installation** - Installs Docker and Docker Compose
✅ **User Creation** - Creates secure `tripgo` user
✅ **Firewall Setup** - Configures UFW firewall
✅ **Security Hardening** - Installs Fail2Ban, sets up automatic updates
✅ **SSL Certificates** - Generates self-signed SSL certificates
✅ **Application Deployment** - Deploys TripGo with all services
✅ **Monitoring Setup** - Configures Prometheus and Grafana
✅ **Backup Configuration** - Sets up automated backups
✅ **Health Checks** - Verifies all services are running

## After Setup

Your TripGo application will be available at:

- **API Base**: `https://75.119.151.132/api`
- **Health Check**: `https://75.119.151.132/health`
- **API Documentation**: `https://75.119.151.132/api/docs`
- **Monitoring Dashboard**: `http://75.119.151.132:3001`

## Default Credentials

- **Grafana**: `admin` / `TripGo2024@Monitor!`
- **Database**: `tripgo_user` / `TripGo2024@SecureDB!`
- **Redis**: Password is `TripGo2024@Redis!`

## Management Commands

After setup, switch to the tripgo user and use these commands:

```bash
# Switch to tripgo user
sudo su - tripgo
cd tripgo-full-project

# View logs
./scripts/vps-deploy.sh logs backend

# Restart services
./scripts/vps-deploy.sh restart

# Health check
./scripts/vps-deploy.sh health

# Create backup
./scripts/vps-deploy.sh backup
```

## Troubleshooting

If something goes wrong:

1. **Check logs:**
   ```bash
   tail -f /var/log/tripgo-setup.log
   ```

2. **Check Docker services:**
   ```bash
   docker-compose -f docker-compose.vps.yml ps
   docker-compose -f docker-compose.vps.yml logs backend
   ```

3. **Restart setup:**
   ```bash
   ./scripts/complete-server-setup.sh deploy
   ```

## Next Steps

1. **Update email settings** in `.env.production`
2. **Configure Stripe** payment keys
3. **Set up domain name** and Let's Encrypt SSL
4. **Configure monitoring** alerts
5. **Set up external backups**

---

🎉 **Your TripGo travel booking platform will be ready in about 10 minutes!** 🌍✈️🏨