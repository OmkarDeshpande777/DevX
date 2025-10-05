'use client';

import React, { useState, useEffect } from 'react';

interface Crop {
  id: string;
  cropName: string;
  fieldName: string;
  area: number;
  sowingDate: string;
  harvestDate: string;
  state: string;
  market: string;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  cropId: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  notes: string;
  completed: boolean;
  createdAt: string;
}

interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  timestamp: number;
}

const CropDatabase = {
  'indo-gangetic': {
    crops: [
      {
        name: 'Wheat',
        sowingStart: { month: 10, day: 15 },
        sowingEnd: { month: 11, day: 30 },
        harvestDuration: 120,
        idealTemp: { min: 15, max: 25 },
        idealRainfall: { min: 5, max: 15 }
      },
      {
        name: 'Rice',
        sowingStart: { month: 5, day: 1 },
        sowingEnd: { month: 7, day: 15 },
        harvestDuration: 150,
        idealTemp: { min: 20, max: 35 },
        idealRainfall: { min: 50, max: 200 }
      }
    ]
  },
  'southern-plateau': {
    crops: [
      {
        name: 'Rice',
        sowingStart: { month: 5, day: 1 },
        sowingEnd: { month: 7, day: 31 },
        harvestDuration: 120,
        idealTemp: { min: 20, max: 30 },
        idealRainfall: { min: 100, max: 250 }
      },
      {
        name: 'Coconut',
        sowingStart: { month: 6, day: 1 },
        sowingEnd: { month: 9, day: 30 },
        harvestDuration: 365,
        idealTemp: { min: 25, max: 35 },
        idealRainfall: { min: 150, max: 300 }
      }
    ]
  },
  'western-coastal': {
    crops: [
      {
        name: 'Coconut',
        sowingStart: { month: 5, day: 1 },
        sowingEnd: { month: 8, day: 31 },
        harvestDuration: 365,
        idealTemp: { min: 25, max: 32 },
        idealRainfall: { min: 200, max: 400 }
      },
      {
        name: 'Pepper',
        sowingStart: { month: 5, day: 1 },
        sowingEnd: { month: 7, day: 31 },
        harvestDuration: 240,
        idealTemp: { min: 20, max: 30 },
        idealRainfall: { min: 150, max: 300 }
      }
    ]
  }
};

const CropCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [crops, setCrops] = useState<Crop[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedCity, setSelectedCity] = useState('Thiruvananthapuram');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  useEffect(() => {
    // Load data from localStorage
    const savedCrops = localStorage.getItem('farmAssistant_crops');
    const savedTasks = localStorage.getItem('farmAssistant_tasks');
    
    if (savedCrops) setCrops(JSON.parse(savedCrops));
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    // Simulate weather data
    setWeatherData({
      city: selectedCity,
      temperature: 28,
      description: 'Partly Cloudy',
      icon: '/api/placeholder/40/40',
      humidity: 75,
      precipitation: 2.5,
      windSpeed: 12,
      timestamp: Date.now()
    });
  }, [selectedCity]);

  const saveCrops = (newCrops: Crop[]) => {
    setCrops(newCrops);
    localStorage.setItem('farmAssistant_crops', JSON.stringify(newCrops));
  };

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('farmAssistant_tasks', JSON.stringify(newTasks));
  };

  const addCrop = (cropData: Omit<Crop, 'id' | 'createdAt'>) => {
    const newCrop: Crop = {
      ...cropData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    saveCrops([...crops, newCrop]);
    setShowAddCropModal(false);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    saveTasks([...tasks, newTask]);
    setShowAddTaskModal(false);
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
  };

  const deleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      saveTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const deleteCrop = (cropId: string) => {
    if (confirm('Are you sure you want to delete this crop?')) {
      saveCrops(crops.filter(crop => crop.id !== cropId));
    }
  };

  const changeMonth = (delta: number) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const calculateGrowthProgress = (sowDate: Date, harvestDate: Date, currentDate: Date) => {
    const totalDays = (harvestDate.getTime() - sowDate.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (currentDate.getTime() - sowDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.min(100, Math.round((elapsedDays / totalDays) * 100)));
  };

  const getStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completed = tasks.filter(t => t.completed).length;
    const dueToday = tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime() && !t.completed;
    }).length;
    const overdue = tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      return dueDate < today && !t.completed;
    }).length;
    
    return { completed, dueToday, overdue, activeCrops: crops.length };
  };

  const renderCalendar = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const days = [];
    
    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth - 1, prevMonthDays - i)
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(currentYear, currentMonth, day)
      });
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth + 1, day)
      });
    }
    
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => changeMonth(-1)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              ←
            </button>
            <h2 className="text-2xl font-bold text-green-600">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              →
            </button>
          </div>
          <button
            onClick={() => setShowAddCropModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ➕ Add Crop Plan
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-bold p-3 text-gray-600 text-sm">
              {day}
            </div>
          ))}
          
          {days.map((dayInfo, index) => {
            const isToday = dayInfo.date.toDateString() === new Date().toDateString();
            const dayEvents = getDayEvents(dayInfo.date);
            
            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border-2 rounded-lg cursor-pointer transition-all ${
                  !dayInfo.isCurrentMonth ? 'opacity-30' : ''
                } ${
                  isToday ? 'border-green-500 bg-green-50' : 'border-gray-200'
                } hover:border-green-500 hover:scale-105`}
              >
                <div className="font-bold mb-2">{dayInfo.day}</div>
                <div className="space-y-1">
                  {dayEvents.map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`text-xs p-1 rounded cursor-pointer flex items-center gap-1 ${event.className}`}
                      onClick={event.onClick}
                    >
                      <span>{event.icon}</span>
                      <span className="truncate">{event.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getDayEvents = (date: Date) => {
    const events: Array<{
      text: string;
      className: string;
      icon: string;
      onClick: () => void;
    }> = [];

    // Add crop events
    crops.forEach(crop => {
      const sowDate = new Date(crop.sowingDate);
      const harvestDate = new Date(crop.harvestDate);

      // Sowing date
      if (isSameDate(date, sowDate)) {
        events.push({
          text: `Sow ${crop.cropName}`,
          className: 'bg-green-200 text-green-800 border border-green-500',
          icon: '🌱',
          onClick: () => alert(`Sowing details for ${crop.cropName}`)
        });
      }

      // Harvest date
      if (isSameDate(date, harvestDate)) {
        events.push({
          text: `Harvest ${crop.cropName}`,
          className: 'bg-orange-200 text-orange-800 border border-orange-500',
          icon: '💰',
          onClick: () => alert(`Harvest details for ${crop.cropName}`)
        });
      }

      // Growth progress
      if (date >= sowDate && date <= harvestDate) {
        const progress = calculateGrowthProgress(sowDate, harvestDate, date);
        if (progress > 0) {
          events.push({
            text: `${crop.cropName} (${progress}%)`,
            className: 'bg-gradient-to-r from-green-500 to-gray-300 text-white font-bold',
            icon: '📈',
            onClick: () => alert(`Growth details for ${crop.cropName}`)
          });
        }
      }
    });

    return events;
  };

  const isSameDate = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-800 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🍃</span>
              <span className="text-2xl font-bold">Kerala Farm Assistant</span>
            </div>
            
            {weatherData && (
              <div className="bg-white bg-opacity-20 rounded-lg p-3 flex items-center gap-3">
                <span className="text-2xl">⛅</span>
                <div>
                  <div className="font-bold text-xl">{Math.round(weatherData.temperature)}°C</div>
                  <div className="text-sm opacity-90">{weatherData.description}</div>
                </div>
              </div>
            )}
            
            <div className="bg-green-500 bg-opacity-30 rounded-lg px-3 py-2 flex items-center gap-2">
              <span className="text-green-200">📶</span>
              <span>Online</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-green-600">✅</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-600">{stats.completed}</h3>
              <p className="text-gray-600">Completed Tasks</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-orange-600">⏰</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-orange-600">{stats.dueToday}</h3>
              <p className="text-gray-600">Due Today</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-red-600">⚠️</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-red-600">{stats.overdue}</h3>
              <p className="text-gray-600">Overdue</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-blue-600">🌱</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-600">{stats.activeCrops}</h3>
              <p className="text-gray-600">Active Crops</p>
            </div>
          </div>
        </div>

        {/* Zone Selector */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
            <span>🗺️</span>
            Select Your Agro-Climatic Zone
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agro-Climatic Zone
              </label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="">Select Zone...</option>
                <option value="southern-plateau">Southern Plateau and Hills</option>
                <option value="western-coastal">Western Coastal Plains and Ghats</option>
                <option value="central-plateau">Central Plateau and Hills</option>
                <option value="indo-gangetic">Indo-Gangetic Plain</option>
                <option value="eastern-plateau">Eastern Plateau and Hills</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City/Location
              </label>
              <input
                type="text"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                placeholder="Enter your city"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>
          <button className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
            🔄 Update Location
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {[
            { id: 'calendar', label: 'Smart Calendar', icon: '📅' },
            { id: 'crops', label: 'My Crops', icon: '🌱' },
            { id: 'tasks', label: 'Task List', icon: '📋' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg border-2 font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-500'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'calendar' && renderCalendar()}

        {activeTab === 'crops' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-green-600 flex items-center gap-2">
                <span>🌱</span>
                Active Crops
              </h3>
              <button
                onClick={() => setShowAddCropModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ➕ Add Crop
              </button>
            </div>
            
            {crops.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No crops added yet. Click "Add Crop" to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {crops.map(crop => {
                  const sowDate = new Date(crop.sowingDate);
                  const harvestDate = new Date(crop.harvestDate);
                  const progress = calculateGrowthProgress(sowDate, harvestDate, new Date());
                  
                  return (
                    <div key={crop.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-green-500 transition-all">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xl font-bold text-green-600 flex items-center gap-2">
                          <span>🌾</span>
                          {crop.cropName}
                        </h4>
                        <button
                          onClick={() => deleteCrop(crop.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          🗑️
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-600">Field</span>
                          <div className="font-medium">{crop.fieldName}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Area</span>
                          <div className="font-medium">{crop.area} acres</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Sowing Date</span>
                          <div className="font-medium">{sowDate.toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Harvest Date</span>
                          <div className="font-medium">{harvestDate.toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Growth Progress</span>
                          <span className="font-bold text-green-600">{Math.max(0, Math.min(100, progress))}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-green-600 flex items-center gap-2">
                <span>📋</span>
                All Tasks
              </h3>
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ➕ Add Task
              </button>
            </div>
            
            {tasks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No tasks yet. Click "Add Task" to create one.
              </p>
            ) : (
              <div className="space-y-4">
                {tasks
                  .sort((a, b) => {
                    if (a.completed !== b.completed) return a.completed ? 1 : -1;
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                  })
                  .map(task => {
                    const crop = crops.find(c => c.id === task.cropId);
                    const cropName = crop ? `${crop.cropName} - ${crop.fieldName}` : 'No crop';
                    const dueDate = new Date(task.dueDate);
                    const today = new Date();
                    const isOverdue = dueDate < today && !task.completed;
                    const isDueToday = dueDate.toDateString() === today.toDateString();
                    
                    const priorityColors = {
                      low: 'text-blue-600',
                      medium: 'text-orange-600',
                      high: 'text-red-600'
                    };
                    
                    return (
                      <div
                        key={task.id}
                        className={`border-2 rounded-xl p-6 transition-all ${
                          task.completed ? 'opacity-60' : ''
                        } ${isOverdue ? 'border-red-500' : 'border-gray-200 hover:border-green-500'}`}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className="w-5 h-5 cursor-pointer"
                          />
                          <div className="flex-1">
                            <h4 className={`text-lg font-bold ${task.completed ? 'line-through' : ''}`}>
                              {task.title}
                            </h4>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <span>🌱</span>
                              {cropName}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            🗑️
                          </button>
                        </div>
                        
                        <div className="flex gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className={isOverdue ? 'text-red-600' : isDueToday ? 'text-orange-600' : 'text-gray-600'}>
                              📅
                            </span>
                            <span className={isOverdue ? 'text-red-600' : 'text-gray-700'}>
                              {dueDate.toLocaleDateString()}
                              {isOverdue ? ' (Overdue)' : isDueToday ? ' (Today)' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={priorityColors[task.priority]}>
                              🚩
                            </span>
                            <span className={`${priorityColors[task.priority]} capitalize`}>
                              {task.priority} Priority
                            </span>
                          </div>
                        </div>
                        
                        {task.notes && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <small>{task.notes}</small>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Crop Modal */}
      {showAddCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-600">Add New Crop</h3>
              <button
                onClick={() => setShowAddCropModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addCrop({
                  cropName: formData.get('cropName') as string,
                  fieldName: formData.get('fieldName') as string,
                  area: parseFloat(formData.get('area') as string),
                  sowingDate: formData.get('sowingDate') as string,
                  harvestDate: formData.get('harvestDate') as string,
                  state: formData.get('state') as string,
                  market: formData.get('market') as string
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Crop Name</label>
                <select name="cropName" required className="w-full p-3 border-2 border-gray-300 rounded-lg">
                  <option value="">Select Crop...</option>
                  <option value="Rice">Rice</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Potato">Potato</option>
                  <option value="Onion">Onion</option>
                  <option value="Coconut">Coconut</option>
                  <option value="Pepper">Pepper</option>
                  <option value="Cardamom">Cardamom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field Name</label>
                <input name="fieldName" type="text" required className="w-full p-3 border-2 border-gray-300 rounded-lg" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Area (acres)</label>
                <input name="area" type="number" step="0.1" required className="w-full p-3 border-2 border-gray-300 rounded-lg" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sowing Date</label>
                <input name="sowingDate" type="date" required className="w-full p-3 border-2 border-gray-300 rounded-lg" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Harvest Date</label>
                <input name="harvestDate" type="date" required className="w-full p-3 border-2 border-gray-300 rounded-lg" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input name="state" type="text" defaultValue="Kerala" required className="w-full p-3 border-2 border-gray-300 rounded-lg" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Market Name</label>
                <input name="market" type="text" defaultValue="Thiruvananthapuram" required className="w-full p-3 border-2 border-gray-300 rounded-lg" />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                💾 Save Crop
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-600">Add New Task</h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addTask({
                  title: formData.get('title') as string,
                  cropId: formData.get('cropId') as string,
                  dueDate: formData.get('dueDate') as string,
                  priority: formData.get('priority') as 'low' | 'medium' | 'high',
                  notes: formData.get('notes') as string
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                <input name="title" type="text" required className="w-full p-3 border-2 border-gray-300 rounded-lg" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Related Crop</label>
                <select name="cropId" required className="w-full p-3 border-2 border-gray-300 rounded-lg">
                  <option value="">Select Crop...</option>
                  {crops.map(crop => (
                    <option key={crop.id} value={crop.id}>
                      {crop.cropName} - {crop.fieldName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input name="dueDate" type="date" required className="w-full p-3 border-2 border-gray-300 rounded-lg" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select name="priority" required className="w-full p-3 border-2 border-gray-300 rounded-lg">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea name="notes" rows={3} className="w-full p-3 border-2 border-gray-300 rounded-lg"></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                💾 Save Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropCalendarPage;