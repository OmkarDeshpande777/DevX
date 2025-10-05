const { query } = require('../config/database');

class DiseaseDetection {
  static async create(detectionData) {
    const {
      user_id, crop_id, image_path, image_url, predicted_disease, confidence_score,
      disease_description, treatment_recommendations, supplements_recommended,
      severity, location_lat, location_lng, weather_conditions
    } = detectionData;

    const text = `
      INSERT INTO disease_detections (
        user_id, crop_id, image_path, image_url, predicted_disease, confidence_score,
        disease_description, treatment_recommendations, supplements_recommended,
        severity, location_lat, location_lng, weather_conditions
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      user_id, crop_id, image_path, image_url, predicted_disease, confidence_score,
      disease_description, treatment_recommendations, supplements_recommended,
      severity, location_lat, location_lng, 
      weather_conditions ? JSON.stringify(weather_conditions) : null
    ];

    const result = await query(text, values);
    
    // Get the created detection by ID
    const createdDetection = await this.findById(result.insertId);
    return createdDetection;
  }

  static async findById(id) {
    const text = `
      SELECT dd.*, u.name as user_name, c.name as crop_name
      FROM disease_detections dd
      LEFT JOIN users u ON dd.user_id = u.id
      LEFT JOIN crops c ON dd.crop_id = c.id
      WHERE dd.id = ?
    `;
    const result = await query(text, [id]);
    return result[0];
  }

  static async findByUserId(userId, limit = 20, offset = 0) {
    const text = `
      SELECT dd.*, c.name as crop_name
      FROM disease_detections dd
      LEFT JOIN crops c ON dd.crop_id = c.id
      WHERE dd.user_id = ?
      ORDER BY dd.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const result = await query(text, [userId, limit, offset]);
    return result;
  }

  static async findByCropId(cropId, limit = 20, offset = 0) {
    const text = `
      SELECT dd.*, u.name as user_name
      FROM disease_detections dd
      LEFT JOIN users u ON dd.user_id = u.id
      WHERE dd.crop_id = ?
      ORDER BY dd.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const result = await query(text, [cropId, limit, offset]);
    return result;
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined && key !== 'id') {
        if (key === 'weather_conditions') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const text = `
      UPDATE disease_detections 
      SET ${fields.join(', ')}
      WHERE id = ?
    `;

    await query(text, values);
    
    // Get the updated detection
    const updatedDetection = await this.findById(id);
    return updatedDetection;
  }

  static async getStatsByUser(userId) {
    const text = `
      SELECT 
        COUNT(*) as total_detections,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_cases,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_cases,
        COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_cases,
        COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_cases,
        AVG(confidence_score) as avg_confidence,
        COUNT(DISTINCT predicted_disease) as unique_diseases,
        COUNT(DISTINCT crop_id) as unique_crops_affected
      FROM disease_detections
      WHERE user_id = ?
    `;
    const result = await query(text, [userId]);
    return result[0];
  }

  static async getTrendingDiseases(limit = 10, days = 30) {
    const text = `
      SELECT 
        predicted_disease,
        COUNT(*) as detection_count,
        AVG(confidence_score) as avg_confidence,
        COUNT(DISTINCT user_id) as unique_users_affected,
        COUNT(DISTINCT crop_id) as unique_crops_affected,
        MAX(created_at) as last_detected
      FROM disease_detections
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY predicted_disease
      ORDER BY detection_count DESC
      LIMIT ?
    `;
    const result = await query(text, [days, limit]);
    return result;
  }

  static async getDiseasesByLocation(lat, lng, radius_km = 50) {
    const text = `
      SELECT 
        predicted_disease,
        COUNT(*) as detection_count,
        AVG(confidence_score) as avg_confidence,
        MAX(created_at) as last_detected,
        GROUP_CONCAT(DISTINCT severity) as severities
      FROM disease_detections
      WHERE location_lat IS NOT NULL 
        AND location_lng IS NOT NULL
        AND (
          6371 * acos(
            cos(radians(?)) * cos(radians(location_lat)) *
            cos(radians(location_lng) - radians(?)) +
            sin(radians(?)) * sin(radians(location_lat))
          )
        ) <= ?
      GROUP BY predicted_disease
      ORDER BY detection_count DESC
    `;
    const result = await query(text, [lat, lng, lat, radius_km]);
    return result;
  }

  static async getDiseasesBySeverity(severity, limit = 20) {
    const text = `
      SELECT dd.*, u.name as user_name, c.name as crop_name
      FROM disease_detections dd
      LEFT JOIN users u ON dd.user_id = u.id
      LEFT JOIN crops c ON dd.crop_id = c.id
      WHERE dd.severity = ?
      ORDER BY dd.created_at DESC
      LIMIT ?
    `;
    const result = await query(text, [severity, limit]);
    return result;
  }

  static async delete(id) {
    // First get the detection to return
    const detectionToDelete = await this.findById(id);
    if (!detectionToDelete) {
      return null;
    }
    
    const text = 'DELETE FROM disease_detections WHERE id = ?';
    await query(text, [id]);
    return detectionToDelete;
  }

  static async count(userId = null) {
    let text = 'SELECT COUNT(*) as total FROM disease_detections';
    let values = [];
    
    if (userId) {
      text += ' WHERE user_id = ?';
      values = [userId];
    }
    
    const result = await query(text, values);
    return parseInt(result[0].total);
  }
}

module.exports = DiseaseDetection;