"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  Camera, 
  TrendingUp, 
  Cloud, 
  User, 
  TestTube, 
  HelpCircle, 
  Bell,
  Settings,
  LogOut,
  Sprout
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activePattern: string;
}

const navigationItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    activePattern: "/dashboard"
  },
  {
    id: "scan",
    label: "Crop Scan",
    href: "/healthmap", 
    icon: Camera,
    activePattern: "/healthmap"
  },
  {
    id: "market",
    label: "Market Prices",
    href: "/live-prices",
    icon: TrendingUp, 
    activePattern: "/live-prices"
  },
  {
    id: "weather",
    label: "Weather",
    href: "/weather",
    icon: Cloud,
    activePattern: "/weather"
  },
  {
    id: "soil",
    label: "Soil Analysis", 
    href: "/soil-analysis",
    icon: TestTube,
    activePattern: "/soil-analysis"
  },
  {
    id: "help",
    label: "AgriBot AI Assistant",
    href: "/help",
    icon: HelpCircle,
    activePattern: "/help"
  },
  {
    id: "profile",
    label: "Profile",
    href: "/profile", 
    icon: User,
    activePattern: "/profile"
  }
];

interface ModernNavigationProps {
  children: React.ReactNode;
}

export default function ModernNavigation({ children }: ModernNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleLogout = () => {
    logout();
  };

  const isActiveRoute = (pattern: string) => {
    return pathname.startsWith(pattern);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <div>
        <main className="py-0">
          {children}
        </main>
      </div>
    </div>
  );
}