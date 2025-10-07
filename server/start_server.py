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

def run_api_server(host='0.0.0.0', port=8080):
    """Run the API server."""
    print(f"🌐 Starting API server on {host}:{port}...")
    try:
        # Import and run the API server
        from api_server import run_server
        run_server(host=host, port=port)
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
    import argparse
    
    parser = argparse.ArgumentParser(description='PlatzPilot Server Launcher')
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind API server to (default: 0.0.0.0)')
    parser.add_argument('--port', type=int, default=8080, help='Port to bind API server to (default: 8080)')
    parser.add_argument('--data-only', action='store_true', help='Run only data collection service')
    parser.add_argument('--api-only', action='store_true', help='Run only API server')
    
    args = parser.parse_args()
    
    print("🚀 Starting PlatzPilot Server")
    print("=" * 50)
    
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Check if we're in the right directory
    if not os.path.exists('config.json'):
        print("❌ Error: config.json not found. Please run from the server directory.")
        sys.exit(1)
    
    # Create threads for services
    data_thread = None
    api_thread = None
    
    if not args.api_only:
        data_thread = threading.Thread(target=run_data_collector, name="DataCollector", daemon=True)
    
    if not args.data_only:
        api_thread = threading.Thread(target=lambda: run_api_server(args.host, args.port), name="APIServer", daemon=True)
    
    try:
        # Start services
        services_started = []
        
        if data_thread:
            data_thread.start()
            services_started.append("📡 Data collection")
            time.sleep(2)  # Give data collector a head start
        
        if api_thread:
            api_thread.start()
            services_started.append(f"🌐 API server: http://{args.host}:{args.port}")
        
        print("✅ Services started successfully!")
        for service in services_started:
            print(f"   {service}")
        
        if api_thread:
            print(f"🔍 Health check: http://{args.host}:{args.port}/api/health")
            print(f"📋 Library data: http://{args.host}:{args.port}/api/libraries")
        
        print("\nPress Ctrl+C to stop all services")
        
        # Keep main thread alive
        while True:
            if data_thread and not data_thread.is_alive():
                print("⚠️ Data collection thread died, restarting...")
                data_thread = threading.Thread(target=run_data_collector, name="DataCollector", daemon=True)
                data_thread.start()
            
            if api_thread and not api_thread.is_alive():
                print("⚠️ API server thread died, restarting...")
                api_thread = threading.Thread(target=lambda: run_api_server(args.host, args.port), name="APIServer", daemon=True)
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