#!/bin/bash

# =======================================================
# TripGo Full-Stack Deployment Script
# =======================================================

echo "🚀 Deploying TripGo Full-Stack Application..."

# Check if we're in the right directory
if [ ! -f "docker-compose.vps.yml" ]; then
    echo "❌ Error: docker-compose.vps.yml not found. Please run this script from the project root directory."
    exit 1
fi

# Stop any running containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.vps.yml down

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# TripGo Full-Stack Production Environment
POSTGRES_DB=tripgo_prod
POSTGRES_USER=tripgo_user
POSTGRES_PASSWORD=TripGo_Strong_DB_Password_2024!
REDIS_PASSWORD=TripGo_Redis_Password_2024!
JWT_SECRET=TripGo_Super_Secret_JWT_Key_For_Production_2024!
JWT_REFRESH_SECRET=TripGo_Super_Secret_JWT_Refresh_Key_For_Production_2024!
FRONTEND_URL=http://localhost:3000
EMAIL_FROM=noreply@tripgo.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
GRAFANA_PASSWORD=admin123
DOCKER_CONTAINER=true
EOF
    echo "✅ .env file created with default values"
else
    echo "✅ .env file already exists"
fi

# Clean up old images and containers
echo "🧹 Cleaning up old Docker resources..."
docker system prune -f

# Build and start all services
echo "🔨 Building and starting all services..."
echo "   📦 Backend API (Node.js + Express)"
echo "   🌐 Frontend (Next.js)"
echo "   ⚙️ Admin Panel (Vite + React)"
echo "   🗄️ PostgreSQL Database"
echo "   🔄 Redis Cache"
echo "   🌉 Nginx Reverse Proxy"

docker-compose -f docker-compose.vps.yml up -d --build

# Wait for services to start
echo "⏳ Waiting for services to start up..."
sleep 30

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.vps.yml ps

echo ""
echo "🔍 Health Checks:"

# Check backend health
echo -n "   🔧 Backend API: "
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

# Check if nginx is serving
echo -n "   🌐 Frontend: "
if curl -s http://localhost > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

# Check admin panel
echo -n "   ⚙️ Admin Panel: "
if curl -s http://localhost/admin/ > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

echo ""
echo "📋 Application URLs:"
echo "   🌐 Main Website: http://your-vps-ip"
echo "   ⚙️ Admin Panel: http://your-vps-ip/admin"
echo "   🔧 Backend API: http://your-vps-ip/api"
echo "   📚 API Docs: http://your-vps-ip/api/docs"
echo "   ❤️ Health Check: http://your-vps-ip/health"

echo ""
echo "📝 Recent logs:"
docker-compose -f docker-compose.vps.yml logs --tail=10 --timestamps

echo ""
echo "✅ Full-Stack TripGo Deployment Complete!"
echo "🎉 Your application is now running with:"
echo "   - Next.js Frontend"
echo "   - React Admin Panel"
echo "   - Node.js Backend API"
echo "   - PostgreSQL Database"
echo "   - Redis Cache"
echo "   - Nginx Load Balancer"