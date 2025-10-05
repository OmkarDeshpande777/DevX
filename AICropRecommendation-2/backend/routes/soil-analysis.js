const express = require('express');
const axios = require('axios');
const router = express.Router();

class SoilAnalysisSystem {
  constructor() {
    this.soilgrids_base_url = "https://rest.isric.org/soilgrids/v2.0/properties/query";
  }

  async getLiveLocationSoilData(latitude, longitude) {
    try {
      const soilgridsData = await this.fetchSoilgridsData(latitude, longitude);
      const estimatedNutrients = this.estimateNutrients(soilgridsData);
      const recommendations = this.generateRecommendations(soilgridsData, estimatedNutrients);
      
      return {
        location: { latitude, longitude },
        soil_properties: soilgridsData,
        nutrients: estimatedNutrients,
        recommendations,
        confidence_score: this.calculateConfidenceScore(soilgridsData)
      };
    } catch (error) {
      console.error('Soil analysis error:', error);
      throw error;
    }
  }

  async fetchSoilgridsData(lat, lon) {
    const params = {
      lon,
      lat,
      property: ['phh2o', 'nitrogen', 'soc', 'sand', 'silt', 'clay', 'cec', 'bdod'],
      depth: ['0-5cm', '5-15cm'],
      value: ['mean', 'uncertainty']
    };

    try {
      const response = await axios.get(this.soilgrids_base_url, { 
        params,
        timeout: 15000
      });
      return this.processSoilgridsResponse(response.data);
    } catch (error) {
      console.error('SoilGrids API error:', error.message);
      return this.getMockData(); // Fallback data
    }
  }

  processSoilgridsResponse(data) {
    try {
      const properties = data.properties || {};
      const layers = properties.layers || [];
      
      const soilProps = {};
      const uncertainties = {};
      
      for (const layer of layers) {
        const propName = layer.name || '';
        const depths = layer.depths || [];
        
        if (depths.length > 0) {
          const firstDepth = depths[0];
          const values = firstDepth.values || {};
          const meanValue = values.mean || 0;
          const uncertainty = firstDepth.uncertainty || 0;
          
          // Convert units and map properties
          switch (propName) {
            case 'phh2o':
              soilProps.ph = Math.round((meanValue / 10) * 10) / 10;
              uncertainties.ph = uncertainty / 10;
              break;
            case 'soc':
              soilProps.organic_carbon = Math.round((meanValue / 10) * 100) / 100;
              uncertainties.organic_carbon = uncertainty / 10;
              break;
            case 'nitrogen':
              soilProps.nitrogen = Math.round((meanValue / 100) * 100) / 100;
              uncertainties.nitrogen = uncertainty / 100;
              break;
            case 'sand':
              soilProps.sand_content = Math.round((meanValue / 10) * 10) / 10;
              break;
            case 'silt':
              soilProps.silt_content = Math.round((meanValue / 10) * 10) / 10;
              break;
            case 'clay':
              soilProps.clay_content = Math.round((meanValue / 10) * 10) / 10;
              break;
            case 'cec':
              soilProps.cec = Math.round((meanValue / 10) * 10) / 10;
              uncertainties.cec = uncertainty / 10;
              break;
            case 'bdod':
              soilProps.bulk_density = Math.round((meanValue / 100) * 100) / 100;
              break;
          }
        }
      }
      
      // Ensure all required fields exist with defaults
      const result = {
        ph: soilProps.ph || 6.5,
        organic_carbon: soilProps.organic_carbon || 0.6,
        nitrogen: soilProps.nitrogen || 0.15,
        sand_content: soilProps.sand_content || 40.0,
        silt_content: soilProps.silt_content || 35.0,
        clay_content: soilProps.clay_content || 25.0,
        cec: soilProps.cec || 15.0,
        bulk_density: soilProps.bulk_density || 1.3,
        uncertainties
      };
      
      return result;
    } catch (error) {
      console.error('Error processing SoilGrids response:', error);
      return this.getMockData();
    }
  }

  getMockData() {
    return {
      ph: 6.5,
      organic_carbon: 0.65,
      nitrogen: 0.15,
      sand_content: 40.0,
      silt_content: 35.0,
      clay_content: 25.0,
      cec: 15.0,
      bulk_density: 1.3,
      uncertainties: {}
    };
  }

  estimateNutrients(soilData) {
    const { ph, organic_carbon: oc, clay_content: clay, sand_content: sand, cec, nitrogen } = soilData;
    
    // Phosphorus estimation
    const baseP = 8.5 * oc + 0.15 * clay + 2.0;
    const phFactor = this.getPhFactorPhosphorus(ph);
    const phosphorus = Math.max(3.0, Math.min(baseP * phFactor, 60.0));
    
    // Potassium estimation
    const baseK = cec * 12.5 + clay * 2.8;
    const potassium = Math.max(60.0, Math.min((sand > 60 ? baseK * 0.7 : baseK) + 40, 500.0));
    
    // Sulfur estimation
    const sulfur = Math.max(3.0, Math.min(oc * 18 + nitrogen * 10, 50.0));
    
    // Iron estimation
    let iron = ph < 6.5 ? 35.0 + (6.5 - ph) * 8 : 35.0 - (ph - 6.5) * 5;
    iron = Math.max(10.0, Math.min(iron + oc * 3, 80.0));
    
    // Calcium estimation
    const caSaturation = ph >= 7.0 ? 0.75 : ph >= 6.0 ? 0.65 : 0.50;
    const calcium = Math.max(200.0, Math.min(cec * caSaturation * 200, 5000.0));
    
    // Magnesium estimation
    const mgSaturation = ph >= 7.0 ? 0.15 : ph >= 6.0 ? 0.12 : 0.08;
    const magnesium = Math.max(50.0, Math.min(cec * mgSaturation * 120, 800.0));
    
    // Micronutrients
    const zinc = Math.max(0.5, Math.min(2.5 + oc * 0.8 - (ph - 6.5) * 0.3, 5.0));
    const boron = Math.max(0.2, Math.min(0.8 + oc * 0.15, 2.0));
    
    return {
      phosphorus_ppm: Math.round(phosphorus * 100) / 100,
      potassium_ppm: Math.round(potassium * 100) / 100,
      sulfur_ppm: Math.round(sulfur * 100) / 100,
      iron_ppm: Math.round(iron * 100) / 100,
      calcium_ppm: Math.round(calcium * 100) / 100,
      magnesium_ppm: Math.round(magnesium * 100) / 100,
      zinc_ppm: Math.round(zinc * 100) / 100,
      boron_ppm: Math.round(boron * 100) / 100,
      data_quality: 'estimated'
    };
  }

  getPhFactorPhosphorus(ph) {
    if (ph >= 6.0 && ph <= 7.0) return 1.0;
    if (ph < 6.0) return 0.65 + (ph - 5.0) * 0.35;
    return 1.0 - (ph - 7.0) * 0.12;
  }

  generateRecommendations(soilData, nutrients) {
    const crops = this.recommendCrops(soilData);
    const fertilizers = this.recommendFertilizers(nutrients, soilData);
    const management = this.recommendManagement(soilData, nutrients);
    
    return { crops, fertilizers, management_practices: management };
  }

  recommendCrops(soilData) {
    const { ph, organic_carbon: oc, clay_content: clay, sand_content: sand } = soilData;
    const cropScores = {};
    
    // Rice
    if (ph >= 5.5 && ph <= 7.0 && clay > 25) {
      cropScores['Rice'] = 0.9;
    } else if (ph >= 5.0 && ph <= 7.5 && clay > 20) {
      cropScores['Rice'] = 0.7;
    }
    
    // Wheat
    if (ph >= 6.0 && ph <= 7.5 && clay >= 20 && clay <= 40) {
      cropScores['Wheat'] = 0.9;
    } else if (ph >= 5.5 && ph <= 8.0) {
      cropScores['Wheat'] = 0.7;
    }
    
    // Maize
    if (ph >= 5.8 && ph <= 7.0 && sand < 70) {
      cropScores['Maize'] = 0.9;
    } else if (ph >= 5.5 && ph <= 7.5) {
      cropScores['Maize'] = 0.7;
    }
    
    // Cotton
    if (ph >= 6.0 && ph <= 8.0 && clay >= 25 && clay <= 45) {
      cropScores['Cotton'] = 0.9;
    } else if (ph >= 6.5) {
      cropScores['Cotton'] = 0.7;
    }
    
    // Soybean
    if (ph >= 6.0 && ph <= 7.5 && oc > 0.5) {
      cropScores['Soybean'] = 0.9;
    } else if (ph >= 6.0) {
      cropScores['Soybean'] = 0.7;
    }
    
    // Sugarcane
    if (oc > 0.6 && ph >= 6.0 && ph <= 7.5) {
      cropScores['Sugarcane'] = 0.9;
    } else if (oc > 0.4) {
      cropScores['Sugarcane'] = 0.7;
    }
    
    // Groundnut
    if (sand > 50 && ph >= 6.0 && ph <= 7.0) {
      cropScores['Groundnut'] = 0.9;
    } else if (sand > 40) {
      cropScores['Groundnut'] = 0.7;
    }
    
    // Vegetables
    if (oc > 0.7 && ph >= 6.0 && ph <= 7.0) {
      cropScores['Vegetables'] = 0.9;
    } else if (oc > 0.5) {
      cropScores['Vegetables'] = 0.7;
    }
    
    const sortedCrops = Object.entries(cropScores)
      .sort(([,a], [,b]) => b - a)
      .filter(([,score]) => score >= 0.7);
    
    return {
      best_crop: sortedCrops.length > 0 ? sortedCrops[0][0] : 'Rice',
      suitable_crops: sortedCrops.slice(0, 5).map(([crop]) => crop),
      suitability_scores: Object.fromEntries(sortedCrops.slice(0, 5))
    };
  }

  recommendFertilizers(nutrients, soilData) {
    const recs = [];
    const { ph, organic_carbon: oc, nitrogen } = soilData;
    
    // Nitrogen recommendations
    if (nitrogen < 0.12) {
      recs.push('Apply 80-100 kg/ha Urea in 3 split doses (basal, tillering, panicle)');
    } else if (nitrogen < 0.18) {
      recs.push('Apply 60 kg/ha Urea in 2 split doses');
    } else {
      recs.push('Maintain nitrogen with 40 kg/ha Urea');
    }
    
    // Phosphorus recommendations
    if (nutrients.phosphorus_ppm < 10) {
      recs.push('Apply 100 kg/ha Single Super Phosphate (SSP) as basal dose');
    } else if (nutrients.phosphorus_ppm < 20) {
      recs.push('Apply 60 kg/ha Single Super Phosphate (SSP)');
    } else {
      recs.push('Phosphorus levels adequate - apply 30 kg/ha SSP for maintenance');
    }
    
    // Potassium recommendations
    if (nutrients.potassium_ppm < 120) {
      recs.push('Apply 70 kg/ha Muriate of Potash (MOP) in 2 split doses');
    } else if (nutrients.potassium_ppm < 180) {
      recs.push('Apply 50 kg/ha Muriate of Potash (MOP)');
    } else {
      recs.push('Potassium levels good - apply 30 kg/ha MOP for maintenance');
    }
    
    // Calcium recommendations
    if (nutrients.calcium_ppm < 500 || ph < 5.8) {
      recs.push('Apply 500 kg/ha Lime (CaCO3) to improve pH and calcium');
    } else if (nutrients.calcium_ppm < 1000) {
      recs.push('Apply 250 kg/ha Gypsum (CaSO4) for calcium supplementation');
    }
    
    // Magnesium recommendations
    if (nutrients.magnesium_ppm < 100) {
      recs.push('Apply 50 kg/ha Magnesium Sulfate (Epsom salt)');
    } else if (nutrients.magnesium_ppm < 150) {
      recs.push('Apply 25 kg/ha Magnesium Sulfate for maintenance');
    }
    
    // Organic matter recommendations
    if (oc < 0.5) {
      recs.push('Apply 10 tonnes/ha well-decomposed Farm Yard Manure (FYM) or compost');
    } else if (oc < 0.75) {
      recs.push('Apply 5 tonnes/ha compost to improve organic matter');
    }
    
    return recs;
  }

  recommendManagement(soilData, nutrients) {
    const practices = [];
    const { ph, organic_carbon: oc, clay_content: clay, sand_content: sand } = soilData;
    
    // pH management
    if (ph < 5.5) {
      practices.push('Soil is acidic - apply lime to raise pH to 6.0-6.5');
    } else if (ph > 8.0) {
      practices.push('Soil is alkaline - apply gypsum and organic matter to lower pH');
    }
    
    // Organic matter management
    if (oc < 0.5) {
      practices.push('Practice crop residue incorporation and green manuring');
    }
    
    // Texture-based management
    if (sand > 70) {
      practices.push('Sandy soil - use mulching to retain moisture and nutrients');
    }
    if (clay > 50) {
      practices.push('Heavy clay - improve drainage and add organic matter for structure');
    }
    
    // Conservation practices
    practices.push('Practice crop rotation to maintain soil health');
    practices.push('Use drip irrigation or sprinkler for water efficiency');
    
    if (clay < 20) {
      practices.push('Light soil - avoid over-irrigation to prevent nutrient leaching');
    }
    
    return practices;
  }

  calculateConfidenceScore(soilData) {
    let baseConfidence = 0.85;
    
    if (!soilData.uncertainties || Object.keys(soilData.uncertainties).length === 0) {
      baseConfidence = 0.70;
    } else {
      const uncertainties = Object.values(soilData.uncertainties);
      const avgUncertainty = uncertainties.reduce((sum, val) => sum + val, 0) / uncertainties.length;
      baseConfidence = Math.max(0.60, 0.95 - avgUncertainty * 0.01);
    }
    
    return Math.round(baseConfidence * 100) / 100;
  }
}

// Initialize soil analysis system
const soilSystem = new SoilAnalysisSystem();

// POST /api/soil-analysis - Analyze soil based on GPS coordinates
router.post('/', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    // Validate coordinates
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }
    
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude. Must be between -90 and 90'
      });
    }
    
    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: 'Invalid longitude. Must be between -180 and 180'
      });
    }
    
    // Get soil analysis
    const result = await soilSystem.getLiveLocationSoilData(latitude, longitude);
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error('Soil analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Soil analysis failed. Please try again.'
    });
  }
});

// GET /api/soil-analysis/health - Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Soil Analysis API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;