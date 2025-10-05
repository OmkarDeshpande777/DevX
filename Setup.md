# 🚀 Setup Guide for Digi Farmer Platform

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MySQL** (v8.0 or higher)
- **Git**

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/OmkarDeshpande777/DevX.git
cd DevX/AICropRecommendation-2
```

### 2. Environment Setup

#### Backend Environment
```bash
cd backend
cp .env.example .env
# Edit .env file with your database credentials and API keys
npm install
```

#### Frontend Environment
```bash
cd client
cp .env.example .env
# Edit .env file with API URLs
npm install
```

#### AI Service Environment
```bash
cd "Agri Doctor"
cp .env.example .env
# Edit .env file with database and model paths
pip install -r requirements.txt
```

#### Crop Recommendation Service Environment
```bash
cd "Crop Recommendation Server"
pip install -r requirements.txt
```

### 3. Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE AgriNova;
```

2. Import database schema (if available) or run the application to auto-create tables.

### 4. Start Services

#### Terminal 1 - Backend API
```bash
cd backend
npm start
# Server runs on http://localhost:3001
```

#### Terminal 2 - Disease Detection AI Service
```bash
cd "Agri Doctor"
python main.py
# AI service runs on http://localhost:1234
```

#### Terminal 3 - Crop Recommendation Service
```bash
cd "Crop Recommendation Server"
python api_server.py
# Service runs on http://localhost:8000
```

#### Terminal 4 - Frontend
```bash
cd client
npm run dev
# Frontend runs on http://localhost:3000
```

## Environment Variables

### Backend (.env)
```bash
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_NAME=AgriNova
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
WEATHER_API_KEY=your_weather_api_key_here
```

### Frontend (.env)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_DISEASE_API_URL=http://localhost:1234
NEXT_PUBLIC_CROP_API_URL=http://localhost:8000
BACKEND_URL=http://localhost:3001
```

### Disease Detection AI Service (.env)
```bash
DB_HOST=localhost
DB_NAME=AgriNova
DB_USER=your_username
DB_PASSWORD=your_password
API_PORT=1234
MODEL_PATH=./models/
```

### Crop Recommendation Service (.env)
```bash
DB_HOST=localhost
DB_NAME=AgriNova
DB_USER=your_username
DB_PASSWORD=your_password
API_PORT=8000
MODEL_PATH=./models/
```

## Required API Keys

### 1. Google Gemini API
- Visit: https://ai.google.dev/
- Create API key for AI chat functionality

### 2. Weather API
- Visit: https://www.weatherapi.com/
- Sign up and get free API key
- Used for weather data in crop recommendations

### 3. Market Price Data
- Government API: https://www.data.gov.in/resource/variety-wise-daily-market-prices-data-commodity
- No API key required for basic access

## Dataset Sources

### 1. Plant Disease Dataset
- **Source**: [Kaggle - New Plant Diseases Dataset](https://www.kaggle.com/datasets/vipoooool/new-plant-diseases-dataset)
- **Size**: 87,000+ images
- **Usage**: Training disease detection models

### 2. Crop Recommendation Dataset
- **Source**: Agricultural research data
- **Size**: 2,200+ samples
- **Features**: NPK values, weather parameters

### 3. Weather Data
- **Source**: [WeatherAPI](https://www.weatherapi.com/)
- **Coverage**: Pan-India with district-level data

### 4. Market Prices
- **Source**: [Data.gov.in](https://www.data.gov.in/resource/variety-wise-daily-market-prices-data-commodity)
- **Update**: Daily market price updates

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Windows - Check what's using the port
   netstat -ano | findstr :3001
   # Kill the process if needed
   taskkill /PID <process_id> /F
   ```

2. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in .env files
   - Ensure database exists

3. **AI Models Not Loading**
   - Download model files from respective sources
   - Place models in correct directories
   - Check model file paths in .env
   - Verify Python dependencies are installed

4. **API Key Issues**
   - Verify all API keys are correctly set in .env files
   - Check API key quotas and limits
   - Ensure no extra spaces or quotes around keys

### Development Tips

1. **API Testing**: Use Postman or Thunder Client for testing endpoints
2. **Database Management**: Use MySQL Workbench or phpMyAdmin
3. **Logs**: Monitor console outputs for detailed error information
4. **Model Downloads**: Download required AI models before starting services

## Project Structure

```
DevX/
└── AICropRecommendation-2/
    ├── client/                      # Next.js Frontend (Port 3000)
    ├── backend/                     # Express.js API (Port 3001)
    ├── Agri Doctor/                # Disease Detection AI (Port 1234)
    ├── Crop Recommendation Server/ # Crop AI Service (Port 8000)
    ├── .gitignore
    ├── README_TEAM_DEVX.md
    └── SETUP.md
```

## API Endpoints

### Backend API (Port 3001)
- `GET /health` - Health check
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/yield-recommendor/yield-recommendation` - Crop recommendations
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/weather` - Weather data
- `GET /api/market-prices` - Market price data

### AI Services
- `POST http://localhost:1234/detect` - Disease detection from plant images
- `POST http://localhost:8000/predict` - Crop prediction based on soil parameters

## Features Overview

### Core Functionalities
- **🤖 AI Crop Recommendations**: ML-powered crop suggestions
- **🔬 Disease Detection**: Computer vision-based plant disease identification
- **📊 Yield Prediction**: Soil health analysis and yield optimization
- **🗺️ Disease Mapping**: Interactive disease tracking across India
- **💬 Multilingual Support**: Hindi voice assistance with Gemini AI
- **📱 Mobile Ready**: Responsive design for all devices

### Technology Stack
- **Frontend**: Next.js 15.5.2, React 19.1.0, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, MySQL, JWT Authentication
- **AI/ML**: FastAPI, PyTorch, OpenCV, YOLOv8, CNN models
- **External APIs**: Google Gemini AI, WeatherAPI, Government market data

## Support

For issues or questions:
1. Check this setup guide thoroughly
2. Review error logs in terminal windows
3. Ensure all environment variables are properly configured
4. Verify all services are running on correct ports
5. Check API key validity and quotas

## Next Steps

1. **Download Required Models**: Get AI models for disease detection
2. **Configure Database**: Set up MySQL with proper credentials
3. **Obtain API Keys**: Register for required external service APIs
4. **Test Services**: Start all services and verify functionality
5. **Deploy**: Consider containerization for production deployment

---

**Team DevX** - Digi Farmer Platform
*Revolutionizing Indian Agriculture with AI Technology*
