
# 📊 PlatzPilot KA 

Real-time library seat finder & occupancy prediction for Karlsruhe libraries.

---

**PlatzPilot** is a complete solution consisting of:
- 📱 **React Native Mobile App** - User-friendly interface with real-time data
- 🐍 **Python Backend Server** - Data collection, processing, and API service
- 🔄 **Real-time Data Pipeline** - From external APIs to your mobile device

---

## 🚀 Key Features

### Backend (Python)
- ⏱ **Auto Data Collection**: Fetches seat data every 5 minutes from KIT SeatFinder
- 🧠 **ML Forecasting**: Holt-Winters model predicts future seat availability  
- 💾 **Efficient Storage**: Ring buffer with NumPy memmap for time-series data
- 🌐 **HTTP API Server**: RESTful endpoints for real-time client access
- 🔐 **Robust Error Handling**: Retry logic, timeout management, comprehensive logging

### Frontend (React Native)
- � **Cross-platform**: Works on iOS and Android
- 🔄 **Real-time Updates**: Automatic background sync every 2 minutes
- 📊 **Interactive Charts**: Visual predictions with react-native-chart-kit
- ❤️ **Favorites System**: Save and track preferred libraries
- 🌙 **Dark/Light Theme**: Automatic system theme support
- � **Offline Support**: Cached data when server unavailable

### Data Pipeline
```
KIT SeatFinder API → Python Server → JSON Storage → HTTP API → Mobile App
     (5min)              (real-time)      (cached)        (2min sync)
```

---

## 🏃‍♂️ Quick Start

### 🖥️ Local Development

#### Option 1: Automated Setup
```bash
git clone https://github.com/Kinheadpump/PlatzPilot-KA.git
cd PlatzPilot-KA
./setup_realtime.sh
```

#### Option 2: Manual Setup
```bash
# 1. Start the Backend
cd server
pip install -r requirements.txt
python start_server.py

# 2. Configure & Start Frontend (new terminal)
cd client
npm install
cp .env.example .env.local
npm start
```

### 🌐 VPS Deployment

#### Quick Deploy to VPS
```bash
# On your VPS
wget https://raw.githubusercontent.com/Kinheadpump/PlatzPilot-KA/main/deploy_vps.sh
chmod +x deploy_vps.sh
./deploy_vps.sh
```

#### Configure Client for Production
```bash
# On your development machine
cd client
./configure_api.sh  # Interactive configuration helper
# OR manually edit .env.local:
echo "EXPO_PUBLIC_API_URL=https://your-domain.com" > .env.local
```

#### Update Deployed Server
```bash
# On your VPS
./update_vps.sh  # Pull updates and restart service
```

---

## � Architecture Overview

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   KIT Library   │────│    Python    │────│  React Native   │
│   SeatFinder    │    │    Server    │    │   Mobile App    │
│      API        │    │              │    │                 │
└─────────────────┘    └──────────────┘    └─────────────────┘
        │                       │                     │
        │ JSONP every 5min      │ HTTP API           │ Auto-sync
        │                       │ Port 8080          │ every 2min
        │                       │                     │
    ┌───▼─────┐          ┌──────▼────┐        ┌──────▼────┐
    │ Raw     │          │ Processed │        │ Cached    │
    │ Seat    │          │ Data +    │        │ Data +    │
    │ Data    │          │ Forecasts │        │ Favorites │
    └─────────┘          └───────────┘        └───────────┘
```

## 🔧 Configuration

### Server Config (`server/config.json`)
```json
{
  "other": {
    "fetch_interval": 300,     // 5 minutes
    "seats_url": "https://seatfinder.bibliothek.kit.edu/...",
    "max_forecast": 12         // 1 hour ahead (5min intervals)
  }
}
```

### Client Config (`client/.env.local`)
```bash
# Development
EXPO_PUBLIC_API_URL=http://localhost:8080

# Production  
EXPO_PUBLIC_API_URL=https://your-server.com

# Physical device (replace with your computer's IP)
EXPO_PUBLIC_API_URL=http://192.168.1.100:8080
```

---

## 🛠 Development

### Run Tests
```bash
# Test server functionality
cd server && python test_api.py

# Test mobile app
cd client && npm test
```

### Monitor Logs
```bash
# Server logs
tail -f server/log/seat_tracker.log

# API requests
curl -s http://localhost:8080/api/health | jq
```

### Debug Mode
```bash
# Enable detailed logging
cd server && python start_server.py --debug

# React Native debugging
cd client && npm start -- --reset-cache
```

---

## 📖 Documentation

- **[🔄 Real-time Setup Guide](REALTIME_SETUP.md)** - Detailed setup instructions
- **[🚀 VPS Deployment](VPS_DEPLOYMENT.md)** - Production deployment guide
- **[📱 Client Architecture](client/README.md)** - Mobile app details
- **[� Server Architecture](server/README.md)** - Backend details

---

## 🎯 Roadmap

- [ ] **WebSocket Support**: Real-time push notifications instead of polling
- [ ] **Push Notifications**: Alert when favorite libraries have free seats  
- [ ] **Historical Analytics**: Show usage patterns and trends over time
- [ ] **Multi-University**: Extend to other university library systems
- [ ] **Offline Maps**: Show library locations without internet
- [ ] **Smart Recommendations**: ML-powered seat availability predictions

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`) 
5. Open a Pull Request

---

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Setup Issues**: Run `./setup_realtime.sh` for automated diagnostics
- **Server Problems**: Check `server/log/seat_tracker.log`
- **Client Issues**: Enable debug mode and check Metro bundler output
- **API Testing**: Use `curl http://localhost:8080/api/health`

**Need help?** Open an issue with:
- Your operating system
- Error messages/logs
- Steps to reproduce
