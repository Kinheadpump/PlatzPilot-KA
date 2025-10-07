#!/usr/bin/env python3
"""
Test script to verify PlatzPilot server setup and API endpoints.
"""

import json
import requests
import time
import sys
from datetime import datetime

def test_health_endpoint(base_url):
    """Test the health endpoint."""
    try:
        print("🔍 Testing health endpoint...")
        response = requests.get(f"{base_url}/api/health", timeout=5)
        
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Health check passed")
            print(f"   Status: {health_data.get('status', 'unknown')}")
            print(f"   Data available: {health_data.get('data_available', False)}")
            print(f"   Last update: {health_data.get('last_data_update', 'never')}")
            return True
        else:
            print(f"❌ Health check failed: HTTP {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check error: {e}")
        return False

def test_libraries_endpoint(base_url):
    """Test the libraries data endpoint."""
    try:
        print("\n📚 Testing libraries endpoint...")
        response = requests.get(f"{base_url}/api/libraries", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if 'data' in data and 'metadata' in data:
                library_data = data['data']
                metadata = data['metadata']
                
                # Count total libraries
                total_libs = sum(len(category_libs) for category_libs in library_data.values())
                
                print(f"✅ Libraries data retrieved successfully")
                print(f"   Total categories: {len(library_data)}")
                print(f"   Total libraries: {total_libs}")
                print(f"   Last server update: {metadata.get('last_update', 'unknown')}")
                print(f"   Server time: {metadata.get('server_time', 'unknown')}")
                
                # Sample a few libraries
                print(f"\n📋 Sample libraries:")
                count = 0
                for category, libraries in library_data.items():
                    if libraries and count < 3:
                        lib = libraries[0]
                        print(f"   {category}: {lib.get('long_name', 'Unknown')} "
                              f"({lib.get('free_seats_currently', 0)}/{lib.get('available_seats', 0)} free)")
                        count += 1
                
                return True
            else:
                print(f"❌ Invalid response structure")
                return False
                
        elif response.status_code == 503:
            print(f"⚠️ Service unavailable (data not ready yet)")
            print("   The server may still be fetching initial data. Wait a few minutes and try again.")
            return False
        else:
            print(f"❌ Libraries endpoint failed: HTTP {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('error', 'Unknown error')}")
            except:
                pass
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Libraries endpoint error: {e}")
        return False

def wait_for_data(base_url, max_wait=300):
    """Wait for data to become available."""
    print(f"\n⏳ Waiting for data to become available (max {max_wait}s)...")
    
    start_time = time.time()
    while time.time() - start_time < max_wait:
        try:
            response = requests.get(f"{base_url}/api/health", timeout=5)
            if response.status_code == 200:
                health_data = response.json()
                if health_data.get('data_available', False):
                    print(f"✅ Data is now available!")
                    return True
        except:
            pass
        
        print(".", end="", flush=True)
        time.sleep(10)
    
    print(f"\n⏰ Timeout waiting for data")
    return False

def main():
    """Main test function."""
    base_url = "http://localhost:8080"
    
    if len(sys.argv) > 1:
        base_url = sys.argv[1].rstrip('/')
    
    print("🧪 PlatzPilot API Test Script")
    print("=" * 40)
    print(f"Testing server at: {base_url}")
    print(f"Test time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test health endpoint
    if not test_health_endpoint(base_url):
        print("\n❌ Server appears to be down. Make sure it's running with:")
        print("   cd server && python start_server.py")
        return False
    
    # Test libraries endpoint
    if not test_libraries_endpoint(base_url):
        # If data not available, wait for it
        if wait_for_data(base_url):
            test_libraries_endpoint(base_url)
        else:
            print("\n❌ Could not retrieve library data.")
            print("Check server logs for errors:")
            print("   tail -f server/log/seat_tracker.log")
            return False
    
    print("\n🎉 All tests passed! The server is working correctly.")
    print("\nNext steps:")
    print("1. Start the React Native client: cd client && npm start")
    print("2. Configure client API URL in: client/.env.local")
    print("3. Test the mobile app with real-time data!")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)