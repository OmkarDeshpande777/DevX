const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// OCR extraction endpoint
router.post('/extract-soil-card', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Convert buffer to base64
    const imageBase64 = req.file.buffer.toString('base64');
    
    // For now, we'll return mock data since the NVIDIA API requires setup
    // In production, you would make the actual API call here
    const mockExtractedData = {
      farmer_name: "Ramesh Kumar",
      village: "Gopalpur",
      sub_district: "Anandpur",
      district: "Bhopal",
      pin: "462001",
      aadhaar: "1234-5678-9012",
      mobile: "+91 98765 43210",
      soil_tests: {
        ph: { value: 6.8, rating: "Normal" },
        ec: { value: 0.45, unit: "dS/m", rating: "Normal" },
        oc: { value: 0.6, unit: "%", rating: "Medium" },
        n: { value: 280, unit: "kg/ha", rating: "Medium" },
        p: { value: 22, unit: "kg/ha", rating: "Low" },
        k: { value: 150, unit: "kg/ha", rating: "Medium" },
        s: { value: 12, unit: "mg/kg", rating: "Low" },
        zn: { value: 1.2, unit: "mg/kg", rating: "Deficient" },
        b: { value: 0.5, unit: "mg/kg", rating: "Deficient" },
        fe: { value: 8.0, unit: "mg/kg", rating: "Deficient" },
        mn: { value: 4.5, unit: "mg/kg", rating: "Sufficient" },
        cu: { value: 1.0, unit: "mg/kg", rating: "Sufficient" }
      },
      secondary_micro: {
        ca: { value: 20, unit: "kg/ha" },
        mg: { value: 5, unit: "kg/ha" },
        s_sec: { value: 5, unit: "kg/ha" },
        b_sec: { value: 0.5, unit: "kg/ha", as: "kg/ha" },
        cu_sec: { value: 10, unit: "kg/ha", as: "kg/ha" }
      },
      organic: {
        fym: { value: 5, unit: "t/ha" },
        biofertilizer: { value: 100, unit: "kg/ha" },
        lime_gypsum: { value: 500, unit: "kg/ha" }
      }
    };

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    res.json(mockExtractedData);

  } catch (error) {
    console.error('OCR extraction error:', error);
    res.status(500).json({ 
      error: 'Failed to extract data from soil health card',
      details: error.message 
    });
  }
});

// Enhanced crop recommendation endpoint that includes yield predictions
router.post('/yield-recommendation', async (req, res) => {
  try {
    const {
      N, P, K, temperature, humidity, ph, rainfall,
      area_ha = 1.0,
      previous_crop = "",
      region = "default",
      season = "kharif",
      source = "manual" // or "ocr"
    } = req.body;

    // Validate required fields
    if (!N || !P || !K || !temperature || !humidity || !ph || !rainfall) {
      return res.status(400).json({ 
        error: 'Missing required soil and environmental parameters' 
      });
    }

    // Call the existing crop recommendation AI service
    const cropResponse = await axios.post('http://localhost:8000/predict', {
      N, P, K, temperature, humidity, ph, rainfall,
      area_ha, previous_crop, region, season
    });

    const cropRecommendation = cropResponse.data;

    // Enhanced response with yield-specific data
    const enhancedRecommendation = {
      ...cropRecommendation,
      data_source: source,
      soil_analysis: {
        npk_balance: analyzeNPKBalance(N, P, K),
        ph_analysis: analyzePH(ph),
        nutrient_deficiencies: identifyDeficiencies(N, P, K),
        soil_health_score: calculateSoilHealthScore(N, P, K, ph)
      },
      yield_optimization: {
        current_yield_potential: cropRecommendation.expected_yield_t_per_acre,
        optimized_yield_potential: cropRecommendation.expected_yield_t_per_acre * 1.2,
        optimization_suggestions: generateOptimizationSuggestions(N, P, K, ph),
        limiting_factors: identifyLimitingFactors(N, P, K, ph, temperature, humidity)
      },
      environmental_impact: {
        water_efficiency: calculateWaterEfficiency(rainfall, cropRecommendation.recommended_crop),
        carbon_footprint: calculateCarbonFootprint(area_ha, cropRecommendation.recommended_crop),
        sustainability_score: calculateSustainabilityScore(N, P, K, cropRecommendation.recommended_crop)
      }
    };

    res.json(enhancedRecommendation);

  } catch (error) {
    console.error('Yield recommendation error:', error);
    if (error.response) {
      res.status(error.response.status).json({ 
        error: 'AI service error',
        details: error.response.data 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to generate yield recommendation',
        details: error.message 
      });
    }
  }
});

// Helper functions for enhanced analysis
function analyzeNPKBalance(N, P, K) {
  const ideal_ratio = { N: 4, P: 2, K: 1 }; // Simplified ideal ratio
  const current_ratio = {
    N: N / Math.min(N, P, K),
    P: P / Math.min(N, P, K),
    K: K / Math.min(N, P, K)
  };
  
  return {
    current: current_ratio,
    ideal: ideal_ratio,
    balance_score: calculateBalanceScore(current_ratio, ideal_ratio)
  };
}

function analyzePH(ph) {
  let analysis = "";
  let recommendation = "";
  
  if (ph < 6.0) {
    analysis = "Acidic soil - may limit nutrient availability";
    recommendation = "Consider lime application to raise pH";
  } else if (ph > 8.0) {
    analysis = "Alkaline soil - may cause nutrient lockup";
    recommendation = "Consider sulfur application to lower pH";
  } else {
    analysis = "Optimal pH range for most crops";
    recommendation = "Maintain current pH levels";
  }
  
  return { analysis, recommendation, value: ph };
}

function identifyDeficiencies(N, P, K) {
  const deficiencies = [];
  
  if (N < 200) deficiencies.push({ nutrient: "Nitrogen", severity: "Low", recommendation: "Apply nitrogen-rich fertilizer" });
  if (P < 30) deficiencies.push({ nutrient: "Phosphorus", severity: "Low", recommendation: "Apply phosphate fertilizer" });
  if (K < 120) deficiencies.push({ nutrient: "Potassium", severity: "Low", recommendation: "Apply potash fertilizer" });
  
  return deficiencies;
}

function calculateSoilHealthScore(N, P, K, ph) {
  let score = 0;
  
  // NPK scoring (0-60 points)
  score += Math.min((N / 300) * 20, 20);
  score += Math.min((P / 50) * 20, 20);
  score += Math.min((K / 200) * 20, 20);
  
  // pH scoring (0-40 points)
  if (ph >= 6.0 && ph <= 7.5) {
    score += 40;
  } else if (ph >= 5.5 && ph <= 8.0) {
    score += 30;
  } else {
    score += 10;
  }
  
  return Math.round(Math.min(score, 100));
}

function generateOptimizationSuggestions(N, P, K, ph) {
  const suggestions = [];
  
  if (N < 250) suggestions.push("Increase nitrogen levels through organic manure or urea application");
  if (P < 25) suggestions.push("Apply DAP or single super phosphate to boost phosphorus");
  if (K < 150) suggestions.push("Use muriate of potash to improve potassium levels");
  if (ph < 6.0) suggestions.push("Apply lime to improve soil pH and nutrient availability");
  if (ph > 7.5) suggestions.push("Use organic matter to buffer high pH");
  
  return suggestions;
}

function identifyLimitingFactors(N, P, K, ph, temperature, humidity) {
  const factors = [];
  
  if (N < 200) factors.push("Low nitrogen levels limiting growth");
  if (P < 20) factors.push("Phosphorus deficiency affecting root development");
  if (K < 100) factors.push("Potassium shortage impacting disease resistance");
  if (ph < 5.5 || ph > 8.5) factors.push("pH levels affecting nutrient uptake");
  if (temperature < 15 || temperature > 35) factors.push("Temperature stress affecting growth");
  if (humidity < 40 || humidity > 90) factors.push("Humidity levels affecting plant health");
  
  return factors;
}

function calculateWaterEfficiency(rainfall, crop) {
  // Simplified water efficiency calculation
  const waterRequirements = {
    rice: 1500,
    wheat: 500,
    maize: 600,
    cotton: 800,
    sugarcane: 1200,
    default: 600
  };
  
  const required = waterRequirements[crop] || waterRequirements.default;
  const efficiency = Math.min((rainfall / required) * 100, 100);
  
  return {
    efficiency_percentage: Math.round(efficiency),
    water_requirement_mm: required,
    available_mm: rainfall,
    deficit_mm: Math.max(0, required - rainfall)
  };
}

function calculateCarbonFootprint(area_ha, crop) {
  // Simplified carbon footprint calculation (kg CO2 per hectare)
  const carbonData = {
    rice: 2500,
    wheat: 1800,
    maize: 1200,
    cotton: 2000,
    sugarcane: 1500,
    default: 1600
  };
  
  const footprintPerHa = carbonData[crop] || carbonData.default;
  
  return {
    total_kg_co2: Math.round(footprintPerHa * area_ha),
    per_hectare_kg_co2: footprintPerHa,
    rating: footprintPerHa < 1500 ? "Low" : footprintPerHa < 2000 ? "Medium" : "High"
  };
}

function calculateSustainabilityScore(N, P, K, crop) {
  let score = 50; // Base score
  
  // Bonus for balanced nutrition
  if (N > 200 && N < 400) score += 10;
  if (P > 20 && P < 60) score += 10;
  if (K > 100 && K < 250) score += 10;
  
  // Crop-specific sustainability factors
  const sustainableCrops = ['wheat', 'barley', 'millet', 'groundnut'];
  if (sustainableCrops.includes(crop)) score += 20;
  
  return Math.min(score, 100);
}

function calculateBalanceScore(current, ideal) {
  const nDiff = Math.abs(current.N - ideal.N) / ideal.N;
  const pDiff = Math.abs(current.P - ideal.P) / ideal.P;
  const kDiff = Math.abs(current.K - ideal.K) / ideal.K;
  
  const avgDiff = (nDiff + pDiff + kDiff) / 3;
  return Math.max(0, Math.round((1 - avgDiff) * 100));
}

module.exports = router;