"use client";

import { StandardCard, CardHeader, CardContent } from "@/components/ui/StandardCard"
import { StandardButton } from "@/components/ui/StandardButton"
import { Camera, TrendingUp, TestTube, Sun, Cloud, CloudRain, Wind, Droplets, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"

interface WeatherData {
  location: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  precipitation: number
  icon: "sun" | "cloud" | "rain" | "wind"
}

export default function DashboardPage() {
  const [weather, setWeather] = useState<WeatherData>({
    location: "Loading...",
    temperature: 0,
    condition: "Clear",
    humidity: 0,
    windSpeed: 0,
    precipitation: 0,
    icon: "sun",
    forecast: []
  })
  const [recentScans, setRecentScans] = useState<RecentScan[]>([])
  const [loading, setLoading] = useState(true)
  
  const { user } = useAuth()
  const userName = user?.name || "CropAI User"

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
          icon: "cloud",
          forecast: [
            { day: "Today", high: 32, low: 22, condition: "Sunny", icon: "sun" },
            { day: "Tomorrow", high: 29, low: 20, condition: "Cloudy", icon: "cloud" },
            { day: "Thu", high: 26, low: 18, condition: "Rainy", icon: "rain" },
          ]
        })

        // Mock recent scans data
        setRecentScans([
          {
            id: "1",
            cropName: "Tomato",
            result: "healthy",
            confidence: 95,
            timestamp: "2 hours ago",
          },
          {
            id: "2", 
            cropName: "Wheat",
            result: "disease",
            confidence: 87,
            timestamp: "5 hours ago",
          },
          {
            id: "3",
            cropName: "Rice",
            result: "healthy",
            confidence: 92,
            timestamp: "1 day ago",
          },
        ])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case "sun": return Sun
      case "cloud": return Cloud
      case "rain": return CloudRain
      case "wind": return Wind
      default: return Sun
    }
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case "healthy": return "text-green-600 bg-green-50 border-green-200"
      case "disease": return "text-red-600 bg-red-50 border-red-200"
      case "pest": return "text-orange-600 bg-orange-50 border-orange-200"
      default: return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case "healthy": return CheckCircle
      case "disease": return AlertTriangle
      case "pest": return AlertTriangle
      default: return CheckCircle
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your CropAI dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6 p-4 pb-20">
        {/* Header with Weather Card */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Good morning, {userName}</h1>
              <p className="text-gray-600">Let's check on your crops today</p>
            </div>
          </div>

          {/* Weather Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-sky-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/70 rounded-full">
                    {(() => {
                      const WeatherIcon = getWeatherIcon(weather.icon)
                      return <WeatherIcon className="w-8 h-8 text-blue-600" />
                    })()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{weather.temperature}°C</h3>
                    <p className="text-sm text-gray-600">{weather.condition}</p>
                    <p className="text-xs text-gray-500">{weather.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Droplets className="w-4 h-4" />
                      <span>{weather.humidity}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Wind className="w-4 h-4" />
                      <span>{weather.windSpeed}km/h</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Rain: {weather.precipitation}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Large Camera CTA - "Snap & Solve" */}
        <Card className="bg-gradient-to-br from-emerald-500 to-green-600 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-white">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Snap & Solve</h2>
                <p className="text-emerald-100">Take a photo of your crop for instant AI diagnosis</p>
                <div className="flex items-center space-x-2 text-sm text-emerald-100">
                  <CheckCircle className="w-4 h-4" />
                  <span>95% accuracy</span>
                  <span className="mx-2">•</span>
                  <Clock className="w-4 h-4" />
                  <span>Instant results</span>
                </div>
              </div>
              <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-md">
                <Link href="/camera" className="flex items-center space-x-2">
                  <Camera className="w-6 h-6" />
                  <span>Scan Now</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          {secondaryActions.map((action) => (
            <Button key={action.title} asChild variant="outline" className="h-20 p-4">
              <Link href={action.href} className="flex flex-col items-center space-y-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} text-white`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.title}</span>
              </Link>
            </Button>
          ))}
        </div>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                <span>Recent Scans</span>
              </CardTitle>
              <CardDescription>Your latest crop health checks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentScans.map((scan) => {
                const ResultIcon = getResultIcon(scan.result)
                return (
                  <div key={scan.id} className={`p-3 rounded-lg border ${getResultColor(scan.result)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ResultIcon className="w-5 h-5" />
                        <div>
                          <h4 className="font-medium">{scan.cropName}</h4>
                          <p className="text-sm opacity-75">
                            {scan.result === "healthy" ? "Healthy" : 
                             scan.result === "disease" ? "Disease detected" : "Pest detected"} 
                            • {scan.confidence}% confidence
                          </p>
                        </div>
                      </div>
                      <span className="text-xs opacity-60">{scan.timestamp}</span>
                    </div>
                  </div>
                )
              })}
              <Button asChild variant="ghost" className="w-full">
                <Link href="/dashboard/detection" className="text-emerald-600">
                  View all scans
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Tips Card */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-amber-200 rounded-full">
                <Leaf className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800">Today's Farming Tip</h3>
                <p className="text-sm text-amber-700 mt-1">
                  With {weather.condition.toLowerCase()} weather and {weather.precipitation}% chance of rain, 
                  it's a good day to check for fungal diseases in your crops.
                </p>
                <Button asChild variant="link" className="p-0 h-auto text-amber-700 text-sm mt-2">
                  <Link href="/help">Learn more</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}