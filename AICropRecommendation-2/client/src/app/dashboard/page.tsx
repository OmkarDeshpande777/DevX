"use client";

import { 
  ModernCard, 
  CardHeader, 
  CardContent, 
  StatCard, 
  ActionCard, 
  Grid 
} from "@/components/ui/ModernCard";
import PageLayout from "@/components/layout/PageLayout";
import { 
  TrendingUp, 
  TestTube, 
  Sun, 
  Cloud, 
  CloudRain, 
  Wind, 
  Droplets,
  Sprout,
  Shield,
  AlertTriangle,
  TrendingDown,
  Calendar,
  Clock,
  MapPin,
  Activity
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  icon: "sun" | "cloud" | "rain" | "wind";
}

export default function DashboardPage() {
  const [weather, setWeather] = useState<WeatherData>({
    location: "Loading...",
    temperature: 0,
    condition: "Clear",
    humidity: 0,
    windSpeed: 0,
    precipitation: 0,
    icon: "sun"
  });
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const userName = user?.name || "Farmer";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock weather data - in real app, fetch from weather API
        setWeather({
          location: "Pune, Maharashtra",
          temperature: 28,
          condition: "Partly Cloudy",
          humidity: 65,
          windSpeed: 12,
          precipitation: 20,
          icon: "cloud"
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case "sun": return Sun;
      case "cloud": return Cloud;
      case "rain": return CloudRain;
      case "wind": return Wind;
      default: return Sun;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your farm control center...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <PageLayout maxWidth="full" padding="lg">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {getGreeting()}, {userName}! 🌱
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome to your smart farming dashboard
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Farm Overview</h2>
          <Grid cols={4} gap="lg">
            <StatCard
              title="Total Crops"
              value="12"
              subtitle="Active crop varieties"
              icon={Sprout}
              color="emerald"
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Crop Health"
              value="94%"
              subtitle="Overall health score"
              icon={Shield}
              color="blue"
              trend={{ value: 2, isPositive: true }}
            />
            <StatCard
              title="Alerts"
              value="3"
              subtitle="Require attention"
              icon={AlertTriangle}
              color="orange"
              trend={{ value: 5, isPositive: false }}
            />
            <StatCard
              title="Growth Rate"
              value="87%"
              subtitle="vs. last season"
              icon={TrendingUp}
              color="purple"
              trend={{ value: 12, isPositive: true }}
            />
          </Grid>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="col-span-2 space-y-8">
            {/* Weather Card */}
            <ModernCard variant="gradient" className="bg-gradient-to-br from-blue-50 to-sky-100 border-blue-200">
              <CardHeader 
                title="Today's Weather"
                subtitle={weather.location}
                icon={
                  <div className="p-3 bg-white/70 rounded-full">
                    {(() => {
                      const WeatherIcon = getWeatherIcon(weather.icon);
                      return <WeatherIcon className="w-8 h-8 text-blue-600" />;
                    })()}
                  </div>
                }
                action={
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>Current Location</span>
                  </div>
                }
              />
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {weather.temperature}°C
                    </div>
                    <div className="text-sm text-gray-600">Temperature</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1 flex items-center justify-center">
                      <Droplets className="w-5 h-5 mr-1" />
                      {weather.humidity}%
                    </div>
                    <div className="text-sm text-gray-600">Humidity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1 flex items-center justify-center">
                      <Wind className="w-5 h-5 mr-1" />
                      {weather.windSpeed}
                    </div>
                    <div className="text-sm text-gray-600">Wind km/h</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {weather.precipitation}%
                    </div>
                    <div className="text-sm text-gray-600">Rain Chance</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Farm Tip:</strong> Current conditions are ideal for watering crops. 
                    Consider applying organic fertilizer today for optimal growth.
                  </p>
                </div>
              </CardContent>
            </ModernCard>

            {/* Action Cards */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <Grid cols={2} gap="lg">
                <ActionCard
                  title="Health Monitoring"
                  description="Monitor your crop health with satellite imagery"
                  icon={Activity}
                  href="/healthmap"
                  color="emerald"
                  features={["Health Maps", "Field Analysis", "Issue Detection"]}
                />
                <ActionCard
                  title="Market Prices"
                  description="Real-time crop prices and market trends"
                  icon={TrendingUp}
                  href="/live-prices"
                  color="orange"
                  features={["Live Rates", "Price Alerts", "Market Analysis"]}
                />
                <ActionCard
                  title="Soil Analysis"
                  description="Comprehensive soil health assessment"
                  icon={TestTube}
                  href="/soil-analysis"
                  color="blue"
                  features={["Nutrient Analysis", "pH Testing", "Recommendations"]}
                />
                <ActionCard
                  title="Weather Forecast"
                  description="7-day detailed weather predictions"
                  icon={Cloud}
                  href="/weather"
                  color="purple"
                  features={["7-Day Forecast", "Rain Alerts", "Farm Planning"]}
                />
              </Grid>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <ModernCard variant="bordered">
              <CardHeader 
                title="Recent Activity"
                icon={<Activity className="w-5 h-5 text-gray-600" />}
              />
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Disease scan completed</p>
                      <p className="text-xs text-gray-500">Tomato crop - Healthy</p>
                      <p className="text-xs text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Weather alert</p>
                      <p className="text-xs text-gray-500">Rain expected tomorrow</p>
                      <p className="text-xs text-gray-400">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Price update</p>
                      <p className="text-xs text-gray-500">Wheat prices increased 5%</p>
                      <p className="text-xs text-gray-400">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </ModernCard>

            {/* Quick Tips */}
            <ModernCard variant="gradient" className="bg-gradient-to-br from-emerald-50 to-green-50">
              <CardHeader 
                title="Farm Tips"
                subtitle="Today's recommendations"
              />
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-white/60 rounded-lg">
                    <p className="text-sm font-medium text-emerald-800 mb-1">
                      💧 Irrigation Reminder
                    </p>
                    <p className="text-xs text-emerald-700">
                      Water your tomato plants early morning for best results
                    </p>
                  </div>
                  <div className="p-3 bg-white/60 rounded-lg">
                    <p className="text-sm font-medium text-emerald-800 mb-1">
                      🌱 Growth Optimization
                    </p>
                    <p className="text-xs text-emerald-700">
                      Add organic compost to boost soil fertility
                    </p>
                  </div>
                </div>
              </CardContent>
            </ModernCard>

            {/* Upcoming Tasks */}
            <ModernCard variant="elevated">
              <CardHeader 
                title="Upcoming Tasks"
                icon={<Calendar className="w-5 h-5 text-gray-600" />}
              />
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900">Fertilizer application</span>
                    </div>
                    <span className="text-xs text-gray-500">Tomorrow</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900">Pest inspection</span>
                    </div>
                    <span className="text-xs text-gray-500">2 days</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900">Harvest planning</span>
                    </div>
                    <span className="text-xs text-gray-500">1 week</span>
                  </div>
                </div>
              </CardContent>
            </ModernCard>
          </div>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}