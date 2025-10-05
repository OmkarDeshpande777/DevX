#!/usr/bin/env python3
"""
Startup script for Disease Detection API
Ensures the server stays running
"""
import sys
import os
import uvicorn
from pathlib import Path

# Add current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Import the FastAPI app
from main import app

if __name__ == "__main__":
    print("🚀 Starting Disease Detection API Server...")
    print("📍 Server will be available at: http://localhost:1234")
    print("📖 API docs will be available at: http://localhost:1234/docs")
    print("⏹️  Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=1234,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        sys.exit(1)