'use client';

import { useState } from 'react';
import { 
  Award, 
  IndianRupee, 
  Users, 
  BookOpen, 
  Shield, 
  Tractor,
  Heart,
  Building,
  FileText,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  Star
} from 'lucide-react';

const FarmerSchemesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const schemes = [
    {
      id: 1,
      title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      description: 'Direct income support of ₹6,000 per year to all farmer families',
      category: 'financial',
      amount: '₹6,000/year',
      eligibility: 'All landholding farmer families',
      documents: ['Aadhaar Card', 'Bank Account', 'Land Records'],
      status: 'active',
      applicationLink: 'https://pmkisan.gov.in/',
      helpline: '011-24300606',
      rating: 4.8
    },
    {
      id: 2,
      title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      description: 'Crop insurance scheme protecting farmers against crop losses',
      category: 'insurance',
      amount: 'Up to ₹2 Lakh',
      eligibility: 'All farmers growing notified crops',
      documents: ['Aadhaar Card', 'Bank Account', 'Land Records', 'Sowing Certificate'],
      status: 'active',
      applicationLink: 'https://pmfby.gov.in/',
      helpline: '011-23381092',
      rating: 4.5
    },
    {
      id: 3,
      title: 'Kisan Credit Card (KCC)',
      description: 'Credit facility for farmers to meet agricultural expenses',
      category: 'credit',
      amount: 'Up to ₹3 Lakh',
      eligibility: 'All farmers including tenant farmers',
      documents: ['Aadhaar Card', 'PAN Card', 'Land Records', 'Income Certificate'],
      status: 'active',
      applicationLink: 'https://pmkisan.gov.in/KccApplication.aspx',
      helpline: '1800-180-1551',
      rating: 4.6
    },
    {
      id: 4,
      title: 'PM Kisan Maan Dhan Yojana',
      description: 'Pension scheme for small and marginal farmers',
      category: 'pension',
      amount: '₹3,000/month after 60',
      eligibility: 'Small & marginal farmers (18-40 years)',
      documents: ['Aadhaar Card', 'Savings Bank Account', 'Land Records'],
      status: 'active',
      applicationLink: 'https://maandhan.in/',
      helpline: '1800-267-6888',
      rating: 4.3
    },
    {
      id: 5,
      title: 'National Agriculture Market (e-NAM)',
      description: 'Online trading platform for agricultural commodities',
      category: 'market',
      amount: 'Better prices',
      eligibility: 'All farmers',
      documents: ['Aadhaar Card', 'Bank Account'],
      status: 'active',
      applicationLink: 'https://enam.gov.in/',
      helpline: '1800-270-0224',
      rating: 4.2
    },
    {
      id: 6,
      title: 'Soil Health Card Scheme',
      description: 'Free soil testing and health cards for farmers',
      category: 'technology',
      amount: 'Free',
      eligibility: 'All farmers',
      documents: ['Aadhaar Card', 'Land Records'],
      status: 'active',
      applicationLink: 'https://soilhealth.dac.gov.in/',
      helpline: '011-23382012',
      rating: 4.4
    }
  ];

  const categories = {
    all: { name: 'All Schemes', icon: Award, color: 'bg-blue-500' },
    financial: { name: 'Financial Support', icon: IndianRupee, color: 'bg-green-500' },
    insurance: { name: 'Insurance', icon: Shield, color: 'bg-red-500' },
    credit: { name: 'Credit & Loans', icon: Building, color: 'bg-purple-500' },
    pension: { name: 'Pension', icon: Heart, color: 'bg-pink-500' },
    market: { name: 'Market Access', icon: Users, color: 'bg-orange-500' },
    technology: { name: 'Technology', icon: Tractor, color: 'bg-indigo-500' }
  };

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeColor = (category: string) => {
    const colors: { [key: string]: string } = {
      financial: 'bg-green-100 text-green-700',
      insurance: 'bg-red-100 text-red-700',
      credit: 'bg-purple-100 text-purple-700',
      pension: 'bg-pink-100 text-pink-700',
      market: 'bg-orange-100 text-orange-700',
      technology: 'bg-indigo-100 text-indigo-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Farmer Schemes & Support</h1>
              <p className="text-gray-600">Discover government schemes and support programs</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search schemes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/70 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/70 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
            >
              {Object.entries(categories).map(([key, category]) => (
                <option key={key} value={key}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === key
                      ? `${category.color} text-white shadow-lg`
                      : 'bg-white/70 text-gray-700 hover:bg-white border border-blue-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 shadow-lg text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">15+</div>
            <div className="text-sm text-gray-600">Active Schemes</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 shadow-lg text-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <IndianRupee className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">₹50K+</div>
            <div className="text-sm text-gray-600">Avg. Benefit</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 shadow-lg text-center">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">10M+</div>
            <div className="text-sm text-gray-600">Beneficiaries</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 shadow-lg text-center">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">24/7</div>
            <div className="text-sm text-gray-600">Support Available</div>
          </div>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSchemes.map(scheme => (
            <div key={scheme.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{scheme.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(scheme.category)}`}>
                      {(categories as any)[scheme.category]?.name}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{scheme.description}</p>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-1">
                      <IndianRupee className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">{scheme.amount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{scheme.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Eligibility</span>
                  <p className="text-sm text-gray-700">{scheme.eligibility}</p>
                </div>

                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Documents Required</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {scheme.documents.map((doc, index) => (
                      <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{scheme.helpline}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <FileText className="h-4 w-4" />
                      <span>Details</span>
                    </button>
                    <a
                      href={scheme.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Need Help with Applications?</h2>
            <p className="text-blue-100 mb-6">Our support team is here to help you navigate through scheme applications</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <Phone className="h-6 w-6" />
                </div>
                <div className="font-semibold">Call Support</div>
                <div className="text-blue-100 text-sm">1800-123-4567</div>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="font-semibold">Email Support</div>
                <div className="text-blue-100 text-sm">support@farmerschemes.gov.in</div>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="font-semibold">Visit Office</div>
                <div className="text-blue-100 text-sm">Find nearest CSC center</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerSchemesPage;