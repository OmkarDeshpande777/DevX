const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Enhanced Market Prices API with Farmer-Focused Features

// Get farmer dashboard with actionable insights
router.get('/farmer-dashboard', async (req, res) => {
  try {
    const { state, district } = req.query;
    const csvFilePath = path.join(__dirname, '../data/commodity_prices.csv');
    const results = [];
    
    if (!fs.existsSync(csvFilePath)) {
      return res.status(404).json({
        success: false,
        error: 'Market price data not found'
      });
    }

    // Read and process data
    const dataPromise = new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          if (!state || row.state.toLowerCase() === state.toLowerCase()) {
            if (!district || row.district.toLowerCase() === district.toLowerCase()) {
              results.push({
                commodity: row.commodity,
                state: row.state,
                district: row.district,
                market: row.market,
                variety: row.variety,
                grade: row.grade,
                arrival_date: row.arrival_date,
                min_price: (parseFloat(row.min_price) || 0) / 100,
                max_price: (parseFloat(row.max_price) || 0) / 100,
                modal_price: (parseFloat(row.modal_price) || 0) / 100
              });
            }
          }
        })
        .on('end', () => resolve())
        .on('error', reject);
    });

    await dataPromise;

    // Generate farmer insights
    const insights = generateFarmerInsights(results);
    
    res.json({
      success: true,
      data: {
        location: { state, district },
        total_crops: results.length,
        insights,
        recommendations: generateRecommendations(results),
        alerts: generatePriceAlerts(results)
      }
    });

  } catch (error) {
    console.error('Farmer dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate farmer dashboard'
    });
  }
});

// Get profit analysis for specific crop
router.get('/profit-analysis/:commodity', async (req, res) => {
  try {
    const { commodity } = req.params;
    const { state, district, investmentCost = 50000, landSize = 1 } = req.query;
    
    const csvFilePath = path.join(__dirname, '../data/commodity_prices.csv');
    const results = [];
    
    const dataPromise = new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.commodity.toLowerCase() === commodity.toLowerCase()) {
            if (!state || row.state.toLowerCase() === state.toLowerCase()) {
              if (!district || row.district.toLowerCase() === district.toLowerCase()) {
                results.push({
                  state: row.state,
                  district: row.district,
                  market: row.market,
                  modal_price: (parseFloat(row.modal_price) || 0) / 100,
                  min_price: (parseFloat(row.min_price) || 0) / 100,
                  max_price: (parseFloat(row.max_price) || 0) / 100,
                  arrival_date: row.arrival_date
                });
              }
            }
          }
        })
        .on('end', () => resolve())
        .on('error', reject);
    });

    await dataPromise;

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No price data found for this commodity'
      });
    }

    // Calculate profit analysis
    const profitAnalysis = calculateProfitAnalysis(results, parseFloat(investmentCost), parseFloat(landSize), commodity);
    
    res.json({
      success: true,
      data: {
        commodity,
        analysis: profitAnalysis,
        markets: results,
        investment_details: {
          total_cost: parseFloat(investmentCost),
          land_size_acres: parseFloat(landSize),
          cost_per_acre: parseFloat(investmentCost) / parseFloat(landSize)
        }
      }
    });

  } catch (error) {
    console.error('Profit analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate profit analysis'
    });
  }
});

// Get seasonal trends and best selling time
router.get('/seasonal-insights/:commodity', async (req, res) => {
  try {
    const { commodity } = req.params;
    const csvFilePath = path.join(__dirname, '../data/commodity_prices.csv');
    const results = [];
    
    const dataPromise = new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.commodity.toLowerCase() === commodity.toLowerCase()) {
            results.push({
              modal_price: (parseFloat(row.modal_price) || 0) / 100,
              arrival_date: row.arrival_date,
              state: row.state,
              district: row.district,
              market: row.market
            });
          }
        })
        .on('end', () => resolve())
        .on('error', reject);
    });

    await dataPromise;

    const seasonalInsights = generateSeasonalInsights(results, commodity);
    
    res.json({
      success: true,
      data: {
        commodity,
        seasonal_insights: seasonalInsights,
        best_selling_advice: generateSellingAdvice(results, commodity)
      }
    });

  } catch (error) {
    console.error('Seasonal insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate seasonal insights'
    });
  }
});

// Get transportation cost calculator
router.get('/transport-calculator', async (req, res) => {
  try {
    const { fromDistrict, toMarket, commodity, quantity = 100 } = req.query;
    
    if (!fromDistrict || !toMarket || !commodity) {
      return res.status(400).json({
        success: false,
        error: 'fromDistrict, toMarket, and commodity parameters are required'
      });
    }

    const transportCost = calculateTransportCost(fromDistrict, toMarket, parseFloat(quantity));
    const storageCost = calculateStorageCost(commodity, parseFloat(quantity));
    
    res.json({
      success: true,
      data: {
        route: `${fromDistrict} → ${toMarket}`,
        commodity,
        quantity_kg: parseFloat(quantity),
        costs: {
          transportation: transportCost,
          storage: storageCost,
          handling: Math.round(parseFloat(quantity) * 2), // ₹2 per kg handling
          total: transportCost + storageCost + Math.round(parseFloat(quantity) * 2)
        },
        recommendations: [
          'Consider bulk transportation to reduce per-kg cost',
          'Plan harvest timing to avoid peak season transport charges',
          'Group with other farmers for shared transportation',
          'Check for government subsidized transport schemes'
        ]
      }
    });

  } catch (error) {
    console.error('Transport calculator error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate transport costs'
    });
  }
});

// Get crop comparison for decision making
router.get('/crop-comparison', async (req, res) => {
  try {
    const { crops, state, district } = req.query;
    
    if (!crops) {
      return res.status(400).json({
        success: false,
        error: 'crops parameter is required (comma-separated list)'
      });
    }

    const cropList = crops.split(',').map(c => c.trim());
    const csvFilePath = path.join(__dirname, '../data/commodity_prices.csv');
    const allData = [];
    
    const dataPromise = new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          if (cropList.some(crop => row.commodity.toLowerCase().includes(crop.toLowerCase()))) {
            if (!state || row.state.toLowerCase() === state.toLowerCase()) {
              if (!district || row.district.toLowerCase() === district.toLowerCase()) {
                allData.push({
                  commodity: row.commodity,
                  modal_price: (parseFloat(row.modal_price) || 0) / 100,
                  min_price: (parseFloat(row.min_price) || 0) / 100,
                  max_price: (parseFloat(row.max_price) || 0) / 100,
                  state: row.state,
                  district: row.district
                });
              }
            }
          }
        })
        .on('end', () => resolve())
        .on('error', reject);
    });

    await dataPromise;

    const comparison = generateCropComparison(allData, cropList);
    
    res.json({
      success: true,
      data: {
        comparison,
        recommendations: generateCropRecommendations(comparison)
      }
    });

  } catch (error) {
    console.error('Crop comparison error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate crop comparison'
    });
  }
});

// Get market alerts and notifications
router.get('/alerts', async (req, res) => {
  try {
    const { state, district, crops } = req.query;
    const csvFilePath = path.join(__dirname, '../data/commodity_prices.csv');
    const results = [];
    
    const dataPromise = new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          if (!state || row.state.toLowerCase() === state.toLowerCase()) {
            if (!district || row.district.toLowerCase() === district.toLowerCase()) {
              if (!crops || crops.split(',').some(crop => 
                row.commodity.toLowerCase().includes(crop.trim().toLowerCase()))) {
                results.push({
                  commodity: row.commodity,
                  state: row.state,
                  district: row.district,
                  market: row.market,
                  modal_price: (parseFloat(row.modal_price) || 0) / 100,
                  min_price: (parseFloat(row.min_price) || 0) / 100,
                  max_price: (parseFloat(row.max_price) || 0) / 100,
                  arrival_date: row.arrival_date
                });
              }
            }
          }
        })
        .on('end', () => resolve())
        .on('error', reject);
    });

    await dataPromise;

    const alerts = generateAdvancedAlerts(results);
    
    res.json({
      success: true,
      data: {
        alerts,
        total_alerts: alerts.length,
        location: { state, district }
      }
    });

  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate market alerts'
    });
  }
});

// Helper Functions

function generateFarmerInsights(data) {
  const commodityGroups = {};
  
  data.forEach(item => {
    if (!commodityGroups[item.commodity]) {
      commodityGroups[item.commodity] = [];
    }
    commodityGroups[item.commodity].push(item.modal_price);
  });

  const insights = [];
  
  Object.entries(commodityGroups).forEach(([commodity, prices]) => {
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const volatility = ((maxPrice - minPrice) / avgPrice) * 100;
    
    insights.push({
      commodity,
      average_price: Math.round(avgPrice),
      price_range: { min: minPrice, max: maxPrice },
      volatility_percent: Math.round(volatility),
      market_stability: volatility < 20 ? 'Stable' : volatility < 40 ? 'Moderate' : 'Volatile',
      recommendation: volatility < 20 ? 'Good for steady income' : 'High risk, high reward'
    });
  });

  return insights.sort((a, b) => b.average_price - a.average_price);
}

function generateRecommendations(data) {
  const recommendations = [];
  
  // Top 3 highest priced commodities
  const topPriced = data
    .sort((a, b) => b.modal_price - a.modal_price)
    .slice(0, 3)
    .map(item => ({
      type: 'high_value',
      commodity: item.commodity,
      price: item.modal_price,
      market: item.market,
      message: `${item.commodity} is fetching ₹${item.modal_price}/kg in ${item.market}. Consider this for next season.`
    }));

  recommendations.push(...topPriced);

  // Seasonal recommendations
  const currentMonth = new Date().getMonth() + 1;
  const seasonalAdvice = getSeasonalAdvice(currentMonth);
  
  recommendations.push({
    type: 'seasonal',
    message: seasonalAdvice,
    priority: 'high'
  });

  return recommendations;
}

function generatePriceAlerts(data) {
  const alerts = [];
  
  data.forEach(item => {
    const priceVariation = ((item.max_price - item.min_price) / item.modal_price) * 100;
    
    if (priceVariation > 30) {
      alerts.push({
        type: 'price_volatility',
        commodity: item.commodity,
        market: item.market,
        message: `High price variation (${Math.round(priceVariation)}%) for ${item.commodity} in ${item.market}`,
        severity: 'warning'
      });
    }
    
    if (item.modal_price > 100) {
      alerts.push({
        type: 'high_price',
        commodity: item.commodity,
        price: item.modal_price,
        market: item.market,
        message: `Excellent prices for ${item.commodity}: ₹${item.modal_price}/kg in ${item.market}`,
        severity: 'info'
      });
    }
  });

  return alerts;
}

function calculateProfitAnalysis(priceData, investmentCost, landSize, commodity) {
  const avgPrice = priceData.reduce((sum, item) => sum + item.modal_price, 0) / priceData.length;
  const maxPrice = Math.max(...priceData.map(item => item.modal_price));
  const minPrice = Math.min(...priceData.map(item => item.min_price));
  
  // Estimated yield per acre (this would be from crop database in real scenario)
  const yieldEstimates = {
    'tomato': 15000, // kg per acre
    'wheat': 2500,
    'rice': 3000,
    'cotton': 400,
    'potato': 10000
  };
  
  const estimatedYield = yieldEstimates[commodity.toLowerCase()] || 2000;
  const totalYield = estimatedYield * landSize;
  
  const scenarios = {
    conservative: {
      price: minPrice,
      revenue: totalYield * minPrice,
      profit: (totalYield * minPrice) - investmentCost,
      roi: (((totalYield * minPrice) - investmentCost) / investmentCost) * 100
    },
    average: {
      price: avgPrice,
      revenue: totalYield * avgPrice,
      profit: (totalYield * avgPrice) - investmentCost,
      roi: (((totalYield * avgPrice) - investmentCost) / investmentCost) * 100
    },
    optimistic: {
      price: maxPrice,
      revenue: totalYield * maxPrice,
      profit: (totalYield * maxPrice) - investmentCost,
      roi: (((totalYield * maxPrice) - investmentCost) / investmentCost) * 100
    }
  };

  return {
    estimated_yield_kg: totalYield,
    yield_per_acre: estimatedYield,
    scenarios,
    breakeven_price: investmentCost / totalYield,
    risk_assessment: scenarios.conservative.profit > 0 ? 'Low Risk' : 'High Risk',
    recommendation: scenarios.average.roi > 20 ? 'Highly Recommended' : 
                   scenarios.average.roi > 10 ? 'Recommended' : 'Consider Alternatives'
  };
}

function generateSeasonalInsights(data, commodity) {
  // This would be enhanced with historical data in a real system
  const seasonalPatterns = {
    'tomato': {
      peak_season: 'October-February',
      lean_season: 'June-August',
      best_planting: 'August-September',
      harvest_time: '90-120 days',
      market_trend: 'Prices peak in winter due to high demand'
    },
    'wheat': {
      peak_season: 'March-May',
      lean_season: 'September-November',
      best_planting: 'November-December',
      harvest_time: '4-5 months',
      market_trend: 'Government procurement drives prices in April-May'
    }
  };

  const pattern = seasonalPatterns[commodity.toLowerCase()] || {
    peak_season: 'Data not available',
    lean_season: 'Data not available',
    best_planting: 'Consult local agriculture office',
    harvest_time: 'Varies by variety',
    market_trend: 'Monitor local market conditions'
  };

  return {
    ...pattern,
    current_price_trend: 'Stable', // This would be calculated from historical data
    next_month_forecast: 'Expected to remain stable',
    advice: `Best time to sell ${commodity} is during ${pattern.peak_season}`
  };
}

function generateSellingAdvice(data, commodity) {
  const avgPrice = data.reduce((sum, item) => sum + item.modal_price, 0) / data.length;
  const currentPrice = data[0]?.modal_price || avgPrice;
  
  return {
    current_market_status: currentPrice > avgPrice ? 'Favorable' : 'Below Average',
    sell_recommendation: currentPrice > avgPrice ? 'Good time to sell' : 'Wait for better prices',
    target_price: Math.round(avgPrice * 1.1),
    market_outlook: 'Monitor daily for 1-2 weeks for price improvement',
    alternatives: [
      'Consider value addition (processing)',
      'Explore direct sales to consumers',
      'Check with food processing companies',
      'Look into export opportunities'
    ]
  };
}

function calculateTransportCost(fromDistrict, toMarket, quantity) {
  // Simplified transport cost calculation (₹3-5 per kg based on distance)
  const baseRate = 4; // ₹4 per kg average
  const bulkDiscount = quantity > 1000 ? 0.5 : 0; // 50 paisa discount for bulk
  return Math.round(quantity * (baseRate - bulkDiscount));
}

function calculateStorageCost(commodity, quantity) {
  // Storage cost varies by commodity (₹1-3 per kg per month)
  const storageRates = {
    'grains': 1,
    'vegetables': 3,
    'fruits': 2.5,
    'spices': 1.5
  };
  
  const rate = storageRates['vegetables']; // Default to vegetable rate
  return Math.round(quantity * rate);
}

function generateCropComparison(data, cropList) {
  const comparison = {};
  
  cropList.forEach(crop => {
    const cropData = data.filter(item => 
      item.commodity.toLowerCase().includes(crop.toLowerCase())
    );
    
    if (cropData.length > 0) {
      const avgPrice = cropData.reduce((sum, item) => sum + item.modal_price, 0) / cropData.length;
      const maxPrice = Math.max(...cropData.map(item => item.modal_price));
      const minPrice = Math.min(...cropData.map(item => item.min_price));
      
      comparison[crop] = {
        average_price: Math.round(avgPrice),
        max_price: maxPrice,
        min_price: minPrice,
        markets_available: cropData.length,
        price_stability: ((maxPrice - minPrice) / avgPrice * 100) < 30 ? 'Stable' : 'Volatile',
        profitability_score: Math.round((avgPrice / 100) * 10) // Simplified scoring
      };
    }
  });
  
  return comparison;
}

function generateCropRecommendations(comparison) {
  const recommendations = [];
  const crops = Object.entries(comparison);
  
  // Best price crop
  const bestPrice = crops.reduce((best, current) => 
    current[1].average_price > best[1].average_price ? current : best
  );
  
  recommendations.push({
    type: 'highest_price',
    crop: bestPrice[0],
    reason: `Highest average price: ₹${bestPrice[1].average_price}/kg`,
    priority: 'high'
  });
  
  // Most stable crop
  const mostStable = crops.find(([crop, data]) => data.price_stability === 'Stable');
  if (mostStable) {
    recommendations.push({
      type: 'most_stable',
      crop: mostStable[0],
      reason: 'Stable prices with lower risk',
      priority: 'medium'
    });
  }
  
  return recommendations;
}

function generateAdvancedAlerts(data) {
  const alerts = [];
  
  // Price spike alerts
  data.forEach(item => {
    if (item.modal_price > 80) {
      alerts.push({
        type: 'price_spike',
        commodity: item.commodity,
        market: item.market,
        current_price: item.modal_price,
        message: `${item.commodity} prices are exceptionally high at ₹${item.modal_price}/kg in ${item.market}`,
        action: 'Consider selling if you have stock',
        urgency: 'high'
      });
    }
  });
  
  // Market opportunity alerts
  const highValueCrops = data.filter(item => item.modal_price > 50);
  if (highValueCrops.length > 0) {
    alerts.push({
      type: 'opportunity',
      message: `${highValueCrops.length} high-value crops available in your area`,
      action: 'Consider diversifying to high-value crops',
      urgency: 'medium'
    });
  }
  
  return alerts;
}

function getSeasonalAdvice(month) {
  const advice = {
    1: 'January: Harvest winter crops, prepare for Rabi season',
    2: 'February: Good time to harvest wheat, mustard. Plan for summer crops',
    3: 'March: Harvest season for wheat, barley. Prepare land for summer crops',
    4: 'April: Summer crop planting - fodder, vegetables. Market surplus winter crops',
    5: 'May: Continue summer crop care. Plan for monsoon crops',
    6: 'June: Monsoon preparation. Sow Kharif crops like rice, cotton',
    7: 'July: Peak Kharif sowing. Focus on rice, sugarcane, cotton',
    8: 'August: Continue Kharif crop care. Late sowing if needed',
    9: 'September: Kharif crop management. Prepare for post-monsoon planting',
    10: 'October: Harvest early Kharif crops. Sow Rabi crops',
    11: 'November: Peak Rabi sowing season - wheat, mustard, gram',
    12: 'December: Continue Rabi sowing. Winter crop management'
  };
  
  return advice[month] || 'Monitor local agricultural department advice';
}

module.exports = router;