#!/usr/bin/env python3
"""Test script to verify model loading and prediction functionality"""

from src.predict import predict_from_dict

# Test input data
test_input = {
    'N': 60, 
    'P': 45, 
    'K': 50, 
    'temperature': 25, 
    'humidity': 70, 
    'ph': 6.5, 
    'rainfall': 800, 
    'area_ha': 2.0
}

print("Testing AI model with sample input...")
result = predict_from_dict(test_input)

print(f"✅ Predicted crop: {result['recommended_crop']}")
print(f"✅ Confidence: {result['confidence']:.3f}")
print(f"✅ Method: {result.get('method', 'unknown')}")
print(f"✅ Expected yield: {result['expected_yield_t_per_acre']} t/acre")
print(f"✅ Net profit: ₹{result['profit_breakdown']['net']:,}")

if result.get('method') != 'fallback':
    print("🎉 SUCCESS: AI models are working properly!")
else:
    print("⚠️ WARNING: Still using fallback predictions")