#!/bin/bash

# PlatzPilot Real-Time Setup Test Script
# This script helps verify that the real-time data connection is working

set -e

echo "🚀 PlatzPilot Real-Time Setup Test"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if we're in the right directory
if [ ! -f "server/config.json" ] || [ ! -f "client/package.json" ]; then
    print_error "Please run this script from the PlatzPilot root directory"
    exit 1
fi

print_status "Found PlatzPilot project structure ✓"

# Check Python installation and dependencies
print_status "Checking Python environment..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_success "Python $PYTHON_VERSION found"
    
    # Check if requirements are installed
    cd server
    if python3 -c "import requests, numpy" 2>/dev/null; then
        print_success "Python dependencies are installed"
    else
        print_warning "Installing Python dependencies..."
        pip3 install -r requirements.txt
    fi
    cd ..
else
    print_error "Python 3 not found. Please install Python 3.8 or later."
    exit 1
fi

# Check Node.js and npm
print_status "Checking Node.js environment..."
if command -v npm &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js $NODE_VERSION found"
    
    # Check if client dependencies are installed
    cd client
    if [ ! -d "node_modules" ]; then
        print_warning "Installing client dependencies..."
        npm install
    else
        print_success "Client dependencies are installed"
    fi
    cd ..
else
    print_error "Node.js/npm not found. Please install Node.js 18 or later."
    exit 1
fi

# Test server functionality
print_status "Testing server setup..."

# Start server in background for testing
cd server
echo "Starting Python server..."
python3 start_server.py &
SERVER_PID=$!
cd ..

# Wait for server to start
print_status "Waiting for server to start..."
sleep 5

# Test the server
cd server
if python3 test_api.py; then
    print_success "Server is working correctly!"
else
    print_error "Server test failed"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi
cd ..

# Stop the test server
kill $SERVER_PID 2>/dev/null || true
sleep 2

# Check client configuration
print_status "Checking client configuration..."
cd client

if [ -f ".env.local" ]; then
    print_success "Client environment file found"
else
    print_warning "Creating client environment file..."
    cp .env.example .env.local
    print_status "Please edit client/.env.local to set your API URL"
fi

cd ..

# Final instructions
echo ""
echo "🎉 Setup verification complete!"
echo ""
echo "Next steps to start the real-time system:"
echo ""
echo "1. Start the Python server:"
echo "   cd server && python3 start_server.py"
echo ""
echo "2. In a new terminal, start the React Native client:"
echo "   cd client && npm start"
echo ""
echo "3. Configure your API URL in client/.env.local:"
echo "   - For development: EXPO_PUBLIC_API_URL=http://localhost:8080"
echo "   - For physical device: Replace localhost with your computer's IP"
echo ""
echo "4. Test endpoints manually:"
echo "   curl http://localhost:8080/api/health"
echo "   curl http://localhost:8080/api/libraries"
echo ""
echo "📚 For detailed setup instructions, see REALTIME_SETUP.md"
echo ""
print_success "You're ready to use PlatzPilot with real-time data!"