"use client";

import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  headerAction?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  padding?: "sm" | "md" | "lg";
  className?: string;
}

export default function PageLayout({
  children,
  title,
  subtitle,
  showBackButton = false,
  headerAction,
  maxWidth = "lg",
  padding = "md",
  className = ""
}: PageLayoutProps) {
  const router = useRouter();

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case "sm":
        return "max-w-sm";
      case "md":
        return "max-w-md";
      case "lg":
        return "max-w-4xl";
      case "xl":
        return "max-w-6xl";
      case "full":
        return "max-w-none";
      default:
        return "max-w-4xl";
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case "sm":
        return "px-4 py-2";
      case "md":
        return "px-4 py-4 lg:px-8";
      case "lg":
        return "px-4 py-6 lg:px-8 lg:py-8";
      default:
        return "px-4 py-4 lg:px-8";
    }
  };

  return (
    <div className={`${getMaxWidthClass()} mx-auto ${getPaddingClass()} ${className}`}>
      {/* Page Header */}
      {(title || showBackButton || headerAction) && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              
              {title && (
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-gray-600 mt-1 text-sm lg:text-base">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {headerAction && (
              <div className="flex-shrink-0">
                {headerAction}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Content */}
      <div>
        {children}
      </div>
    </div>
  );
}