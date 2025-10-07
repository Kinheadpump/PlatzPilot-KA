#!/bin/bash

# PlatzPilot VPS Update Script
# Run this on your VPS to update the PlatzPilot server

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🔄 PlatzPilot Server Update"
print_status "========================="

# Check if we're in the right directory
if [ ! -d "PlatzPilot-KA" ]; then
    print_error "PlatzPilot-KA directory not found. Are you in the right location?"
    exit 1
fi

# Stop the service
print_status "⏹️  Stopping PlatzPilot service..."
sudo systemctl stop platzpilot

# Backup current version (optional)
BACKUP_DIR="PlatzPilot-KA-backup-$(date +%Y%m%d-%H%M%S)"
print_status "📦 Creating backup: $BACKUP_DIR"
cp -r PlatzPilot-KA "$BACKUP_DIR"

# Update code
print_status "📥 Pulling latest changes..."
cd PlatzPilot-KA
git fetch origin
git reset --hard origin/main  # Force update to match remote
git pull origin main

# Update Python dependencies if requirements changed
if git diff HEAD~1 server/requirements.txt &>/dev/null; then
    print_status "📦 Updating Python dependencies..."
    cd server
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
else
    print_status "📦 Python dependencies unchanged"
fi

# Go back to parent directory
cd ..

# Restart service
print_status "🚀 Starting PlatzPilot service..."
sudo systemctl start platzpilot

# Wait for service to start
sleep 5

# Check service status
if sudo systemctl is-active --quiet platzpilot; then
    print_success "✅ Update completed successfully!"
    
    # Test the service
    print_status "🧪 Testing service..."
    if curl -s http://localhost:8080/api/health > /dev/null; then
        print_success "✅ Service is responding correctly"
    else
        print_error "❌ Service is not responding"
        print_status "Check logs: sudo journalctl -u platzpilot -n 20"
    fi
    
else
    print_error "❌ Service failed to start"
    print_status "Check status: sudo systemctl status platzpilot"
    print_status "Check logs: sudo journalctl -u platzpilot -n 20"
    
    # Offer to rollback
    read -p "Would you like to rollback to the previous version? (y/N): " rollback
    if [[ $rollback =~ ^[Yy]$ ]]; then
        print_status "🔄 Rolling back..."
        rm -rf PlatzPilot-KA
        mv "$BACKUP_DIR" PlatzPilot-KA
        sudo systemctl start platzpilot
        print_status "Rollback completed"
    fi
fi

print_status "📋 Useful commands:"
echo "  • Check status: sudo systemctl status platzpilot"
echo "  • View logs: sudo journalctl -u platzpilot -f"
echo "  • Restart: sudo systemctl restart platzpilot"