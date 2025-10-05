"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { 
  Home, 
  TrendingUp, 
  Cloud, 
  User, 
  TestTube, 
  HelpCircle, 
  LogOut,
  Leaf,
  Menu,
  X,
  BarChart3,
  Calendar,
  DollarSign,
  Activity,
  Heart,
  Stethoscope
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navigationItems: NavItem[] = [
  {
    id: "crop-recommendation",
    label: "Crop Recommendation",
    href: "/crop-recommendation",
    icon: Leaf,
    description: "AI Crop Suggestions"
  },
  {
    id: "weather",
    label: "Farm Weather",
    href: "/weather",
    icon: Cloud,
    description: "Weather Forecast"
  },
  {
    id: "agri-doctor",
    label: "Agri Doctor",
    href: "/agri-doctor",
    icon: Stethoscope,
    description: "Plant Disease Detection"
  },
  {
    id: "calendar",
    label: "Farming Calendar",
    href: "/crop-calendar",
    icon: Calendar,
    description: "Farming Schedule"
  },
  {
    id: "soil",
    label: "Soil Analysis",
    href: "/soil-analysis",
    icon: TestTube,
    description: "Test Soil Health"
  },
  {
    id: "prices",
    label: "Market Rates",
    href: "/live-prices",
    icon: TrendingUp,
    description: "Live Market Prices"
  },
  {
    id: "schemes",
    label: "Farmer Schemes & Support",
    href: "/farmer-schemes",
    icon: Heart,
    description: "Government Schemes"
  },
  {
    id: "health",
    label: "Crop Health Map",
    href: "/healthmap",
    icon: Activity,
    description: "Health Monitoring"
  },
  {
    id: "finance",
    label: "Farm Finance",
    href: "/farm-finance",
    icon: DollarSign,
    description: "Expenses & Loans"
  },
  {
    id: "assistant",
    label: "AgriBot AI Assistant",
    href: "/help",
    icon: HelpCircle,
    description: "AI-Powered Assistant"
  }
];

const quickActions: NavItem[] = [
  {
    id: "profile",
    label: "Profile",
    href: "/profile",
    icon: User,
    description: "Account Settings"
  },
  {
    id: "help",
    label: "Ask AI",
    href: "/help",
    icon: HelpCircle,
    description: "AI Assistant"
  }
];

interface TopNavigationBarProps {
  children: React.ReactNode;
}

export default function TopNavigationBar({ children }: TopNavigationBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(href);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getCurrentPageInfo = () => {
    return [...navigationItems, ...quickActions].find(item => isActiveRoute(item.href));
  };

  const getCurrentPageIcon = () => {
    const pageInfo = getCurrentPageInfo();
    return pageInfo?.icon;
  };

  const getCurrentPageTitle = () => {
    const pageInfo = getCurrentPageInfo();
    return pageInfo?.label || 'CropAI Platform';
  };

  const getCurrentPageDescription = () => {
    const pageInfo = getCurrentPageInfo();
    return pageInfo?.description || 'Smart Farming Solutions';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-xl border-b-2 border-emerald-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-bold text-emerald-800">CropAI</span>
                <p className="text-sm text-emerald-600 -mt-1">Smart Farming Platform</p>
              </div>
            </Link>

            {/* Desktop Navigation - All Items in Single Line */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`px-2 py-3 rounded-xl text-xs font-semibold transition-all duration-300 flex flex-col items-center space-y-1 min-w-[70px] group ${
                    isActiveRoute(item.href)
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 hover:scale-105'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                </Link>
              ))}
            </div>



            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-emerald-50 hover:shadow-md transition-all duration-300 border border-transparent hover:border-emerald-200"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-bold text-gray-800">CropAI User</p>
                    <p className="text-xs text-emerald-600">farmer@example.com</p>
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-emerald-200 z-50">
                    <div className="p-3">
                      <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide px-3 py-2 border-b border-emerald-100">
                        Account Options
                      </div>
                      <div className="mt-2 space-y-1">
                        {quickActions.map((item) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition-all duration-200"
                          >
                            <item.icon className="h-5 w-5" />
                            <div>
                              <div>{item.label}</div>
                              <div className="text-xs text-gray-500 font-normal">{item.description}</div>
                            </div>
                          </Link>
                        ))}
                        <hr className="my-2 border-emerald-100" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200 w-full text-left"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-3 rounded-xl hover:bg-emerald-50 hover:shadow-md transition-all duration-300 border border-transparent hover:border-emerald-200"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-600" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-gradient-to-b from-white to-emerald-50 border-t-2 border-emerald-200 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-emerald-800 mb-2">Navigation Menu</h3>
                <div className="h-1 w-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex flex-col items-center space-y-3 p-4 rounded-xl transition-all duration-300 border-2 shadow-md ${
                      isActiveRoute(item.href)
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-600 shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 hover:border-emerald-400 hover:scale-105 hover:shadow-lg'
                    }`}
                  >
                    <item.icon className="h-6 w-6" />
                    <div className="text-center">
                      <span className="text-sm font-bold">{item.label}</span>
                      {item.description && (
                        <p className="text-xs mt-1 opacity-80">{item.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* Mobile User Actions */}
              <div className="mt-6 pt-4 border-t border-emerald-200">
                <h4 className="text-sm font-bold text-emerald-700 mb-3">Quick Actions</h4>
                <div className="flex justify-around">
                  {quickActions.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="flex flex-col items-center space-y-2 p-3 rounded-lg text-gray-600 hover:text-emerald-700 hover:bg-emerald-100 transition-all duration-200"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="flex flex-col items-center space-y-2 p-3 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-xs font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Page Title Bar */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getCurrentPageInfo() && (
                <>
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                    {(() => {
                      const IconComponent = getCurrentPageIcon();
                      return IconComponent ? <IconComponent className="h-4 w-4 text-white" /> : <Home className="h-4 w-4 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-emerald-800">{getCurrentPageTitle()}</h1>
                    <p className="text-sm text-emerald-600">{getCurrentPageDescription()}</p>
                  </div>
                </>
              )}
            </div>
            <div className="text-sm text-emerald-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>

      {/* Click outside handler */}
      {(isMobileMenuOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </div>
  );
}