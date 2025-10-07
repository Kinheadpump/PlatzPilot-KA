#!/usr/bin/env python3
"""
PlatzPilot Server Launcher
Runs both the data collection service and API server concurrently.
"""

import sys
import threading
import time
import signal
import subprocess
import os
from pathlib import Path

def run_data_collector():
    """Run the main data collection service."""
    print("🔄 Starting data collection service...")
    try:
        # Import and run the main data collector
        from main import main
        main()
    except KeyboardInterrupt:
        print("🛑 Data collection service stopped")
    except Exception as e:
        print(f"❌ Data collection service error: {e}")

def run_api_server():
    """Run the API server."""
    print("🌐 Starting API server...")
    try:
        # Import and run the API server
        from api_server import run_server
        run_server(host='0.0.0.0', port=8080)
    except KeyboardInterrupt:
        print("🛑 API server stopped")
    except Exception as e:
        print(f"❌ API server error: {e}")

def signal_handler(signum, frame):
    """Handle shutdown signals gracefully."""
    print(f"\n🛑 Received signal {signum}, shutting down services...")
    sys.exit(0)

def main():
    """Main launcher function."""
    print("🚀 Starting PlatzPilot Server")
    print("=" * 50)
    
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Check if we're in the right directory
    if not os.path.exists('config.json'):
        print("❌ Error: config.json not found. Please run from the server directory.")
        sys.exit(1)
    
    # Create threads for both services
    data_thread = threading.Thread(target=run_data_collector, name="DataCollector", daemon=True)
    api_thread = threading.Thread(target=run_api_server, name="APIServer", daemon=True)
    
    try:
        # Start both services
        data_thread.start()
        time.sleep(2)  # Give data collector a head start
        api_thread.start()
        
        print("✅ Both services started successfully!")
        print("📡 Data collection: Running in background")
        print("🌐 API server: http://localhost:8080")
        print("🔍 Health check: http://localhost:8080/api/health")
        print("📋 Library data: http://localhost:8080/api/libraries")
        print("\nPress Ctrl+C to stop all services")
        
        # Keep main thread alive
        while True:
            if not data_thread.is_alive():
                print("⚠️ Data collection thread died, restarting...")
                data_thread = threading.Thread(target=run_data_collector, name="DataCollector", daemon=True)
                data_thread.start()
            
            if not api_thread.is_alive():
                print("⚠️ API server thread died, restarting...")
                api_thread = threading.Thread(target=run_api_server, name="APIServer", daemon=True)
                api_thread.start()
            
            time.sleep(10)  # Check every 10 seconds
            
    except KeyboardInterrupt:
        print("\n🛑 Shutting down all services...")
    except Exception as e:
        print(f"\n❌ Launcher error: {e}")
    finally:
        print("👋 PlatzPilot Server stopped")

if __name__ == "__main__":
    main()