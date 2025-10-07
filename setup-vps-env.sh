#!/bin/bash

# =======================================================
# VPS Environment Setup Script for TripGo
# =======================================================

echo "🚀 Setting up TripGo environment variables for VPS..."

# Create .env file for production
cat > .env << 'EOF'
# =======================================================
# TripGo VPS Production Environment
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
EOF

echo "✅ Environment file created!"
echo ""
echo "🔐 IMPORTANT: Update the following before production:"
echo "   - Change all passwords to strong, unique values"
echo "   - Set your actual domain in FRONTEND_URL"
echo "   - Configure real email credentials"
echo "   - Add production Stripe keys"
echo ""
echo "🚀 Now run: docker-compose -f docker-compose.vps.yml up -d --build"