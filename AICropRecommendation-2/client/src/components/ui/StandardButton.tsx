"use client";

import { Button as BaseButton } from "@/components/ui/button";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface StandardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const StandardButton = forwardRef<HTMLButtonElement, StandardButtonProps>(
  ({ 
    variant = "primary", 
    size = "md", 
    fullWidth = false, 
    loading = false, 
    className, 
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = "font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50";
    
    const variantClasses = {
      primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
      secondary: "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 bg-white",
      ghost: "text-gray-700 hover:bg-gray-100"
    };

    const sizeClasses = {
      sm: "px-3 py-2 text-sm rounded-lg min-h-[36px]",
      md: "px-4 py-3 text-base rounded-xl min-h-[44px]", 
      lg: "px-6 py-4 text-lg rounded-xl min-h-[52px]"
    };

    const buttonClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && "w-full",
      (disabled || loading) && "opacity-50 cursor-not-allowed",
      className
    );

    return (
      <BaseButton
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </BaseButton>
    );
  }
);

StandardButton.displayName = "StandardButton";

export { StandardButton };