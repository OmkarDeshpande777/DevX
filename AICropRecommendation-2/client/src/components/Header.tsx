"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Leaf, 
  Brain,
  LogOut,
  User,
  HelpCircle,
  MapPin,
  Wifi,
  Calendar,
  Activity,
  IndianRupee,
  TestTube,
  DollarSign,
  Stethoscope
} from "lucide-react";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

    const navigationItems = [
    { name: "Crop Recommendation", href: "/crop-recommendation", icon: Leaf },
    { name: "Farm Weather", href: "/farm-weather", icon: MapPin },
    { name: "Agri Doctor", href: "/agri-doctor", icon: Stethoscope },
    { name: "Farming Calendar", href: "/farming-calendar", icon: Calendar },
    { name: "Soil Analysis", href: "/soil-analysis", icon: TestTube },
    { name: "Market Rates", href: "/market-rates", icon: IndianRupee },
    { name: "Farmer Schemes", href: "/farmer-schemes", icon: HelpCircle },
    { name: "Crop Health Map", href: "/crop-health-map", icon: Activity },
    { name: "Farm Finance", href: "/farm-finance", icon: DollarSign },
    { name: "AgriBot AI Assistant", href: "/agribot", icon: Brain }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-green-100 z-50">
      <div className="max-w-[1600px] mx-auto px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  CropAI
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Smart Farming</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Only show if authenticated */}
          {isAuthenticated && (
            <nav className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="flex items-center space-x-2 text-gray-700">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{user?.name}</span>
                </div>
                
                {/* Dashboard Button */}
                <Link href="/dashboard">
                  <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                    Dashboard
                  </Button>
                </Link>
                
                {/* Logout Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLogout}
                  className="flex items-center space-x-1 border-gray-300 text-gray-700 hover:text-red-600 hover:border-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/help">
                  <Button size="sm" variant="outline" className="flex items-center space-x-1 border-green-300 text-green-600 hover:bg-green-50">
                    <HelpCircle className="w-4 h-4" />
                    <span>Ask AI</span>
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm" variant="outline" className="border-green-300 text-green-600 hover:bg-green-50">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
