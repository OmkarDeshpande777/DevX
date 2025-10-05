const express = require('express');
const router = express.Router();
const { detectLanguage, getSupportedLanguages } = require('../utils/languageDetector');
const { getResponse, categorizeQuery } = require('../utils/farmingResponses');

/**
 * POST /api/multilingual-chat/chat
 * Main multilingual chat endpoint
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, userId = 'anonymous' } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Detect the language of the input message
    const detectedLanguage = detectLanguage(message);
    console.log(`🌐 Language detected: ${detectedLanguage.name} (${detectedLanguage.confidence})`);

    // Categorize the query to determine response type
    const category = categorizeQuery(message, detectedLanguage.language);
    console.log(`📝 Query category: ${category}`);

    // Get appropriate response in the detected language
    const response = getResponse(detectedLanguage.language, category, {
      crop: getCropSuggestion(detectedLanguage.language),
      season: getSeasonInfo(detectedLanguage.language),
      yield: '2-3',
      disease: getDiseaseInfo(detectedLanguage.language),
      treatment: getTreatmentInfo(detectedLanguage.language),
      condition: getWeatherCondition(detectedLanguage.language)
    });

    // Return the response in the same language as input
    res.json({
      success: true,
      data: {
        response,
        detectedLanguage: {
          language: detectedLanguage.language,
          name: detectedLanguage.name,
          nativeName: detectedLanguage.nativeName,
          code: detectedLanguage.code,
          confidence: detectedLanguage.confidence
        },
        category,
        originalMessage: message,
        userId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Multilingual chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process your message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/multilingual-chat/languages
 * Get all supported languages
 */
router.get('/languages', (req, res) => {
  try {
    const languages = getSupportedLanguages();
    
    res.json({
      success: true,
      data: {
        languages,
        count: languages.length,
        message: 'Supported languages retrieved successfully'
      }
    });
  } catch (error) {
    console.error('❌ Languages endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve supported languages'
    });
  }
});

/**
 * POST /api/multilingual-chat/detect-language
 * Test language detection endpoint
 */
router.post('/detect-language', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required for language detection'
      });
    }

    const detectedLanguage = detectLanguage(text);
    
    res.json({
      success: true,
      data: {
        originalText: text,
        detectedLanguage,
        message: 'Language detected successfully'
      }
    });

  } catch (error) {
    console.error('❌ Language detection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect language'
    });
  }
});

/**
 * GET /api/multilingual-chat/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Multilingual AI Chat service is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      chat: 'POST /api/multilingual-chat/chat',
      languages: 'GET /api/multilingual-chat/languages',
      detectLanguage: 'POST /api/multilingual-chat/detect-language',
      health: 'GET /api/multilingual-chat/health'
    }
  });
});

// Helper functions to provide contextual information in multiple languages
function getCropSuggestion(language) {
  const suggestions = {
    hindi: 'धान',
    marathi: 'भात',
    telugu: 'వరి',
    tamil: 'நெல்',
    kannada: 'ಅಕ್ಕಿ',
    malayalam: 'നെൽ',
    gujarati: 'ચોખા',
    punjabi: 'ਚਾਵਲ',
    bengali: 'ধান',
    english: 'Rice'
  };
  return suggestions[language] || suggestions.english;
}

function getSeasonInfo(language) {
  const seasons = {
    hindi: 'खरीफ (जून-जुलाई)',
    marathi: 'खरीप (जून-जुलै)',
    telugu: 'ఖరీఫ్ (జూన్-జులై)',
    tamil: 'கரீப் (ஜூன்-ஜூலை)',
    english: 'Kharif (June-July)'
  };
  return seasons[language] || seasons.english;
}

function getDiseaseInfo(language) {
  const diseases = {
    hindi: 'पत्ती झुलसा रोग',
    marathi: 'पानांचा करपा रोग',
    telugu: 'ఆకు కాలిక వ్యాధి',
    tamil: 'இலை கருகல் நோய்',
    english: 'Leaf blight'
  };
  return diseases[language] || diseases.english;
}

function getTreatmentInfo(language) {
  const treatments = {
    hindi: 'कॉपर सल्फेट का छिड़काव',
    marathi: 'कॉपर सल्फेटची फवारणी',
    telugu: 'కాపర్ సల్ఫేట్ స్ప్రే',
    tamil: 'காப்பர் சல்பேட் தெளிப்பு',
    english: 'Copper sulfate spray'
  };
  return treatments[language] || treatments.english;
}

function getWeatherCondition(language) {
  const conditions = {
    hindi: 'अनुकूल मौसम',
    marathi: 'अनुकूल हवामान',
    telugu: 'అనుకూల వాతావరణం',
    tamil: 'சாதகமான வானிலை',
    english: 'Favorable weather'
  };
  return conditions[language] || conditions.english;
}

module.exports = router;