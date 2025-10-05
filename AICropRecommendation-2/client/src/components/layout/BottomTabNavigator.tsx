"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Camera, TrendingUp, Cloud, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  activePattern: string;
}

const tabs: TabItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
    activePattern: "/dashboard"
  },
  {
    id: "scan", 
    label: "Scan",
    icon: Camera,
    href: "/healthmap",
    activePattern: "/healthmap"
  },
  {
    id: "market",
    label: "Market", 
    icon: TrendingUp,
    href: "/live-prices",
    activePattern: "/live-prices"
  },
  {
    id: "weather",
    label: "Weather",
    icon: Cloud,
    href: "/weather", 
    activePattern: "/weather"
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    href: "/profile",
    activePattern: "/profile"
  }
];

export default function BottomTabNavigator() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Don't show bottom navigation for unauthenticated users or on auth pages
  if (!isAuthenticated || pathname.startsWith('/auth') || pathname === '/') {
    return null;
  }

  const handleTabPress = (href: string) => {
    router.push(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around px-4 py-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname.startsWith(tab.activePattern);
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabPress(tab.href)}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-[60px] transition-colors duration-200 ${
                isActive 
                  ? "text-emerald-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon 
                className={`w-6 h-6 mb-1 ${
                  isActive ? "text-emerald-600 stroke-2" : "text-gray-500"
                }`} 
              />
              <span 
                className={`text-xs font-medium ${
                  isActive ? "text-emerald-600" : "text-gray-500"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}