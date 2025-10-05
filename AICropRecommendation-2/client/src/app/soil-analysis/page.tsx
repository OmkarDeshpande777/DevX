'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, TestTube, Leaf, Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface SoilProperties {
  ph: number;
  organic_carbon: number;
  nitrogen: number;
  sand_content: number;
  silt_content: number;
  clay_content: number;
  cec: number;
  bulk_density: number;
}

interface Nutrients {
  phosphorus_ppm: number;
  potassium_ppm: number;
  sulfur_ppm: number;
  iron_ppm: number;
  calcium_ppm: number;
  magnesium_ppm: number;
  zinc_ppm: number;
  boron_ppm: number;
}

interface CropRecommendations {
  best_crop: string;
  suitable_crops: string[];
  suitability_scores?: Record<string, number>;
}

interface Recommendations {
  crops: CropRecommendations;
  fertilizers: string[];
  management_practices: string[];
}

interface SoilAnalysisResult {
  location: {
    latitude: number;
    longitude: number;
  };
  soil_properties: SoilProperties;
  nutrients: Nutrients;
  recommendations: Recommendations;
  confidence_score: number;
}

const SoilAnalysisPage = () => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SoilAnalysisResult | null>(null);
  const [error, setError] = useState<string>('');

  const getLocation = () => {
    setIsGettingLocation(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMsg = 'Unable to get location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMsg += 'Location request timed out.';
            break;
        }
        setError(errorMsg);
        setIsGettingLocation(false);
      }
    );
  };

  const analyzeSoil = async () => {
    if (!location) return;

    setIsAnalyzing(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/soil-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lon,
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error('Soil analysis error:', error);
      setError('Failed to analyze soil. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getpHStatus = (ph: number) => {
    if (ph < 5.5) return { status: 'Acidic', color: 'text-red-600', icon: AlertTriangle };
    if (ph > 8.0) return { status: 'Alkaline', color: 'text-orange-600', icon: AlertTriangle };
    return { status: 'Optimal', color: 'text-green-600', icon: CheckCircle };
  };

  const getNutrientStatus = (value: number, thresholds: { low: number; high: number }) => {
    if (value < thresholds.low) return { status: 'Low', color: 'text-red-600' };
    if (value > thresholds.high) return { status: 'High', color: 'text-blue-600' };
    return { status: 'Good', color: 'text-green-600' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TestTube className="w-12 h-12" />
              <h1 className="text-4xl font-bold">🌱 मिट्टी विश्लेषण</h1>
            </div>
            <p className="text-xl opacity-90">GPS आधारित उन्नत मिट्टी जांच प्रणाली</p>
            <p className="text-lg opacity-80 mt-2">Advanced GPS-Based Soil Analysis System</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Location Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-green-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
              <MapPin className="w-6 h-6 text-green-600" />
              अपना स्थान प्राप्त करें / Get Your Location
            </h2>
            
            <button
              onClick={getLocation}
              disabled={isGettingLocation}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full 
                       hover:from-green-700 hover:to-emerald-700 transition-all duration-300 
                       disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg
                       shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                  स्थान प्राप्त कर रहे हैं... / Getting Location...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5 inline mr-2" />
                  📍 मेरा स्थान प्राप्त करें / Get My Location
                </>
              )}
            </button>

            {location && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 font-medium">
                  📍 स्थान / Location: {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
                </p>
                <button
                  onClick={analyzeSoil}
                  disabled={isAnalyzing}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-full 
                           hover:from-blue-700 hover:to-blue-800 transition-all duration-300 
                           disabled:opacity-50 disabled:cursor-not-allowed font-semibold
                           shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                      मिट्टी का विश्लेषण कर रहे हैं... / Analyzing Soil...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-5 h-5 inline mr-2" />
                      🔬 मिट्टी का विश्लेषण करें / Analyze Soil Properties
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-8">
            {/* Soil Properties Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                🏆 मिट्टी के गुण / Soil Properties
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  मापा गया / Measured
                </span>
              </h3>
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">pH स्तर / pH Level</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-900">{analysisResult.soil_properties.ph}</span>
                    {(() => {
                      const phStatus = getpHStatus(analysisResult.soil_properties.ph);
                      const IconComponent = phStatus.icon;
                      return (
                        <div className={`flex items-center gap-1 ${phStatus.color}`}>
                          <IconComponent className="w-4 h-4" />
                          <span className="text-sm font-medium">{phStatus.status}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">कार्बनिक कार्बन / Organic Carbon</h4>
                  <span className="text-2xl font-bold text-green-900">{analysisResult.soil_properties.organic_carbon}%</span>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">नाइट्रोजन / Nitrogen</h4>
                  <span className="text-2xl font-bold text-purple-900">{analysisResult.soil_properties.nitrogen} g/kg</span>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">CEC</h4>
                  <span className="text-2xl font-bold text-orange-900">{analysisResult.soil_properties.cec} mmol(c)/kg</span>
                </div>
              </div>
            </div>

            {/* Soil Texture */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                🎨 मिट्टी की बनावट / Soil Texture Distribution
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg text-center">
                  <h4 className="font-semibold text-yellow-800 mb-2 text-lg">रेत / Sand</h4>
                  <span className="text-3xl font-bold text-yellow-900">{analysisResult.soil_properties.sand_content}%</span>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-lg text-center">
                  <h4 className="font-semibold text-amber-800 mb-2 text-lg">सिल्ट / Silt</h4>
                  <span className="text-3xl font-bold text-amber-900">{analysisResult.soil_properties.silt_content}%</span>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg text-center">
                  <h4 className="font-semibold text-red-800 mb-2 text-lg">मिट्टी / Clay</h4>
                  <span className="text-3xl font-bold text-red-900">{analysisResult.soil_properties.clay_content}%</span>
                </div>
              </div>
            </div>

            {/* Primary Nutrients */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                🧪 मुख्य पोषक तत्व / Primary Nutrients (NPK)
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  अनुमानित / Estimated
                </span>
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg text-center">
                  <h4 className="font-semibold text-blue-800 mb-2">फास्फोरस / Phosphorus (P)</h4>
                  <div className="text-2xl font-bold text-blue-900 mb-2">{analysisResult.nutrients.phosphorus_ppm} ppm</div>
                  <span className={`text-sm font-medium ${getNutrientStatus(analysisResult.nutrients.phosphorus_ppm, { low: 10, high: 30 }).color}`}>
                    {getNutrientStatus(analysisResult.nutrients.phosphorus_ppm, { low: 10, high: 30 }).status}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg text-center">
                  <h4 className="font-semibold text-green-800 mb-2">पोटेशियम / Potassium (K)</h4>
                  <div className="text-2xl font-bold text-green-900 mb-2">{analysisResult.nutrients.potassium_ppm} ppm</div>
                  <span className={`text-sm font-medium ${getNutrientStatus(analysisResult.nutrients.potassium_ppm, { low: 120, high: 300 }).color}`}>
                    {getNutrientStatus(analysisResult.nutrients.potassium_ppm, { low: 120, high: 300 }).status}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg text-center">
                  <h4 className="font-semibold text-purple-800 mb-2">सल्फर / Sulfur (S)</h4>
                  <div className="text-2xl font-bold text-purple-900 mb-2">{analysisResult.nutrients.sulfur_ppm} ppm</div>
                  <span className={`text-sm font-medium ${getNutrientStatus(analysisResult.nutrients.sulfur_ppm, { low: 10, high: 25 }).color}`}>
                    {getNutrientStatus(analysisResult.nutrients.sulfur_ppm, { low: 10, high: 25 }).status}
                  </span>
                </div>
              </div>
            </div>

            {/* Secondary & Micronutrients */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">💎 द्वितीयक और सूक्ष्म पोषक तत्व / Secondary & Micronutrients</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg text-center">
                  <h4 className="font-medium text-gray-700 mb-2">Ca</h4>
                  <span className="text-lg font-bold text-gray-900">{analysisResult.nutrients.calcium_ppm} ppm</span>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg text-center">
                  <h4 className="font-medium text-gray-700 mb-2">Mg</h4>
                  <span className="text-lg font-bold text-gray-900">{analysisResult.nutrients.magnesium_ppm} ppm</span>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg text-center">
                  <h4 className="font-medium text-gray-700 mb-2">Fe</h4>
                  <span className="text-lg font-bold text-gray-900">{analysisResult.nutrients.iron_ppm} ppm</span>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg text-center">
                  <h4 className="font-medium text-gray-700 mb-2">Zn</h4>
                  <span className="text-lg font-bold text-gray-900">{analysisResult.nutrients.zinc_ppm} ppm</span>
                </div>
              </div>
            </div>

            {/* Crop Planning */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Leaf className="w-6 h-6 text-green-600" />
                🌾 फसल योजना / Crop Planning
              </h3>
              <div className="mb-4">
                <p className="text-lg font-semibold text-green-800 mb-2">
                  🏆 सर्वोत्तम फसल / Best Crop: <span className="text-green-900">{analysisResult.recommendations.crops.best_crop}</span>
                </p>
                <p className="font-medium text-gray-700 mb-3">उपयुक्त फसलें / Suitable Crops:</p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.recommendations.crops.suitable_crops.map((crop, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Fertilizer Recommendations */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-orange-600" />
                💊 उर्वरक सिफारिशें / Fertilizer Recommendations
              </h3>
              <div className="space-y-3">
                {analysisResult.recommendations.fertilizers.map((recommendation, index) => (
                  <div key={index} className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                    <p className="text-orange-800">• {recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Management Practices */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Info className="w-6 h-6 text-blue-600" />
                🌿 मिट्टी प्रबंधन प्रथाएं / Soil Management Practices
              </h3>
              <div className="space-y-3">
                {analysisResult.recommendations.management_practices.map((practice, index) => (
                  <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <p className="text-blue-800">• {practice}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence Score */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 विश्लेषण विश्वसनीयता / Analysis Confidence</h3>
              <div className="w-full bg-gray-200 rounded-full h-8 mb-4">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-8 rounded-full flex items-center justify-center text-white font-bold transition-all duration-1000"
                  style={{ width: `${Math.round(analysisResult.confidence_score * 100)}%` }}
                >
                  {Math.round(analysisResult.confidence_score * 100)}%
                </div>
              </div>
              <p className="text-sm text-gray-600">
                SoilGrids उपग्रह डेटा और AI अनुमान एल्गोरिदम के आधार पर / Based on SoilGrids satellite data and AI estimation algorithms
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoilAnalysisPage;