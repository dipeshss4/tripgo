#!/bin/bash

# Production Seeder Deployment Script
# This script uploads seeders to production and runs them in Docker

set -e

SERVER_IP="75.119.151.132"
SERVER_USER="root"
SERVER_PATH="~/tripgo/backend"
DOCKER_CONTAINER="tripgo-backend"

echo "========================================================================"
echo "🚀 DEPLOYING SEEDERS TO PRODUCTION"
echo "========================================================================"
echo "Server: $SERVER_IP"
echo "Container: $DOCKER_CONTAINER"
echo ""

# Step 1: Upload seeder files
echo "📤 Step 1: Uploading seeder files to production server..."
echo "------------------------------------------------------------------------"

scp prisma/seed-blogs.ts ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/prisma/
echo "✅ Uploaded seed-blogs.ts"

scp prisma/seed-cruises.ts ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/prisma/
echo "✅ Uploaded seed-cruises.ts"

scp prisma/seed-hotels.ts ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/prisma/
echo "✅ Uploaded seed-hotels.ts"

scp prisma/seed-packages.ts ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/prisma/
echo "✅ Uploaded seed-packages.ts"

scp prisma/seed-all.ts ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/prisma/
echo "✅ Uploaded seed-all.ts"

echo ""
echo "✅ All files uploaded successfully!"
echo ""

# Step 2: Verify files exist on server
echo "🔍 Step 2: Verifying files on server..."
echo "------------------------------------------------------------------------"

ssh ${SERVER_USER}@${SERVER_IP} "ls -lh ${SERVER_PATH}/prisma/seed-*.ts"

echo ""
echo "✅ Files verified!"
echo ""

# Step 3: Run seeders in Docker
echo "🌱 Step 3: Running seeders in Docker container..."
echo "------------------------------------------------------------------------"
echo ""

# Ask user which seeder to run
echo "Choose seeding option:"
echo "  1) Run all seeders (blogs, cruises, hotels, packages)"
echo "  2) Run cruises only"
echo "  3) Run hotels only"
echo "  4) Run packages only"
echo "  5) Run blogs only"
echo "  6) Run individually (one by one)"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
  1)
    echo ""
    echo "🚀 Running all seeders..."
    ssh ${SERVER_USER}@${SERVER_IP} "docker exec ${DOCKER_CONTAINER} npx tsx prisma/seed-all.ts"
    ;;
  2)
    echo ""
    echo "🚢 Running cruise seeder..."
    ssh ${SERVER_USER}@${SERVER_IP} "docker exec ${DOCKER_CONTAINER} npx tsx prisma/seed-cruises.ts"
    ;;
  3)
    echo ""
    echo "🏨 Running hotel seeder..."
    ssh ${SERVER_USER}@${SERVER_IP} "docker exec ${DOCKER_CONTAINER} npx tsx prisma/seed-hotels.ts"
    ;;
  4)
    echo ""
    echo "🎒 Running package seeder..."
    ssh ${SERVER_USER}@${SERVER_IP} "docker exec ${DOCKER_CONTAINER} npx tsx prisma/seed-packages.ts"
    ;;
  5)
    echo ""
    echo "📝 Running blog seeder..."
    ssh ${SERVER_USER}@${SERVER_IP} "docker exec ${DOCKER_CONTAINER} npx tsx prisma/seed-blogs.ts"
    ;;
  6)
    echo ""
    echo "📝 Running blog seeder..."
    ssh ${SERVER_USER}@${SERVER_IP} "docker exec ${DOCKER_CONTAINER} npx tsx prisma/seed-blogs.ts"
    echo ""

    echo "🚢 Running cruise seeder..."
    ssh ${SERVER_USER}@${SERVER_IP} "docker exec ${DOCKER_CONTAINER} npx tsx prisma/seed-cruises.ts"
    echo ""

    echo "🏨 Running hotel seeder..."
    ssh ${SERVER_USER}@${SERVER_IP} "docker exec ${DOCKER_CONTAINER} npx tsx prisma/seed-hotels.ts"
    echo ""

    echo "🎒 Running package seeder..."
    ssh ${SERVER_USER}@${SERVER_IP} "docker exec ${DOCKER_CONTAINER} npx tsx prisma/seed-packages.ts"
    ;;
  *)
    echo "❌ Invalid choice. Exiting."
    exit 1
    ;;
esac

echo ""
echo "========================================================================"
echo "✅ DEPLOYMENT COMPLETED!"
echo "========================================================================"
echo ""
echo "🔍 Verify the data:"
echo "  - Admin Panel: http://${SERVER_IP}/admin"
echo "  - API Blogs: http://${SERVER_IP}/api/blog"
echo "  - API Cruises: http://${SERVER_IP}/api/cruise"
echo "  - API Hotels: http://${SERVER_IP}/api/hotel"
echo "  - API Packages: http://${SERVER_IP}/api/package"
echo ""
echo "💡 To check counts via API:"
echo "  curl http://${SERVER_IP}/api/blog | jq '.data | length'"
echo "  curl http://${SERVER_IP}/api/cruise | jq '.data | length'"
echo "  curl http://${SERVER_IP}/api/hotel | jq '.data | length'"
echo "  curl http://${SERVER_IP}/api/package | jq '.data | length'"
echo ""
