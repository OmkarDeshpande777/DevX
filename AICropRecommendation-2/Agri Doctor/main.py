import os
import io
import json
import traceback
from datetime import datetime
from typing import Optional, List, Dict, Any
import uvicorn
import pandas as pd
import torch
import torchvision.transforms.functional as TF
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
import CNN
from database_manager import get_db_manager

# Global variables for model and data
model = None
disease_info = None
supplement_info = None
db_manager = None

# Configuration
MODEL_PATH = r"C:\Document Local\Projects\SIH2025Test\AICropRecommendation-2\Agri Doctor\models\plant_disease_model_1_latest.pt"
DISEASE_INFO_PATH = r"C:\Document Local\Projects\SIH2025Test\AICropRecommendation-2\Agri Doctor\disease_info.csv"
SUPPLEMENT_INFO_PATH = r"C:\Document Local\Projects\SIH2025Test\AICropRecommendation-2\Agri Doctor\supplement_info.csv"

# Use the same class mapping as your Flask app
idx_to_classes = CNN.idx_to_classes

def load_model_and_components():
    """Load CNN model and CSV data exactly like Flask app"""
    global model, disease_info, supplement_info, db_manager
    
    try:
        print("📊 Loading CNN model and CSV data...")
        
        # Initialize database manager
        try:
            db_manager = get_db_manager()
            if db_manager and db_manager.test_connection():
                print("✅ Database manager initialized successfully")
            else:
                print("⚠️ Database manager initialized but connection failed")
        except Exception as e:
            print(f"⚠️ Database manager initialization failed: {e}")
            db_manager = None
        
        # Load CNN model exactly like Flask app
        if os.path.exists(MODEL_PATH):
            print(f"Loading CNN model from: {MODEL_PATH}")
            model = CNN.CNN(39)    
            model.load_state_dict(torch.load(MODEL_PATH))
            model.eval()
            print("✅ CNN model loaded successfully")
        else:
            print(f"❌ Model file not found: {MODEL_PATH}")
            raise Exception(f"Model file not found: {MODEL_PATH}")
            
        # Load disease information
        if os.path.exists(DISEASE_INFO_PATH):
            disease_info = pd.read_csv(DISEASE_INFO_PATH, encoding='cp1252')
            print(f"✅ Disease info loaded: {len(disease_info)} entries")
        else:
            print(f"❌ Disease info file not found: {DISEASE_INFO_PATH}")
            disease_info = None
            
        # Load supplement information  
        if os.path.exists(SUPPLEMENT_INFO_PATH):
            supplement_info = pd.read_csv(SUPPLEMENT_INFO_PATH, encoding='cp1252')
            print(f"✅ Supplement info loaded: {len(supplement_info)} entries")
        else:
            print(f"❌ Supplement info file not found: {SUPPLEMENT_INFO_PATH}")
            supplement_info = None
            
        return True
        
    except Exception as e:
        print(f"❌ Error loading model and components: {e}")
        traceback.print_exc()
        return False

def prediction(image: Image.Image) -> int:
    """Predict disease using CNN model - same logic as Flask app"""
    try:
        image = image.resize((224, 224))
        input_data = TF.to_tensor(image)
        input_data = input_data.view((-1, 3, 224, 224))
        
        with torch.no_grad():
            output = model(input_data)
            output = output.detach().numpy()
            index = np.argmax(output)
        return index
    except Exception as e:
        print(f"Error in prediction: {e}")
        return 0  # Return default class if prediction fails

def predict_disease(image: Image.Image) -> Dict[str, Any]:
    """Predict disease using CNN model"""
    global model, disease_info, supplement_info
    
    try:
        if model is None:
            raise Exception("CNN model not loaded")
            
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        # Make prediction using the same function as Flask app
        pred_index = prediction(image)
        
        # Get class name
        predicted_class = idx_to_classes.get(pred_index, "Unknown")
        
        # Extract crop name and disease
        if "___" in predicted_class:
            crop, disease = predicted_class.split("___", 1)
        else:
            crop = "Unknown"
            disease = predicted_class
            
        # Get disease information from CSV (same as Flask app)
        disease_details = get_disease_info(pred_index)
        supplement_details = get_supplement_info(pred_index)
        
        # Calculate confidence from model output
        with torch.no_grad():
            image_resized = image.resize((224, 224))
            input_data = TF.to_tensor(image_resized)
            input_data = input_data.view((-1, 3, 224, 224))
            output = model(input_data)
            probabilities = torch.nn.functional.softmax(output, dim=1)
            confidence = float(torch.max(probabilities).item())
            
            # Create class probabilities dictionary
            class_probabilities = {}
            for idx, prob in enumerate(probabilities[0]):
                if idx in idx_to_classes:
                    class_probabilities[idx_to_classes[idx]] = float(prob.item())
        
        result = {
            "predicted_class": predicted_class,
            "crop": crop,
            "confidence": confidence,
            "risk_assessment": {
                "overall_risk": get_risk_level(confidence, disease),
                "risk_factors": disease_details.get("risk_factors", []),
                "recommendations": disease_details.get("recommendations", [])
            },
            "disease_info": disease_details,
            "class_probabilities": class_probabilities,
            "supplement_info": supplement_details,
            "model_status": "CNN"
        }
        
        return result
        
    except Exception as e:
        print(f"Prediction error: {e}")
        raise e

def get_disease_info(class_idx: int) -> Dict[str, Any]:
    """Get disease information from CSV"""
    global disease_info
    
    try:
        if disease_info is not None and class_idx < len(disease_info):
            row = disease_info.iloc[class_idx]
            
            # Parse the possible steps into recommendations
            possible_steps = str(row.get('Possible Steps', ''))
            recommendations = [step.strip() for step in possible_steps.split('.') if step.strip()]
            
            return {
                "description": str(row.get('description', '')),
                "symptoms": extract_symptoms(str(row.get('description', ''))),
                "solutions": recommendations[:3] if recommendations else [],
                "prevention": recommendations[3:] if len(recommendations) > 3 else [],
                "risk_factors": get_risk_factors(str(row.get('disease_name', '')))
            }
    except Exception as e:
        print(f"Error getting disease info: {e}")
        
    return {
        "description": "Disease information not available",
        "symptoms": [],
        "solutions": [],
        "prevention": [],
        "risk_factors": []
    }

def get_supplement_info(class_idx: int) -> Dict[str, Any]:
    """Get supplement information from CSV"""
    global supplement_info
    
    try:
        if supplement_info is not None and class_idx < len(supplement_info):
            row = supplement_info.iloc[class_idx]
            return {
                "name": str(row.get('supplement name', '')),
                "image_url": str(row.get('supplement image', '')),
                "buy_link": str(row.get('buy link', ''))
            }
    except Exception as e:
        print(f"Error getting supplement info: {e}")
        
    return {
        "name": "No supplement recommended",
        "image_url": "",
        "buy_link": ""
    }

def extract_symptoms(description: str) -> List[str]:
    """Extract symptoms from disease description"""
    symptoms = []
    description_lower = description.lower()
    
    # Common symptom keywords
    symptom_indicators = ['spots', 'yellowing', 'browning', 'wilting', 'lesions', 'blight', 'mildew', 'rust', 'scab']
    
    sentences = description.split('.')
    for sentence in sentences:
        sentence = sentence.strip()
        if any(indicator in sentence.lower() for indicator in symptom_indicators):
            if len(sentence) > 10:  # Avoid very short fragments
                symptoms.append(sentence)
                
    return symptoms[:3]  # Return top 3 symptoms

def get_risk_factors(disease_name: str) -> List[str]:
    """Get risk factors based on disease type"""
    disease_lower = disease_name.lower()
    
    risk_factors = []
    
    if 'blight' in disease_lower:
        risk_factors = ["High humidity", "Wet conditions", "Poor air circulation"]
    elif 'rust' in disease_lower:
        risk_factors = ["Moisture on leaves", "Cool temperatures", "Dense planting"]
    elif 'spot' in disease_lower:
        risk_factors = ["Overhead watering", "Humid conditions", "Plant stress"]
    elif 'mildew' in disease_lower:
        risk_factors = ["High humidity", "Poor ventilation", "Overcrowding"]
    else:
        risk_factors = ["Environmental stress", "Poor plant health", "Weather conditions"]
        
    return risk_factors

def get_risk_level(confidence: float, disease: str) -> str:
    """Determine risk level based on confidence and disease type"""
    if 'healthy' in disease.lower():
        return "Low"
    elif confidence > 0.8:
        return "High"
    elif confidence > 0.6:
        return "Medium"
    else:
        return "Low"

# Initialize FastAPI app
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting CropAI Disease Detection API...")
    success = load_model_and_components()
    if success:
        print("✅ All components loaded successfully")
    else:
        print("⚠️ Some components failed to load")
    yield
    # Shutdown
    print("🛑 Shutting down CropAI Disease Detection API...")

app = FastAPI(
    title="CropAI Disease Detection API",
    description="Advanced plant disease detection using CNN model",
    version="2.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "disease_data_loaded": disease_info is not None,
        "supplement_data_loaded": supplement_info is not None,
        "classes": len(idx_to_classes),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/classes")
async def get_classes():
    """Get all disease classes"""
    return {
        "classes": list(idx_to_classes.values()),
        "count": len(idx_to_classes)
    }

@app.post("/predict")
async def predict_disease_endpoint(
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    crop_id: Optional[str] = Form(None),
    include_explanation: bool = Form(False),
    weather_humidity: Optional[float] = Form(None),
    weather_temperature: Optional[float] = Form(None),
    weather_rainfall: Optional[float] = Form(None),
    growth_stage: Optional[str] = Form(None),
    location_lat: Optional[float] = Form(None),
    location_lng: Optional[float] = Form(None)
):
    """Predict plant disease from uploaded image"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and process image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Make prediction
        result = predict_disease(image)
        
        # Add timestamp
        result["timestamp"] = datetime.now().isoformat()
        
        # Save to database if database connection is available
        try:
            if db_manager and db_manager.connection:
                # Prepare weather conditions
                weather_conditions = {}
                if weather_humidity is not None:
                    weather_conditions['humidity'] = weather_humidity
                if weather_temperature is not None:
                    weather_conditions['temperature'] = weather_temperature
                if weather_rainfall is not None:
                    weather_conditions['rainfall'] = weather_rainfall
                if growth_stage:
                    weather_conditions['growth_stage'] = growth_stage
                
                # Determine severity based on confidence and disease type
                severity = 'medium'  # default
                confidence = result.get('confidence', 0)
                if confidence > 0.9:
                    severity = 'high' if 'blight' in result['disease'].lower() or 'rot' in result['disease'].lower() else 'medium'
                elif confidence < 0.6:
                    severity = 'low'
                
                # Save detection to database
                detection_id = db_manager.save_disease_detection(
                    user_id=user_id,
                    crop_id=crop_id,
                    image_url=f"uploaded_image_{datetime.now().strftime('%Y%m%d_%H%M%S')}",  # You might want to save actual file
                    predicted_disease=result['disease'],
                    confidence_score=confidence,
                    disease_description=result.get('description', ''),
                    treatment_recommendations=result.get('recommendations', []),
                    supplements_recommended=result.get('supplements', []),
                    severity=severity,
                    location_lat=location_lat,
                    location_lng=location_lng,
                    weather_conditions=weather_conditions if weather_conditions else None
                )
                
                if detection_id:
                    result["detection_id"] = detection_id
                    result["saved_to_database"] = True
                    print(f"🗄️ Disease detection saved to database: {detection_id}")
                else:
                    result["saved_to_database"] = False
                    print("⚠️ Failed to save detection to database")
            else:
                result["saved_to_database"] = False
                print("⚠️ Database not available, prediction not saved")
                
        except Exception as db_error:
            print(f"⚠️ Database error: {db_error}")
            result["saved_to_database"] = False
            result["database_error"] = str(db_error)
        
        return result
        
    except Exception as e:
        print(f"Prediction error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/batch_predict")
async def batch_predict(files: List[UploadFile] = File(...)):
    """Predict diseases for multiple images"""
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed")
    
    results = []
    for file in files:
        try:
            # Validate file type
            if not file.content_type or not file.content_type.startswith('image/'):
                results.append({"error": f"Invalid file type: {file.filename}"})
                continue
            
            # Read and process image
            image_data = await file.read()
            image = Image.open(io.BytesIO(image_data))
            
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Make prediction
            result = predict_disease(image)
            result["filename"] = file.filename
            result["timestamp"] = datetime.now().isoformat()
            results.append(result)
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            })
    
    return results

@app.get("/disease_info/{crop}/{disease}")
async def get_disease_info_endpoint(crop: str, disease: str):
    """Get detailed information about a specific disease"""
    try:
        # Find the disease in the class mapping
        disease_key = f"{crop}___{disease}"
        class_idx = None
        
        for idx, class_name in idx_to_classes.items():
            if class_name == disease_key:
                class_idx = idx
                break
        
        if class_idx is not None:
            disease_details = get_disease_info(class_idx)
            supplement_details = get_supplement_info(class_idx)
            
            return {
                "disease_info": disease_details,
                "supplement_info": supplement_details,
                "class_index": class_idx
            }
        else:
            raise HTTPException(status_code=404, detail="Disease not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{user_id}")
async def get_user_detection_history(user_id: str, limit: int = 10):
    """
    Get disease detection history for a specific user
    """
    try:
        history = db_manager.get_detection_history(user_id, limit)
        return {
            "status": "success",
            "user_id": user_id,
            "detections": history,
            "count": len(history)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving history: {str(e)}")

@app.get("/stats/user/{user_id}")
async def get_user_detection_stats(user_id: str):
    """
    Get detection statistics for a specific user
    """
    try:
        stats = db_manager.get_detection_stats(user_id)
        return {
            "status": "success",
            "user_id": user_id,
            "statistics": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving stats: {str(e)}")

@app.get("/stats/global")
async def get_global_detection_stats():
    """
    Get global detection statistics
    """
    try:
        stats = db_manager.get_detection_stats()
        return {
            "status": "success",
            "global_statistics": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving global stats: {str(e)}")

@app.get("/health/database")
async def check_database_health():
    """
    Check database connection health
    """
    try:
        # Test database connection
        is_healthy = db_manager.test_connection()
        return {
            "status": "success" if is_healthy else "error",
            "database_connected": is_healthy,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "database_connected": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "CropAI Disease Detection API",
        "version": "2.0.0",
        "status": "active",
        "model": "CNN (PyTorch)",
        "classes": len(idx_to_classes),
        "endpoints": {
            "predict": "/predict - POST with image file",
            "health": "/health - GET for health check",
            "classes": "/classes - GET all disease classes",
            "batch_predict": "/batch_predict - POST with multiple images",
            "history": "/history/{user_id} - GET user detection history",
            "user_stats": "/stats/user/{user_id} - GET user statistics",
            "global_stats": "/stats/global - GET global statistics",
            "database_health": "/health/database - GET database connection status"
        }
    }

if __name__ == "__main__":
    print("🌐 Starting server on http://0.0.0.0:1234")
    print("📖 API documentation available at http://0.0.0.0:1234/docs")
    print("🌍 Server accessible on local network - find your IP with 'ipconfig'")
    
    uvicorn.run(app, host="0.0.0.0", port=1234)
