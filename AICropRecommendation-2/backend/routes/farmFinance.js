// Farm Finance API routes
const express = require('express');
const router = express.Router();

// Calculate loan EMI
router.post('/calculate-emi', (req, res) => {
  try {
    const { loanAmount, interestRate, loanTerm } = req.body;

    if (!loanAmount || !interestRate || !loanTerm) {
      return res.status(400).json({ 
        error: 'Loan amount, interest rate, and loan term are required' 
      });
    }

    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    const totalPayment = emi * numPayments;
    const totalInterest = totalPayment - loanAmount;

    res.json({
      emi: Math.round(emi * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      monthlyRate: monthlyRate * 100,
      breakdown: {
        principal: loanAmount,
        interest: Math.round(totalInterest * 100) / 100,
        tenure: loanTerm,
        monthlyEmi: Math.round(emi * 100) / 100
      }
    });
  } catch (error) {
    console.error('EMI calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate EMI' });
  }
});

// Get loan schemes
router.get('/loan-schemes', (req, res) => {
  try {
    const loanSchemes = [
      {
        id: 1,
        name: 'Kisan Credit Card (KCC)',
        interestRate: 7,
        maxAmount: 500000,
        tenure: 5,
        features: ['Flexible repayment', 'Interest subvention', 'Crop insurance'],
        eligibility: 'All farmers with land documents',
        description: 'Short-term credit for crop cultivation and allied activities'
      },
      {
        id: 2,
        name: 'Crop Loan',
        interestRate: 8.5,
        maxAmount: 300000,
        tenure: 1,
        features: ['Seasonal loan', 'Quick processing', 'Minimal documentation'],
        eligibility: 'Farmers with clear land title',
        description: 'Short-term loans for seasonal crop production'
      },
      {
        id: 3,
        name: 'Farm Equipment Loan',
        interestRate: 9.5,
        maxAmount: 2000000,
        tenure: 7,
        features: ['Asset-backed', 'Tax benefits', 'Processing fee waiver'],
        eligibility: 'Farmers and FPOs',
        description: 'Long-term loans for purchasing farm machinery and equipment'
      },
      {
        id: 4,
        name: 'Dairy Development Loan',
        interestRate: 8,
        maxAmount: 1000000,
        tenure: 5,
        features: ['Cattle insurance', 'Technical support', 'Market linkage'],
        eligibility: 'Dairy farmers and cooperatives',
        description: 'Loans for dairy farming and milk production activities'
      },
      {
        id: 5,
        name: 'Horticulture Loan',
        interestRate: 8.5,
        maxAmount: 750000,
        tenure: 6,
        features: ['Plantation support', 'Post-harvest loans', 'Cold storage finance'],
        eligibility: 'Horticulture farmers',
        description: 'Specialized loans for fruit and vegetable cultivation'
      }
    ];

    res.json({
      schemes: loanSchemes,
      totalSchemes: loanSchemes.length
    });
  } catch (error) {
    console.error('Loan schemes error:', error);
    res.status(500).json({ error: 'Failed to fetch loan schemes' });
  }
});

// Get insurance schemes
router.get('/insurance-schemes', (req, res) => {
  try {
    const insuranceSchemes = [
      {
        id: 1,
        name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        type: 'Crop Insurance',
        premium: '2% for Kharif, 1.5% for Rabi',
        coverage: 'Up to ₹2 lakh per hectare',
        features: ['Weather risks', 'Pest attacks', 'Natural disasters'],
        eligibility: 'All farmers including sharecroppers and tenant farmers'
      },
      {
        id: 2,
        name: 'Weather Based Crop Insurance Scheme',
        type: 'Weather Insurance',
        premium: '3-5% of sum insured',
        coverage: 'Based on weather parameters',
        features: ['Rainfall', 'Temperature', 'Humidity', 'Wind speed'],
        eligibility: 'Farmers in notified areas'
      },
      {
        id: 3,
        name: 'Livestock Insurance Scheme',
        type: 'Livestock Insurance',
        premium: '3-4% of animal value',
        coverage: 'Up to ₹60,000 per animal',
        features: ['Death coverage', 'Disease protection', 'Accident coverage'],
        eligibility: 'All livestock owners'
      },
      {
        id: 4,
        name: 'Farm Equipment Insurance',
        type: 'Equipment Insurance',
        premium: '2-4% of equipment value',
        coverage: 'Comprehensive coverage',
        features: ['Theft', 'Fire', 'Natural disasters', 'Mechanical breakdown'],
        eligibility: 'Equipment owners'
      }
    ];

    res.json({
      schemes: insuranceSchemes,
      totalSchemes: insuranceSchemes.length
    });
  } catch (error) {
    console.error('Insurance schemes error:', error);
    res.status(500).json({ error: 'Failed to fetch insurance schemes' });
  }
});

// Get subsidies information
router.get('/subsidies', (req, res) => {
  try {
    const { state, district } = req.query;

    const subsidies = [
      {
        id: 1,
        name: 'Seeds Subsidy',
        category: 'Input Subsidy',
        amount: '50% of seed cost',
        maxLimit: 25000,
        eligibility: 'Small and marginal farmers',
        documents: ['Land records', 'Aadhaar card', 'Bank account'],
        applicationProcess: 'Apply through Common Service Center or Agriculture Department',
        status: 'Active'
      },
      {
        id: 2,
        name: 'Fertilizer Subsidy',
        category: 'Input Subsidy',
        amount: 'Direct Benefit Transfer',
        maxLimit: 50000,
        eligibility: 'All farmers with Aadhaar',
        documents: ['Aadhaar card', 'Bank account', 'Soil health card'],
        applicationProcess: 'Automatic through DBT system',
        status: 'Active'
      },
      {
        id: 3,
        name: 'Drip Irrigation Subsidy',
        category: 'Infrastructure Subsidy',
        amount: '55% for small farmers, 45% for others',
        maxLimit: 100000,
        eligibility: 'Farmers with assured water source',
        documents: ['Water source certificate', 'Land documents', 'Technical proposal'],
        applicationProcess: 'Apply through Agriculture Department',
        status: 'Active'
      },
      {
        id: 4,
        name: 'Solar Pump Subsidy',
        category: 'Equipment Subsidy',
        amount: '70% of pump cost',
        maxLimit: 175000,
        eligibility: 'Farmers in grid-connected areas',
        documents: ['Electricity connection proof', 'Land documents', 'Technical feasibility'],
        applicationProcess: 'Apply through MNRE portal',
        status: 'Active'
      },
      {
        id: 5,
        name: 'Farm Mechanization Subsidy',
        category: 'Equipment Subsidy',
        amount: '25-80% depending on category',
        maxLimit: 500000,
        eligibility: 'Individual/Group of farmers',
        documents: ['Purchase invoice', 'Bank account', 'Land documents'],
        applicationProcess: 'Apply through DBT Agriculture portal',
        status: 'Active'
      }
    ];

    // Filter by location if provided
    let filteredSubsidies = subsidies;
    if (state || district) {
      // In a real application, you would filter based on location-specific schemes
      filteredSubsidies = subsidies; // For now, return all schemes
    }

    res.json({
      subsidies: filteredSubsidies,
      location: { state, district },
      totalSubsidies: filteredSubsidies.length
    });
  } catch (error) {
    console.error('Subsidies error:', error);
    res.status(500).json({ error: 'Failed to fetch subsidies information' });
  }
});

// Calculate insurance premium
router.post('/calculate-insurance-premium', (req, res) => {
  try {
    const { insuranceType, cropValue, coverageType } = req.body;

    if (!insuranceType || !cropValue) {
      return res.status(400).json({ 
        error: 'Insurance type and crop value are required' 
      });
    }

    let premiumRate = 0;
    let coverageAmount = cropValue;

    switch (insuranceType) {
      case 'pmfby-kharif':
        premiumRate = 2;
        break;
      case 'pmfby-rabi':
        premiumRate = 1.5;
        break;
      case 'weather-based':
        premiumRate = 4;
        break;
      case 'livestock':
        premiumRate = 3.5;
        coverageAmount = Math.min(cropValue, 60000);
        break;
      case 'equipment':
        premiumRate = 3;
        break;
      default:
        premiumRate = 2.5;
    }

    const premiumAmount = (coverageAmount * premiumRate) / 100;
    const governmentSubsidy = premiumAmount * 0.8; // 80% government subsidy
    const farmerShare = premiumAmount - governmentSubsidy;

    res.json({
      coverageAmount,
      premiumAmount: Math.round(premiumAmount * 100) / 100,
      premiumRate,
      farmerShare: Math.round(farmerShare * 100) / 100,
      governmentSubsidy: Math.round(governmentSubsidy * 100) / 100,
      insuranceType,
      breakdown: {
        totalPremium: Math.round(premiumAmount * 100) / 100,
        farmerContribution: Math.round(farmerShare * 100) / 100,
        governmentContribution: Math.round(governmentSubsidy * 100) / 100
      }
    });
  } catch (error) {
    console.error('Insurance premium calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate insurance premium' });
  }
});

// Financial analysis endpoint
router.post('/financial-analysis', (req, res) => {
  try {
    const { expenses } = req.body;

    if (!expenses || !Array.isArray(expenses)) {
      return res.status(400).json({ 
        error: 'Expenses array is required' 
      });
    }

    const totalIncome = expenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalExpenses = expenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);

    const profit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;
    const roi = totalExpenses > 0 ? (profit / totalExpenses) * 100 : 0;

    // Category-wise breakdown
    const categoryBreakdown = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = { income: 0, expense: 0, net: 0 };
      }
      
      if (expense.type === 'income') {
        acc[expense.category].income += expense.amount;
      } else {
        acc[expense.category].expense += expense.amount;
      }
      
      acc[expense.category].net = acc[expense.category].income - acc[expense.category].expense;
      
      return acc;
    }, {});

    // Monthly breakdown
    const monthlyBreakdown = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toISOString().slice(0, 7); // YYYY-MM format
      
      if (!acc[month]) {
        acc[month] = { income: 0, expense: 0, net: 0 };
      }
      
      if (expense.type === 'income') {
        acc[month].income += expense.amount;
      } else {
        acc[month].expense += expense.amount;
      }
      
      acc[month].net = acc[month].income - acc[month].expense;
      
      return acc;
    }, {});

    res.json({
      summary: {
        totalIncome,
        totalExpenses,
        profit,
        profitMargin: Math.round(profitMargin * 100) / 100,
        roi: Math.round(roi * 100) / 100
      },
      categoryBreakdown,
      monthlyBreakdown,
      recommendations: generateFinancialRecommendations(profit, profitMargin, roi)
    });
  } catch (error) {
    console.error('Financial analysis error:', error);
    res.status(500).json({ error: 'Failed to perform financial analysis' });
  }
});

// Generate financial recommendations
function generateFinancialRecommendations(profit, profitMargin, roi) {
  const recommendations = [];

  if (profit < 0) {
    recommendations.push({
      type: 'warning',
      title: 'Negative Profit',
      message: 'Your expenses are exceeding income. Consider cost optimization strategies.',
      action: 'Review and reduce unnecessary expenses'
    });
  }

  if (profitMargin < 10) {
    recommendations.push({
      type: 'caution',
      title: 'Low Profit Margin',
      message: 'Profit margin is below 10%. Look for ways to increase efficiency.',
      action: 'Focus on high-value crops or reduce input costs'
    });
  }

  if (roi < 15) {
    recommendations.push({
      type: 'info',
      title: 'Improve ROI',
      message: 'Return on investment could be better. Consider diversification.',
      action: 'Explore value-added farming or new crop varieties'
    });
  }

  if (profit > 0 && profitMargin > 15) {
    recommendations.push({
      type: 'success',
      title: 'Good Performance',
      message: 'Your farm is performing well. Consider expansion opportunities.',
      action: 'Invest in modern equipment or increase production'
    });
  }

  return recommendations;
}

module.exports = router;