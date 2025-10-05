const express = require('express');
const router = express.Router();

// Mock data for government schemes
const generateSchemes = (state, district) => {
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
        office: `District Agriculture Office, ${district}`,
        phone: '1800-115-526',
        email: 'pmkisan-ict@gov.in',
        website: 'https://pmkisan.gov.in'
      },
      status: 'active',
      deadline: 'No deadline - Ongoing',
      description: 'Income support scheme providing ₹6,000 per year to small and marginal farmers.',
      targetGroup: ['Small Farmers', 'Marginal Farmers'],
      state: state,
      district: district
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
        office: `Agriculture Insurance Company, ${district}`,
        phone: '1800-180-1551',
        email: 'info@pmfby.gov.in',
        website: 'https://pmfby.gov.in'
      },
      status: 'active',
      deadline: 'Varies by crop season',
      description: 'Crop insurance scheme protecting farmers against crop loss due to natural calamities.',
      targetGroup: ['All Farmers', 'Tenant Farmers'],
      state: state,
      district: district
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
        office: `District Lead Bank, ${district}`,
        phone: '1800-180-1111',
        email: 'kcc@nabard.org',
        website: 'https://www.nabard.org/kcc'
      },
      status: 'active',
      deadline: 'No deadline - Ongoing',
      description: 'Credit facility for farmers to meet their agricultural and allied activities expenses.',
      targetGroup: ['Active Farmers', 'Agricultural Workers'],
      state: state,
      district: district
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
        office: `Soil Testing Laboratory, ${district}`,
        phone: '1800-180-1234',
        email: 'soilhealth@gov.in',
        website: 'https://soilhealth.dac.gov.in'
      },
      status: 'active',
      deadline: 'No deadline - Ongoing',
      description: 'Provides soil health cards to farmers with crop-wise recommendations.',
      targetGroup: ['All Farmers'],
      state: state,
      district: district
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
        office: `District Collector Office, ${district}`,
        phone: '1800-180-6677',
        email: 'pmksy@nic.in',
        website: 'https://pmksy.gov.in'
      },
      status: 'active',
      deadline: 'March 31, 2024',
      description: 'Micro irrigation scheme for efficient water usage and higher crop productivity.',
      targetGroup: ['Progressive Farmers', 'Water-Stressed Areas'],
      state: state,
      district: district
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
        office: `NABARD Regional Office, ${state}`,
        phone: '1800-200-2110',
        email: 'fpo@nabard.org',
        website: 'https://www.nabard.org/content1.aspx?id=1752'
      },
      status: 'active',
      deadline: 'December 31, 2024',
      description: 'Support for formation and promotion of Farmer Producer Organizations.',
      targetGroup: ['Farmer Groups', 'Cooperatives'],
      state: state,
      district: district
    },
    // Add more state-specific schemes based on location
    ...(state === 'Punjab' ? [
      {
        id: 'pb1',
        name: 'Punjab Crop Diversification Scheme',
        category: 'subsidy',
        department: 'Department of Agriculture, Punjab',
        amount: '₹17,500 per hectare',
        duration: 'Annual',
        eligibility: [
          'Punjab resident farmers',
          'Shifting from paddy to alternative crops',
          'Valid land records'
        ],
        benefits: [
          'Direct benefit transfer',
          'Crop diversification support',
          'Reduced water usage'
        ],
        documents: [
          'Land Records',
          'Aadhaar Card',
          'Bank Details'
        ],
        applicationProcess: 'Apply through Punjab Agriculture Department portal',
        contactInfo: {
          office: `Agriculture Department, ${district}, Punjab`,
          phone: '0172-2970605',
          email: 'agripb@gov.in',
          website: 'https://agri.punjab.gov.in'
        },
        status: 'active',
        deadline: 'April 30, 2024',
        description: 'Incentive scheme to promote crop diversification from paddy to alternative crops.',
        targetGroup: ['Punjab Farmers'],
        state: state,
        district: district
      }
    ] : []),
    ...(state === 'Maharashtra' ? [
      {
        id: 'mh1',
        name: 'Maharashtra Krishi Vikas Yojana',
        category: 'infrastructure',
        department: 'Agriculture Department, Maharashtra',
        amount: '50% subsidy up to ₹50,000',
        duration: 'One-time',
        eligibility: [
          'Maharashtra resident farmers',
          'Farm mechanization needs',
          'Small and marginal farmers priority'
        ],
        benefits: [
          'Farm equipment subsidy',
          'Custom hiring centers',
          'Technology adoption'
        ],
        documents: [
          'Residence Proof',
          'Land Documents',
          'Income Certificate'
        ],
        applicationProcess: 'Apply through Krishi Vibhag offices or online portal',
        contactInfo: {
          office: `Krishi Vibhag, ${district}, Maharashtra`,
          phone: '022-22027990',
          email: 'agrimh@gov.in',
          website: 'https://krishi.maharashtra.gov.in'
        },
        status: 'active',
        deadline: 'March 31, 2024',
        description: 'State scheme for agricultural development and mechanization.',
        targetGroup: ['Maharashtra Farmers'],
        state: state,
        district: district
      }
    ] : [])
  ];
};

// Government schemes endpoint
router.get('/schemes/:state/:district', (req, res) => {
  try {
    const { state, district } = req.params;
    const schemes = generateSchemes(state, district);
    res.json({
      schemes,
      location: { state, district },
      totalSchemes: schemes.length,
      categories: {
        subsidy: schemes.filter(s => s.category === 'subsidy').length,
        loan: schemes.filter(s => s.category === 'loan').length,
        insurance: schemes.filter(s => s.category === 'insurance').length,
        welfare: schemes.filter(s => s.category === 'welfare').length,
        infrastructure: schemes.filter(s => s.category === 'infrastructure').length,
        training: schemes.filter(s => s.category === 'training').length
      }
    });
  } catch (error) {
    console.error('Error fetching schemes:', error);
    res.status(500).json({ error: 'Failed to fetch government schemes' });
  }
});

// Get specific scheme details
router.get('/scheme/:id', (req, res) => {
  try {
    const { id } = req.params;
    // In a real implementation, this would query a database
    // For now, return a mock response
    res.json({
      message: 'Scheme details endpoint',
      schemeId: id
    });
  } catch (error) {
    console.error('Error fetching scheme details:', error);
    res.status(500).json({ error: 'Failed to fetch scheme details' });
  }
});

// Search schemes endpoint
router.get('/schemes/search/:state/:district', (req, res) => {
  try {
    const { state, district } = req.params;
    const { category, search } = req.query;
    
    let schemes = generateSchemes(state, district);
    
    if (category && category !== 'all') {
      schemes = schemes.filter(scheme => scheme.category === category);
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      schemes = schemes.filter(scheme =>
        scheme.name.toLowerCase().includes(searchTerm) ||
        scheme.description.toLowerCase().includes(searchTerm) ||
        scheme.department.toLowerCase().includes(searchTerm)
      );
    }
    
    res.json({
      schemes,
      location: { state, district },
      totalResults: schemes.length,
      searchCriteria: { category, search }
    });
  } catch (error) {
    console.error('Error searching schemes:', error);
    res.status(500).json({ error: 'Failed to search schemes' });
  }
});

module.exports = router;