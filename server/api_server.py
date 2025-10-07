#!/usr/bin/env python3
"""
HTTP API server for PlatzPilot - serves library data to mobile clients.
"""

import json
import os
import threading
import time
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

from tools.config import AppConfig
from tools.log import setup_logger

# Global variables
config = AppConfig('config.json')
logger = setup_logger(name="api_server", level="DEBUG", logger_dir=config.logger_config)
data_lock = threading.Lock()
cached_data = None
last_update = None

class LibraryAPIHandler(BaseHTTPRequestHandler):
    """HTTP request handler for library data API."""
    
    def _set_cors_headers(self):
        """Set CORS headers to allow client access."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def _send_json_response(self, data, status_code=200):
        """Send JSON response with appropriate headers."""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        
        json_str = json.dumps(data, ensure_ascii=False, indent=2)
        self.wfile.write(json_str.encode('utf-8'))
    
    def _send_error_response(self, message, status_code=500):
        """Send error response."""
        error_data = {
            'error': message,
            'timestamp': datetime.now().isoformat()
        }
        self._send_json_response(error_data, status_code)
    
    def do_OPTIONS(self):
        """Handle preflight OPTIONS requests."""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests."""
        try:
            parsed_url = urlparse(self.path)
            path = parsed_url.path
            
            logger.info(f"GET request: {path}")
            
            if path == '/api/libraries':
                self._handle_libraries_request()
            elif path == '/api/health':
                self._handle_health_request()
            elif path == '/':
                self._handle_root_request()
            else:
                self._send_error_response("Endpoint not found", 404)
                
        except Exception as e:
            logger.error(f"Error handling GET request: {e}")
            self._send_error_response("Internal server error")
    
    def _handle_libraries_request(self):
        """Handle /api/libraries endpoint."""
        global cached_data, last_update
        
        try:
            with data_lock:
                if cached_data is None:
                    # Try to load data from file if not cached
                    data_file_path = os.path.join(
                        config.ring_buffer_config, 
                        config.json_save_file
                    )
                    
                    if os.path.exists(data_file_path):
                        with open(data_file_path, 'r', encoding='utf-8') as f:
                            cached_data = json.load(f)
                            last_update = datetime.now()
                    else:
                        self._send_error_response("Data not available yet", 503)
                        return
                
                # Add metadata to response
                response_data = {
                    'data': cached_data,
                    'metadata': {
                        'last_update': last_update.isoformat() if last_update else None,
                        'server_time': datetime.now().isoformat(),
                        'total_locations': len(cached_data) if cached_data else 0
                    }
                }
                
                self._send_json_response(response_data)
                logger.info("Libraries data served successfully")
                
        except Exception as e:
            logger.error(f"Error serving libraries data: {e}")
            self._send_error_response("Failed to load library data")
    
    def _handle_health_request(self):
        """Handle /api/health endpoint."""
        global last_update
        
        health_data = {
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'data_available': cached_data is not None,
            'last_data_update': last_update.isoformat() if last_update else None
        }
        
        self._send_json_response(health_data)
    
    def _handle_root_request(self):
        """Handle root endpoint with API information."""
        info_data = {
            'service': 'PlatzPilot API Server',
            'version': '1.0.0',
            'endpoints': {
                '/api/libraries': 'Get current library data',
                '/api/health': 'Health check endpoint'
            },
            'timestamp': datetime.now().isoformat()
        }
        
        self._send_json_response(info_data)
    
    def log_message(self, format, *args):
        """Override default logging to use our logger."""
        logger.info(f"{self.client_address[0]} - {format % args}")


def update_cached_data():
    """Background thread to update cached data from file."""
    global cached_data, last_update
    
    data_file_path = os.path.join(
        config.ring_buffer_config, 
        config.json_save_file
    )
    
    while True:
        try:
            if os.path.exists(data_file_path):
                # Check if file was modified
                file_mtime = os.path.getmtime(data_file_path)
                
                if (last_update is None or 
                    file_mtime > last_update.timestamp()):
                    
                    with data_lock:
                        with open(data_file_path, 'r', encoding='utf-8') as f:
                            new_data = json.load(f)
                            cached_data = new_data
                            last_update = datetime.now()
                        
                        logger.info("Cached data updated from file")
            
            # Check every 30 seconds for data updates
            time.sleep(30)
            
        except Exception as e:
            logger.error(f"Error updating cached data: {e}")
            time.sleep(60)  # Wait longer on error


def run_server(host='0.0.0.0', port=8080):
    """Run the HTTP API server."""
    logger.info(f"Starting PlatzPilot API Server on {host}:{port}")
    
    # Start background data updater
    data_thread = threading.Thread(target=update_cached_data, daemon=True)
    data_thread.start()
    
    server_address = (host, port)
    httpd = HTTPServer(server_address, LibraryAPIHandler)
    
    try:
        logger.info("API Server is running...")
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Shutting down API Server...")
        httpd.shutdown()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='PlatzPilot API Server')
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind to')
    parser.add_argument('--port', type=int, default=8080, help='Port to bind to')
    
    args = parser.parse_args()
    
    run_server(args.host, args.port)