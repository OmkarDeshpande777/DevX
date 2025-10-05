"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LocationSelector from '../../components/LocationSelector';
import { useLocation } from '../../hooks/useLocation';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Umbrella,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Leaf,
  Sprout,
  Calendar as CalendarIcon,
  Clock
} from "lucide-react";

interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    visibility: number;
    uvIndex: number;
    condition: string;
    icon: string;
    rainfall: number;
  };
  forecast: Array<{
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    rainfall: number;
    humidity: number;
  }>;
  farmingAdvice: Array<{
    type: 'planting' | 'irrigation' | 'harvesting' | 'pest' | 'general';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  seasonalInsights: {
    currentSeason: string;
    cropRecommendations: string[];
    seasonalTips: string[];
  };
}

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedView, setSelectedView] = useState<'current' | 'forecast' | 'farming'>('current');
  
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
      fetchWeatherData();
    }
  }, [location]);

  const fetchWeatherData = async () => {
    if (!location) return;
    
    try {
      setLoading(true);
      
      // In production, integrate with weather APIs like:
      // - OpenWeatherMap API
      // - WeatherAPI.com
      // - Government Meteorological APIs
      // - ISRO/MOSDAC weather data
      
      // For now, generate comprehensive mock data
      const mockData = generateMockWeatherData(location);
      setWeatherData(mockData);
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockWeatherData = (location: { state: string; district: string }): WeatherData => {
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
        type: 'irrigation' as const,
        title: season === 'Monsoon' ? 'Manage Water Logging' : 'Plan Irrigation Schedule',
        description: season === 'Monsoon' ? 
          'Ensure proper drainage to prevent waterlogging in fields.' :
          'Irrigate crops during early morning or evening hours to reduce water loss.',
        priority: 'high' as const
      },
      {
        type: 'planting' as const,
        title: `${season} Crop Planning`,
        description: season === 'Monsoon' ? 
          'Ideal time for Kharif crops like rice, cotton, and sugarcane.' :
          season === 'Winter' ?
          'Perfect season for Rabi crops like wheat, barley, and mustard.' :
          'Consider drought-resistant varieties for summer cultivation.',
        priority: 'high' as const
      },
      {
        type: 'pest' as const,
        title: 'Pest Management',
        description: season === 'Monsoon' ?
          'Monitor for fungal diseases due to high humidity. Apply preventive sprays.' :
          'Watch for pest buildup. Use integrated pest management techniques.',
        priority: 'medium' as const
      },
      {
        type: 'general' as const,
        title: 'Soil Health',
        description: 'Test soil pH and nutrient levels. Add organic matter to improve soil structure.',
        priority: 'medium' as const
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
      seasonalInsights
    };
  };

  const getWeatherIcon = (condition: string, size: 'sm' | 'lg' = 'sm') => {
    const iconSize = size === 'lg' ? 'h-12 w-12' : 'h-6 w-6';
    
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className={`${iconSize} text-yellow-500`} />;
      case 'rainy':
      case 'rain':
        return <CloudRain className={`${iconSize} text-blue-500`} />;
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className={`${iconSize} text-gray-500`} />;
      default:
        return <Sun className={`${iconSize} text-yellow-500`} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAdviceIcon = (type: string) => {
    switch (type) {
      case 'planting': return <Sprout className="h-5 w-5 text-green-600" />;
      case 'irrigation': return <Droplets className="h-5 w-5 text-blue-600" />;
      case 'harvesting': return <Leaf className="h-5 w-5 text-orange-600" />;
      case 'pest': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Calendar className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="flex items-center gap-2">
              <Cloud className="h-8 w-8 text-blue-600" />
              Farm Weather
            </span>
          </h1>
          <p className="text-gray-600">Weather insights and farming guidance for your location</p>
        </div>

        {/* Location Selector */}
        <LocationSelector
          location={location}
          onLocationChange={(loc: { state: string; district: string }) => setManualLocation(loc.state, loc.district)}
          onAutoLocation={getAutoLocation}
          loading={locationLoading}
          error={locationError}
        />

        {!location && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Required</h3>
              <p className="text-gray-600 mb-4">
                Please set your location above to view weather data and farming guidance.
              </p>
            </CardContent>
          </Card>
        )}

        {location && (
          <>
            {/* View Selector */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={selectedView === 'current' ? 'default' : 'outline'}
                onClick={() => setSelectedView('current')}
                className="flex items-center gap-2"
              >
                <Thermometer className="h-4 w-4" />
                Current Weather
              </Button>
              <Button
                variant={selectedView === 'forecast' ? 'default' : 'outline'}
                onClick={() => setSelectedView('forecast')}
                className="flex items-center gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                7-Day Forecast
              </Button>
              <Button
                variant={selectedView === 'farming' ? 'default' : 'outline'}
                onClick={() => setSelectedView('farming')}
                className="flex items-center gap-2"
              >
                <Leaf className="h-4 w-4" />
                Farming Guidance
              </Button>
            </div>

            {loading && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Weather Data</h3>
                  <p className="text-gray-600">
                    Fetching latest weather information for {location.district}, {location.state}...
                  </p>
                </CardContent>
              </Card>
            )}

            {weatherData && (
              <>
                {/* Current Weather */}
                {selectedView === 'current' && (
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    {/* Main Weather Card */}
                    <Card className="border-0 shadow-lg col-span-2">
                      <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                              {location.district}, {location.state}
                            </h2>
                            <p className="text-gray-600">Current Weather</p>
                          </div>
                          <div className="text-right">
                            <div className="text-4xl font-bold text-gray-900">
                              {weatherData.current.temperature}°C
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {getWeatherIcon(weatherData.current.condition, 'lg')}
                              <span className="text-lg text-gray-600">
                                {weatherData.current.condition}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <Droplets className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                            <div className="text-sm text-gray-600">Humidity</div>
                            <div className="font-semibold">{weatherData.current.humidity}%</div>
                          </div>
                          
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <Wind className="h-6 w-6 text-green-600 mx-auto mb-2" />
                            <div className="text-sm text-gray-600">Wind Speed</div>
                            <div className="font-semibold">{weatherData.current.windSpeed} km/h</div>
                          </div>
                          
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <Eye className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                            <div className="text-sm text-gray-600">Visibility</div>
                            <div className="font-semibold">{weatherData.current.visibility} km</div>
                          </div>
                          
                          <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <Umbrella className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                            <div className="text-sm text-gray-600">Rainfall</div>
                            <div className="font-semibold">{weatherData.current.rainfall} mm</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Seasonal Insights */}
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-green-600" />
                          Seasonal Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Current Season</div>
                            <Badge className="bg-green-100 text-green-800">
                              {weatherData.seasonalInsights.currentSeason}
                            </Badge>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-600 mb-2">Recommended Crops</div>
                            <div className="flex flex-wrap gap-1">
                              {weatherData.seasonalInsights.cropRecommendations.slice(0, 3).map((crop, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {crop}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-600 mb-2">Key Tips</div>
                            <ul className="space-y-1">
                              {weatherData.seasonalInsights.seasonalTips.slice(0, 2).map((tip, index) => (
                                <li key={index} className="text-xs text-gray-700 flex items-start gap-1">
                                  <span className="text-green-600 mt-1">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* 7-Day Forecast */}
                {selectedView === 'forecast' && (
                  <div className="grid grid-cols-7 gap-4 mb-8">
                    {weatherData.forecast.map((day, index) => (
                      <Card key={index} className="border-0 shadow-lg">
                        <CardContent className="p-4 text-center">
                          <div className="font-semibold text-gray-900 mb-2">{day.day}</div>
                          <div className="text-sm text-gray-600 mb-3">{day.date}</div>
                          
                          <div className="flex justify-center mb-3">
                            {getWeatherIcon(day.condition)}
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-3">{day.condition}</div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">High:</span>
                              <span className="font-semibold">{day.high}°C</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Low:</span>
                              <span className="font-semibold">{day.low}°C</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Rain:</span>
                              <span className="font-semibold">{day.rainfall}mm</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Humidity:</span>
                              <span className="font-semibold">{day.humidity}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Farming Guidance */}
                {selectedView === 'farming' && (
                  <div className="space-y-6">
                    {/* Farming Advice Cards */}
                    <div className="grid grid-cols-2 gap-6">
                      {weatherData.farmingAdvice.map((advice, index) => (
                        <Card key={index} className="border-0 shadow-lg">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="p-2 bg-gray-100 rounded-full">
                                {getAdviceIcon(advice.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-gray-900">{advice.title}</h3>
                                  <Badge className={getPriorityColor(advice.priority)}>
                                    {advice.priority}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 text-sm">{advice.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Seasonal Planning */}
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5 text-blue-600" />
                          Seasonal Planning Guide
                        </CardTitle>
                        <CardDescription>
                          Recommendations for {weatherData.seasonalInsights.currentSeason} season
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Recommended Crops</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {weatherData.seasonalInsights.cropRecommendations.map((crop, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                                  <Sprout className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium">{crop}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Seasonal Tips</h4>
                            <ul className="space-y-2">
                              {weatherData.seasonalInsights.seasonalTips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span className="text-blue-600 mt-1">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}