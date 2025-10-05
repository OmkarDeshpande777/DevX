const express = require('express');
const router = express.Router();

// Mock data for weather information
const generateWeatherData = (state, district) => {
  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'Summer';
    if (month >= 6 && month <= 9) return 'Monsoon';
    if (month >= 10 && month <= 11) return 'Post-Monsoon';
    return 'Winter';
  };

  const season = getCurrentSeason();
  const baseTemp = season === 'Summer' ? 35 : season === 'Monsoon' ? 28 : season === 'Winter' ? 20 : 30;
  const baseHumidity = season === 'Monsoon' ? 85 : season === 'Summer' ? 45 : 65;

  // Generate 7-day forecast
  const forecast = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    return {
      date: date.toLocaleDateString('en-IN'),
      day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-IN', { weekday: 'short' }),
      high: baseTemp + Math.floor(Math.random() * 8) - 4,
      low: baseTemp - 8 + Math.floor(Math.random() * 6) - 3,
      condition: season === 'Monsoon' ? 
        (Math.random() > 0.4 ? 'Rainy' : 'Cloudy') :
        season === 'Summer' ? 
        (Math.random() > 0.7 ? 'Partly Cloudy' : 'Sunny') :
        (Math.random() > 0.6 ? 'Cloudy' : 'Clear'),
      icon: season === 'Monsoon' ? 'rain' : season === 'Summer' ? 'sun' : 'cloud',
      rainfall: season === 'Monsoon' ? Math.floor(Math.random() * 50) : Math.floor(Math.random() * 5),
      humidity: baseHumidity + Math.floor(Math.random() * 20) - 10
    };
  });

  const farmingAdvice = [
    {
      type: 'irrigation',
      title: season === 'Monsoon' ? 'Manage Water Logging' : 'Plan Irrigation Schedule',
      description: season === 'Monsoon' ? 
        'Ensure proper drainage to prevent waterlogging in fields.' :
        'Irrigate crops during early morning or evening hours to reduce water loss.',
      priority: 'high'
    },
    {
      type: 'planting',
      title: `${season} Crop Planning`,
      description: season === 'Monsoon' ? 
        'Ideal time for Kharif crops like rice, cotton, and sugarcane.' :
        season === 'Winter' ?
        'Perfect season for Rabi crops like wheat, barley, and mustard.' :
        'Consider drought-resistant varieties for summer cultivation.',
      priority: 'high'
    },
    {
      type: 'pest',
      title: 'Pest Management',
      description: season === 'Monsoon' ?
        'Monitor for fungal diseases due to high humidity. Apply preventive sprays.' :
        'Watch for pest buildup. Use integrated pest management techniques.',
      priority: 'medium'
    },
    {
      type: 'general',
      title: 'Soil Health',
      description: 'Test soil pH and nutrient levels. Add organic matter to improve soil structure.',
      priority: 'medium'
    }
  ];

  const seasonalInsights = {
    currentSeason: season,
    cropRecommendations: season === 'Monsoon' ? 
      ['Rice', 'Cotton', 'Sugarcane', 'Maize', 'Soybean'] :
      season === 'Winter' ?
      ['Wheat', 'Barley', 'Mustard', 'Gram', 'Peas'] :
      season === 'Summer' ?
      ['Watermelon', 'Muskmelon', 'Fodder crops'] :
      ['Vegetables', 'Pulses', 'Oilseeds'],
    seasonalTips: season === 'Monsoon' ? [
      'Ensure proper drainage systems',
      'Monitor for waterlogging',
      'Use disease-resistant varieties',
      'Plan timely harvesting before heavy rains'
    ] : season === 'Winter' ? [
      'Protect crops from frost',
      'Ensure adequate irrigation',
      'Apply winter fertilizers',
      'Monitor for aphid attacks'
    ] : [
      'Use mulching to retain moisture',
      'Plan drip irrigation systems',
      'Choose heat-tolerant varieties',
      'Protect from heat stress'
    ]
  };

  return {
    current: {
      temperature: forecast[0].high,
      humidity: forecast[0].humidity,
      windSpeed: 8 + Math.floor(Math.random() * 10),
      visibility: 8 + Math.floor(Math.random() * 4),
      uvIndex: season === 'Summer' ? 9 : season === 'Monsoon' ? 4 : 6,
      condition: forecast[0].condition,
      icon: forecast[0].icon,
      rainfall: forecast[0].rainfall
    },
    forecast,
    farmingAdvice,
    seasonalInsights,
    location: { state, district }
  };
};

// Weather data endpoint
router.get('/weather/:state/:district', (req, res) => {
  try {
    const { state, district } = req.params;
    const weatherData = generateWeatherData(state, district);
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

module.exports = router;