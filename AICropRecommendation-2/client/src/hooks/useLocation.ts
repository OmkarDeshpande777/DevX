import { useState } from 'react';

interface LocationData {
  state: string;
  district: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  accuracy?: number;
}



export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get location from browser's geolocation API
  const getAutoLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes cache
        });
      });

      const { latitude, longitude, accuracy } = position.coords;
      
      // Use reverse geocoding to get state and district
      const locationData = await reverseGeocode(latitude, longitude);
      
      if (locationData) {
        setLocation({
          ...locationData,
          coordinates: { latitude, longitude },
          accuracy
        });
      }
    } catch (err) {
      console.error('Geolocation error:', err);
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location access denied by user');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information unavailable');
            break;
          case err.TIMEOUT:
            setError('Location request timed out');
            break;
          default:
            setError('Unknown location error');
        }
      } else {
        setError('Failed to get location');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reverse geocoding using free services with fallback to mock data
  const reverseGeocode = async (lat: number, lng: number): Promise<LocationData | null> => {
    try {
      // Try using Nominatim (OpenStreetMap's free service) first
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'FarmingApp/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.address) {
          const address = data.address;
          return {
            state: address.state || address.state_district || 'Unknown State',
            district: address.state_district || address.county || address.city || address.town || address.village || 'Unknown District'
          };
        }
      }
      
      // If API fails, use our improved mock data
      return getMockLocationData(lat, lng);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Fallback to mock data with better coordinate mapping
      return getMockLocationData(lat, lng);
    }
  };

  // Mock location data based on coordinates (for demo purposes)
  const getMockLocationData = (lat: number, lng: number): LocationData => {
    // More accurate mapping for Indian regions based on coordinates
    if (lat >= 20 && lat <= 24.5 && lng >= 68 && lng <= 74) {
      return { state: 'Gujarat', district: 'Ahmedabad' };
    } else if (lat >= 24 && lat <= 30.5 && lng >= 69 && lng <= 78) {
      return { state: 'Rajasthan', district: 'Jaipur' };
    } else if (lat >= 23.5 && lat <= 31 && lng >= 77 && lng <= 84.5) {
      return { state: 'Uttar Pradesh', district: 'Lucknow' };
    } else if (lat >= 15.5 && lat <= 22 && lng >= 72 && lng <= 80.5) {
      return { state: 'Maharashtra', district: 'Mumbai' };
    } else if (lat >= 11.5 && lat <= 18.5 && lng >= 74 && lng <= 78.5) {
      return { state: 'Karnataka', district: 'Bangalore' };
    } else if (lat >= 8 && lat <= 13 && lng >= 76 && lng <= 80) {
      return { state: 'Tamil Nadu', district: 'Chennai' };
    } else if (lat >= 19.5 && lat <= 28 && lng >= 85 && lng <= 90) {
      return { state: 'West Bengal', district: 'Kolkata' };
    } else if (lat >= 26 && lat <= 35 && lng >= 74 && lng <= 80) {
      return { state: 'Punjab', district: 'Chandigarh' };
    } else if (lat >= 15 && lat <= 20 && lng >= 78 && lng <= 84) {
      return { state: 'Telangana', district: 'Hyderabad' };
    } else if (lat >= 15 && lat <= 19.5 && lng >= 73 && lng <= 78) {
      return { state: 'Andhra Pradesh', district: 'Visakhapatnam' };
    }
    
    // Default fallback - use a central Indian state
    return { state: 'Madhya Pradesh', district: 'Bhopal' };
  };

  // Manually set location
  const setManualLocation = (state: string, district: string) => {
    setLocation({ state, district });
    setError(null);
  };

  // Clear location
  const clearLocation = () => {
    setLocation(null);
    setError(null);
  };

  return {
    location,
    loading,
    error,
    getAutoLocation,
    setManualLocation,
    clearLocation
  };
}