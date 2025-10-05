'use client';

import React, { useState } from 'react';
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Leaf, 
  TrendingUp, 
  Sprout, 
  AlertCircle, 
  Camera,
  FileText,
  BarChart3,
  CheckCircle,
  Loader2,
  Wifi,
  Calendar,
  MapPin,
  ShoppingCart,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

// Types for soil data
interface SoilTestData {
  ph: { value: number; rating: string };
  ec: { value: number; unit: string; rating: string };
  oc: { value: number; unit: string; rating: string };
  n: { value: number; unit: string; rating: string };
  p: { value: number; unit: string; rating: string };
  k: { value: number; unit: string; rating: string };
  s: { value: number; unit: string; rating: string };
  zn: { value: number; unit: string; rating: string };
  b: { value: number; unit: string; rating: string };
  fe: { value: number; unit: string; rating: string };
  mn: { value: number; unit: string; rating: string };
  cu: { value: number; unit: string; rating: string };
}

interface SoilCardData {
  farmer_name: string;
  village: string;
  sub_district: string;
  district: string;
  pin: string;
  aadhaar: string;
  mobile: string;
  soil_tests: SoilTestData;
  secondary_micro: any;
  organic: any;
}

interface CropRecommendation {
  recommended_crop: string;
  confidence: number;
  expected_yield_t_per_acre: number;
  why: string[];
  profit_breakdown: {
    gross: number;
    investment: number;
    net: number;
    roi: number;
  };
  fertilizer_recommendation: {
    type: string;
    dosage_kg_per_ha: number;
    cost: number;
  };
  season_analysis?: {
    detected_season: string;
    season_suitability: string;
    season_explanation: string;
  };
  soil_analysis?: {
    npk_balance: any;
    ph_analysis: any;
    nutrient_deficiencies: any[];
    soil_health_score: number;
  };
  yield_optimization?: {
    current_yield_potential: number;
    optimized_yield_potential: number;
    optimization_suggestions: string[];
    limiting_factors: string[];
  };
  environmental_impact?: {
    water_efficiency: any;
    carbon_footprint: any;
    sustainability_score: number;
  };
}

export default function CropRecommendationPage() {
  const [activeTab, setActiveTab] = useState('manual');
  const [soilCardData, setSoilCardData] = useState<SoilCardData | null>(null);
  const [manualData, setManualData] = useState({
    N: 90,
    P: 42,
    K: 43,
    temperature: 20.5,
    humidity: 82,
    ph: 6.5,
    rainfall: 200,
    area_ha: 1.0,
    previous_crop: "",
    region: "default",
    season: "kharif"
  });
  const [cropRecommendation, setCropRecommendation] = useState<CropRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle soil health card image upload and extraction
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Call the backend OCR API
      const response = await fetch('http://localhost:3001/api/yield-recommendor/extract-soil-card', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('OCR processing failed');
      }

      const extractedData: SoilCardData = await response.json();

      setSoilCardData(extractedData);
      setActiveTab('ocr');
    } catch (err) {
      setError('Failed to extract data from soil health card. Please try again.');
    } finally {
      setExtracting(false);
    }
  };

  // Handle crop recommendation
  const getCropRecommendation = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      // Call the enhanced yield recommendor API
      const requestData = {
        ...data,
        area_ha: 1.0,
        previous_crop: "",
        region: "default",
        season: "kharif",
        source: soilCardData ? "ocr" : "manual"
      };

      const response = await fetch('http://localhost:3001/api/yield-recommendor/yield-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to get crop recommendation');
      }

      const apiResponse = await response.json();
      
      // Transform API response to match our interface
      const recommendation: CropRecommendation = {
        recommended_crop: apiResponse.recommended_crop,
        confidence: apiResponse.confidence,
        expected_yield_t_per_acre: apiResponse.expected_yield_t_per_acre,
        why: apiResponse.why || [],
        profit_breakdown: apiResponse.profit_breakdown || {
          gross: 0,
          investment: 0,
          net: 0,
          roi: 0
        },
        fertilizer_recommendation: apiResponse.fertilizer_recommendation || {
          type: "Balanced NPK",
          dosage_kg_per_ha: 100,
          cost: 5000
        },
        season_analysis: apiResponse.season_analysis || {
          detected_season: "kharif",
          season_suitability: "Good",
          season_explanation: "Suitable for current conditions"
        },
        // Add new enhanced data
        soil_analysis: apiResponse.soil_analysis,
        yield_optimization: apiResponse.yield_optimization,
        environmental_impact: apiResponse.environmental_impact
      };

      setCropRecommendation(recommendation);
    } catch (err) {
      setError('Failed to get crop recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    getCropRecommendation(manualData);
  };

  const handleOCRSubmit = () => {
    if (!soilCardData) return;
    
    const ocrData = {
      N: soilCardData.soil_tests.n.value,
      P: soilCardData.soil_tests.p.value,
      K: soilCardData.soil_tests.k.value,
      temperature: 25, // Default values since not in soil card
      humidity: 70,
      ph: soilCardData.soil_tests.ph.value,
      rainfall: 250,
      area_ha: 1.0,
      previous_crop: "",
      region: "default",
      season: "rabi"
    };
    
    getCropRecommendation(ocrData);
  };

  const getRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'low': case 'deficient': return 'text-red-600 bg-red-50';
      case 'medium': case 'normal': return 'text-yellow-600 bg-yellow-50';
      case 'high': case 'sufficient': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="pt-8 pb-8 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center">
              <Sprout className="w-10 h-10 mr-3" />
              Crop Recommendation
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Get AI-powered crop and yield recommendations using soil health card OCR or manual data entry
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access to Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Farming Calendar */}
            <Link href="/crop-calendar" className="group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 hover:from-green-100 hover:to-green-200 transition-all duration-200 transform hover:scale-105 hover:shadow-md">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-600 transition-colors">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium text-green-900 text-sm mb-1">Farming Calendar</h3>
                  <p className="text-xs text-green-700 leading-tight">Schedule & track</p>
                </div>
              </div>
            </Link>

            {/* HealthMap */}
            <Link href="/healthmap" className="group">
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200 hover:from-teal-100 hover:to-teal-200 transition-all duration-200 transform hover:scale-105 hover:shadow-md">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mb-3 group-hover:bg-teal-600 transition-colors">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium text-teal-900 text-sm mb-1">HealthMap</h3>
                  <p className="text-xs text-teal-700 leading-tight">Area health view</p>
                </div>
              </div>
            </Link>

            {/* Live Prices */}
            <Link href="/live-prices" className="group">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200 hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 transform hover:scale-105 hover:shadow-md">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-600 transition-colors">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium text-indigo-900 text-sm mb-1">Live Prices</h3>
                  <p className="text-xs text-indigo-700 leading-tight">Market trends</p>
                </div>
              </div>
            </Link>

            {/* Weather */}
            <Link href="/weather" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 transform hover:scale-105 hover:shadow-md">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
                    <Wifi className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium text-blue-900 text-sm mb-1">Weather</h3>
                  <p className="text-xs text-blue-700 leading-tight">Weather forecast</p>
                </div>
              </div>
            </Link>

            {/* Soil Analysis */}
            <Link href="/soil-analysis" className="group">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200 hover:from-yellow-100 hover:to-yellow-200 transition-all duration-200 transform hover:scale-105 hover:shadow-md">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-3 group-hover:bg-yellow-600 transition-colors">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium text-yellow-900 text-sm mb-1">Soil Analysis</h3>
                  <p className="text-xs text-yellow-700 leading-tight">Soil testing</p>
                </div>
              </div>
            </Link>

            {/* Ask AI */}
            <Link href="/help" className="group">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 transform hover:scale-105 hover:shadow-md">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center mb-3 group-hover:bg-gray-600 transition-colors">
                    <HelpCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm mb-1">Ask AI</h3>
                  <p className="text-xs text-gray-700 leading-tight">AI assistance</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="ocr" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Soil Health Card
            </TabsTrigger>
          </TabsList>

          {/* Manual Data Entry Tab */}
          <TabsContent value="manual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Manual Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    Soil & Environmental Data
                  </CardTitle>
                  <CardDescription>
                    Enter your field's soil and environmental conditions manually
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    {/* NPK Values */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nitrogen (N) <span className="text-xs text-gray-500">kg/ha</span>
                        </label>
                        <input
                          type="number"
                          value={manualData.N}
                          onChange={(e) => setManualData({...manualData, N: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="90"
                          min="0"
                          max="500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phosphorus (P) <span className="text-xs text-gray-500">kg/ha</span>
                        </label>
                        <input
                          type="number"
                          value={manualData.P}
                          onChange={(e) => setManualData({...manualData, P: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="42"
                          min="0"
                          max="200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Potassium (K) <span className="text-xs text-gray-500">kg/ha</span>
                        </label>
                        <input
                          type="number"
                          value={manualData.K}
                          onChange={(e) => setManualData({...manualData, K: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="43"
                          min="0"
                          max="300"
                        />
                      </div>
                    </div>

                    {/* Environmental Conditions */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Temperature (°C)
                        </label>
                        <input
                          type="number"
                          value={manualData.temperature}
                          onChange={(e) => setManualData({...manualData, temperature: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="20.5"
                          min="-10"
                          max="55"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Humidity (%)
                        </label>
                        <input
                          type="number"
                          value={manualData.humidity}
                          onChange={(e) => setManualData({...manualData, humidity: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="82"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Soil pH
                        </label>
                        <input
                          type="number"
                          value={manualData.ph}
                          onChange={(e) => setManualData({...manualData, ph: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="6.5"
                          min="3.5"
                          max="9.0"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rainfall (mm)
                        </label>
                        <input
                          type="number"
                          value={manualData.rainfall}
                          onChange={(e) => setManualData({...manualData, rainfall: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="200"
                          min="0"
                          max="5000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Farm Area (hectares)
                      </label>
                      <input
                        type="number"
                        value={manualData.area_ha}
                        onChange={(e) => setManualData({...manualData, area_ha: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="1.0"
                        min="0.1"
                        max="1000"
                        step="0.1"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sprout className="w-4 h-4 mr-2" />
                          Get Crop Recommendation
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Manual Results */}
              <div className="space-y-6">
                {cropRecommendation && activeTab === 'manual' && (
                  <RecommendationResults recommendation={cropRecommendation} />
                )}
              </div>
            </div>
          </TabsContent>

          {/* OCR Tab */}
          <TabsContent value="ocr" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* OCR Upload and Results */}
              <div className="space-y-6">
                {/* Image Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5 text-blue-600" />
                      Upload Soil Health Card
                    </CardTitle>
                    <CardDescription>
                      Upload an image of your soil health card to automatically extract data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 font-medium">
                          Click to upload soil health card image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-sm text-gray-500 mt-2">
                        Supports JPG, PNG, JPEG formats
                      </p>
                    </div>
                    
                    {extracting && (
                      <div className="mt-4 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                        <span>Extracting data from soil health card...</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Extracted Data Display */}
                {soilCardData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Extracted Soil Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Farmer Details */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Farmer Details</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-gray-600">Name:</span> {soilCardData.farmer_name}</div>
                            <div><span className="text-gray-600">Village:</span> {soilCardData.village}</div>
                            <div><span className="text-gray-600">District:</span> {soilCardData.district}</div>
                            <div><span className="text-gray-600">PIN:</span> {soilCardData.pin}</div>
                          </div>
                        </div>

                        {/* Key Soil Parameters */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Key Soil Parameters</h4>
                          <div className="space-y-2">
                            {Object.entries(soilCardData.soil_tests).slice(0, 6).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center">
                                <span className="text-sm font-medium">{key.toUpperCase()}:</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{value.value} {value.unit || ''}</span>
                                  <Badge className={`text-xs px-2 py-1 ${getRatingColor(value.rating)}`}>
                                    {value.rating}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button 
                          onClick={handleOCRSubmit}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sprout className="w-4 h-4 mr-2" />
                              Get Crop Recommendation
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* OCR Recommendations */}
              <div className="space-y-6">
                {cropRecommendation && activeTab === 'ocr' && (
                  <RecommendationResults recommendation={cropRecommendation} />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}

// Recommendation Results Component
function RecommendationResults({ recommendation }: { recommendation: CropRecommendation }) {
  return (
    <>
      {/* Main Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-green-600" />
            Recommended Crop
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-3xl font-bold text-green-600 capitalize">
              {recommendation.recommended_crop}
            </div>
            <Badge className="bg-green-100 text-green-800">
              {Math.round(recommendation.confidence * 100)}% Confidence
            </Badge>
            <div className="text-lg font-medium text-gray-700">
              Expected Yield: {recommendation.expected_yield_t_per_acre} tons/acre
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Why This Crop */}
      <Card>
        <CardHeader>
          <CardTitle>Why This Crop?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendation.why.map((reason, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{reason}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Profit Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Profit Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Gross Revenue:</span>
              <span className="font-medium text-green-600">
                ₹{recommendation.profit_breakdown.gross.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Investment:</span>
              <span className="font-medium text-red-600">
                ₹{recommendation.profit_breakdown.investment.toLocaleString()}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="font-medium">Net Profit:</span>
                <span className="font-bold text-green-600">
                  ₹{recommendation.profit_breakdown.net.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>ROI:</span>
                <span>{recommendation.profit_breakdown.roi.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fertilizer Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle>Fertilizer Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{recommendation.fertilizer_recommendation.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dosage:</span>
              <span className="font-medium">
                {recommendation.fertilizer_recommendation.dosage_kg_per_ha} kg/ha
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cost:</span>
              <span className="font-medium text-green-600">
                ₹{recommendation.fertilizer_recommendation.cost.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}