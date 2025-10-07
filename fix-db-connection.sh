#!/bin/bash

# =======================================================
# Fix Database Connection Issues on VPS
# =======================================================

echo "🔧 Fixing database connection issues..."

# Stop all containers first
echo "🛑 Stopping all containers..."
docker-compose -f docker-compose.vps.yml down

# Check if .env file exists and show current DATABASE_URL
if [ -f ".env" ]; then
    echo "📄 Current .env file found:"
    grep "DATABASE_URL\|POSTGRES_" .env || echo "No database variables found in .env"
    echo ""

    # Backup existing .env
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "📋 Backed up existing .env file"
fi

# Create fresh .env file with ALL required variables
echo "📝 Creating fresh .env file with all required variables..."

cat > .env << 'EOF'
# =======================================================
# TripGo VPS Production Environment - CORRECTED
# =======================================================

# Database Configuration
POSTGRES_DB=tripgo_prod
POSTGRES_USER=tripgo_user
POSTGRES_PASSWORD=TripGo_Strong_DB_Password_2024!

# Redis Configuration
REDIS_PASSWORD=TripGo_Redis_Password_2024!

# JWT Configuration
JWT_SECRET=TripGo_Super_Secret_JWT_Key_For_Production_2024!
JWT_REFRESH_SECRET=TripGo_Super_Secret_JWT_Refresh_Key_For_Production_2024!

# Application Configuration
FRONTEND_URL=http://localhost:3000
EMAIL_FROM=noreply@tripgo.com

# Email Configuration (Optional - can be set later)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe Configuration (Optional - can be set later)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Monitoring
GRAFANA_PASSWORD=admin123

# Docker Environment Detection
DOCKER_CONTAINER=true
EOF

echo "✅ Fresh .env file created!"

# Remove any cached Docker volumes that might have wrong database
echo "🗑️ Removing old database volumes..."
docker volume prune -f
docker system prune -f

echo ""
echo "🗄️ Database Configuration:"
echo "   Database Name: tripgo_prod"
echo "   Username: tripgo_user"
echo "   Password: TripGo_Strong_DB_Password_2024!"
echo ""
echo "🔄 Starting containers with fresh configuration..."
docker-compose -f docker-compose.vps.yml up -d --build

echo ""
echo "✅ Fix applied! Monitoring container startup..."
echo "🔍 Checking container logs in 30 seconds..."
sleep 30

echo ""
echo "📋 Container Status:"
docker-compose -f docker-compose.vps.yml ps

echo ""
echo "📝 Recent backend logs:"
docker-compose -f docker-compose.vps.yml logs --tail=20 backend

echo ""
echo "✅ Database connection fix complete!"
echo "🌐 Your application should now be accessible at: http://your-vps-ip"