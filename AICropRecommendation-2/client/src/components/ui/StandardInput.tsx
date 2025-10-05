"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface StandardInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const StandardInput = forwardRef<HTMLInputElement, StandardInputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    fullWidth = false, 
    leftIcon, 
    rightIcon, 
    className, 
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    const inputClasses = cn(
      "w-full px-4 py-3 text-base bg-white border-2 rounded-xl transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50",
      "placeholder:text-gray-400",
      leftIcon && "pl-12",
      rightIcon && "pr-12",
      error 
        ? "border-red-300 focus:border-red-500" 
        : "border-gray-300 focus:border-emerald-500",
      props.disabled && "bg-gray-50 cursor-not-allowed opacity-75",
      className
    );

    return (
      <div className={cn("space-y-2", fullWidth && "w-full")}>
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-semibold text-gray-700"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="space-y-1">
            {error && (
              <p className="text-sm text-red-600 font-medium">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-sm text-gray-500">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

StandardInput.displayName = "StandardInput";

// Textarea variant
interface StandardTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const StandardTextarea = forwardRef<HTMLTextAreaElement, StandardTextareaProps>(
  ({ 
    label, 
    error, 
    helperText, 
    fullWidth = false, 
    className, 
    id,
    rows = 4,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    
    const textareaClasses = cn(
      "w-full px-4 py-3 text-base bg-white border-2 rounded-xl transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50",
      "placeholder:text-gray-400 resize-y",
      error 
        ? "border-red-300 focus:border-red-500" 
        : "border-gray-300 focus:border-emerald-500",
      props.disabled && "bg-gray-50 cursor-not-allowed opacity-75",
      className
    );

    return (
      <div className={cn("space-y-2", fullWidth && "w-full")}>
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-semibold text-gray-700"
          >
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={textareaClasses}
          {...props}
        />
        
        {(error || helperText) && (
          <div className="space-y-1">
            {error && (
              <p className="text-sm text-red-600 font-medium">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-sm text-gray-500">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

StandardTextarea.displayName = "StandardTextarea";

export { StandardInput, StandardTextarea };