"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "bordered" | "gradient" | "glass";
  padding?: "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
  onClick?: () => void;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "emerald" | "blue" | "orange" | "purple" | "red";
  className?: string;
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  color?: "emerald" | "blue" | "orange" | "purple" | "red";
  features?: string[];
  className?: string;
}

interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

// Helper function to get variant styles
const getVariantStyles = (variant: ModernCardProps["variant"]) => {
  switch (variant) {
    case "elevated":
      return "bg-white shadow-lg hover:shadow-xl border-0";
    case "bordered":
      return "bg-white border-2 border-gray-200 shadow-sm hover:border-emerald-300";
    case "gradient":
      return "bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 shadow-sm";
    case "glass":
      return "bg-white/80 backdrop-blur-sm border border-white/20 shadow-sm";
    default:
      return "bg-white border border-gray-200 shadow-sm hover:shadow-md";
  }
};

// Helper function to get padding styles
const getPaddingStyles = (padding: ModernCardProps["padding"]) => {
  switch (padding) {
    case "sm":
      return "p-3";
    case "md":
      return "p-4";
    case "lg":
      return "p-6";
    case "xl":
      return "p-8";
    default:
      return "p-4";
  }
};

// Helper function to get color styles
const getColorStyles = (color: string = "emerald") => {
  const colors = {
    emerald: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
      accent: "text-emerald-600",
      trend: "text-emerald-600"
    },
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600", 
      accent: "text-blue-600",
      trend: "text-blue-600"
    },
    orange: {
      bg: "bg-orange-50",
      icon: "text-orange-600",
      accent: "text-orange-600", 
      trend: "text-orange-600"
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      accent: "text-purple-600",
      trend: "text-purple-600"
    },
    red: {
      bg: "bg-red-50",
      icon: "text-red-600",
      accent: "text-red-600",
      trend: "text-red-600"
    }
  };
  return colors[color as keyof typeof colors] || colors.emerald;
};

export function ModernCard({ 
  children, 
  className = "", 
  variant = "default", 
  padding = "md",
  interactive = false,
  onClick 
}: ModernCardProps) {
  const baseStyles = "rounded-xl transition-all duration-300 ease-in-out";
  const variantStyles = getVariantStyles(variant);
  const paddingStyles = getPaddingStyles(padding);
  const interactiveStyles = interactive 
    ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" 
    : "";

  const combinedClassName = `${baseStyles} ${variantStyles} ${paddingStyles} ${interactiveStyles} ${className}`;

  if (onClick) {
    return (
      <button onClick={onClick} className={combinedClassName}>
        {children}
      </button>
    );
  }

  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
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

export function CardContent({ children, className = "" }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  color = "emerald",
  className = ""
}: StatCardProps) {
  const colorStyles = getColorStyles(color);

  return (
    <ModernCard variant="elevated" className={className}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 ${colorStyles.bg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${colorStyles.icon}`} />
          </div>
          {trend && (
            <div className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </div>
          )}
        </div>
        
        <div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {value}
          </div>
          <div className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-gray-500">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </ModernCard>
  );
}

export function ActionCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  onClick, 
  color = "emerald", 
  features = [],
  className = "" 
}: ActionCardProps) {
  const colorStyles = getColorStyles(color);

  const content = (
    <div className="text-center space-y-4">
      <div className={`w-16 h-16 ${colorStyles.bg} rounded-2xl flex items-center justify-center mx-auto`}>
        <Icon className={`w-8 h-8 ${colorStyles.icon}`} />
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {description}
        </p>
        
        {features.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {features.map((feature, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
              >
                ✓ {feature}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        <ModernCard 
          variant="elevated" 
          interactive={true}
          className={`h-full ${className}`}
        >
          {content}
        </ModernCard>
      </a>
    );
  }

  return (
    <ModernCard 
      variant="elevated" 
      interactive={true}
      onClick={onClick}
      className={`h-full ${className}`}
    >
      {content}
    </ModernCard>
  );
}

export function Grid({ children, cols = 2, gap = "md", className = "" }: GridProps) {
  const colsClass = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3", 
    4: "grid-cols-4"
  };

  const gapClass = {
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6"
  };

  return (
    <div className={`grid ${colsClass[cols]} ${gapClass[gap]} ${className}`}>
      {children}
    </div>
  );
}