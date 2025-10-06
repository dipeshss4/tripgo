#!/bin/bash

# =======================================================
# TripGo Quick Server Deploy - Upload this to your VPS
# =======================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 TripGo Quick Server Setup${NC}"
echo "=================================="

# Update system
echo -e "${BLUE}📦 Updating system...${NC}"
apt update && apt upgrade -y

# Install git if not present
if ! command -v git &> /dev/null; then
    echo -e "${BLUE}📦 Installing git...${NC}"
    apt install -y git
fi

# Clone repository with all files
echo -e "${BLUE}📥 Downloading TripGo setup...${NC}"
if [ -d "tripgo-full-project" ]; then
    rm -rf tripgo-full-project
fi

# Create temporary repository structure
mkdir -p tripgo-full-project/scripts
cd tripgo-full-project

# Download the complete setup script
curl -o scripts/complete-server-setup.sh https://raw.githubusercontent.com/yourusername/tripgo-full-project/main/scripts/complete-server-setup.sh
chmod +x scripts/complete-server-setup.sh

# Run the complete setup
echo -e "${GREEN}🚀 Starting complete server setup...${NC}"
./scripts/complete-server-setup.sh deploy

echo -e "${GREEN}✅ Quick setup completed!${NC}"