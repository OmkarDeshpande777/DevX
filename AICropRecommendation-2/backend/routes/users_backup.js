const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');

const router = express.Router();

// Test endpoint
router.get('/test', async (req, res) => {
  res.json({ message: 'Users route is working!' });
});

module.exports = router;