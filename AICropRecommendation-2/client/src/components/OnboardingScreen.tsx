"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Camera, TestTube, Globe, MapPin } from "lucide-react";

interface OnboardingScreenProps {
  onComplete: (location?: { state: string; district: string; coordinates?: { lat: number; lng: number } }) => void;
}

const onboardingScreens = [
  {
    id: 1,
    icon: Camera,
    title: "Take a photo, get instant crop diagnosis",
    description: "Simply capture an image of your crop and get AI-powered disease detection results in seconds.",
    gradient: "from-emerald-500 to-green-600"
  },
  {
    id: 2,
    icon: TestTube,
    title: "Know your soil, maximize your yield",
    description: "GPS-based soil analysis helps you understand nutrient levels and optimize your farming decisions.",
    gradient: "from-blue-500 to-emerald-600"
  },
  {
    id: 3,
    icon: Globe,
    title: "Get market prices and weather in your language",
    description: "Access real-time market data and weather forecasts with multilingual AgriBot AI assistant support.",
    gradient: "from-green-600 to-emerald-700"
  },
  {
    id: 4,
    icon: MapPin,
    title: "Set your location for better recommendations",
    description: "Help us provide accurate weather data and crop planning specific to your area.",
    gradient: "from-purple-500 to-emerald-600"
  }
];

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", 
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", 
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const stateDistricts: { [key: string]: string[] } = {
  "Maharashtra": ["Pune", "Mumbai City", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Ahmednagar", "Kolhapur"],
  "Karnataka": ["Bangalore Urban", "Mysore", "Tumkur", "Kolar", "Chikkamagaluru", "Hassan", "Shimoga", "Bellary"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore"],
  // Add more as needed
};

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const nextScreen = () => {
    if (currentScreen < onboardingScreens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const prevScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleComplete = () => {
    if (currentScreen === onboardingScreens.length - 1 && selectedState && selectedDistrict) {
      onComplete({
        state: selectedState,
        district: selectedDistrict,
      });
    } else {
      onComplete();
    }
  };

  const screen = onboardingScreens[currentScreen];
  const Icon = screen.icon;
  const isLocationScreen = currentScreen === onboardingScreens.length - 1;
  const availableDistricts = stateDistricts[selectedState] || [];

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Skip Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button variant="ghost" onClick={handleSkip} className="text-gray-500">
          Skip
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Icon */}
        <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${screen.gradient} flex items-center justify-center mb-8 shadow-lg`}>
          <Icon className="w-12 h-12 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">
          {screen.title}
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 text-center max-w-md mb-8 leading-relaxed">
          {screen.description}
        </p>

        {/* Location Setup (only on last screen) */}
        {isLocationScreen && (
          <div className="w-full max-w-md space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select State</label>
              <Select value={selectedState} onValueChange={(value) => {
                setSelectedState(value);
                setSelectedDistrict(""); // Reset district when state changes
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your state" />
                </SelectTrigger>
                <SelectContent>
                  {indianStates.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedState && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select District</label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your district" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map((district) => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Progress Dots */}
        <div className="flex space-x-2 mb-8">
          {onboardingScreens.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentScreen 
                  ? "bg-green-600" 
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 pb-8">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={prevScreen}
          disabled={currentScreen === 0}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>

        {/* Next/Get Started Button */}
        {currentScreen < onboardingScreens.length - 1 ? (
          <Button
            onClick={nextScreen}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 flex items-center space-x-2"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={isLocationScreen && (!selectedState || !selectedDistrict)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Get Started
          </Button>
        )}
      </div>
    </div>
  );
}