import os
import mysql.connector
from mysql.connector import Error
import json
from datetime import datetime
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv
import uuid

# Load environment variables
load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        """Connect to MySQL database"""
        try:
            # Database configuration from environment variables
            self.connection = mysql.connector.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                port=os.getenv('DB_PORT', 3306),
                database=os.getenv('DB_NAME', 'AgriNova'),
                user=os.getenv('DB_USER', 'root'),
                password=os.getenv('DB_PASSWORD', ''),
                use_pure=True,
                charset='utf8mb4',
                collation='utf8mb4_unicode_ci'
            )
            print("✅ Connected to MySQL database")
        except Error as e:
            print(f"❌ Database connection failed: {e}")
            self.connection = None
    
    def save_disease_detection(self, 
                             user_id: Optional[str],
                             crop_id: Optional[str],
                             image_url: str,
                             predicted_disease: str,
                             confidence_score: float,
                             disease_description: Optional[str] = None,
                             treatment_recommendations: Optional[List[str]] = None,
                             supplements_recommended: Optional[List[str]] = None,
                             severity: str = 'medium',
                             location_lat: Optional[float] = None,
                             location_lng: Optional[float] = None,
                             weather_conditions: Optional[Dict] = None) -> Optional[str]:
        """Save disease detection to database"""
        if not self.connection:
            print("⚠️ No database connection available")
            return None
            
        try:
            cursor = self.connection.cursor(dictionary=True)
            
            # Generate a UUID for the detection
            detection_id = str(uuid.uuid4())
            
            query = """
                INSERT INTO disease_detections (
                    id, user_id, image_path, predicted_disease, confidence_score,
                    severity, status, treatment_recommendations, additional_info, 
                    location_lat, location_lng, detection_metadata
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            # Determine status based on disease
            status = 'healthy' if predicted_disease.lower() in ['healthy', 'no disease'] else 'detected'
            
            # Prepare additional info
            additional_info = {
                'disease_description': disease_description,
                'supplements_recommended': supplements_recommended,
                'weather_conditions': weather_conditions,
                'detection_timestamp': datetime.now().isoformat()
            }
            
            # Prepare detection metadata  
            detection_metadata = {
                'crop_id': crop_id,
                'image_url': image_url,
                'model_version': '1.0.0'
            }
            
            values = (
                detection_id, user_id, image_url, predicted_disease, confidence_score,
                severity, status, 
                json.dumps(treatment_recommendations) if treatment_recommendations else None,
                json.dumps(additional_info),
                location_lat, location_lng, 
                json.dumps(detection_metadata)
            )
            
            cursor.execute(query, values)
            self.connection.commit()
            cursor.close()
            
            print(f"✅ Disease detection saved to database with ID: {detection_id}")
            return detection_id
            
        except Exception as e:
            print(f"❌ Error saving disease detection: {e}")
            if self.connection:
                self.connection.rollback()
            return None
    
    def get_detection_history(self, user_id: str, limit: int = 10) -> List[Dict]:
        """Get user's disease detection history"""
        if not self.connection:
            return []
            
        try:
            cursor = self.connection.cursor(dictionary=True)
            
            query = """
                SELECT id, predicted_disease, confidence_score, severity, created_at
                FROM disease_detections
                WHERE user_id = %s
                ORDER BY created_at DESC
                LIMIT %s
            """
            
            cursor.execute(query, (user_id, limit))
            results = cursor.fetchall()
            cursor.close()
            
            return results
            
        except Exception as e:
            print(f"❌ Error fetching detection history: {e}")
            return []
    
    def get_detection_stats(self, user_id: Optional[str] = None) -> Dict:
        """Get detection statistics"""
        if not self.connection:
            return {}
            
        try:
            cursor = self.connection.cursor(dictionary=True)
            
            if user_id:
                query = """
                    SELECT 
                        COUNT(*) as total_detections,
                        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_cases,
                        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_cases,
                        AVG(confidence_score) as avg_confidence
                    FROM disease_detections
                    WHERE user_id = %s
                """
                cursor.execute(query, (user_id,))
            else:
                query = """
                    SELECT 
                        COUNT(*) as total_detections,
                        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_cases,
                        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_cases,
                        AVG(confidence_score) as avg_confidence,
                        COUNT(DISTINCT user_id) as total_users
                    FROM disease_detections
                """
                cursor.execute(query)
            
            result = cursor.fetchone()
            cursor.close()
            
            return result if result else {}
            
        except Exception as e:
            print(f"❌ Error fetching detection stats: {e}")
            return {}
    
    def test_connection(self):
        """Test database connection"""
        try:
            if not self.connection:
                self.connect()
            
            if self.connection:
                cursor = self.connection.cursor()
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                cursor.close()
                return result is not None and result[0] == 1
                cursor.close()
                return result is not None
            return False
        except Exception as e:
            print(f"❌ Database connection test failed: {e}")
            return False
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            print("🔒 Database connection closed")

# Global database manager instance
db_manager = None

def get_db_manager():
    """Get or create database manager instance"""
    global db_manager
    if db_manager is None:
        db_manager = DatabaseManager()
    return db_manager