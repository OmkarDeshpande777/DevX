const express = require('express');
const router = express.Router();

// Mock real-time price data with trending simulation
let priceCache = {};
let lastUpdateTime = null;

// Real crop data with actual Indian crop names and realistic price ranges
const cropDatabase = {
  'Rice': { category: 'Cereals', basePrice: 25, volatility: 0.15, unit: 'kg' },
  'Wheat': { category: 'Cereals', basePrice: 22, volatility: 0.12, unit: 'kg' },
  'Maize': { category: 'Cereals', basePrice: 18, volatility: 0.20, unit: 'kg' },
  'Barley': { category: 'Cereals', basePrice: 20, volatility: 0.18, unit: 'kg' },
  'Bajra': { category: 'Cereals', basePrice: 24, volatility: 0.16, unit: 'kg' },
  'Jowar': { category: 'Cereals', basePrice: 26, volatility: 0.14, unit: 'kg' },
  
  'Arhar': { category: 'Pulses', basePrice: 85, volatility: 0.25, unit: 'kg' },
  'Moong': { category: 'Pulses', basePrice: 78, volatility: 0.22, unit: 'kg' },
  'Urad': { category: 'Pulses', basePrice: 82, volatility: 0.24, unit: 'kg' },
  'Chana': { category: 'Pulses', basePrice: 55, volatility: 0.20, unit: 'kg' },
  'Masoor': { category: 'Pulses', basePrice: 68, volatility: 0.18, unit: 'kg' },
  
  'Groundnut': { category: 'Oilseeds', basePrice: 45, volatility: 0.30, unit: 'kg' },
  'Mustard': { category: 'Oilseeds', basePrice: 52, volatility: 0.28, unit: 'kg' },
  'Sunflower': { category: 'Oilseeds', basePrice: 48, volatility: 0.26, unit: 'kg' },
  'Sesame': { category: 'Oilseeds', basePrice: 95, volatility: 0.32, unit: 'kg' },
  'Safflower': { category: 'Oilseeds', basePrice: 42, volatility: 0.24, unit: 'kg' },
  
  'Cotton': { category: 'Cash Crops', basePrice: 55, volatility: 0.35, unit: 'kg' },
  'Sugarcane': { category: 'Cash Crops', basePrice: 3.2, volatility: 0.15, unit: 'kg' },
  'Jute': { category: 'Cash Crops', basePrice: 38, volatility: 0.28, unit: 'kg' },
  
  'Onion': { category: 'Vegetables', basePrice: 28, volatility: 0.45, unit: 'kg' },
  'Potato': { category: 'Vegetables', basePrice: 20, volatility: 0.40, unit: 'kg' },
  'Tomato': { category: 'Vegetables', basePrice: 32, volatility: 0.50, unit: 'kg' },
  'Cabbage': { category: 'Vegetables', basePrice: 18, volatility: 0.35, unit: 'kg' },
  'Cauliflower': { category: 'Vegetables', basePrice: 25, volatility: 0.38, unit: 'kg' },
  
  'Banana': { category: 'Fruits', basePrice: 35, volatility: 0.25, unit: 'kg' },
  'Apple': { category: 'Fruits', basePrice: 120, volatility: 0.20, unit: 'kg' },
  'Orange': { category: 'Fruits', basePrice: 45, volatility: 0.22, unit: 'kg' },
  'Mango': { category: 'Fruits', basePrice: 65, volatility: 0.30, unit: 'kg' },
  'Grapes': { category: 'Fruits', basePrice: 85, volatility: 0.28, unit: 'kg' }
};

// Market locations in India
const marketLocations = [
  'Delhi', 'Mumbai', 'Pune', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
  'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
  'Bhopal', 'Visakhapatnam', 'Pimpri', 'Patna', 'Vadodara', 'Ghaziabad'
];

// Generate realistic price with trends
const generateRealtimePrice = (crop, baseData, location) => {
  const now = Date.now();
  const timeVariation = Math.sin(now / 1000000) * 0.1; // Slow oscillation
  const randomVariation = (Math.random() - 0.5) * baseData.volatility;
  const locationMultiplier = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
  
  const currentPrice = baseData.basePrice * (1 + timeVariation + randomVariation) * locationMultiplier;
  
  // Calculate trend
  const previousPrice = priceCache[`${crop}_${location}`]?.price || currentPrice;
  const change = currentPrice - previousPrice;
  const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;
  
  let trend = 'stable';
  if (changePercent > 2) trend = 'up';
  else if (changePercent < -2) trend = 'down';
  
  return {
    crop,
    location,
    price: Math.round(currentPrice * 100) / 100,
    unit: baseData.unit,
    category: baseData.category,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    trend,
    lastUpdated: new Date().toISOString(),
    marketName: `${location} Agricultural Market`,
    quality: ['Grade A', 'Grade B', 'Standard'][Math.floor(Math.random() * 3)],
    supply: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
    demand: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
  };
};

// Update price cache
const updatePriceCache = () => {
  const crops = Object.keys(cropDatabase);
  const locations = marketLocations.slice(0, 10); // Use top 10 markets
  
  crops.forEach(crop => {
    locations.forEach(location => {
      const key = `${crop}_${location}`;
      const newPrice = generateRealtimePrice(crop, cropDatabase[crop], location);
      priceCache[key] = newPrice;
    });
  });
  
  lastUpdateTime = new Date().toISOString();
};

// Initialize cache
updatePriceCache();

// Update cache every 5 minutes
setInterval(updatePriceCache, 5 * 60 * 1000);

// Get live crop prices for a location
router.get('/live-prices/:state/:district', async (req, res) => {
  try {
    const { state, district } = req.params;
    const { category, search, limit = 20 } = req.query;
    
    // Use nearest major market for the state
    const stateMarketMap = {
      'Delhi': 'Delhi',
      'Maharashtra': 'Mumbai',
      'Karnataka': 'Bangalore',
      'Tamil Nadu': 'Chennai',
      'West Bengal': 'Kolkata',
      'Telangana': 'Hyderabad',
      'Gujarat': 'Ahmedabad',
      'Rajasthan': 'Jaipur',
      'Uttar Pradesh': 'Lucknow',
      'Madhya Pradesh': 'Indore'
    };
    
    const nearestMarket = stateMarketMap[state] || 'Delhi';
    
    // Get all prices for the nearest market
    let prices = Object.values(priceCache).filter(price => 
      price.location === nearestMarket
    );
    
    // Apply category filter
    if (category && category !== 'all') {
      prices = prices.filter(price => 
        price.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      prices = prices.filter(price =>
        price.crop.toLowerCase().includes(searchTerm) ||
        price.category.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by price change (trending)
    prices.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    
    // Limit results
    prices = prices.slice(0, parseInt(limit));
    
    // Add market insights
    const insights = {
      totalCrops: prices.length,
      averageChange: prices.reduce((sum, p) => sum + p.changePercent, 0) / prices.length,
      highSupplyCrops: prices.filter(p => p.supply === 'High').length,
      highDemandCrops: prices.filter(p => p.demand === 'High').length,
      trendingUp: prices.filter(p => p.trend === 'up').length,
      trendingDown: prices.filter(p => p.trend === 'down').length,
      lastUpdated: lastUpdateTime,
      marketLocation: nearestMarket,
      dataSource: 'Live Market Feed'
    };
    
    res.json({
      success: true,
      data: {
        prices,
        insights,
        location: { state, district, nearestMarket },
        categories: [...new Set(prices.map(p => p.category))],
        updateInterval: '5 minutes'
      }
    });
    
  } catch (error) {
    console.error('Error fetching live prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live crop prices',
      message: error.message
    });
  }
});

// Get specific crop price history and predictions
router.get('/crop-analysis/:crop/:location', async (req, res) => {
  try {
    const { crop, location } = req.params;
    const key = `${crop}_${location}`;
    
    if (!priceCache[key]) {
      return res.status(404).json({
        success: false,
        error: 'Crop or location not found'
      });
    }
    
    const currentPrice = priceCache[key];
    
    // Generate mock historical data (last 30 days)
    const historical = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const variation = (Math.random() - 0.5) * 0.2;
      const price = currentPrice.price + (currentPrice.price * variation);
      
      return {
        date: date.toISOString().split('T')[0],
        price: Math.round(price * 100) / 100,
        volume: Math.floor(Math.random() * 1000) + 100
      };
    });
    
    // Simple prediction (next 7 days)
    const predictions = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      const trend = currentPrice.trend === 'up' ? 0.02 : currentPrice.trend === 'down' ? -0.02 : 0;
      const variation = (Math.random() - 0.5) * 0.1;
      const predictedPrice = currentPrice.price * (1 + trend + variation);
      
      return {
        date: date.toISOString().split('T')[0],
        predictedPrice: Math.round(predictedPrice * 100) / 100,
        confidence: Math.floor(Math.random() * 20) + 70, // 70-90% confidence
        factors: ['Weather patterns', 'Market demand', 'Seasonal trends']
      };
    });
    
    // Market analysis
    const analysis = {
      volatilityIndex: cropDatabase[crop]?.volatility || 0.2,
      priceRange: {
        min: Math.min(...historical.map(h => h.price)),
        max: Math.max(...historical.map(h => h.price)),
        average: historical.reduce((sum, h) => sum + h.price, 0) / historical.length
      },
      marketSentiment: currentPrice.trend === 'up' ? 'Bullish' : 
                       currentPrice.trend === 'down' ? 'Bearish' : 'Neutral',
      recommendation: currentPrice.trend === 'up' ? 'Hold/Sell' : 
                      currentPrice.trend === 'down' ? 'Buy' : 'Monitor',
      factors: [
        'Seasonal demand patterns',
        'Weather conditions',
        'Government policies',
        'International market trends',
        'Storage and transportation costs'
      ]
    };
    
    res.json({
      success: true,
      data: {
        current: currentPrice,
        historical,
        predictions,
        analysis,
        metadata: {
          dataPoints: historical.length,
          predictionHorizon: '7 days',
          lastUpdated: lastUpdateTime
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching crop analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crop analysis',
      message: error.message
    });
  }
});

// Get market comparison across locations
router.get('/market-comparison/:crop', async (req, res) => {
  try {
    const { crop } = req.params;
    
    // Get prices for this crop across all locations
    const cropPrices = Object.values(priceCache).filter(price => 
      price.crop === crop
    );
    
    if (cropPrices.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Crop not found in any market'
      });
    }
    
    // Sort by price
    cropPrices.sort((a, b) => a.price - b.price);
    
    const analysis = {
      crop,
      totalMarkets: cropPrices.length,
      priceRange: {
        lowest: cropPrices[0],
        highest: cropPrices[cropPrices.length - 1],
        average: cropPrices.reduce((sum, p) => sum + p.price, 0) / cropPrices.length
      },
      bestBuyMarkets: cropPrices.slice(0, 3), // Top 3 lowest prices
      bestSellMarkets: cropPrices.slice(-3).reverse(), // Top 3 highest prices
      marketSpread: cropPrices[cropPrices.length - 1].price - cropPrices[0].price,
      recommendation: {
        buyFrom: cropPrices[0].location,
        sellTo: cropPrices[cropPrices.length - 1].location,
        potentialProfit: cropPrices[cropPrices.length - 1].price - cropPrices[0].price
      }
    };
    
    res.json({
      success: true,
      data: {
        markets: cropPrices,
        analysis,
        lastUpdated: lastUpdateTime
      }
    });
    
  } catch (error) {
    console.error('Error fetching market comparison:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market comparison',
      message: error.message
    });
  }
});

// Get trending crops
router.get('/trending', async (req, res) => {
  try {
    const allPrices = Object.values(priceCache);
    
    // Group by crop and calculate average change
    const cropTrends = {};
    allPrices.forEach(price => {
      if (!cropTrends[price.crop]) {
        cropTrends[price.crop] = {
          crop: price.crop,
          category: price.category,
          totalChange: 0,
          count: 0,
          prices: []
        };
      }
      cropTrends[price.crop].totalChange += price.changePercent;
      cropTrends[price.crop].count += 1;
      cropTrends[price.crop].prices.push(price);
    });
    
    // Calculate average change and sort
    const trending = Object.values(cropTrends)
      .map(trend => ({
        ...trend,
        averageChange: trend.totalChange / trend.count,
        averagePrice: trend.prices.reduce((sum, p) => sum + p.price, 0) / trend.prices.length,
        trend: trend.totalChange > 0 ? 'up' : trend.totalChange < 0 ? 'down' : 'stable'
      }))
      .sort((a, b) => Math.abs(b.averageChange) - Math.abs(a.averageChange));
    
    const categories = {
      gainers: trending.filter(t => t.averageChange > 2).slice(0, 10),
      losers: trending.filter(t => t.averageChange < -2).slice(0, 10),
      mostVolatile: trending.slice(0, 10),
      stable: trending.filter(t => Math.abs(t.averageChange) < 1).slice(0, 10)
    };
    
    res.json({
      success: true,
      data: {
        trending: trending.slice(0, 20),
        categories,
        summary: {
          totalCrops: trending.length,
          gainers: categories.gainers.length,
          losers: categories.losers.length,
          stable: categories.stable.length,
          lastUpdated: lastUpdateTime
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching trending crops:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending crops',
      message: error.message
    });
  }
});

// Force refresh prices (for testing)
router.post('/refresh', (req, res) => {
  try {
    updatePriceCache();
    res.json({
      success: true,
      message: 'Price cache refreshed successfully',
      lastUpdated: lastUpdateTime,
      totalPrices: Object.keys(priceCache).length
    });
  } catch (error) {
    console.error('Error refreshing prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh prices'
    });
  }
});

module.exports = router;