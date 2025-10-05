"""
Database manager for Crop Recommendation AI Service
Handles MySQL integration for saving predictions and analytics
"""

import mysql.connector
from mysql.connector import Error
import json
import os
from datetime import datetime
from typing import Dict, List, Optional
from dotenv import load_dotenv
import uuid

# Load environment variables
load_dotenv()

class CropDatabaseManager:
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        """Establish database connection"""
        try:
            # Database connection parameters
            db_config = {
                'host': os.getenv('DB_HOST', 'localhost'),
                'port': os.getenv('DB_PORT', '3306'),
                'database': os.getenv('DB_NAME', 'AgriNova'),
                'user': os.getenv('DB_USER', 'root'),
                'password': os.getenv('DB_PASSWORD', ''),
                'use_pure': True,
                'charset': 'utf8mb4',
                'collation': 'utf8mb4_unicode_ci'
            }
            
            print(f"🔗 Connecting to MySQL database: {db_config['host']}:{db_config['port']}/{db_config['database']}")
            
            self.connection = mysql.connector.connect(**db_config)
            
            print("✅ Successfully connected to MySQL database")
            
        except Error as e:
            print(f"❌ Failed to connect to database: {e}")
            self.connection = None
    
    def save_crop_recommendation(self, 
                                 user_id: str,
                                 input_data: Dict,
                                 prediction_result: Dict,
                                 location_lat: Optional[float] = None,
                                 location_lng: Optional[float] = None,
                                 farm_details: Optional[Dict] = None) -> Optional[str]:
        """
        Save crop recommendation to database
        """
        if not self.connection:
            print("❌ No database connection available")
            return None
            
        try:
            cursor = self.connection.cursor(dictionary=True)
            
            # Extract prediction details
            recommended_crop = prediction_result.get('recommended_crop', 'unknown')
            confidence = prediction_result.get('confidence', 0.0)
            expected_yield = prediction_result.get('expected_yield_t_per_acre', 0.0)
            
            # Extract profit breakdown
            profit_breakdown = prediction_result.get('profit_breakdown', {})
            expected_profit = profit_breakdown.get('net', 0.0)
            gross_profit = profit_breakdown.get('gross', 0.0)
            investment_cost = profit_breakdown.get('investment', 0.0)
            roi = profit_breakdown.get('roi', 0.0)
            
            # Extract environmental data
            soil_data = {
                'nitrogen': input_data.get('N', 0),
                'phosphorus': input_data.get('P', 0),
                'potassium': input_data.get('K', 0),
                'ph': input_data.get('ph', 7.0),
                'temperature': input_data.get('temperature', 25.0),
                'humidity': input_data.get('humidity', 50.0),
                'rainfall': input_data.get('rainfall', 100.0)
            }
            
            # Additional prediction details
            additional_details = {
                'yield_interval': prediction_result.get('yield_interval_p10_p90', [0.0, 0.0]),
                'previous_crop_analysis': prediction_result.get('previous_crop_analysis'),
                'season_analysis': prediction_result.get('season_analysis'),
                'fertilizer_recommendation': prediction_result.get('fertilizer_recommendation'),
                'recommendations': prediction_result.get('why', []),
                'model_version': prediction_result.get('model_version', '2.0.0'),
                'region': input_data.get('region', 'default'),
                'area_ha': input_data.get('area_ha', 0.0),
                'previous_crop': input_data.get('previous_crop', ''),
                'season': input_data.get('season', ''),
                'planting_date': input_data.get('planting_date', '')
            }
            
            query = """
                INSERT INTO crop_recommendations (
                    id, user_id, recommended_crop, confidence, expected_yield, expected_profit,
                    gross_profit, investment_cost, roi, soil_data, location_lat, location_lng,
                    additional_details, farm_details, created_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            # Generate a UUID for the recommendation
            recommendation_id = str(uuid.uuid4())
            
            values = (
                recommendation_id, user_id, recommended_crop, confidence, expected_yield, expected_profit,
                gross_profit, investment_cost, roi,
                json.dumps(soil_data), location_lat, location_lng,
                json.dumps(additional_details),
                json.dumps(farm_details) if farm_details else None,
                datetime.now()
            )
            
            cursor.execute(query, values)
            self.connection.commit()
            cursor.close()
            
            print(f"✅ Crop recommendation saved to database with ID: {recommendation_id}")
            return recommendation_id
            
        except Exception as e:
            print(f"❌ Error saving crop recommendation: {e}")
            if self.connection:
                self.connection.rollback()
            return None
    
    def get_recommendation_history(self, user_id: str, limit: int = 10) -> List[Dict]:
        """Get user's crop recommendation history"""
        if not self.connection:
            return []
            
        try:
            cursor = self.connection.cursor(dictionary=True)
            
            query = """
                SELECT id, recommended_crop, confidence, expected_yield, expected_profit,
                       roi, created_at, additional_details
                FROM crop_recommendations
                WHERE user_id = %s
                ORDER BY created_at DESC
                LIMIT %s
            """
            
            cursor.execute(query, (user_id, limit))
            results = cursor.fetchall()
            cursor.close()
            
            return results
            
        except Exception as e:
            print(f"❌ Error fetching recommendation history: {e}")
            return []
    
    def get_recommendation_stats(self, user_id: Optional[str] = None) -> Dict:
        """Get recommendation statistics"""
        if not self.connection:
            return {}
            
        try:
            cursor = self.connection.cursor(dictionary=True)
            
            if user_id:
                query = """
                    SELECT 
                        COUNT(*) as total_recommendations,
                        AVG(confidence) as avg_confidence,
                        AVG(expected_yield) as avg_expected_yield,
                        AVG(expected_profit) as avg_expected_profit,
                        AVG(roi) as avg_roi,
                        COUNT(DISTINCT recommended_crop) as unique_crops_recommended
                    FROM crop_recommendations
                    WHERE user_id = %s
                """
                cursor.execute(query, (user_id,))
            else:
                query = """
                    SELECT 
                        COUNT(*) as total_recommendations,
                        AVG(confidence) as avg_confidence,
                        AVG(expected_yield) as avg_expected_yield,
                        AVG(expected_profit) as avg_expected_profit,
                        AVG(roi) as avg_roi,
                        COUNT(DISTINCT user_id) as total_users,
                        COUNT(DISTINCT recommended_crop) as unique_crops_recommended
                    FROM crop_recommendations
                """
                cursor.execute(query)
            
            result = cursor.fetchone()
            
            if result:
                stats = result
                
                # Convert Decimal to float for JSON serialization
                for key, value in stats.items():
                    if value is not None and hasattr(value, '__float__'):
                        stats[key] = float(value)
                
                # Get crop recommendation breakdown
                if user_id:
                    cursor.execute("""
                        SELECT recommended_crop, COUNT(*) as count
                        FROM crop_recommendations 
                        WHERE user_id = %s 
                        GROUP BY recommended_crop
                        ORDER BY count DESC
                    """, (user_id,))
                else:
                    cursor.execute("""
                        SELECT recommended_crop, COUNT(*) as count
                        FROM crop_recommendations 
                        GROUP BY recommended_crop
                        ORDER BY count DESC
                    """)
                
                crop_breakdown = {}
                for row in cursor.fetchall():
                    crop_breakdown[row['recommended_crop']] = row['count']
                
                stats['crop_breakdown'] = crop_breakdown
            else:
                stats = {}
            
            cursor.close()
            return stats
            
        except Exception as e:
            print(f"❌ Error fetching recommendation stats: {e}")
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
crop_db_manager = None

def get_crop_db_manager():
    """Get or create crop database manager instance"""
    global crop_db_manager
    if crop_db_manager is None:
        crop_db_manager = CropDatabaseManager()
    return crop_db_manager