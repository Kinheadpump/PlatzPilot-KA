# 🚀 VPS Deployment Guide

This guide will help you deploy the PlatzPilot server to a VPS and connect your mobile client to the live data.

## 📋 Prerequisites

- **VPS Server** (Ubuntu 20.04+ recommended, 1GB RAM minimum)
- **Domain name** (optional but recommended for HTTPS)
- **SSH access** to your VPS
- **Basic Linux knowledge**

## 🏗️ VPS Setup

### 1. Connect to Your VPS

```bash
ssh root@your-server-ip
# or
ssh your-username@your-server-ip
```

### 2. Update System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv git curl nginx
```

### 3. Create Application User

```bash
sudo adduser platzpilot --disabled-password --gecos ""
sudo usermod -aG sudo platzpilot
sudo su - platzpilot
```

## 📥 Deploy Application

### 1. Clone Repository

```bash
cd ~
git clone https://github.com/Kinheadpump/PlatzPilot-KA.git
cd PlatzPilot-KA
```

### 2. Setup Python Environment

```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Test Server (Optional)

```bash
# Test the server works
python start_server.py

# In another terminal, test the API
curl http://localhost:8080/api/health
```

Press `Ctrl+C` to stop the test server.

## 🔧 Production Configuration

### 1. Create systemd Service

Create the service file:

```bash
sudo nano /etc/systemd/system/platzpilot.service
```

Add this content:

```ini
[Unit]
Description=PlatzPilot Server
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=platzpilot
Group=platzpilot
WorkingDirectory=/home/platzpilot/PlatzPilot-KA/server
Environment=PATH=/home/platzpilot/PlatzPilot-KA/server/venv/bin
ExecStart=/home/platzpilot/PlatzPilot-KA/server/venv/bin/python start_server.py --host 127.0.0.1 --port 8080
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
ReadWritePaths=/home/platzpilot/PlatzPilot-KA/server

[Install]
WantedBy=multi-user.target
```

### 2. Enable and Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable platzpilot
sudo systemctl start platzpilot

# Check status
sudo systemctl status platzpilot
```

### 3. Configure Nginx Reverse Proxy

Create nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/platzpilot
```

**Option A: HTTP Only (for testing)**

```nginx
server {
    listen 80;
    server_name your-domain.com your-server-ip;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers for mobile app
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
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
```

**Option B: HTTPS (Recommended for production)**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration (Let's Encrypt certificates)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers for mobile app
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization";
            return 204;
        }
    }

    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 4. Enable Nginx Configuration

```bash
sudo ln -s /etc/nginx/sites-available/platzpilot /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## 🔒 SSL Setup (HTTPS - Recommended)

### 1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Get SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com

# Follow the prompts to configure HTTPS
```

### 3. Auto-renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot will automatically set up renewal via cron
```

## 🔥 Firewall Configuration

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Check status
sudo ufw status
```

## 📱 Client Configuration

### 1. Update Client Environment

Edit `client/.env.local`:

```bash
# For HTTP deployment
EXPO_PUBLIC_API_URL=http://your-server-ip

# For HTTPS deployment (recommended)
EXPO_PUBLIC_API_URL=https://your-domain.com

# Example
EXPO_PUBLIC_API_URL=https://api.platzpilot.com
```

### 2. Test Client Connection

```bash
cd client
npm start

# The app should now connect to your VPS server!
```

## 🔍 Monitoring & Maintenance

### Check Service Status

```bash
# Service status
sudo systemctl status platzpilot

# View logs
sudo journalctl -u platzpilot -f

# Application logs
tail -f /home/platzpilot/PlatzPilot-KA/server/log/seat_tracker.log
```

### Test API Endpoints

```bash
# Health check
curl https://your-domain.com/api/health

# Library data
curl https://your-domain.com/api/libraries

# From your local machine
curl https://your-domain.com/api/libraries | jq '.metadata'
```

### Update Application

```bash
# SSH to server
ssh platzpilot@your-server-ip

# Pull updates
cd ~/PlatzPilot-KA
git pull

# Restart service
sudo systemctl restart platzpilot
```

## 🚨 Troubleshooting

### Common Issues

**1. Service Won't Start**
```bash
# Check logs
sudo journalctl -u platzpilot -n 50

# Check Python dependencies
cd /home/platzpilot/PlatzPilot-KA/server
source venv/bin/activate
python -c "import requests, numpy"
```

**2. Nginx 502 Bad Gateway**
```bash
# Check if service is running
sudo systemctl status platzpilot

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

**3. Client Can't Connect**
```bash
# Test from server
curl http://localhost:8080/api/health

# Test from internet
curl https://your-domain.com/api/health

# Check firewall
sudo ufw status
```

**4. SSL Issues**
```bash
# Renew certificate
sudo certbot renew

# Test SSL
openssl s_client -connect your-domain.com:443
```

### Performance Tuning

**For servers with limited resources:**

1. **Reduce fetch frequency** in `server/config.json`:
```json
{
  "other": {
    "fetch_interval": 600  // 10 minutes instead of 5
  }
}
```

2. **Limit log retention**:
```bash
sudo journalctl --vacuum-time=7d
```

## 📊 Monitoring Setup (Optional)

### Basic Monitoring Script

Create `/home/platzpilot/monitor.sh`:

```bash
#!/bin/bash
# Simple monitoring script

LOG_FILE="/home/platzpilot/monitor.log"
API_URL="http://localhost:8080/api/health"

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    if curl -s "$API_URL" > /dev/null; then
        echo "[$TIMESTAMP] API is healthy" >> "$LOG_FILE"
    else
        echo "[$TIMESTAMP] API is down - restarting service" >> "$LOG_FILE"
        sudo systemctl restart platzpilot
    fi
    
    sleep 300  # Check every 5 minutes
done
```

Make it executable and run:
```bash
chmod +x /home/platzpilot/monitor.sh
nohup /home/platzpilot/monitor.sh &
```

## 🎉 Success!

Your PlatzPilot server is now deployed! Your mobile app will:

- ✅ Connect to live data from your VPS
- ✅ Show real-time library occupancy
- ✅ Display ML-generated predictions
- ✅ Work with HTTPS security
- ✅ Handle server downtime gracefully

**Next Steps:**
- Monitor your logs for any issues
- Consider setting up automated backups
- Add monitoring/alerting for production use
- Scale horizontally if needed

**API Endpoints:**
- Health: `https://your-domain.com/api/health`
- Data: `https://your-domain.com/api/libraries`