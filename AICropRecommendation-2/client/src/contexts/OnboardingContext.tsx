"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface OnboardingContextType {
  isFirstTime: boolean;
  hasCompletedOnboarding: boolean;
  userLocation: {
    state: string;
    district: string;
    coordinates?: { lat: number; lng: number };
  } | null;
  completeOnboarding: (location: { state: string; district: string; coordinates?: { lat: number; lng: number } }) => void;
  skipOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<OnboardingContextType['userLocation']>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding before
    const onboardingStatus = localStorage.getItem('cropai_onboarding_completed');
    const savedLocation = localStorage.getItem('cropai_user_location');
    
    if (onboardingStatus === 'true') {
      setIsFirstTime(false);
      setHasCompletedOnboarding(true);
    }
    
    if (savedLocation) {
      try {
        setUserLocation(JSON.parse(savedLocation));
      } catch (error) {
        console.error('Error parsing saved location:', error);
      }
    }
    
    setIsLoading(false);
  }, []);

  const completeOnboarding = (location: { state: string; district: string; coordinates?: { lat: number; lng: number } }) => {
    localStorage.setItem('cropai_onboarding_completed', 'true');
    localStorage.setItem('cropai_user_location', JSON.stringify(location));
    
    setIsFirstTime(false);
    setHasCompletedOnboarding(true);
    setUserLocation(location);
  };

  const skipOnboarding = () => {
    localStorage.setItem('cropai_onboarding_completed', 'true');
    
    setIsFirstTime(false);
    setHasCompletedOnboarding(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CropAI...</p>
        </div>
      </div>
    );
  }

  return (
    <OnboardingContext.Provider value={{
      isFirstTime,
      hasCompletedOnboarding,
      userLocation,
      completeOnboarding,
      skipOnboarding,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}