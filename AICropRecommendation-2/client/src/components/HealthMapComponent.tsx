'use client';

import React, { useEffect, useRef } from 'react';

interface Disease {
  id: string;
  name: string;
  status: 'Active' | 'Controlled' | 'Monitoring' | 'Eradicated';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  type: string;
  dateReported: string;
  affectedArea: string;
  details?: string;
  source?: string;
}

interface Location {
  pincode: number;
  officeName: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  diseases: Disease[];
  riskScore: number;
}

interface HealthMapComponentProps {
  locations: Location[];
}

declare global {
  interface Window {
    L: any;
  }
}

const HealthMapComponent: React.FC<HealthMapComponentProps> = ({ locations }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const mapIdRef = useRef(`map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    mountedRef.current = true;

    // Load Leaflet CSS and JS dynamically
    const loadLeaflet = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(cssLink);
      }

      // Load JS
      if (!window.L) {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve(window.L);
          document.head.appendChild(script);
        });
      }
      return window.L;
    };

    const initializeMap = async () => {
      try {
        // Check if map is already initialized or component is unmounted
        if (mapInstanceRef.current || !mountedRef.current) {
          return;
        }

        const L = await loadLeaflet();
        if (!L || !mapRef.current || !mountedRef.current) return;

        // Clear any existing map container content
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
          
          // Remove any leaflet-specific classes that might interfere
          mapRef.current.className = '';
        }

        // Initialize map centered on India
        mapInstanceRef.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);

        // Create marker cluster group
        markersGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);

        // Add markers for locations
        if (mountedRef.current) {
          addMarkersToMap(L);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(initializeMap, 100);

    // Cleanup function
    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (error) {
          console.warn('Error during map cleanup:', error);
        }
        mapInstanceRef.current = null;
      }
      if (markersGroupRef.current) {
        markersGroupRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.innerHTML = '';
        mapRef.current.className = '';
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && window.L && markersGroupRef.current && mountedRef.current) {
      // Add a small delay to ensure map is fully initialized
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          addMarkersToMap(window.L);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [locations]);

  const addMarkersToMap = (L: any) => {
    if (!markersGroupRef.current || !mapInstanceRef.current || !mountedRef.current) return;

    // Clear existing markers
    markersGroupRef.current.clearLayers();

    locations.forEach((location) => {
      if (location.latitude && location.longitude) {
        const { latitude, longitude, officeName, district, state, pincode, diseases, riskScore } = location;

        // Create marker with color based on risk score
        const markerColor = getRiskMarkerColor(riskScore);
        
        // Create custom icon
        const markerIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="
            background-color: ${markerColor}; 
            width: 20px; 
            height: 20px; 
            border-radius: 50%; 
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
          ">${riskScore}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        // Create popup content
        const diseasesList = diseases.map(disease => 
          `<div style="margin-bottom: 8px; padding: 4px; background: #f3f4f6; border-radius: 4px;">
            <strong>${disease.name}</strong><br>
            <span style="font-size: 12px;">
              Status: <span style="color: ${getStatusColor(disease.status)};">${disease.status}</span> | 
              Severity: <span style="color: ${getSeverityColor(disease.severity)};">${disease.severity}</span><br>
              Reported: ${disease.dateReported}<br>
              Area: ${disease.affectedArea}
              ${disease.details ? `<br>Details: ${disease.details}` : ''}
            </span>
          </div>`
        ).join('');

        const popupContent = `
          <div style="max-width: 300px;">
            <h3 style="margin: 0 0 8px 0; color: #059669; font-size: 16px;">
              📍 ${officeName}
            </h3>
            <div style="margin-bottom: 12px; font-size: 14px; color: #6b7280;">
              <strong>Pincode:</strong> ${pincode}<br>
              <strong>District:</strong> ${district}<br>
              <strong>State:</strong> ${state}<br>
              <strong>Risk Score:</strong> <span style="color: ${getRiskTextColor(riskScore)}; font-weight: bold;">${riskScore}/100</span>
            </div>
            ${diseases.length > 0 ? `
              <div>
                <h4 style="margin: 8px 0; color: #374151; font-size: 14px;">
                  🦠 Diseases (${diseases.length}):
                </h4>
                ${diseasesList}
              </div>
            ` : '<p style="color: #6b7280; font-style: italic;">No diseases reported</p>'}
          </div>
        `;

        // Create marker and add to map
        const marker = L.marker([latitude, longitude], { icon: markerIcon })
          .bindPopup(popupContent, {
            maxWidth: 320,
            className: 'custom-popup'
          });

        markersGroupRef.current.addLayer(marker);
      }
    });

    // Fit map to show all markers if there are any
    if (locations.length > 0 && markersGroupRef.current.getLayers().length > 0) {
      const group = new L.featureGroup(markersGroupRef.current.getLayers());
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  };

  const getRiskMarkerColor = (riskScore: number): string => {
    if (riskScore >= 75) return '#dc2626'; // Red
    if (riskScore >= 50) return '#ea580c'; // Orange
    if (riskScore >= 25) return '#d97706'; // Amber
    return '#16a34a'; // Green
  };

  const getRiskTextColor = (riskScore: number): string => {
    if (riskScore >= 75) return '#dc2626';
    if (riskScore >= 50) return '#ea580c';
    if (riskScore >= 25) return '#d97706';
    return '#16a34a';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Active': return '#dc2626';
      case 'Controlled': return '#2563eb';
      case 'Monitoring': return '#d97706';
      case 'Eradicated': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'Critical': return '#dc2626';
      case 'High': return '#ea580c';
      case 'Medium': return '#d97706';
      case 'Low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  return (
    <>
      <style jsx global>{`
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 8px;
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        
        .leaflet-container {
          height: 100%;
          width: 100%;
          border-radius: 8px;
        }
      `}</style>
      <div 
        ref={mapRef}
        id={mapIdRef.current}
        style={{ 
          height: '500px', 
          width: '100%',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }} 
      />
    </>
  );
};

export default HealthMapComponent;