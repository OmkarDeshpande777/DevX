"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LocationSelector from './LocationSelector';
import { useLocation } from '../hooks/useLocation';
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Calendar,
  IndianRupee,
  Calculator,
  Truck,
  AlertTriangle,
  Target,
  BarChart3,
  Lightbulb,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Leaf,
  Activity,
  Users,
  Zap
} from "lucide-react";

interface FarmerDashboard {
  location: { state?: string; district?: string };
  total_crops: number;
  insights: Array<{
    commodity: string;
    average_price: number;
    price_range: { min: number; max: number };
    volatility_percent: number;
    market_stability: string;
    recommendation: string;
  }>;
  recommendations: Array<{
    type: string;
    commodity?: string;
    price?: number;
    market?: string;
    message: string;
    priority?: string;
  }>;
  alerts: Array<{
    type: string;
    commodity?: string;
    market?: string;
    message: string;
    severity: string;
  }>;
}

interface ProfitAnalysis {
  estimated_yield_kg: number;
  yield_per_acre: number;
  scenarios: {
    conservative: { price: number; revenue: number; profit: number; roi: number };
    average: { price: number; revenue: number; profit: number; roi: number };
    optimistic: { price: number; revenue: number; profit: number; roi: number };
  };
  breakeven_price: number;
  risk_assessment: string;
  recommendation: string;
}

export default function FarmerMarketPrices() {
  const [dashboard, setDashboard] = useState<FarmerDashboard | null>(null);
  const [profitAnalysis, setProfitAnalysis] = useState<ProfitAnalysis | null>(null);
  const [selectedCrop, setSelectedCrop] = useState('tomato');
  const [investmentCost, setInvestmentCost] = useState(50000);
  const [landSize, setLandSize] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Location hook
  const { 
    location, 
    loading: locationLoading, 
    error: locationError, 
    getAutoLocation, 
    setManualLocation 
  } = useLocation();

  useEffect(() => {
    if (location) {
      fetchFarmerDashboard();
    }
  }, [location]);

  const fetchFarmerDashboard = async () => {
    if (!location) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams({
        state: location.state,
        district: location.district
      });
      
      const response = await fetch(`/api/farmer-market/farmer-dashboard?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setDashboard(data.data);
      }
    } catch (error) {
      console.error('Error fetching farmer dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfitAnalysis = async () => {
    if (!location) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams({
        investmentCost: investmentCost.toString(),
        landSize: landSize.toString(),
        state: location.state,
        district: location.district
      });
      
      const response = await fetch(`/api/farmer-market/profit-analysis/${selectedCrop}?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setProfitAnalysis(data.data.analysis);
      }
    } catch (error) {
      console.error('Error fetching profit analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStabilityColor = (stability: string) => {
    switch (stability) {
      case 'Stable': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Volatile': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <Lightbulb className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-green-600" />
              Farmer Market Intelligence
            </span>
          </h1>
          <p className="text-gray-600">Smart market insights and profit analysis for better farming decisions</p>
        </div>

        {/* Location Selector */}
        <LocationSelector
          location={location}
          onLocationChange={(loc) => setManualLocation(loc.state, loc.district)}
          onAutoLocation={getAutoLocation}
          loading={locationLoading}
          error={locationError}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="profit" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Profit Analysis
            </TabsTrigger>
            <TabsTrigger value="transport" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Transport Cost
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {!location && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Required</h3>
                  <p className="text-gray-600 mb-4">
                    Please set your location above to view market data and insights for your area.
                  </p>
                </CardContent>
              </Card>
            )}
            
            {location && loading && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Market Data</h3>
                  <p className="text-gray-600">
                    Fetching latest market prices for {location.district}, {location.state}...
                  </p>
                </CardContent>
              </Card>
            )}
            
            {location && dashboard && (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Active Crops</p>
                          <p className="text-3xl font-bold text-gray-900">{dashboard.total_crops}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                          <Leaf className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">High Value Crops</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {dashboard.insights.filter(i => i.average_price > 5000).length}
                          </p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-full">
                          <TrendingUp className="h-6 w-6 text-yellow-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Stable Markets</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {dashboard.insights.filter(i => i.market_stability === 'Stable').length}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                          <Target className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                          <p className="text-3xl font-bold text-gray-900">{dashboard.alerts.length}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Market Insights */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      Crop Market Analysis
                    </CardTitle>
                    <CardDescription>
                      Price analysis and market stability for crops in your area
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboard.insights.slice(0, 8).map((insight, index) => (
                        <div key={insight.commodity} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <div>
                              <h3 className="font-semibold text-gray-900">{insight.commodity}</h3>
                              <p className="text-sm text-gray-600">{insight.recommendation}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getStabilityColor(insight.market_stability)}>
                                  {insight.market_stability}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  Volatility: {insight.volatility_percent}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">
                              {formatCurrency(insight.average_price)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(insight.price_range.min)} - {formatCurrency(insight.price_range.max)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations and Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-blue-600" />
                        Smart Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboard.recommendations.map((rec, index) => (
                          <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-100 rounded-full">
                                {rec.type === 'high_value' ? (
                                  <TrendingUp className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <Calendar className="h-4 w-4 text-blue-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{rec.message}</p>
                                {rec.commodity && rec.price && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {rec.commodity}: {formatCurrency(rec.price)} in {rec.market}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        Market Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboard.alerts.map((alert, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-start gap-3">
                              {getSeverityIcon(alert.severity)}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                                {alert.commodity && alert.market && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {alert.commodity} in {alert.market}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Profit Analysis Tab */}
          <TabsContent value="profit" className="space-y-6">
            {!location && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Required for Profit Analysis</h3>
                  <p className="text-gray-600 mb-4">
                    Please set your location to get accurate profit calculations based on local market prices.
                  </p>
                </CardContent>
              </Card>
            )}
            
            {location && (
              <>
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-green-600" />
                      Profit Calculator
                    </CardTitle>
                    <CardDescription>
                      Calculate potential profits for different crops based on your investment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Crop</label>
                        <select 
                          value={selectedCrop}
                          onChange={(e) => setSelectedCrop(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="tomato">Tomato</option>
                          <option value="wheat">Wheat</option>
                          <option value="rice">Rice</option>
                          <option value="cotton">Cotton</option>
                          <option value="potato">Potato</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Investment Cost (₹)</label>
                        <input
                          type="number"
                          value={investmentCost}
                          onChange={(e) => setInvestmentCost(parseInt(e.target.value))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Land Size (Acres)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={landSize}
                          onChange={(e) => setLandSize(parseFloat(e.target.value))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <Button onClick={fetchProfitAnalysis} className="bg-green-500 hover:bg-green-600">
                      Calculate Profit Analysis
                    </Button>
                  </CardContent>
                </Card>

                {profitAnalysis && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conservative Scenario */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-red-50">
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <ArrowDownRight className="h-5 w-5" />
                      Conservative Scenario
                    </CardTitle>
                    <CardDescription>Minimum expected returns</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price per kg:</span>
                        <span className="font-semibold">{formatCurrency(profitAnalysis.scenarios.conservative.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Revenue:</span>
                        <span className="font-semibold">{formatCurrency(profitAnalysis.scenarios.conservative.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profit:</span>
                        <span className={`font-bold ${profitAnalysis.scenarios.conservative.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(profitAnalysis.scenarios.conservative.profit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ROI:</span>
                        <span className={`font-bold ${profitAnalysis.scenarios.conservative.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {profitAnalysis.scenarios.conservative.roi.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Average Scenario */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-yellow-50">
                    <CardTitle className="flex items-center gap-2 text-yellow-700">
                      <Activity className="h-5 w-5" />
                      Average Scenario
                    </CardTitle>
                    <CardDescription>Expected market returns</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price per kg:</span>
                        <span className="font-semibold">{formatCurrency(profitAnalysis.scenarios.average.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Revenue:</span>
                        <span className="font-semibold">{formatCurrency(profitAnalysis.scenarios.average.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profit:</span>
                        <span className={`font-bold ${profitAnalysis.scenarios.average.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(profitAnalysis.scenarios.average.profit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ROI:</span>
                        <span className={`font-bold ${profitAnalysis.scenarios.average.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {profitAnalysis.scenarios.average.roi.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Optimistic Scenario */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <ArrowUpRight className="h-5 w-5" />
                      Optimistic Scenario
                    </CardTitle>
                    <CardDescription>Maximum potential returns</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price per kg:</span>
                        <span className="font-semibold">{formatCurrency(profitAnalysis.scenarios.optimistic.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Revenue:</span>
                        <span className="font-semibold">{formatCurrency(profitAnalysis.scenarios.optimistic.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profit:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(profitAnalysis.scenarios.optimistic.profit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ROI:</span>
                        <span className="font-bold text-green-600">
                          {profitAnalysis.scenarios.optimistic.roi.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {profitAnalysis && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {profitAnalysis.estimated_yield_kg.toLocaleString()} kg
                      </div>
                      <div className="text-sm text-gray-600">Expected Yield</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(profitAnalysis.breakeven_price)}
                      </div>
                      <div className="text-sm text-gray-600">Breakeven Price</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {profitAnalysis.risk_assessment}
                      </div>
                      <div className="text-sm text-gray-600">Risk Level</div>
                    </div>
                  </div>
                  <Alert className="mt-4">
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Recommendation:</strong> {profitAnalysis.recommendation}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
            </>
            )}
          </TabsContent>

          {/* Transport Cost Tab */}
          <TabsContent value="transport" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Transportation Cost Calculator
                </CardTitle>
                <CardDescription>
                  Calculate transportation and logistics costs for your produce
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Transportation Calculator</p>
                  <p className="text-sm text-gray-400 mb-4">Calculate transport costs from farm to market</p>
                  <Button variant="outline">Coming Soon</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  AI-Powered Market Insights
                </CardTitle>
                <CardDescription>
                  Smart predictions and recommendations based on market data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">AI Market Intelligence</p>
                  <p className="text-sm text-gray-400 mb-4">Advanced analytics and market predictions</p>
                  <Button variant="outline">Coming Soon</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}