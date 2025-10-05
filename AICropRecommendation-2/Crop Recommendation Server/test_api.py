#!/usr/bin/env python3
"""Test the AI API server to verify it's working properly"""

import requests
import json

# Test data
test_data = {
    "N": 60,
    "P": 45,
    "K": 50,
    "temperature": 25,
    "humidity": 70,
    "ph": 6.5,
    "rainfall": 800,
    "area_ha": 2.0
}

try:
    print("🔄 Testing AI API server...")
    response = requests.post("http://localhost:8000/predict", json=test_data)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ API Test SUCCESSFUL!")
        print(f"✅ Recommended crop: {result['recommended_crop']}")
        print(f"✅ Confidence: {result['confidence']:.3f}")
        print(f"✅ Expected yield: {result['expected_yield_t_per_acre']} t/acre")
        print(f"✅ Net profit: ₹{result['profit_breakdown']['net']:,}")
        print(f"✅ Model version: {result['model_version']}")
        
        if 'fallback' not in result['model_version']:
            print("🎉 SUCCESS: AI models are working through API!")
        else:
            print("⚠️ WARNING: API still using fallback predictions")
    else:
        print(f"❌ API Test FAILED: {response.status_code}")
        print(f"Response: {response.text}")

except requests.exceptions.ConnectionError:
    print("❌ Cannot connect to AI API server on localhost:8000")
    print("Make sure the server is running with: python api_server.py")
except Exception as e:
    print(f"❌ Error testing API: {e}")