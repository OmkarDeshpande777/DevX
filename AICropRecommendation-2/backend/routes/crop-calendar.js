const express = require('express');
const axios = require('axios');
const router = express.Router();

// Sample crop calendar data structure
const cropDatabase = {
  'indo-gangetic': {
    crops: [
      {
        name: 'Wheat',
        sowingStart: { month: 10, day: 15 },
        sowingEnd: { month: 11, day: 30 },
        harvestDuration: 120,
        idealTemp: { min: 15, max: 25 },
        idealRainfall: { min: 5, max: 15 }
      },
      {
        name: 'Rice',
        sowingStart: { month: 5, day: 1 },
        sowingEnd: { month: 7, day: 15 },
        harvestDuration: 150,
        idealTemp: { min: 20, max: 35 },
        idealRainfall: { min: 50, max: 200 }
      }
    ]
  },
  'southern-plateau': {
    crops: [
      {
        name: 'Rice',
        sowingStart: { month: 5, day: 1 },
        sowingEnd: { month: 7, day: 31 },
        harvestDuration: 120,
        idealTemp: { min: 20, max: 30 },
        idealRainfall: { min: 100, max: 250 }
      },
      {
        name: 'Coconut',
        sowingStart: { month: 6, day: 1 },
        sowingEnd: { month: 9, day: 30 },
        harvestDuration: 365,
        idealTemp: { min: 25, max: 35 },
        idealRainfall: { min: 150, max: 300 }
      }
    ]
  },
  'western-coastal': {
    crops: [
      {
        name: 'Coconut',
        sowingStart: { month: 5, day: 1 },
        sowingEnd: { month: 8, day: 31 },
        harvestDuration: 365,
        idealTemp: { min: 25, max: 32 },
        idealRainfall: { min: 200, max: 400 }
      },
      {
        name: 'Pepper',
        sowingStart: { month: 5, day: 1 },
        sowingEnd: { month: 7, day: 31 },
        harvestDuration: 240,
        idealTemp: { min: 20, max: 30 },
        idealRainfall: { min: 150, max: 300 }
      }
    ]
  }
};

// Get crop calendar recommendations for a specific zone
router.get('/recommendations/:zone', (req, res) => {
  try {
    const { zone } = req.params;
    const zoneData = cropDatabase[zone];
    
    if (!zoneData) {
      return res.status(404).json({
        success: false,
        error: 'Zone not found',
        availableZones: Object.keys(cropDatabase)
      });
    }
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    
    // Find crops suitable for current time
    const suitableCrops = zoneData.crops.filter(crop => {
      const { sowingStart, sowingEnd } = crop;
      
      if (sowingStart.month === sowingEnd.month) {
        return currentMonth === sowingStart.month && 
               currentDay >= sowingStart.day && 
               currentDay <= sowingEnd.day;
      } else {
        return (currentMonth === sowingStart.month && currentDay >= sowingStart.day) ||
               (currentMonth === sowingEnd.month && currentDay <= sowingEnd.day) ||
               (currentMonth > sowingStart.month && currentMonth < sowingEnd.month);
      }
    });
    
    res.json({
      success: true,
      zone: zone,
      currentDate: currentDate.toISOString(),
      suitableCrops: suitableCrops,
      allCrops: zoneData.crops
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get market forecast data (simplified version without web scraping)
router.get('/forecast', (req, res) => {
  try {
    const { commodity, state, market } = req.query;
    
    if (!commodity || !state || !market) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameters',
        required: ['commodity', 'state', 'market']
      });
    }
    
    // Generate mock market data for demonstration
    // In production, this would connect to real market data APIs
    const mockPrices = [
      { date: '2025-01-01', price: 25 + Math.random() * 10 },
      { date: '2025-01-02', price: 27 + Math.random() * 8 },
      { date: '2025-01-03', price: 30 + Math.random() * 12 },
      { date: '2025-01-04', price: 28 + Math.random() * 9 },
      { date: '2025-01-05', price: 32 + Math.random() * 7 }
    ];
    
    const prices = mockPrices.map(p => p.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    
    // Simple trend calculation
    const recentPrices = prices.slice(-2);
    const olderPrices = prices.slice(0, -2);
    const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const olderAvg = olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length;
    const trend = recentAvg > olderAvg ? 'rising' : 'falling';
    
    const forecast = {
      success: true,
      commodity: commodity,
      state: state,
      market: market,
      average_price: Math.round(avgPrice * 100) / 100,
      max_price: Math.round(maxPrice * 100) / 100,
      min_price: Math.round(minPrice * 100) / 100,
      trend: trend,
      recommendation: trend === 'falling' || avgPrice > (maxPrice * 0.8) ? 
        'Sell now - prices may decline' : 
        'Wait for better prices - upward trend expected',
      historical_data: mockPrices.map(p => ({
        date: p.date,
        price: Math.round(p.price * 100) / 100
      })),
      timestamp: new Date().toISOString()
    };
    
    res.json(forecast);
  } catch (error) {
    console.error('Error generating forecast:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get weather data for crop planning
router.get('/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    // Mock weather data - in production, integrate with weather API
    const mockWeather = {
      city: city,
      temperature: 22 + Math.random() * 15,
      description: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
      humidity: 60 + Math.random() * 30,
      precipitation: Math.random() * 10,
      windSpeed: 5 + Math.random() * 15,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      weather: mockWeather
    });
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get crop growth stage information
router.get('/growth-stage', (req, res) => {
  try {
    const { sowingDate, harvestDate } = req.query;
    
    if (!sowingDate || !harvestDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: sowingDate, harvestDate'
      });
    }
    
    const sowing = new Date(sowingDate);
    const harvest = new Date(harvestDate);
    const today = new Date();
    
    const totalDays = Math.round((harvest - sowing) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.round((today - sowing) / (1000 * 60 * 60 * 24));
    const remainingDays = totalDays - elapsedDays;
    const progress = Math.max(0, Math.min(100, Math.round((elapsedDays / totalDays) * 100)));
    
    let stage = 'Pre-sowing';
    if (progress > 0 && progress <= 25) stage = 'Germination/Seedling';
    else if (progress > 25 && progress <= 50) stage = 'Vegetative Growth';
    else if (progress > 50 && progress <= 75) stage = 'Flowering/Fruiting';
    else if (progress > 75 && progress <= 100) stage = 'Maturation';
    else if (progress > 100) stage = 'Harvest Due';
    
    res.json({
      success: true,
      sowingDate: sowing.toISOString(),
      harvestDate: harvest.toISOString(),
      currentDate: today.toISOString(),
      totalDays: totalDays,
      elapsedDays: Math.max(0, elapsedDays),
      remainingDays: Math.max(0, remainingDays),
      progress: progress,
      stage: stage,
      isOverdue: progress > 100
    });
  } catch (error) {
    console.error('Error calculating growth stage:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get crop rotation suggestions
router.get('/rotation-suggestions/:cropName', (req, res) => {
  try {
    const { cropName } = req.params;
    
    const rotationSuggestions = {
      'Rice': {
        nextCrops: ['Wheat', 'Chickpea', 'Mustard'],
        reason: 'Rice depletes nitrogen; rotate with nitrogen-fixing legumes or cereals',
        benefits: ['Soil health improvement', 'Pest cycle disruption', 'Nutrient balance']
      },
      'Wheat': {
        nextCrops: ['Chickpea', 'Lentil', 'Mustard'],
        reason: 'Wheat benefits from rotation with legumes to restore soil nitrogen',
        benefits: ['Nitrogen fixation', 'Reduced disease pressure', 'Improved soil structure']
      },
      'Tomato': {
        nextCrops: ['Leafy Greens', 'Legumes', 'Cereals'],
        reason: 'Avoid nightshade family; rotate with different plant families',
        benefits: ['Disease prevention', 'Soil nutrient restoration', 'Pest management']
      },
      'Potato': {
        nextCrops: ['Cereals', 'Legumes', 'Brassicas'],
        reason: 'Rotate away from solanaceous crops to prevent disease buildup',
        benefits: ['Disease cycle break', 'Soil health', 'Nutrient management']
      },
      'Onion': {
        nextCrops: ['Legumes', 'Leafy Vegetables', 'Root Vegetables'],
        reason: 'Onions are good for soil health; follow with nutrient-demanding crops',
        benefits: ['Natural pest deterrent', 'Soil conditioning', 'Nutrient cycling']
      }
    };
    
    const suggestion = rotationSuggestions[cropName] || {
      nextCrops: ['Legumes', 'Cereals', 'Vegetables'],
      reason: 'General rotation principle: alternate between different plant families',
      benefits: ['Soil health maintenance', 'Pest and disease management', 'Nutrient balance']
    };
    
    res.json({
      success: true,
      currentCrop: cropName,
      suggestions: suggestion
    });
  } catch (error) {
    console.error('Error getting rotation suggestions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Crop Calendar API',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;