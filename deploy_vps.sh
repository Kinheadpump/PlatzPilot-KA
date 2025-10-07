#!/bin/bash

# PlatzPilot VPS Deployment Script
# Run this script on your VPS to deploy the PlatzPilot server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. Use a regular user with sudo privileges."
    exit 1
fi

print_status "🚀 PlatzPilot VPS Deployment Starting..."

# Get configuration from user
read -p "Enter your domain name (or server IP): " DOMAIN
read -p "Do you want HTTPS setup? (y/N): " SETUP_HTTPS
read -p "Enter GitHub repository URL [https://github.com/Kinheadpump/PlatzPilot-KA.git]: " REPO_URL
REPO_URL=${REPO_URL:-https://github.com/Kinheadpump/PlatzPilot-KA.git}

print_status "Configuration:"
print_status "  Domain: $DOMAIN"
print_status "  HTTPS: $SETUP_HTTPS"
print_status "  Repository: $REPO_URL"

# Update system
print_status "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv git curl nginx ufw

# Clone or update repository
if [ -d "PlatzPilot-KA" ]; then
    print_status "📥 Updating existing repository..."
    cd PlatzPilot-KA
    git pull
    cd ..
else
    print_status "📥 Cloning repository..."
    git clone "$REPO_URL"
fi

# Setup Python environment
print_status "🐍 Setting up Python environment..."
cd PlatzPilot-KA/server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Test server briefly
print_status "🧪 Testing server setup..."
timeout 10s python start_server.py --host 127.0.0.1 --port 8080 &
sleep 5
if curl -s http://127.0.0.1:8080/api/health > /dev/null; then
    print_success "Server test passed!"
else
    print_warning "Server test failed, but continuing deployment..."
fi
pkill -f start_server.py 2>/dev/null || true
cd ..

# Create systemd service
print_status "⚙️ Creating systemd service..."
sudo tee /etc/systemd/system/platzpilot.service > /dev/null <<EOF
[Unit]
Description=PlatzPilot Server
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=$HOME/PlatzPilot-KA/server
Environment=PATH=$HOME/PlatzPilot-KA/server/venv/bin
ExecStart=$HOME/PlatzPilot-KA/server/venv/bin/python start_server.py --host 127.0.0.1 --port 8080
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=platzpilot

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$HOME/PlatzPilot-KA/server

[Install]
WantedBy=multi-user.target
EOF

# Configure firewall
print_status "🔥 Configuring firewall..."
sudo ufw --force reset
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Configure Nginx
print_status "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/platzpilot > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers for mobile app
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization";
            return 204;
        }
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/platzpilot /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Setup HTTPS if requested
if [[ $SETUP_HTTPS =~ ^[Yy]$ ]]; then
    print_status "🔒 Setting up HTTPS with Let's Encrypt..."
    sudo apt install -y certbot python3-certbot-nginx
    
    # Get certificate
    sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email
    
    print_success "HTTPS configured successfully!"
fi

# Enable and start services
print_status "🚀 Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable platzpilot
sudo systemctl start platzpilot
sudo systemctl enable nginx

# Wait for services to start
sleep 5

# Test deployment
print_status "🧪 Testing deployment..."
if [[ $SETUP_HTTPS =~ ^[Yy]$ ]]; then
    TEST_URL="https://$DOMAIN"
else
    TEST_URL="http://$DOMAIN"
fi

if curl -s "$TEST_URL/api/health" > /dev/null; then
    print_success "🎉 Deployment successful!"
    echo ""
    echo "Your PlatzPilot server is now running at:"
    echo "  📍 $TEST_URL"
    echo "  🔍 Health check: $TEST_URL/api/health"
    echo "  📚 Library data: $TEST_URL/api/libraries"
    echo ""
    echo "Next steps:"
    echo "1. Update your mobile app configuration:"
    echo "   Edit client/.env.local and set:"
    echo "   EXPO_PUBLIC_API_URL=$TEST_URL"
    echo ""
    echo "2. Restart your React Native app to connect to the live server"
    echo ""
    echo "3. Monitor your deployment:"
    echo "   sudo systemctl status platzpilot"
    echo "   sudo journalctl -u platzpilot -f"
    echo ""
else
    print_error "❌ Deployment test failed"
    print_status "Check service status:"
    sudo systemctl status platzpilot
    print_status "Check logs:"
    sudo journalctl -u platzpilot -n 20
fi

print_status "📋 Useful commands:"
echo "  • Check service: sudo systemctl status platzpilot"
echo "  • View logs: sudo journalctl -u platzpilot -f"
echo "  • Restart: sudo systemctl restart platzpilot"
echo "  • Update code: cd PlatzPilot-KA && git pull && sudo systemctl restart platzpilot"