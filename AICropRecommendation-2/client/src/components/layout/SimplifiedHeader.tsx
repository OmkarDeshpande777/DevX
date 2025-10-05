"use client";

import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

interface SimplifiedHeaderProps {
  title?: string;
  showNotifications?: boolean;
  showSettings?: boolean;
  rightAction?: React.ReactNode;
}

const getPageTitle = (pathname: string): string => {
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/healthmap')) return 'Crop Health Map';
  if (pathname.startsWith('/live-prices')) return 'Market Prices';
  if (pathname.startsWith('/weather')) return 'Weather';
  if (pathname.startsWith('/profile')) return 'Profile';
  if (pathname.startsWith('/help')) return 'AgriBot AI Assistant';
  if (pathname.startsWith('/soil-analysis')) return 'Soil Analysis';
  return 'CropAI';
};

export default function SimplifiedHeader({ 
  title, 
  showNotifications = true, 
  showSettings = false,
  rightAction 
}: SimplifiedHeaderProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Don't show header for unauthenticated users or on auth pages
  if (!isAuthenticated || pathname.startsWith('/auth') || pathname === '/') {
    return null;
  }

  const displayTitle = title || getPageTitle(pathname);
  
  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{displayTitle}</h1>
          {pathname === '/dashboard' && (
            <p className="text-sm text-gray-500">Welcome to your farm control center</p>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {rightAction}
          
          {showNotifications && (
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="w-5 h-5 text-gray-600" />
            </Button>
          )}
          
          {showSettings && (
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="w-5 h-5 text-gray-600" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}