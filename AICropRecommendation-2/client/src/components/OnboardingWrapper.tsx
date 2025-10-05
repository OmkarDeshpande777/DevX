"use client";

import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";
import OnboardingScreen from "@/components/OnboardingScreen";

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export default function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const { isFirstTime, hasCompletedOnboarding, completeOnboarding } = useOnboarding();
  const { isAuthenticated } = useAuth();

  const handleOnboardingComplete = (location?: { state: string; district: string; coordinates?: { lat: number; lng: number } }) => {
    if (location) {
      completeOnboarding(location);
    } else {
      // If no location provided, just mark as completed
      completeOnboarding({
        state: "Maharashtra",
        district: "Pune",
      });
    }
  };

  // Only show onboarding for authenticated users who haven't completed it
  if (isAuthenticated && isFirstTime && !hasCompletedOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // Show regular content for all other cases
  return <>{children}</>;
}