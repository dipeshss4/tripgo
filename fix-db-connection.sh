#!/bin/bash

# =======================================================
# Fix Database Connection Issues on VPS
# =======================================================

echo "🔧 Fixing database connection issues..."

# Check if .env file exists and show current DATABASE_URL
if [ -f ".env" ]; then
    echo "📄 Current .env file found:"
    grep "DATABASE_URL\|POSTGRES_" .env || echo "No database variables found in .env"
    echo ""
fi

# Create/update the .env file with correct database configuration
echo "📝 Updating .env with correct database configuration..."

# Remove any existing database-related entries
if [ -f ".env" ]; then
    sed -i.bak '/^POSTGRES_DB=/d; /^POSTGRES_USER=/d; /^POSTGRES_PASSWORD=/d; /^DATABASE_URL=/d' .env
fi

# Add correct database configuration
cat >> .env << 'EOF'

# Database Configuration - CORRECTED
POSTGRES_DB=tripgo_prod
POSTGRES_USER=tripgo_user
POSTGRES_PASSWORD=TripGo_Strong_DB_Password_2024!

# Note: Do not add DATABASE_URL here - it's set in docker-compose.yml
EOF

echo "✅ Database configuration updated!"
echo ""
echo "🗄️ Database Configuration:"
echo "   Database Name: tripgo_prod"
echo "   Username: tripgo_user"
echo "   Password: TripGo_Strong_DB_Password_2024!"
echo ""
echo "🔄 Now run:"
echo "   docker-compose -f docker-compose.vps.yml down -v"
echo "   docker-compose -f docker-compose.vps.yml up -d --build"
echo ""
echo "⚠️  Note: The -v flag will remove the old database with wrong name"
echo "   This will create a fresh database with the correct name 'tripgo_prod'"