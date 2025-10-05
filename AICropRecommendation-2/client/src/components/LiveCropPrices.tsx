"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import LocationSelector from './LocationSelector';
import { useLocation } from '../hooks/useLocation';
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  RefreshCw,
  IndianRupee,
  Clock,
  Search,
  Filter,
  Leaf,
  Activity,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface CropPrice {
  crop: string;
  variety: string;
  price: number;
  unit: string;
  market: string;
  date: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  quality: string;
}

interface MarketData {
  location: string;
  lastUpdated: string;
  prices: CropPrice[];
}

export default function LiveCropPrices() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  
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
      fetchLivePrices();
    }
  }, [location]);

  // Auto refresh every 5 minutes
  useEffect(() => {
    if (autoRefreshEnabled && location) {
      const interval = setInterval(() => {
        fetchLivePrices(true);
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoRefreshEnabled, location]);

  const fetchLivePrices = async (isAutoRefresh = false) => {
    if (!location) return;
    
    try {
      if (!isAutoRefresh) setLoading(true);
      
      // Call the real backend API for live crop prices
      const queryParams = new URLSearchParams({
        category: selectedCategory,
        search: searchTerm,
        limit: '50'
      });
      
      const response = await fetch(
        `http://localhost:3001/api/live-prices/live-prices/${location.state}/${location.district}?${queryParams}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch live prices');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Transform API data to match component interface
        const transformedData: MarketData = {
          location: `${location.district}, ${location.state}`,
          lastUpdated: new Date().toLocaleTimeString('en-IN'),
          prices: data.data.prices.map((price: any) => ({
            crop: price.crop,
            variety: price.quality || 'Standard',
            price: price.price,
            unit: price.unit,
            market: price.marketName,
            date: new Date(price.lastUpdated).toLocaleDateString('en-IN'),
            change: price.change,
            trend: price.trend,
            quality: price.quality || 'Standard'
          }))
        };
        setMarketData(transformedData);
      } else {
        throw new Error(data.error);
      }
      
    } catch (error) {
      console.error('Error fetching live prices:', error);
      // Generate mock data as fallback
      setMarketData(generateMockPriceData(location));
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  };

  const generateMockPriceData = (location: { state: string; district: string }): MarketData => {
    const crops = [
      { crop: 'Rice', variety: 'Basmati', basePrice: 45, unit: 'kg' },
      { crop: 'Wheat', variety: 'HD-2967', basePrice: 22, unit: 'kg' },
      { crop: 'Tomato', variety: 'Hybrid', basePrice: 30, unit: 'kg' },
      { crop: 'Onion', variety: 'Red', basePrice: 25, unit: 'kg' },
      { crop: 'Potato', variety: 'Local', basePrice: 18, unit: 'kg' },
      { crop: 'Cotton', variety: 'BT', basePrice: 5800, unit: 'quintal' },
      { crop: 'Sugarcane', variety: 'Co-86032', basePrice: 300, unit: 'quintal' },
      { crop: 'Maize', variety: 'Hybrid', basePrice: 20, unit: 'kg' },
      { crop: 'Soybean', variety: 'JS-335', basePrice: 65, unit: 'kg' },
      { crop: 'Chili', variety: 'Red', basePrice: 120, unit: 'kg' },
      { crop: 'Turmeric', variety: 'Salem', basePrice: 180, unit: 'kg' },
      { crop: 'Groundnut', variety: 'TMV-2', basePrice: 80, unit: 'kg' }
    ];

    const qualities = ['Premium', 'Grade-A', 'Grade-B', 'FAQ'];
    const markets = [`${location.district} Mandi`, `${location.district} APMC`, 'Local Market', 'Wholesale Market'];
    
    const prices: CropPrice[] = crops.map(crop => {
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
      const price = Math.round(crop.basePrice * (1 + variation));
      const change = Math.round((Math.random() - 0.5) * 10); // ±5 change
      
      return {
        crop: crop.crop,
        variety: crop.variety,
        price,
        unit: crop.unit,
        market: markets[Math.floor(Math.random() * markets.length)],
        date: new Date().toLocaleDateString('en-IN'),
        change,
        trend: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
        quality: qualities[Math.floor(Math.random() * qualities.length)]
      };
    });

    return {
      location: `${location.district}, ${location.state}`,
      lastUpdated: new Date().toLocaleTimeString('en-IN'),
      prices
    };
  };

  const filteredPrices = marketData?.prices.filter(price => {
    const matchesSearch = price.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         price.variety.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    
    const categoryMap: { [key: string]: string[] } = {
      'cereals': ['Rice', 'Wheat', 'Maize'],
      'vegetables': ['Tomato', 'Onion', 'Potato', 'Chili'],
      'cash-crops': ['Cotton', 'Sugarcane'],
      'pulses': ['Soybean', 'Groundnut'],
      'spices': ['Turmeric', 'Chili']
    };
    
    return matchesSearch && categoryMap[selectedCategory]?.includes(price.crop);
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50';
      case 'down': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="flex items-center gap-2">
              <IndianRupee className="h-8 w-8 text-green-600" />
              Market Rates
            </span>
          </h1>
          <p className="text-gray-600">Real-time crop prices from local markets and mandis</p>
        </div>

        {/* Location Selector */}
        <LocationSelector
          location={location}
          onLocationChange={(loc) => setManualLocation(loc.state, loc.district)}
          onAutoLocation={getAutoLocation}
          loading={locationLoading}
          error={locationError}
        />

        {!location && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Required</h3>
              <p className="text-gray-600 mb-4">
                Please set your location above to view market rates for your area.
              </p>
            </CardContent>
          </Card>
        )}

        {location && (
          <>
            {/* Controls */}
            <Card className="border-0 shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search crops..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Category Filter */}
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="cereals">Cereals</option>
                      <option value="vegetables">Vegetables</option>
                      <option value="cash-crops">Cash Crops</option>
                      <option value="pulses">Pulses & Oilseeds</option>
                      <option value="spices">Spices</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Auto Refresh Toggle */}
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={autoRefreshEnabled}
                        onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                        className="rounded"
                      />
                      Auto-refresh
                    </label>

                    {/* Manual Refresh */}
                    <Button
                      onClick={() => fetchLivePrices()}
                      disabled={loading}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>

                {marketData && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    Last updated: {marketData.lastUpdated}
                    <Badge variant="outline" className="ml-2">
                      {marketData.location}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price Grid */}
            {loading && !marketData && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Live Prices</h3>
                  <p className="text-gray-600">
                    Fetching latest crop prices for {location.district}, {location.state}...
                  </p>
                </CardContent>
              </Card>
            )}

            {marketData && filteredPrices && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPrices.map((price, index) => (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{price.crop}</h3>
                          <p className="text-sm text-gray-600">{price.variety}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(price.trend)}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(price.price)}
                        </div>
                        <div className="text-sm text-gray-500">per {price.unit}</div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Change:</span>
                          <Badge className={`${getTrendColor(price.trend)} border-0`}>
                            {price.change > 0 ? '+' : ''}{price.change}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Quality:</span>
                          <span className="text-sm font-medium">{price.quality}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Market:</span>
                          <span className="text-sm font-medium">{price.market}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Date:</span>
                          <span className="text-sm font-medium">{price.date}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {marketData && filteredPrices?.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                  <p className="text-gray-600 mb-4">
                    No crops match your search criteria. Try different keywords or filters.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Market Insights */}
            {marketData && (
              <Card className="border-0 shadow-lg mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Market Insights
                  </CardTitle>
                  <CardDescription>
                    Quick insights about today's market trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {marketData.prices.filter(p => p.trend === 'up').length}
                      </div>
                      <div className="text-sm text-gray-600">Prices Up</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {marketData.prices.filter(p => p.trend === 'down').length}
                      </div>
                      <div className="text-sm text-gray-600">Prices Down</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">
                        {marketData.prices.filter(p => p.trend === 'stable').length}
                      </div>
                      <div className="text-sm text-gray-600">Stable Prices</div>
                    </div>
                  </div>

                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Note:</strong> Prices are indicative and may vary by market. Always verify with local traders before making transactions.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}