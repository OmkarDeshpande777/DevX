"use client";

import TopNavigationBar from "./TopNavigationBar";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

interface GlobalLayoutProps {
  children: React.ReactNode;
}

export default function GlobalLayout({ children }: GlobalLayoutProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Pages that should NOT show navigation (only landing/auth pages)
  const noNavigationPages = [
    '/',
    '/auth',
    '/login', 
    '/register'
  ];

  const shouldShowNavigation = isAuthenticated && !noNavigationPages.includes(pathname) && !pathname.startsWith('/auth');

  // If user is not authenticated or on auth pages, show without navigation
  if (!shouldShowNavigation) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  // For all authenticated pages, show with navigation
  return (
    <TopNavigationBar>
      {children}
    </TopNavigationBar>
  );
}