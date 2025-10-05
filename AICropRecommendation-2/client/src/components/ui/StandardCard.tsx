"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface StandardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered" | "gradient";
  padding?: "sm" | "md" | "lg";
  interactive?: boolean;
  children: React.ReactNode;
}

const StandardCard = forwardRef<HTMLDivElement, StandardCardProps>(
  ({ 
    variant = "default", 
    padding = "md", 
    interactive = false, 
    className, 
    children, 
    ...props 
  }, ref) => {
    const baseClasses = "bg-white rounded-xl transition-all duration-200";
    
    const variantClasses = {
      default: "border border-gray-200",
      elevated: "shadow-md border border-gray-100",
      bordered: "border-2 border-gray-200",
      gradient: "bg-gradient-to-br from-white to-gray-50 border border-gray-200"
    };

    const paddingClasses = {
      sm: "p-3",
      md: "p-4", 
      lg: "p-6"
    };

    const interactiveClasses = interactive 
      ? "hover:shadow-lg hover:scale-[1.02] cursor-pointer" 
      : "";

    const cardClasses = cn(
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      interactiveClasses,
      className
    );

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    );
  }
);

StandardCard.displayName = "StandardCard";

// Card Header Component
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, icon, action, className, ...props }, ref) => {
    const headerClasses = cn("flex items-start justify-between mb-4", className);
    
    return (
      <div ref={ref} className={headerClasses} {...props}>
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

// Card Content Component  
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = "CardContent";

export { StandardCard, CardHeader, CardContent };