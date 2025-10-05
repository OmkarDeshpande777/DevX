const express = require('express');
const router = express.Router();
const DiseaseDetection = require('../models/DiseaseDetection');
const { body, validationResult } = require('express-validator');

// Get all disease detections
router.get('/', async (req, res) => {
  try {
    const { user_id, limit = 20, offset = 0 } = req.query;
    
    let detections;
    if (user_id) {
      detections = await DiseaseDetection.findByUserId(user_id, parseInt(limit), parseInt(offset));
    } else {
      // This would need a method to get all detections - let's add it
      const { query } = require('../config/database');
      const result = await query(
        'SELECT * FROM disease_detections ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [parseInt(limit), parseInt(offset)]
      );
      detections = result;
    }
    
    res.json({
      success: true,
      data: detections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch disease detections',
      message: error.message
    });
  }
});

// Get disease detection by ID
router.get('/:id', async (req, res) => {
  try {
    const detection = await DiseaseDetection.findById(req.params.id);
    if (!detection) {
      return res.status(404).json({
        success: false,
        error: 'Disease detection not found'
      });
    }
    res.json({
      success: true,
      data: detection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch disease detection',
      message: error.message
    });
  }
});

// Create disease detection record
router.post('/', [
  body('user_id').optional().isUUID(),
  body('crop_id').optional().isUUID(),
  body('image_url').isURL().withMessage('Valid image URL required'),
  body('predicted_disease').isLength({ min: 1, max: 255 }).trim(),
  body('confidence_score').isFloat({ min: 0, max: 1 }),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('location_lat').optional().isFloat({ min: -90, max: 90 }),
  body('location_lng').optional().isFloat({ min: -180, max: 180 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const detection = await DiseaseDetection.create(req.body);
    res.status(201).json({
      success: true,
      data: detection,
      message: 'Disease detection recorded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create disease detection record',
      message: error.message
    });
  }
});

// Update disease detection
router.put('/:id', [
  body('is_verified').optional().isBoolean(),
  body('verified_by').optional().isLength({ min: 1, max: 255 }),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('treatment_recommendations').optional().isArray(),
  body('supplements_recommended').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const detection = await DiseaseDetection.update(req.params.id, req.body);
    if (!detection) {
      return res.status(404).json({
        success: false,
        error: 'Disease detection not found'
      });
    }

    res.json({
      success: true,
      data: detection,
      message: 'Disease detection updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update disease detection',
      message: error.message
    });
  }
});

// Get user's disease detection statistics
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const stats = await DiseaseDetection.getStatsByUser(req.params.userId);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch disease detection statistics',
      message: error.message
    });
  }
});

// Get trending diseases
router.get('/analytics/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const trending = await DiseaseDetection.getTrendingDiseases(parseInt(limit));
    res.json({
      success: true,
      data: trending
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending diseases',
      message: error.message
    });
  }
});

// Delete disease detection
router.delete('/:id', async (req, res) => {
  try {
    const detection = await DiseaseDetection.delete(req.params.id);
    if (!detection) {
      return res.status(404).json({
        success: false,
        error: 'Disease detection not found'
      });
    }

    res.json({
      success: true,
      message: 'Disease detection deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete disease detection',
      message: error.message
    });
  }
});

module.exports = router;