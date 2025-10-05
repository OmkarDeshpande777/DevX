"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LocationSelector from '../../components/LocationSelector';
import { useLocation } from '../../hooks/useLocation';
import { 
  Search,
  Filter,
  ExternalLink,
  IndianRupee,
  Calendar,
  User,
  FileText,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  Landmark,
  Banknote,
  Tractor,
  Droplets,
  Zap,
  Home,
  GraduationCap,
  Shield
} from "lucide-react";

interface Scheme {
  id: string;
  name: string;
  category: 'subsidy' | 'loan' | 'insurance' | 'welfare' | 'infrastructure' | 'training';
  department: string;
  amount: string;
  duration: string;
  eligibility: string[];
  benefits: string[];
  documents: string[];
  applicationProcess: string;
  contactInfo: {
    office: string;
    phone: string;
    email: string;
    website: string;
  };
  status: 'active' | 'upcoming' | 'closed';
  deadline: string;
  description: string;
  targetGroup: string[];
}

export default function GovernmentSchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  
  // Location hook
  const { 
    location, 
    loading: locationLoading, 
    error: locationError, 
    getAutoLocation, 
    setManualLocation 
  } = useLocation();

  useEffect(() => {
    if (location) {
      fetchSchemes();
    }
  }, [location]);

  useEffect(() => {
    filterSchemes();
  }, [schemes, searchTerm, selectedCategory]);

  const fetchSchemes = async () => {
    if (!location) return;
    
    try {
      setLoading(true);
      
      // In production, integrate with:
      // - Government scheme APIs
      // - State government portals
      // - Central scheme databases
      // - Real-time scheme updates
      
      const mockSchemes = generateMockSchemes(location);
      setSchemes(mockSchemes);
      
    } catch (error) {
      console.error('Error fetching schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockSchemes = (location: { state: string; district: string }): Scheme[] => {
    return [
      {
        id: '1',
        name: 'PM-KISAN Direct Benefit Transfer',
        category: 'subsidy',
        department: 'Ministry of Agriculture & Farmers Welfare',
        amount: '₹6,000 per year',
        duration: 'Annual',
        eligibility: [
          'Small and marginal farmers',
          'Landholding up to 2 hectares',
          'Valid Aadhaar card',
          'Bank account linked with Aadhaar'
        ],
        benefits: [
          '₹2,000 per installment (3 times a year)',
          'Direct bank transfer',
          'No middleman involvement',
          'Covers all crops and farming activities'
        ],
        documents: [
          'Aadhaar Card',
          'Bank Account Details',
          'Land Ownership Documents',
          'Mobile Number'
        ],
        applicationProcess: 'Online application through PM-KISAN portal or visit nearest Common Service Center',
        contactInfo: {
          office: `District Agriculture Office, ${location.district}`,
          phone: '1800-115-526',
          email: 'pmkisan-ict@gov.in',
          website: 'https://pmkisan.gov.in'
        },
        status: 'active',
        deadline: 'No deadline - Ongoing',
        description: 'Income support scheme providing ₹6,000 per year to small and marginal farmers.',
        targetGroup: ['Small Farmers', 'Marginal Farmers']
      },
      {
        id: '2',
        name: 'Pradhan Mantri Fasal Bima Yojana',
        category: 'insurance',
        department: 'Ministry of Agriculture & Farmers Welfare',
        amount: 'Premium: 2% for Kharif, 1.5% for Rabi',
        duration: 'Seasonal',
        eligibility: [
          'All farmers (sharecroppers and tenant farmers)',
          'Growing notified crops',
          'In notified areas',
          'Valid land documents or crop sharing agreement'
        ],
        benefits: [
          'Comprehensive crop insurance',
          'Low premium rates',
          'Coverage for natural calamities',
          'Technology-enabled claim settlement'
        ],
        documents: [
          'Aadhaar Card',
          'Bank Account Details',
          'Land Records',
          'Sowing Certificate',
          'Premium Payment Receipt'
        ],
        applicationProcess: 'Apply through insurance companies, banks, or online portal before crop cutting experiment',
        contactInfo: {
          office: `Agriculture Insurance Company, ${location.district}`,
          phone: '1800-180-1551',
          email: 'info@pmfby.gov.in',
          website: 'https://pmfby.gov.in'
        },
        status: 'active',
        deadline: 'Varies by crop season',
        description: 'Crop insurance scheme protecting farmers against crop loss due to natural calamities.',
        targetGroup: ['All Farmers', 'Tenant Farmers']
      },
      {
        id: '3',
        name: 'KCC - Kisan Credit Card',
        category: 'loan',
        department: 'Ministry of Agriculture & Farmers Welfare',
        amount: 'Based on cropping pattern and scale of finance',
        duration: '5 years (renewable)',
        eligibility: [
          'Farmers with cultivable land',
          'Tenant farmers, oral lessees, sharecroppers',
          'Self-Help Group members',
          'Good repayment track record'
        ],
        benefits: [
          'Flexible credit limit',
          'Lower interest rates (7% per annum)',
          'Insurance coverage included',
          'ATM-cum-Debit card facility'
        ],
        documents: [
          'Identity Proof (Aadhaar/Voter ID)',
          'Address Proof',
          'Land Documents',
          'Income Certificate',
          'Bank Statements'
        ],
        applicationProcess: 'Visit nearest bank branch with required documents and fill KCC application form',
        contactInfo: {
          office: `District Lead Bank, ${location.district}`,
          phone: '1800-180-1111',
          email: 'kcc@nabard.org',
          website: 'https://www.nabard.org/kcc'
        },
        status: 'active',
        deadline: 'No deadline - Ongoing',
        description: 'Credit facility for farmers to meet their agricultural and allied activities expenses.',
        targetGroup: ['Active Farmers', 'Agricultural Workers']
      },
      {
        id: '4',
        name: 'Soil Health Card Scheme',
        category: 'welfare',
        department: 'Ministry of Agriculture & Farmers Welfare',
        amount: 'Free of cost',
        duration: 'Every 3 years',
        eligibility: [
          'All farmers',
          'Land ownership or cultivation rights',
          'Registration with local agriculture department'
        ],
        benefits: [
          'Free soil testing',
          'Nutrient status report',
          'Fertilizer recommendations',
          'Improved crop productivity'
        ],
        documents: [
          'Land Records',
          'Aadhaar Card',
          'Contact Details'
        ],
        applicationProcess: 'Contact local agriculture extension officer or visit soil testing laboratory',
        contactInfo: {
          office: `Soil Testing Laboratory, ${location.district}`,
          phone: '1800-180-1234',
          email: 'soilhealth@gov.in',
          website: 'https://soilhealth.dac.gov.in'
        },
        status: 'active',
        deadline: 'No deadline - Ongoing',
        description: 'Provides soil health cards to farmers with crop-wise recommendations.',
        targetGroup: ['All Farmers']
      },
      {
        id: '5',
        name: 'Pradhan Mantri Krishi Sinchai Yojana',
        category: 'infrastructure',
        department: 'Ministry of Jal Shakti',
        amount: '75% subsidy for SC/ST, 50% for others',
        duration: 'One-time',
        eligibility: [
          'Individual farmers',
          'Groups of farmers',
          'Cooperatives and FPOs',
          'Self-Help Groups'
        ],
        benefits: [
          'Drip irrigation systems',
          'Sprinkler irrigation',
          'Water conservation techniques',
          'Improved water use efficiency'
        ],
        documents: [
          'Land Documents',
          'Aadhaar Card',
          'Bank Account Details',
          'Caste Certificate (if applicable)',
          'Water Source Certificate'
        ],
        applicationProcess: 'Apply through state agriculture/horticulture department or online portal',
        contactInfo: {
          office: `District Collector Office, ${location.district}`,
          phone: '1800-180-6677',
          email: 'pmksy@nic.in',
          website: 'https://pmksy.gov.in'
        },
        status: 'active',
        deadline: 'March 31, 2024',
        description: 'Micro irrigation scheme for efficient water usage and higher crop productivity.',
        targetGroup: ['Progressive Farmers', 'Water-Stressed Areas']
      },
      {
        id: '6',
        name: 'Formation & Promotion of FPOs',
        category: 'training',
        department: 'Ministry of Agriculture & Farmers Welfare',
        amount: '₹18.00 lakh per FPO over 3 years',
        duration: '3 years',
        eligibility: [
          'Minimum 300 members for plains',
          'Minimum 100 members for hills',
          'Registered as FPO under Companies Act',
          'Focus on value chain development'
        ],
        benefits: [
          'Financial assistance for 3 years',
          'Technical support',
          'Market linkage facilities',
          'Capacity building programs'
        ],
        documents: [
          'FPO Registration Certificate',
          'Member List with Aadhaar',
          'Business Plan',
          'Bank Account Details',
          'Board Resolution'
        ],
        applicationProcess: 'Apply through implementing agencies like NABARD, SFAC, or NCDC',
        contactInfo: {
          office: `NABARD Regional Office, ${location.state}`,
          phone: '1800-200-2110',
          email: 'fpo@nabard.org',
          website: 'https://www.nabard.org/content1.aspx?id=1752'
        },
        status: 'active',
        deadline: 'December 31, 2024',
        description: 'Support for formation and promotion of Farmer Producer Organizations.',
        targetGroup: ['Farmer Groups', 'Cooperatives']
      }
    ];
  };

  const filterSchemes = () => {
    let filtered = schemes;

    if (searchTerm) {
      filtered = filtered.filter(scheme =>
        scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(scheme => scheme.category === selectedCategory);
    }

    setFilteredSchemes(filtered);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'subsidy': return <IndianRupee className="h-5 w-5 text-green-600" />;
      case 'loan': return <Banknote className="h-5 w-5 text-blue-600" />;
      case 'insurance': return <Shield className="h-5 w-5 text-purple-600" />;
      case 'welfare': return <User className="h-5 w-5 text-orange-600" />;
      case 'infrastructure': return <Tractor className="h-5 w-5 text-red-600" />;
      case 'training': return <GraduationCap className="h-5 w-5 text-indigo-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case 'closed':
        return <Badge className="bg-red-100 text-red-800">Closed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories', icon: <FileText className="h-4 w-4" /> },
    { value: 'subsidy', label: 'Subsidies', icon: <IndianRupee className="h-4 w-4" /> },
    { value: 'loan', label: 'Loans', icon: <Banknote className="h-4 w-4" /> },
    { value: 'insurance', label: 'Insurance', icon: <Shield className="h-4 w-4" /> },
    { value: 'welfare', label: 'Welfare', icon: <User className="h-4 w-4" /> },
    { value: 'infrastructure', label: 'Infrastructure', icon: <Tractor className="h-4 w-4" /> },
    { value: 'training', label: 'Training', icon: <GraduationCap className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="flex items-center gap-2">
              <Landmark className="h-8 w-8 text-blue-600" />
              Farmer Schemes & Support
            </span>
          </h1>
          <p className="text-gray-600">Discover farmer schemes and support benefits for farmers</p>
        </div>

        {/* Location Selector */}
        <LocationSelector
          location={location}
          onLocationChange={(loc: { state: string; district: string }) => setManualLocation(loc.state, loc.district)}
          onAutoLocation={getAutoLocation}
          loading={locationLoading}
          error={locationError}
        />

        {!location && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Landmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Required</h3>
              <p className="text-gray-600 mb-4">
                Please set your location above to view relevant farmer schemes and support programs.
              </p>
            </CardContent>
          </Card>
        )}

        {location && (
          <>
            {/* Search and Filter */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search schemes by name, department, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category.value)}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    {category.icon}
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>

            {loading && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Schemes</h3>
                  <p className="text-gray-600">
                    Fetching farmer schemes and support for {location.district}, {location.state}...
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Schemes Grid */}
            {!loading && filteredSchemes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSchemes.map((scheme) => (
                  <Card key={scheme.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(scheme.category)}
                          <span className="text-sm font-medium text-gray-600 capitalize">
                            {scheme.category}
                          </span>
                        </div>
                        {getStatusBadge(scheme.status)}
                      </div>
                      <CardTitle className="text-lg leading-tight">{scheme.name}</CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {scheme.department}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {scheme.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <IndianRupee className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{scheme.amount}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span>Duration: {scheme.duration}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span>Deadline: {scheme.deadline}</span>
                        </div>
                        
                        <div className="pt-2">
                          <Button 
                            onClick={() => setSelectedScheme(scheme)}
                            className="w-full"
                            size="sm"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && filteredSchemes.length === 0 && schemes.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schemes Found</h3>
                  <p className="text-gray-600 mb-4">
                    No schemes match your current search criteria. Try adjusting your filters.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Scheme Detail Modal */}
        {selectedScheme && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">{selectedScheme.name}</CardTitle>
                    <CardDescription>{selectedScheme.department}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedScheme(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-600">Amount</div>
                      <div className="font-semibold">{selectedScheme.amount}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-600">Duration</div>
                      <div className="font-semibold">{selectedScheme.duration}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="text-sm text-gray-600">Deadline</div>
                      <div className="font-semibold">{selectedScheme.deadline}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(selectedScheme.category)}
                    <div>
                      <div className="text-sm text-gray-600">Category</div>
                      <div className="font-semibold capitalize">{selectedScheme.category}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700">{selectedScheme.description}</p>
                </div>

                {/* Eligibility */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Eligibility Criteria</h4>
                  <ul className="space-y-1">
                    {selectedScheme.eligibility.map((criteria, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Benefits</h4>
                  <ul className="space-y-1">
                    {selectedScheme.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Required Documents */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Required Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedScheme.documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <FileText className="h-4 w-4 text-gray-600" />
                        {doc}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Application Process */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Application Process</h4>
                  <p className="text-sm text-gray-700">{selectedScheme.applicationProcess}</p>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-600 mt-1" />
                      <div>
                        <div className="text-sm font-medium">Office</div>
                        <div className="text-sm text-gray-700">{selectedScheme.contactInfo.office}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <div>
                        <div className="text-sm font-medium">Phone</div>
                        <div className="text-sm text-gray-700">{selectedScheme.contactInfo.phone}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <div>
                        <div className="text-sm font-medium">Email</div>
                        <div className="text-sm text-gray-700">{selectedScheme.contactInfo.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-gray-600" />
                      <div>
                        <div className="text-sm font-medium">Website</div>
                        <a 
                          href={selectedScheme.contactInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Visit Portal
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Apply Online
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Office
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Forms
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}