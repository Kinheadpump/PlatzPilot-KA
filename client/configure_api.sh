#!/bin/bash

# PlatzPilot Client Configuration Helper
# Helps configure the React Native client to connect to different servers

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check if we're in the client directory or project root
if [ -f "package.json" ]; then
    # We're in client directory
    CLIENT_DIR="."
elif [ -f "client/package.json" ]; then
    # We're in project root
    CLIENT_DIR="client"
else
    print_error "Please run this script from the client directory or project root"
    exit 1
fi

ENV_FILE="$CLIENT_DIR/.env.local"
EXAMPLE_FILE="$CLIENT_DIR/.env.example"

print_status "🔧 PlatzPilot Client Configuration"
echo "=================================="

# Create .env.local if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    if [ -f "$EXAMPLE_FILE" ]; then
        cp "$EXAMPLE_FILE" "$ENV_FILE"
        print_status "Created .env.local from template"
    else
        touch "$ENV_FILE"
        print_status "Created empty .env.local"
    fi
fi

# Show current configuration
if [ -f "$ENV_FILE" ] && [ -s "$ENV_FILE" ]; then
    print_status "Current configuration:"
    grep -E "^EXPO_PUBLIC_API_URL=" "$ENV_FILE" || echo "  No API URL set"
    echo ""
fi

# Configuration options
echo "Select server configuration:"
echo "1) Local development (http://localhost:8080)"
echo "2) Local network (for physical device testing)"
echo "3) Production VPS (HTTPS)"
echo "4) Production VPS (HTTP)"
echo "5) Custom URL"
echo "6) View current config"
echo "7) Exit"

read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        API_URL="http://localhost:8080"
        ;;
    2)
        # Get local IP address
        LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | cut -d' ' -f1 || echo "192.168.1.100")
        echo ""
        print_status "Detected IP: $LOCAL_IP"
        read -p "Enter your computer's IP address [$LOCAL_IP]: " CUSTOM_IP
        CUSTOM_IP=${CUSTOM_IP:-$LOCAL_IP}
        API_URL="http://$CUSTOM_IP:8080"
        ;;
    3)
        read -p "Enter your domain name (e.g., api.platzpilot.com): " DOMAIN
        if [ -z "$DOMAIN" ]; then
            print_error "Domain name is required"
            exit 1
        fi
        API_URL="https://$DOMAIN"
        ;;
    4)
        read -p "Enter your server IP or domain: " SERVER
        if [ -z "$SERVER" ]; then
            print_error "Server address is required"
            exit 1
        fi
        API_URL="http://$SERVER"
        ;;
    5)
        read -p "Enter custom API URL: " CUSTOM_URL
        if [ -z "$CUSTOM_URL" ]; then
            print_error "URL is required"
            exit 1
        fi
        API_URL="$CUSTOM_URL"
        ;;
    6)
        print_status "Current configuration in $ENV_FILE:"
        cat "$ENV_FILE" 2>/dev/null || echo "File doesn't exist or is empty"
        exit 0
        ;;
    7)
        print_status "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Update configuration
print_status "Setting API URL to: $API_URL"

# Remove existing EXPO_PUBLIC_API_URL lines
grep -v "^EXPO_PUBLIC_API_URL=" "$ENV_FILE" > "${ENV_FILE}.tmp" 2>/dev/null || touch "${ENV_FILE}.tmp"

# Add new configuration
echo "EXPO_PUBLIC_API_URL=$API_URL" >> "${ENV_FILE}.tmp"

# Move temp file to replace original
mv "${ENV_FILE}.tmp" "$ENV_FILE"

print_success "✅ Configuration updated!"

# Show final configuration
echo ""
print_status "Updated configuration:"
cat "$ENV_FILE"

# Test connection if possible
echo ""
print_status "🧪 Testing connection..."
if command -v curl &> /dev/null; then
    HEALTH_URL="$API_URL/api/health"
    if curl -s --connect-timeout 5 "$HEALTH_URL" > /dev/null 2>&1; then
        print_success "✅ Server is reachable at $API_URL"
        
        # Try to get server info
        SERVER_INFO=$(curl -s --connect-timeout 5 "$API_URL/api/health" 2>/dev/null)
        if [ ! -z "$SERVER_INFO" ]; then
            echo "Server response: $SERVER_INFO"
        fi
    else
        print_warning "⚠️ Could not reach server at $API_URL"
        echo "This might be normal if:"
        echo "  • Server is not running yet"
        echo "  • You're configuring for later use"
        echo "  • Network restrictions apply"
    fi
else
    print_warning "curl not available - skipping connection test"
fi

echo ""
print_status "Next steps:"
echo "1. Make sure your server is running"
echo "2. Restart your React Native development server:"
echo "   cd $CLIENT_DIR && npm start"
echo "3. Reload your app to pick up the new configuration"
echo ""

# Additional tips based on configuration
case $choice in
    1)
        echo "💡 Local development tips:"
        echo "   • Start server: cd server && python start_server.py"
        echo "   • Test API: curl http://localhost:8080/api/health"
        ;;
    2)
        echo "💡 Physical device testing tips:"
        echo "   • Make sure both devices are on the same network"
        echo "   • Check firewall settings on your computer"
        echo "   • Verify the IP address is correct"
        ;;
    3|4)
        echo "💡 Production server tips:"
        echo "   • Make sure your VPS is properly deployed"
        echo "   • Check DNS configuration for your domain"
        echo "   • Verify SSL certificate if using HTTPS"
        ;;
esac

print_success "🎉 Client configuration complete!"