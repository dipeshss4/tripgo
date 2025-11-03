#!/bin/bash

# Blog Posts Deployment Script for Production Server
# Usage: ./deploy-blogs.sh [server-ip] [backend-path]

set -e

SERVER_IP="${1:-75.119.151.132}"
BACKEND_PATH="${2:-/var/www/tripgo/backend}"
SCRIPT_PATH="prisma/seed-blogs.ts"

echo "🚀 Deploying blog posts to production server..."
echo "📍 Server: $SERVER_IP"
echo "📁 Backend path: $BACKEND_PATH"
echo ""

# Step 1: Copy seeder script to server
echo "📤 Step 1: Uploading seeder script..."
scp "$SCRIPT_PATH" "root@$SERVER_IP:$BACKEND_PATH/prisma/"

if [ $? -eq 0 ]; then
    echo "✅ Script uploaded successfully"
else
    echo "❌ Failed to upload script"
    exit 1
fi

echo ""

# Step 2: Run seeder on server
echo "🌱 Step 2: Running seeder on production..."
ssh "root@$SERVER_IP" << 'ENDSSH'
cd /var/www/tripgo/backend
echo "Current directory: $(pwd)"
echo ""
npx tsx prisma/seed-blogs.ts
echo ""
echo "✅ Seeding completed!"
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "✨ Blog posts deployed successfully!"
    echo ""
    echo "🔍 Verify at:"
    echo "  - Admin: http://$SERVER_IP/admin/blog"
    echo "  - Frontend: http://$SERVER_IP/blog"
    echo "  - API: http://$SERVER_IP/api/blog"
else
    echo "❌ Deployment failed"
    exit 1
fi
