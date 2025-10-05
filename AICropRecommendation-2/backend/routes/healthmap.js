const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// In-memory storage for custom diseases (in production, use a database)
let customDiseases = {};

// Load CSV data
let locationData = [];
const csvPath = path.join(__dirname, '../healthmap/pincode_with_lat-long.csv');

// Load location data on startup
function loadLocationData() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        // Clean and validate data
        if (data.Pincode && data.Latitude && data.Longitude) {
          results.push({
            pincode: parseInt(data.Pincode),
            officeName: data.OfficeName || '',
            district: data.District || '',
            state: data.StateName || '',
            latitude: parseFloat(data.Latitude),
            longitude: parseFloat(data.Longitude)
          });
        }
      })
      .on('end', () => {
        locationData = results;
        console.log(`✅ Loaded ${locationData.length} location records for HealthMap`);
        resolve(results);
      })
      .on('error', (error) => {
        console.error('Error loading location data:', error);
        reject(error);
      });
  });
}

// Initialize data loading
loadLocationData().catch(console.error);

// Get sample disease data for demonstration
function getSampleDiseases() {
  return {
    'Maharashtra': [
      { name: 'Bacterial Blight', status: 'Active', severity: 'Medium', type: 'Crop Disease' },
      { name: 'Powdery Mildew', status: 'Controlled', severity: 'Low', type: 'Crop Disease' }
    ],
    'Punjab': [
      { name: 'Blast Disease', status: 'Active', severity: 'High', type: 'Crop Disease' },
      { name: 'Stem Rot', status: 'Monitoring', severity: 'Medium', type: 'Crop Disease' }
    ],
    'Tamil Nadu': [
      { name: 'Leaf Spot', status: 'Active', severity: 'Medium', type: 'Crop Disease' },
      { name: 'Root Rot', status: 'Controlled', severity: 'Low', type: 'Crop Disease' }
    ],
    'West Bengal': [
      { name: 'Sheath Blight', status: 'Active', severity: 'High', type: 'Crop Disease' },
      { name: 'Brown Spot', status: 'Monitoring', severity: 'Medium', type: 'Crop Disease' }
    ],
    'Karnataka': [
      { name: 'Downy Mildew', status: 'Active', severity: 'Medium', type: 'Crop Disease' },
      { name: 'Anthracnose', status: 'Controlled', severity: 'Low', type: 'Crop Disease' }
    ]
  };
}

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'HealthMap API is running',
    dataLoaded: locationData.length > 0,
    totalRecords: locationData.length,
    customDiseases: Object.keys(customDiseases).length
  });
});

// Get all locations with disease data
router.get('/locations', (req, res) => {
  try {
    const sampleDiseases = getSampleDiseases();
    const locations = [];

    // Group locations by state and add sample disease data
    const stateLocations = {};
    locationData.forEach(location => {
      if (!stateLocations[location.state]) {
        stateLocations[location.state] = [];
      }
      stateLocations[location.state].push(location);
    });

    // Add sample locations with diseases for each state
    Object.keys(sampleDiseases).forEach(state => {
      if (stateLocations[state] && stateLocations[state].length > 0) {
        // Take first few locations from each state as examples
        const stateData = stateLocations[state].slice(0, 5);
        stateData.forEach((location, index) => {
          const diseases = sampleDiseases[state].map(disease => ({
            ...disease,
            id: `${state}-${index}-${disease.name.replace(/\s+/g, '-').toLowerCase()}`,
            dateReported: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            affectedArea: Math.floor(Math.random() * 1000) + 100 + ' hectares'
          }));

          locations.push({
            ...location,
            diseases: diseases,
            riskScore: calculateRiskScore(diseases)
          });
        });
      }
    });

    // Add custom diseases
    Object.keys(customDiseases).forEach(pincode => {
      const location = locationData.find(loc => loc.pincode === parseInt(pincode));
      if (location) {
        const existingIndex = locations.findIndex(loc => loc.pincode === location.pincode);
        if (existingIndex >= 0) {
          locations[existingIndex].diseases.push(...customDiseases[pincode]);
          locations[existingIndex].riskScore = calculateRiskScore(locations[existingIndex].diseases);
        } else {
          locations.push({
            ...location,
            diseases: customDiseases[pincode],
            riskScore: calculateRiskScore(customDiseases[pincode])
          });
        }
      }
    });

    res.json(locations);
  } catch (error) {
    console.error('Error getting locations:', error);
    res.status(500).json({ error: 'Failed to get locations' });
  }
});

// Search locations
router.get('/search', (req, res) => {
  try {
    const { q: query, type = 'all' } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = query.toLowerCase();
    let filteredLocations = [];

    locationData.forEach(location => {
      let match = false;

      switch (type) {
        case 'state':
          match = location.state.toLowerCase().includes(searchTerm);
          break;
        case 'district':
          match = location.district.toLowerCase().includes(searchTerm);
          break;
        case 'pincode':
          match = location.pincode.toString().includes(searchTerm);
          break;
        default:
          match = location.state.toLowerCase().includes(searchTerm) ||
                  location.district.toLowerCase().includes(searchTerm) ||
                  location.officeName.toLowerCase().includes(searchTerm) ||
                  location.pincode.toString().includes(searchTerm);
      }

      if (match) {
        const sampleDiseases = getSampleDiseases();
        const stateDiseases = sampleDiseases[location.state] || [];
        const diseases = stateDiseases.map(disease => ({
          ...disease,
          id: `${location.state}-${location.pincode}-${disease.name.replace(/\s+/g, '-').toLowerCase()}`,
          dateReported: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          affectedArea: Math.floor(Math.random() * 1000) + 100 + ' hectares'
        }));

        filteredLocations.push({
          ...location,
          diseases: diseases,
          riskScore: calculateRiskScore(diseases)
        });
      }
    });

    res.json(filteredLocations.slice(0, 50)); // Limit results
  } catch (error) {
    console.error('Error searching locations:', error);
    res.status(500).json({ error: 'Failed to search locations' });
  }
});

// Add custom disease
router.post('/add-disease', (req, res) => {
  try {
    const { 
      pincode, 
      name, 
      status, 
      severity = 'Medium', 
      details = '', 
      type = 'Custom',
      source = 'User Reported',
      crop,
      confidence,
      treatments,
      symptoms
    } = req.body;

    if (!pincode || !name || !status) {
      return res.status(400).json({ error: 'Pincode, name, and status are required' });
    }

    // Validate pincode exists
    const location = locationData.find(loc => loc.pincode === parseInt(pincode));
    if (!location) {
      return res.status(404).json({ error: 'Pincode not found in our database' });
    }

    const disease = {
      id: `${source === 'AI Detection System' ? 'ai' : 'custom'}-${pincode}-${Date.now()}`,
      name,
      status,
      severity,
      details,
      type: source === 'AI Detection System' ? 'AI Detected' : type,
      dateReported: new Date().toISOString().split('T')[0],
      affectedArea: source === 'AI Detection System' ? 'Single detection' : 'To be determined',
      source,
      // Additional fields for AI detection
      ...(crop && { crop }),
      ...(confidence && { confidence: Math.round(confidence * 100) }),
      ...(treatments && treatments.length > 0 && { treatments }),
      ...(symptoms && symptoms.length > 0 && { symptoms })
    };

    if (!customDiseases[pincode]) {
      customDiseases[pincode] = [];
    }

    customDiseases[pincode].push(disease);

    console.log(`✅ Disease added to HealthMap: ${name} at ${location.officeName}, ${location.state} (${source})`);

    res.json({ 
      success: true, 
      message: 'Disease information added successfully',
      disease,
      location: {
        pincode: location.pincode,
        name: location.officeName,
        district: location.district,
        state: location.state
      }
    });
  } catch (error) {
    console.error('Error adding disease:', error);
    res.status(500).json({ error: 'Failed to add disease information' });
  }
});

// Get disease statistics
router.get('/statistics', (req, res) => {
  try {
    const sampleDiseases = getSampleDiseases();
    const stats = {
      totalLocations: locationData.length,
      statesWithData: Object.keys(sampleDiseases).length,
      totalDiseases: 0,
      diseasesByStatus: {
        Active: 0,
        Controlled: 0,
        Monitoring: 0,
        Eradicated: 0
      },
      diseasesBySeverity: {
        Low: 0,
        Medium: 0,
        High: 0,
        Critical: 0
      },
      customReports: Object.keys(customDiseases).length
    };

    // Count sample diseases
    Object.values(sampleDiseases).forEach(diseases => {
      diseases.forEach(disease => {
        stats.totalDiseases++;
        stats.diseasesByStatus[disease.status] = (stats.diseasesByStatus[disease.status] || 0) + 1;
        stats.diseasesBySeverity[disease.severity] = (stats.diseasesBySeverity[disease.severity] || 0) + 1;
      });
    });

    // Count custom diseases
    Object.values(customDiseases).forEach(diseases => {
      diseases.forEach(disease => {
        stats.totalDiseases++;
        stats.diseasesByStatus[disease.status] = (stats.diseasesByStatus[disease.status] || 0) + 1;
        stats.diseasesBySeverity[disease.severity] = (stats.diseasesBySeverity[disease.severity] || 0) + 1;
      });
    });

    res.json(stats);
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get states list
router.get('/states', (req, res) => {
  try {
    const states = [...new Set(locationData.map(loc => loc.state))].sort();
    res.json(states);
  } catch (error) {
    console.error('Error getting states:', error);
    res.status(500).json({ error: 'Failed to get states' });
  }
});

// Get districts by state
router.get('/districts/:state', (req, res) => {
  try {
    const { state } = req.params;
    const districts = [...new Set(
      locationData
        .filter(loc => loc.state.toLowerCase() === state.toLowerCase())
        .map(loc => loc.district)
    )].sort();
    res.json(districts);
  } catch (error) {
    console.error('Error getting districts:', error);
    res.status(500).json({ error: 'Failed to get districts' });
  }
});

// Helper function to calculate risk score
function calculateRiskScore(diseases) {
  if (!diseases || diseases.length === 0) return 0;
  
  const severityWeights = {
    Low: 1,
    Medium: 2,
    High: 3,
    Critical: 4
  };

  const statusWeights = {
    Eradicated: 0.2,
    Controlled: 0.5,
    Monitoring: 0.8,
    Active: 1.0
  };

  let totalScore = 0;
  diseases.forEach(disease => {
    const severityScore = severityWeights[disease.severity] || 2;
    const statusScore = statusWeights[disease.status] || 0.8;
    totalScore += severityScore * statusScore;
  });

  return Math.round((totalScore / diseases.length) * 25); // Scale to 0-100
}

module.exports = router;