'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import dynamic from 'next/dynamic';
import { 
  MapPin, 
  Search, 
  Plus, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  Users,
  BarChart3,
  Map
} from "lucide-react";

// Dynamically import map component to avoid SSR issues
const HealthMapComponent = dynamic(() => import('@/components/HealthMapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});

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

export default function HealthMapPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [alert, setAlert] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  
  // Search form state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  
  // Disease form state
  const [diseaseForm, setDiseaseForm] = useState({
    pincode: '',
    name: '',
    status: '',
    severity: 'Medium',
    details: ''
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [locationsRes, statsRes] = await Promise.all([
        fetch('/api/healthmap/locations'),
        fetch('/api/healthmap/statistics')
      ]);

      if (locationsRes.ok) {
        const locationsData = await locationsRes.json();
        setLocations(locationsData);
        setSearchResults(locationsData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStatistics(statsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showAlert('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message: string, type: 'success' | 'error' | 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(locations);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await fetch(`/api/healthmap/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`);
      
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        showAlert(`Found ${results.length} location(s)`, 'info');
      } else {
        showAlert('Search failed', 'error');
      }
    } catch (error) {
      console.error('Search error:', error);
      showAlert('Search failed', 'error');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddDisease = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!diseaseForm.pincode || !diseaseForm.name || !diseaseForm.status) {
      showAlert('Please fill in all required fields', 'error');
      return;
    }

    try {
      const response = await fetch('/api/healthmap/add-disease', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diseaseForm),
      });

      if (response.ok) {
        const result = await response.json();
        showAlert('Disease information added successfully!', 'success');
        setDiseaseForm({
          pincode: '',
          name: '',
          status: '',
          severity: 'Medium',
          details: ''
        });
        loadData(); // Reload data
      } else {
        const error = await response.json();
        showAlert(error.error || 'Failed to add disease information', 'error');
      }
    } catch (error) {
      console.error('Error adding disease:', error);
      showAlert('Failed to add disease information', 'error');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-red-100 text-red-800';
      case 'Controlled': return 'bg-blue-100 text-blue-800';
      case 'Monitoring': return 'bg-yellow-100 text-yellow-800';
      case 'Eradicated': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 75) return 'text-red-600';
    if (riskScore >= 50) return 'text-orange-600';
    if (riskScore >= 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <div className="pt-20 pb-8 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center">
              <MapPin className="w-10 h-10 mr-3" />
              HealthMap India
            </h1>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
              Real-time disease monitoring and mapping system for agricultural health across India
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Messages */}
        {alert && (
          <Alert className={`mb-6 ${alert.type === 'error' ? 'border-red-500 bg-red-50' : 
                              alert.type === 'success' ? 'border-green-500 bg-green-50' : 
                              'border-blue-500 bg-blue-50'}`}>
            <AlertDescription className={alert.type === 'error' ? 'text-red-700' : 
                                        alert.type === 'success' ? 'text-green-700' : 'text-blue-700'}>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MapPin className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Locations</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.totalLocations.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Diseases</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.totalDiseases}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">States Monitored</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.statesWithData}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">User Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.customReports}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - Forms */}
          <div className="xl:col-span-1 space-y-6">
            {/* Add Disease Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Report Disease
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddDisease} className="space-y-4">
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      type="number"
                      value={diseaseForm.pincode}
                      onChange={(e) => setDiseaseForm({...diseaseForm, pincode: e.target.value})}
                      placeholder="Enter pincode"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="diseaseName">Disease Name *</Label>
                    <Input
                      id="diseaseName"
                      value={diseaseForm.name}
                      onChange={(e) => setDiseaseForm({...diseaseForm, name: e.target.value})}
                      placeholder="Enter disease name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select value={diseaseForm.status} onValueChange={(value) => setDiseaseForm({...diseaseForm, status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Controlled">Controlled</SelectItem>
                        <SelectItem value="Monitoring">Under Monitoring</SelectItem>
                        <SelectItem value="Eradicated">Eradicated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <Select value={diseaseForm.severity} onValueChange={(value) => setDiseaseForm({...diseaseForm, severity: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="details">Additional Details</Label>
                    <Textarea
                      id="details"
                      value={diseaseForm.details}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDiseaseForm({...diseaseForm, details: e.target.value})}
                      placeholder="Enter additional information..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Disease Report
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Search Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Search Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="searchQuery">Search Query</Label>
                    <Input
                      id="searchQuery"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by state, district, or pincode..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>

                  <div>
                    <Label htmlFor="searchType">Filter Type</Label>
                    <Select value={searchType} onValueChange={setSearchType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="state">State</SelectItem>
                        <SelectItem value="district">District</SelectItem>
                        <SelectItem value="pincode">Pincode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleSearch} 
                      disabled={searchLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {searchLoading ? 'Searching...' : 'Search'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults(locations);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Interactive Map */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Map className="w-5 h-5 mr-2" />
                    Interactive Disease Map
                  </div>
                  {searchQuery && (
                    <Badge variant="secondary">
                      Filtered by: {searchQuery}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading map data...</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 text-sm text-gray-600 flex items-center justify-between">
                      <span>Showing {searchResults.length} locations on map</span>
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Low Risk (0-24)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span>Medium Risk (25-49)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span>High Risk (50-74)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>Critical Risk (75+)</span>
                        </div>
                      </div>
                    </div>
                    <HealthMapComponent locations={searchResults} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Location Details */}
          <div className="xl:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Location Details ({searchResults.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-sm">Loading...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-sm">No locations found.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {searchResults.slice(0, 10).map((location, index) => (
                      <div key={`${location.pincode}-${index}`} className="border rounded-lg p-3 hover:bg-gray-50 text-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm truncate">{location.officeName}</h4>
                            <p className="text-xs text-gray-600">
                              {location.district}, {location.state}
                            </p>
                            <p className="text-xs text-gray-500">PIN: {location.pincode}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${getRiskColor(location.riskScore)}`}>
                              {location.riskScore}
                            </p>
                            <p className="text-xs text-gray-500">Risk</p>
                          </div>
                        </div>

                        {location.diseases.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">
                              {location.diseases.length} Disease{location.diseases.length > 1 ? 's' : ''}:
                            </p>
                            <div className="space-y-1">
                              {location.diseases.slice(0, 2).map((disease, diseaseIndex) => (
                                <div key={`${disease.id}-${diseaseIndex}`} className="text-xs">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium truncate">{disease.name}</span>
                                    <div className="flex space-x-1">
                                      <Badge className={`text-xs px-1 py-0 ${getStatusColor(disease.status)}`} variant="secondary">
                                        {disease.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {location.diseases.length > 2 && (
                                <p className="text-xs text-gray-500">
                                  +{location.diseases.length - 2} more...
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {searchResults.length > 10 && (
                      <div className="text-center py-2">
                        <p className="text-xs text-gray-500">
                          Showing first 10 of {searchResults.length} locations
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}