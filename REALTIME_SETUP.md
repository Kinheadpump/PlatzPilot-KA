# 🔄 Real-Time Data Setup Guide

This guide explains how to set up PlatzPilot to use real-time data from the server instead of static example data.

## 🏗️ Architecture Overview

```
[External API] → [Python Server] → [JSON File] → [HTTP API] → [React Native Client]
     ↓               ↓                  ↓             ↓              ↓
  KIT SeatFinder  Data Processing   Local Storage   REST API    Mobile App
```

## 📋 Prerequisites

- Python 3.8+ with required packages (see `server/requirements.txt`)
- Node.js 18+ with npm/yarn
- Expo CLI for React Native development

## 🚀 Quick Start

### 1. Start the Python Server

```bash
cd server

# Install dependencies (if not already done)
pip install -r requirements.txt

# Start both data collection and API server
python start_server.py
```

This starts:
- **Data Collection Service**: Fetches data every 5 minutes from KIT SeatFinder
- **HTTP API Server**: Serves data to client on port 8080

### 2. Configure the Client

```bash
cd client

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your server URL
# For development: EXPO_PUBLIC_API_URL=http://localhost:8080
# For production: EXPO_PUBLIC_API_URL=https://your-server.com
```

### 3. Start the Client

```bash
cd client

# Install dependencies
npm install

# Start Expo development server
npm start
```

## 🔧 Configuration Details

### Server Configuration

The server uses `server/config.json` for configuration:

```json
{
  "other": {
    "fetch_interval": 300,  // 5 minutes between data fetches
    "seats_url": "https://seatfinder.bibliothek.kit.edu/...",
    "max_forecast": 12      // Number of prediction steps
  },
  "save_files": {
    "json_save_file": "seat_finder_data.json"  // Client data file
  }
}
```

### Client Configuration

The client uses environment variables:

```bash
# Development (localhost)
EXPO_PUBLIC_API_URL=http://localhost:8080

# Production deployment
EXPO_PUBLIC_API_URL=https://your-domain.com

# Physical device testing (replace with your computer's IP)
EXPO_PUBLIC_API_URL=http://192.168.1.100:8080
```

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and data availability.

### Library Data
```
GET /api/libraries
```
Returns complete library data with metadata:

```json
{
  "data": {
    "KITBIBS_A": [...],
    "FBIB": [...],
    // ... other categories
  },
  "metadata": {
    "last_update": "2025-01-07T10:30:00.000Z",
    "server_time": "2025-01-07T10:31:15.123Z",
    "total_locations": 22
  }
}
```

## 🔄 Data Flow

1. **Collection**: Python server fetches data from KIT SeatFinder API every 5 minutes
2. **Processing**: Data is processed, forecasts generated, and saved to JSON file
3. **Serving**: HTTP API server reads JSON file and serves to clients
4. **Caching**: Client caches data locally and refreshes every 2 minutes
5. **Updates**: Real-time updates via pull-to-refresh and automatic background sync

## 🛠️ Features

### Automatic Data Refresh
- **Server**: Fetches new data every 5 minutes
- **Client**: Auto-refreshes every 2 minutes when app is active
- **Manual Refresh**: Pull-to-refresh gesture in app

### Offline Support
- **Local Caching**: Data cached in AsyncStorage for offline access
- **Graceful Degradation**: Shows cached data when server unavailable
- **Error Handling**: Clear error messages with retry options

### Real-time Forecasting
- **Holt-Winters Model**: Predicts seat availability for next hour
- **Bounded Predictions**: Forecasts respect physical seat limits
- **Visual Charts**: Interactive charts show prediction trends

## 🔍 Troubleshooting

### Common Issues

**"Failed to fetch library data"**
- Check if Python server is running: `curl http://localhost:8080/api/health`
- Verify API URL in client `.env.local` file
- Check network connectivity

**"Data not available yet"**
- Server is starting up, wait 1-2 minutes for first data fetch
- Check server logs for fetch errors

**Charts not showing**
- Ensure predictions data is available in API response
- Check if `react-native-svg` is properly installed

**Physical device can't connect**
- Replace `localhost` with your computer's IP address in `.env.local`
- Ensure both devices are on same network
- Check firewall settings (port 8080 should be accessible)

### Development Tips

**Local Development**
```bash
# Terminal 1: Start Python server
cd server && python start_server.py

# Terminal 2: Start React Native client  
cd client && npm start

# Terminal 3: Check API manually
curl http://localhost:8080/api/libraries | jq
```

**Production Deployment**
- Use a process manager (PM2, systemd) for the Python server
- Configure reverse proxy (nginx) for HTTPS
- Update client environment variables for production URL
- Consider using WebSocket for real-time updates

## 🎯 Next Steps

- **WebSocket Support**: Real-time push updates instead of polling
- **Push Notifications**: Alert users when favorite libraries have available seats
- **Historical Data**: Show trends and patterns over time
- **Multi-campus Support**: Extend to other university libraries

## 📞 Support

If you encounter issues:
1. Check server logs: `tail -f server/log/seat_tracker.log`
2. Test API manually: `curl http://localhost:8080/api/health`
3. Enable debug mode in React Native for detailed error messages