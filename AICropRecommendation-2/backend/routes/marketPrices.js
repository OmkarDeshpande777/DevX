const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Market Prices API Routes

// Get all available commodities
router.get('/commodities', async (req, res) => {
  try {
    const csvFilePath = path.join(__dirname, '../data/commodity_prices.csv');
    const commodities = new Set();
    
    if (!fs.existsSync(csvFilePath)) {
      return res.status(404).json({
        success: false,
        error: 'Market price data not found'
      });
    }

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.commodity) {
          commodities.add(row.commodity);
        }
      })
      .on('end', () => {
        const sortedCommodities = Array.from(commodities).sort();
        res.json({
          success: true,
          data: {
            commodities: sortedCommodities,
            total: sortedCommodities.length
          }
        });
      })
      .on('error', (error) => {
        console.error('Error reading commodities:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch commodities'
        });
      });
  } catch (error) {
    console.error('Commodities endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch commodities'
    });
  }
});

// Get all available states
router.get('/states', async (req, res) => {
  try {
    const csvFilePath = path.join(__dirname, '../data/commodity_prices.csv');
    const states = new Set();
    
    if (!fs.existsSync(csvFilePath)) {
      return res.status(404).json({
        success: false,
        error: 'Market price data not found'
      });
    }

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.state) {
          states.add(row.state);
        }
      })
      .on('end', () => {
        const sortedStates = Array.from(states).sort();
        res.json({
          success: true,
          data: {
            states: sortedStates,
            total: sortedStates.length
          }
        });
      })
      .on('error', (error) => {
        console.error('Error reading states:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch states'
        });
      });
  } catch (error) {
    console.error('States endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch states'
    });
  }
});

// Get districts by state
router.get('/districts/:state', async (req, res) => {
  try {
    const { state } = req.params;
    const csvFilePath = path.join(__dirname, '../data/commodity_prices.csv');
    const districts = new Set();
    
    if (!fs.existsSync(csvFilePath)) {
      return res.status(404).json({
        success: false,
        error: 'Market price data not found'
      });
    }

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.state && row.district && row.state.toLowerCase() === state.toLowerCase()) {
          districts.add(row.district);
        }
      })
      .on('end', () => {
        const sortedDistricts = Array.from(districts).sort();
        res.json({
          success: true,
          data: {
            state: state,
            districts: sortedDistricts,
            total: sortedDistricts.length
          }
        });
      })
      .on('error', (error) => {
        console.error('Error reading districts:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch districts'
        });
      });
  } catch (error) {
    console.error('Districts endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch districts'
    });
  }
});

// Get markets by state and district
router.get('/markets/:state/:district', async (req, res) => {
  try {
    const { state, district } = req.params;
    const csvFilePath = path.join(__dirname, '../data/commodity_prices.csv');
    const markets = new Set();
    
    if (!fs.existsSync(csvFilePath)) {
      return res.status(404).json({
        success: false,
        error: 'Market price data not found'
      });
    }

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.state && row.district && row.market && 
            row.state.toLowerCase() === state.toLowerCase() && 
            row.district.toLowerCase() === district.toLowerCase()) {
          markets.add(row.market);
        }
      })
      .on('end', () => {
        const sortedMarkets = Array.from(markets).sort();
        res.json({
          success: true,
          data: {
            state: state,
            district: district,
            markets: sortedMarkets,
            total: sortedMarkets.length
          }
        });
      })
      .on('error', (error) => {
        console.error('Error reading markets:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch markets'
        });
      });
  } catch (error) {
    console.error('Markets endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch markets'
    });
  }
});

// Get price data for specific commodity and location
router.get('/prices', async (req, res) => {
  try {
    const { commodity, state, district, market } = req.query;
    const csvFilePath = path.join(__dirname, '../data/commodity_prices.csv');
    const results = [];
    
    if (!commodity) {
      return res.status(400).json({
        success: false,
        error: 'Commodity parameter is required'
      });
    }

    if (!fs.existsSync(csvFilePath)) {
      return res.status(404).json({
        success: false,
        error: 'Market price data not found'
      });
    }

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Filter based on provided parameters
        let matches = true;
        
        if (commodity && row.commodity.toLowerCase() !== commodity.toLowerCase()) {
          matches = false;
        }
        if (state && row.state.toLowerCase() !== state.toLowerCase()) {
          matches = false;
        }
        if (district && row.district.toLowerCase() !== district.toLowerCase()) {
          matches = false;
        }
        if (market && row.market.toLowerCase() !== market.toLowerCase()) {
          matches = false;
        }
        
        if (matches) {
          results.push({
            commodity: row.commodity,
            state: row.state,
            district: row.district,
            market: row.market,
            variety: row.variety,
            grade: row.grade,
            arrival_date: row.arrival_date,
            min_price: parseFloat(row.min_price) || 0,
            max_price: parseFloat(row.max_price) || 0,
            modal_price: parseFloat(row.modal_price) || 0
          });
        }
      })
      .on('end', () => {
        // Calculate statistics
        const prices = results.map(r => r.modal_price).filter(p => p > 0);
        const statistics = {
          total_records: results.length,
          avg_price: prices.length > 0 ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2) : 0,
          min_price: prices.length > 0 ? Math.min(...prices) : 0,
          max_price: prices.length > 0 ? Math.max(...prices) : 0,
          median_price: prices.length > 0 ? prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)] : 0
        };

        res.json({
          success: true,
          data: {
            filters: {
              commodity,
              state,
              district,
              market
            },
            statistics,
            records: results,
            total: results.length
          }
        });
      })
      .on('error', (error) => {
        console.error('Error reading price data:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch price data'
        });
      });
  } catch (error) {
    console.error('Prices endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price data'
    });
  }
});

// Get market overview with trending prices
router.get('/overview', async (req, res) => {
  try {
    const csvFilePath = path.join(__dirname, '../data/commodity_prices.csv');
    const results = [];
    const commodityStats = {};
    
    if (!fs.existsSync(csvFilePath)) {
      return res.status(404).json({
        success: false,
        error: 'Market price data not found'
      });
    }

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        const commodity = row.commodity;
        const price = parseFloat(row.modal_price) || 0;
        
        if (!commodityStats[commodity]) {
          commodityStats[commodity] = {
            commodity: commodity,
            prices: [],
            locations: new Set(),
            varieties: new Set()
          };
        }
        
        commodityStats[commodity].prices.push(price);
        commodityStats[commodity].locations.add(`${row.district}, ${row.state}`);
        commodityStats[commodity].varieties.add(row.variety);
        
        results.push({
          commodity: row.commodity,
          state: row.state,
          district: row.district,
          market: row.market,
          modal_price: price,
          arrival_date: row.arrival_date
        });
      })
      .on('end', () => {
        // Process commodity statistics
        const trendingCommodities = Object.values(commodityStats).map(stat => {
          const prices = stat.prices.filter(p => p > 0);
          return {
            commodity: stat.commodity,
            avg_price: prices.length > 0 ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2) : 0,
            min_price: prices.length > 0 ? Math.min(...prices) : 0,
            max_price: prices.length > 0 ? Math.max(...prices) : 0,
            locations: Array.from(stat.locations).length,
            varieties: Array.from(stat.varieties).length,
            records: prices.length
          };
        }).sort((a, b) => parseFloat(b.avg_price) - parseFloat(a.avg_price));

        // Get top commodities by price
        const topByPrice = trendingCommodities.slice(0, 10);
        
        // Get market summary
        const allPrices = results.map(r => r.modal_price).filter(p => p > 0);
        const marketSummary = {
          total_commodities: Object.keys(commodityStats).length,
          total_records: results.length,
          avg_market_price: allPrices.length > 0 ? (allPrices.reduce((a, b) => a + b, 0) / allPrices.length).toFixed(2) : 0,
          price_range: {
            min: allPrices.length > 0 ? Math.min(...allPrices) : 0,
            max: allPrices.length > 0 ? Math.max(...allPrices) : 0
          }
        };

        res.json({
          success: true,
          data: {
            market_summary: marketSummary,
            trending_commodities: topByPrice,
            recent_updates: results.slice(0, 20) // Latest 20 records
          }
        });
      })
      .on('error', (error) => {
        console.error('Error reading overview data:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch market overview'
        });
      });
  } catch (error) {
    console.error('Overview endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market overview'
    });
  }
});

// Search functionality
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 50 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query parameter "q" is required'
      });
    }

    const csvFilePath = path.join(__dirname, '../data/commodity_prices.csv');
    const results = [];
    const searchTerm = q.toLowerCase();
    
    if (!fs.existsSync(csvFilePath)) {
      return res.status(404).json({
        success: false,
        error: 'Market price data not found'
      });
    }

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Search in commodity, state, district, market
        const searchableText = `${row.commodity} ${row.state} ${row.district} ${row.market}`.toLowerCase();
        
        if (searchableText.includes(searchTerm)) {
          results.push({
            commodity: row.commodity,
            state: row.state,
            district: row.district,
            market: row.market,
            variety: row.variety,
            modal_price: parseFloat(row.modal_price) || 0,
            arrival_date: row.arrival_date
          });
        }
      })
      .on('end', () => {
        // Limit results and sort by relevance (commodity name matches first)
        const sortedResults = results
          .sort((a, b) => {
            const aStartsWith = a.commodity.toLowerCase().startsWith(searchTerm);
            const bStartsWith = b.commodity.toLowerCase().startsWith(searchTerm);
            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
            return 0;
          })
          .slice(0, parseInt(limit));

        res.json({
          success: true,
          data: {
            query: q,
            results: sortedResults,
            total: results.length,
            showing: sortedResults.length
          }
        });
      })
      .on('error', (error) => {
        console.error('Error searching data:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to search market data'
        });
      });
  } catch (error) {
    console.error('Search endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search market data'
    });
  }
});

module.exports = router;