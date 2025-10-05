'use client';

import { useState, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Wallet,
  Target,
  IndianRupee,
  FileText,
  BarChart3
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const FarmFinancePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTerm, setLoanTerm] = useState(5);
  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Seeds', amount: 25000, date: '2024-08-15', type: 'expense' },
    { id: 2, category: 'Fertilizers', amount: 35000, date: '2024-08-20', type: 'expense' },
    { id: 3, category: 'Equipment', amount: 50000, date: '2024-09-01', type: 'expense' },
    { id: 4, category: 'Crop Sale', amount: 180000, date: '2024-09-15', type: 'income' },
    { id: 5, category: 'Labor', amount: 15000, date: '2024-09-10', type: 'expense' },
    { id: 6, category: 'Pesticides', amount: 8000, date: '2024-10-01', type: 'expense' },
    { id: 7, category: 'Vegetable Sale', amount: 45000, date: '2024-10-05', type: 'income' },
    { id: 8, category: 'Transportation', amount: 5000, date: '2024-10-03', type: 'expense' },
  ]);
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', type: 'expense', date: '' });
  const [timeFilter, setTimeFilter] = useState('current'); // current, 3m, 6m, 1y, 3y

  // Calculate loan EMI
  const calculateEMI = () => {
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                (Math.pow(1 + monthlyRate, numPayments) - 1);
    return emi;
  };

  // Calculate financial summary
  const calculateSummary = () => {
    const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const profit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;
    
    return { totalIncome, totalExpenses, profit, profitMargin };
  };

  const addExpense = () => {
    if (newExpense.category && newExpense.amount && newExpense.date) {
      const expense = {
        id: Date.now(),
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date,
        type: newExpense.type as 'income' | 'expense'
      };
      setExpenses([...expenses, expense]);
      setNewExpense({ category: '', amount: '', type: 'expense', date: '' });
    }
  };

  const summary = calculateSummary();
  const emi = calculateEMI();

  // Get filtered time period data
  const getFilteredProfitData = () => {
    const now = new Date();
    let monthsToShow = 6;

    // Determine how many months to show based on filter
    switch (timeFilter) {
      case 'current':
        monthsToShow = 1;
        break;
      case '3m':
        monthsToShow = 3;
        break;
      case '6m':
        monthsToShow = 6;
        break;
      case '1y':
        monthsToShow = 12;
        break;
      case '3y':
        monthsToShow = 36;
        break;
    }

    // Generate time period months
    const periodMonths: string[] = [];
    if (timeFilter === 'current') {
      // Only current month
      const currentMonthKey = now.toISOString().slice(0, 7);
      periodMonths.push(currentMonthKey);
    } else {
      // Historical months
      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toISOString().slice(0, 7);
        periodMonths.push(monthKey);
      }
    }

    // Filter transactions within the time period
    const filteredExpenses = expenses.filter(expense => {
      const expenseMonth = expense.date.slice(0, 7);
      return periodMonths.includes(expenseMonth);
    });

    // Format labels based on time period
    const formatLabel = (month: string) => {
      const date = new Date(month + '-01');
      if (timeFilter === 'current') {
        return 'Current Month';
      } else if (timeFilter === '1y' || timeFilter === '3y') {
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }
      return date.toLocaleDateString('en-US', { month: 'short' });
    };

    // If no transactions in period, show empty chart
    if (filteredExpenses.length === 0) {
      return {
        labels: periodMonths.map(formatLabel),
        datasets: [{
          label: 'Monthly Profit/Loss',
          data: new Array(monthsToShow).fill(0),
          backgroundColor: new Array(monthsToShow).fill('rgba(156, 163, 175, 0.5)'),
          borderColor: new Array(monthsToShow).fill('rgba(156, 163, 175, 1)'),
          borderWidth: 2,
        }]
      };
    }

    const monthlyData: { [key: string]: { income: number; expense: number } } = {};
    
    // Initialize all months with zero values
    periodMonths.forEach(month => {
      monthlyData[month] = { income: 0, expense: 0 };
    });

    // Aggregate filtered data by month
    filteredExpenses.forEach(expense => {
      const monthKey = expense.date.slice(0, 7);
      if (monthlyData[monthKey]) {
        if (expense.type === 'income') {
          monthlyData[monthKey].income += expense.amount;
        } else {
          monthlyData[monthKey].expense += expense.amount;
        }
      }
    });

    // Calculate monthly profit/loss
    const profitData = periodMonths.map(month => {
      return monthlyData[month].income - monthlyData[month].expense;
    });

    // Color bars based on profit/loss
    const backgroundColors = profitData.map(value => 
      value >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
    );
    const borderColors = profitData.map(value => 
      value >= 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'
    );

    return {
      labels: periodMonths.map(formatLabel),
      datasets: [{
        label: 'Monthly Profit/Loss',
        data: profitData,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    };
  };

  // Calculate summary for filtered period
  const getFilteredSummary = () => {
    const now = new Date();
    let monthsBack = 6;

    switch (timeFilter) {
      case 'current':
        monthsBack = 0; // Current month only
        break;
      case '3m':
        monthsBack = 3;
        break;
      case '6m':
        monthsBack = 6;
        break;
      case '1y':
        monthsBack = 12;
        break;
      case '3y':
        monthsBack = 36;
        break;
    }

    let filteredExpenses;
    
    if (timeFilter === 'current') {
      // Filter for current month only
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= currentMonthStart && expenseDate <= currentMonthEnd;
      });
    } else {
      // Filter for historical periods
      const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
      filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= cutoffDate;
      });
    }

    const totalIncome = filteredExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = filteredExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const profit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;
    
    return { totalIncome, totalExpenses, profit, profitMargin };
  };

  const filteredSummary = getFilteredSummary();

  const getCategoryData = () => {
    const categoryTotals: { [key: string]: number } = {};
    expenses.filter(e => e.type === 'expense').forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const categories = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals) as number[];
    const colors = [
      'rgba(239, 68, 68, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(251, 191, 36, 0.8)',
      'rgba(147, 51, 234, 0.8)',
      'rgba(236, 72, 153, 0.8)',
    ];

    return {
      labels: categories,
      datasets: [
        {
          data: values,
          backgroundColor: colors.slice(0, categories.length),
          borderColor: colors.slice(0, categories.length).map(color => color.replace('0.8', '1')),
          borderWidth: 1,
        }
      ]
    };
  };

  const simpleBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            const status = value >= 0 ? 'Profit' : 'Loss';
            return `${status}: ₹${Math.abs(value).toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        ticks: {
          callback: function(value: any) {
            return '₹' + Math.abs(value).toLocaleString();
          },
          color: '#6B7280',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return label + ': ₹' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-green-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Farm Finance
              </h1>
              <p className="text-gray-600 mt-1">Track your farm income, expenses and get government loans at low interest</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100/50 px-4 py-2 rounded-lg">
                <span className="text-sm text-green-700 font-medium">Financial Year 2024-25</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex space-x-1 bg-white/60 backdrop-blur-sm p-1 rounded-xl border border-green-100">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'loans', label: 'Loan Calculator', icon: Calculator },
            { id: 'expenses', label: 'Expense Tracker', icon: Wallet },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white/80'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    +12.5%
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium">Total Income</h3>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  ₹{summary.totalIncome.toLocaleString()}
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-red-100 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    +8.2%
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium">Total Expenses</h3>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  ₹{summary.totalExpenses.toLocaleString()}
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <PieChart className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    summary.profit >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                  }`}>
                    {summary.profitMargin.toFixed(1)}%
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium">
                  {summary.profit >= 0 ? 'Net Profit' : 'Net Loss'}
                </h3>
                <p className={`text-2xl font-bold mt-1 ${
                  summary.profit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ₹{Math.abs(summary.profit).toLocaleString()}
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    ROI
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium">Return on Investment</h3>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {summary.totalExpenses > 0 ? ((summary.profit / summary.totalExpenses) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>

            {/* Expense Tracker */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Wallet className="w-6 h-6 text-green-600 mr-2" />
                Add Income/Expense
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Category (e.g., Seeds, Fertilizer, Harvest Sale)"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="number"
                  placeholder="Amount ₹"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                />
                <select
                  value={newExpense.type}
                  onChange={(e) => setNewExpense({...newExpense, type: e.target.value as 'income' | 'expense'})}
                  className="px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className="px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={addExpense}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  Add Transaction
                </button>
              </div>
            </div>

            {/* Simple Profit/Loss Chart */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
                  Monthly Profit & Loss
                </h3>
                <select 
                  value={timeFilter} 
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="current">Current Month</option>
                  <option value="3m">Last 3 Months</option>
                  <option value="6m">Last 6 Months</option>
                  <option value="1y">Last 1 Year</option>
                  <option value="3y">Last 3 Years</option>
                </select>
              </div>
              <div className="h-80">
                {expenses.length > 0 ? (
                  <Bar data={getFilteredProfitData()} options={simpleBarChartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 rounded-xl">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                      <p className="text-gray-700 font-semibold text-lg">No data to display</p>
                      <p className="text-gray-500 mt-2">Add some transactions to see your profit/loss chart</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Simple Summary */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                  <p className="text-sm text-green-700 font-medium">Total Income</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ₹{filteredSummary.totalIncome.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl">
                  <p className="text-sm text-red-700 font-medium">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    ₹{filteredSummary.totalExpenses.toLocaleString()}
                  </p>
                </div>
                <div className={`text-center p-4 rounded-xl ${
                  filteredSummary.profit >= 0 
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100' 
                    : 'bg-gradient-to-r from-orange-50 to-orange-100'
                }`}>
                  <p className={`text-sm font-medium ${
                    filteredSummary.profit >= 0 ? 'text-blue-700' : 'text-orange-700'
                  }`}>
                    {filteredSummary.profit >= 0 ? 'Net Profit' : 'Net Loss'}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${
                    filteredSummary.profit >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    ₹{Math.abs(filteredSummary.profit).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Simple Explanation */}
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 text-center">
                  📊 <strong>How to read this chart:</strong> Green bars = Profit months, Red bars = Loss months. 
                  Taller bars = Higher amounts. This shows your monthly financial performance.
                </p>
              </div>
            </div>

            {/* Expense Categories Pie Chart */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <PieChart className="w-6 h-6 text-green-600 mr-2" />
                Expense Categories Breakdown
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  {expenses.filter(e => e.type === 'expense').length > 0 ? (
                    <Pie data={getCategoryData()} options={pieOptions} />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
                      <div className="text-center">
                        <PieChart className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">No expense data</p>
                        <p className="text-sm text-gray-500 mt-1">Add expense transactions to see breakdown</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {expenses.filter(e => e.type === 'expense').length > 0 ? (
                    [...new Set(expenses.filter(e => e.type === 'expense').map(e => e.category))].map((category, index) => {
                      const categoryTotal = expenses
                        .filter(e => e.type === 'expense' && e.category === category)
                        .reduce((sum, e) => sum + e.amount, 0);
                      const percentage = summary.totalExpenses > 0 ? (categoryTotal / summary.totalExpenses * 100).toFixed(1) : 0;
                      const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
                      return (
                        <div key={category} className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`}></div>
                            <span className="font-medium text-gray-800">{category}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">₹{categoryTotal.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">{percentage}%</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No expense categories to display</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FileText className="w-6 h-6 text-green-600 mr-2" />
                Recent Transactions
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {expenses.slice(-5).reverse().map((expense) => (
                  <div 
                    key={expense.id} 
                    className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-gray-100 hover:bg-white/80 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        expense.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {expense.type === 'income' ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <DollarSign className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{expense.category}</p>
                        <p className="text-sm text-gray-600">{new Date(expense.date).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${
                        expense.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {expense.type === 'income' ? '+' : '-'}₹{expense.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">{expense.type}</p>
                    </div>
                  </div>
                ))}
                {expenses.length === 0 && (
                  <div className="text-center py-8">
                    <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No transactions yet</p>
                    <p className="text-sm text-gray-400">Add your first transaction above</p>
                  </div>
                )}
              </div>
              {expenses.length > 5 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setActiveTab('expenses')}
                    className="text-green-600 hover:text-green-800 font-medium text-sm"
                  >
                    View all transactions →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'loans' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Loan Calculator */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Calculator className="w-6 h-6 text-green-600 mr-2" />
                  Loan Calculator
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter loan amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interest Rate (% per annum)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter interest rate"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Term (years)
                    </label>
                    <input
                      type="number"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter loan term in years"
                    />
                  </div>
                </div>
              </div>

              {/* Loan Results */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <IndianRupee className="w-6 h-6 text-blue-600 mr-2" />
                  Loan Details
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                    <p className="text-sm text-gray-600">Monthly EMI</p>
                    <p className="text-2xl font-bold text-green-600">₹{emi.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <p className="text-sm text-gray-600">Total Interest</p>
                    <p className="text-xl font-bold text-blue-600">
                      ₹{(emi * loanTerm * 12 - loanAmount).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <p className="text-sm text-gray-600">Total Amount Payable</p>
                    <p className="text-xl font-bold text-purple-600">
                      ₹{(emi * loanTerm * 12).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </p>
                  </div>
                </div>

                {/* Government Loan Schemes */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Central Government Schemes</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-green-800">Kisan Credit Card (KCC)</span>
                        <span className="text-sm text-green-600 font-semibold">7% Interest</span>
                      </div>
                      <p className="text-xs text-green-700 mb-2">Flexible loan for crop production, maintenance of farm assets</p>
                      <div className="flex gap-3">
                        <a 
                          href="https://www.myscheme.gov.in/schemes/kcc" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-green-600 hover:text-green-800 font-medium underline"
                        >
                          Gov Portal →
                        </a>
                        <a 
                          href="https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-green-600 hover:text-green-800 font-medium underline"
                        >
                          SBI Apply →
                        </a>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-blue-800">PM-KISAN Beneficiary Scheme</span>
                        <span className="text-sm text-blue-600 font-semibold">₹6000/year</span>
                      </div>
                      <p className="text-xs text-blue-700 mb-2">Direct income support for small and marginal farmers</p>
                      <div className="flex gap-3">
                        <a 
                          href="https://pmkisan.gov.in/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                        >
                          Official Portal →
                        </a>
                        <a 
                          href="https://services.india.gov.in/service/detail/register-as-a-new-farmer-for-pradhan-mantri-kisan-samman-nidhi-pm-kisan" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                        >
                          New Registration →
                        </a>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-purple-800">Agriculture Infrastructure Fund</span>
                        <span className="text-sm text-purple-600 font-semibold">3% Interest</span>
                      </div>
                      <p className="text-xs text-purple-700 mb-2">₹1 Lakh Crore fund for farm-gate infrastructure</p>
                      <div className="flex gap-3">
                        <a 
                          href="https://www.pib.gov.in/PressNoteDetails.aspx?NoteId=152061&ModuleId=3" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-purple-600 hover:text-purple-800 font-medium underline"
                        >
                          Scheme Info →
                        </a>
                        <a 
                          href="https://www.hdfcbank.com/agri/gov-schemes/agriculture-infrastructure-fund" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-purple-600 hover:text-purple-800 font-medium underline"
                        >
                          HDFC Apply →
                        </a>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-orange-800">MUDRA Loan for Farmers</span>
                        <span className="text-sm text-orange-600 font-semibold">8-10% Interest</span>
                      </div>
                      <p className="text-xs text-orange-700 mb-2">Up to ₹10 lakh for farm equipment and allied activities</p>
                      <div className="flex gap-3">
                        <a 
                          href="https://bankofmaharashtra.in/pradhan-mantri-mudra-yojana" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-orange-600 hover:text-orange-800 font-medium underline"
                        >
                          BOM Portal →
                        </a>
                        <a 
                          href="https://sbi.co.in/web/agri-rural/pradhan-mantri-mudra-yojna" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-orange-600 hover:text-orange-800 font-medium underline"
                        >
                          SBI Apply →
                        </a>
                      </div>
                    </div>

                    <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-teal-800">NABARD Refinance Scheme</span>
                        <span className="text-sm text-teal-600 font-semibold">Variable Rate</span>
                      </div>
                      <p className="text-xs text-teal-700 mb-2">Agricultural loans through cooperative banks and RRBs</p>
                      <a 
                        href="https://www.nabard.org/content.aspx?id=548" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-teal-600 hover:text-teal-800 font-medium underline"
                      >
                        Official Portal →
                      </a>
                    </div>

                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-indigo-800">Stand Up India Scheme</span>
                        <span className="text-sm text-indigo-600 font-semibold">₹10L-₹1Cr</span>
                      </div>
                      <p className="text-xs text-indigo-700 mb-2">Bank loans for SC/ST and women entrepreneurs in agriculture</p>
                      <div className="flex gap-3">
                        <a 
                          href="https://www.hdfcbank.com/sme/msme-government-schemes/stand-up-india-scheme" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
                        >
                          HDFC Info →
                        </a>
                        <a 
                          href="https://bankofmaharashtra.in/stand-up-india" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
                        >
                          BOM Apply →
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                      <span className="text-sm font-medium text-rose-800">PM Fasal Bima Yojana</span>
                      <p className="text-xs text-rose-700 mt-1">Crop insurance scheme for farmers</p>
                      <a 
                        href="https://pmfby.gov.in/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-rose-600 hover:text-rose-800 font-medium underline mt-1"
                      >
                        Official Portal →
                      </a>
                    </div>
                    
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="text-sm font-medium text-emerald-800">PM Kisan FPO Scheme</span>
                      <p className="text-xs text-emerald-700 mt-1">Support for Farmer Producer Organizations</p>
                      <div className="flex gap-2 mt-1">
                        <a 
                          href="https://www.apnikheti.com/en/pn/govt-schemes-details/pm-kisan-fpo-yojana-2021" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-emerald-600 hover:text-emerald-800 font-medium underline"
                        >
                          Info →
                        </a>
                        <a 
                          href="https://www.bookmycrop.com/blog-details/how-to-apply-under-pm-kisan-farmer-producer-organisation-fpo-yojna" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-emerald-600 hover:text-emerald-800 font-medium underline"
                        >
                          Apply →
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      <strong>Note:</strong> All links verified as of October 2025. Interest rates may vary by bank and are subject to government subsidies. 
                      Contact your nearest bank branch for current rates and eligibility. For state-specific schemes, 
                      visit your state agriculture department website.
                    </p>
                  </div>

                  {/* Major Banks for Agriculture Loans */}
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Apply Directly at Major Banks (October 2025 Verified):</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <a 
                        href="https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-100 rounded text-center text-xs text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        SBI Agri Loans
                      </a>
                      <a 
                        href="https://www.pnbindia.in/Agricultural-Loans.html" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-green-100 rounded text-center text-xs text-green-700 hover:bg-green-200 transition-colors"
                      >
                        PNB Agri Loans
                      </a>
                      <a 
                        href="https://www.hdfcbank.com/personal/borrow/popular-loans/kisan-credit-card" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-red-100 rounded text-center text-xs text-red-700 hover:bg-red-200 transition-colors"
                      >
                        HDFC KCC
                      </a>
                      <a 
                        href="https://www.icicibank.com/personal-banking/loans/rural-and-agri-loans" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-orange-100 rounded text-center text-xs text-orange-700 hover:bg-orange-200 transition-colors"
                      >
                        ICICI Agri Loans
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-6">
            {/* Add New Expense */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Wallet className="w-6 h-6 text-green-600 mr-2" />
                Add Transaction
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Category"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                />
                <select
                  value={newExpense.type}
                  onChange={(e) => setNewExpense({...newExpense, type: e.target.value as 'income' | 'expense'})}
                  className="px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className="px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={addExpense}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Expenses List */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Transaction History</h3>
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div 
                    key={expense.id} 
                    className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        expense.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {expense.type === 'income' ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <DollarSign className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{expense.category}</p>
                        <p className="text-sm text-gray-600">{expense.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        expense.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {expense.type === 'income' ? '+' : '-'}₹{expense.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">{expense.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default FarmFinancePage;