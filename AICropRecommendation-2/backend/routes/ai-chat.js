const express = require('express');
const router = express.Router();
const { detectLanguage, getSupportedLanguages } = require('../utils/languageDetector');
const { getResponse, categorizeQuery } = require('../utils/farmingResponses');

// Simple language detection using Unicode ranges
function detectLanguage(text) {
  // Remove spaces and punctuation for better detection
  const cleanText = text.replace(/[\s\p{P}]/gu, '');
  
  // Hindi (Devanagari script)
  if (/[\u0900-\u097F]/.test(cleanText)) {
    return {
      language: 'hindi',
      name: 'Hindi',
      code: 'hi',
      confidence: 0.9
    };
  }
  
  // Marathi (also Devanagari, but check for specific patterns)
  if (/[\u0900-\u097F]/.test(cleanText) && (/मराठी|महाराष्ट्र|पावसाळ्यात|खरीप/.test(text))) {
    return {
      language: 'marathi',
      name: 'Marathi', 
      code: 'mr',
      confidence: 0.9
    };
  }
  
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(cleanText)) {
    return {
      language: 'telugu',
      name: 'Telugu',
      code: 'te', 
      confidence: 0.9
    };
  }
  
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(cleanText)) {
    return {
      language: 'tamil',
      name: 'Tamil',
      code: 'ta',
      confidence: 0.9
    };
  }
  
  // Gujarati
  if (/[\u0A80-\u0AFF]/.test(cleanText)) {
    return {
      language: 'gujarati', 
      name: 'Gujarati',
      code: 'gu',
      confidence: 0.9
    };
  }
  
  // Punjabi
  if (/[\u0A00-\u0A7F]/.test(cleanText)) {
    return {
      language: 'punjabi',
      name: 'Punjabi', 
      code: 'pa',
      confidence: 0.9
    };
  }
  
  // Kannada
  if (/[\u0C80-\u0CFF]/.test(cleanText)) {
    return {
      language: 'kannada',
      name: 'Kannada',
      code: 'kn', 
      confidence: 0.9
    };
  }
  
  // Malayalam
  if (/[\u0D00-\u0D7F]/.test(cleanText)) {
    return {
      language: 'malayalam',
      name: 'Malayalam',
      code: 'ml',
      confidence: 0.9
    };
  }
  
  // Bengali  
  if (/[\u0980-\u09FF]/.test(cleanText)) {
    return {
      language: 'bengali',
      name: 'Bengali',
      code: 'bn',
      confidence: 0.9
    };
  }
  
  // Default to English
  return {
    language: 'english',
    name: 'English', 
    code: 'en',
    confidence: 0.8
  };
}

// Farming responses in multiple languages
const FARMING_RESPONSES = {
  hindi: {
    cropRecommendation: "आपकी मिट्टी और जलवायु के अनुसार, मैं {crop} की खेती की सलाह देता हूं। बुआई का सबसे अच्छा समय {season} है और अपेक्षित उत्पादन {yield} टन प्रति एकड़ है।",
    weather: "वर्तमान मौसम की स्थिति {condition} दिखा रही है। यह आपकी फसलों के लिए {suitability} है।",
    disease: "आपके द्वारा बताए गए लक्षण {disease} को दर्शाते हैं। तुरंत {treatment} का प्रयोग करें।",
    fertilizer: "आपकी मिट्टी के प्रकार के लिए, {fertilizer} का प्रयोग {dosage} किलो प्रति एकड़ की दर से करें।",
    irrigation: "आपकी फसलों को सप्ताह में {amount} पानी की आवश्यकता है। {method} सिंचाई पद्धति का उपयोग करने पर विचार करें।",
    general: "मैं आपकी सभी कृषि आवश्यकताओं में मदद के लिए यहां हूं। फसल की सिफारिश, रोग की पहचान, मौसम की सलाह और बाजार की कीमतों के बारे में पूछें!"
  },
  marathi: {
    cropRecommendation: "तुमच्या मातीच्या आणि हवामानाच्या परिस्थितीनुसार, मी {crop} पिकाची शिफारस करतो। लागवडीचा सर्वोत्तम काळ {season} आहे आणि अपेक्षित उत्पादन {yield} टन प्रति एकर आहे।",
    weather: "सध्याची हवामान परिस्थिती {condition} दाखवते. हे तुमच्या पिकांसाठी {suitability} आहे।",
    disease: "तुम्ही सांगितलेली लक्षणे {disease} दर्शवतात। ताबडतोब {treatment} वापरा।",
    fertilizer: "तुमच्या मातीच्या प्रकारासाठी, {fertilizer} चा वापर {dosage} किलो प्रति एकर या दराने करा।",
    irrigation: "तुमच्या पिकांना आठवड्यातून {amount} पाण्याची गरज आहे। {method} सिंचन पद्धतीचा वापर करण्याचा विचार करा।",
    general: "मी तुमच्या सर्व शेती गरजांमध्ये मदत करण्यासाठी येथे आहे। पीक शिफारस, रोग ओळख, हवामान सल्ला आणि बाजार भावांबद्दल विचारा!"
  },
  telugu: {
    cropRecommendation: "మీ మట్టి మరియు వాతావరణ పరిస్థితుల ఆధారంగా, నేను {crop} పంట సిఫార్సు చేస్తున్నాను. విత్తనాలకు అత్యుత్తమ కాలం {season} మరియు ఆశించిన దిగుబడి ఎకరేకు {yield} టన్నులు।",
    weather: "ప్రస్తుత వాతావరణ పరిస్థితులు {condition} చూపిస్తున్నాయి. ఇది మీ పంటలకు {suitability}।",
    disease: "మీరు వర్ణించిన లక్షణాలు {disease} ని సూచిస్తున్నాయి. వెంటనే {treatment} వాడండి।",
    fertilizer: "మీ మట్టి రకానికి, {fertilizer} ని ఎకరేకు {dosage} కిలోల చొప్పున వాడండి।",
    irrigation: "మీ పంటలకు వారానికి {amount} నీరు అవసరం. {method} నీటిపారుదల పద్ధతిని పరిగణించండి।",
    general: "మీ అన్ని వ్యవసాయ అవసరాలలో సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను. పంట సిఫార్సు, వ్యాధి గుర్తింపు, వాతావరణ సలహా మరియు మార్కెట్ ధరల గురించి అడగండి!"
  },
  tamil: {
    cropRecommendation: "உங்கள் மண் மற்றும் காலநிலை நிலைமைகளின் அடிப்படையில், நான் {crop} பயிரை பரிந்துரைக்கிறேன். விதைப்புக்கான சிறந்த காலம் {season} மற்றும் எதிர்பார்க்கப்படும் மகசூல் ஏக்கருக்கு {yield} டன்கள்।",
    weather: "தற்போதைய வானிலை நிலைமைகள் {condition} காட்டுகின்றன. இது உங்கள் பயிர்களுக்கு {suitability}।",
    disease: "நீங்கள் விவரித்த அறிகுறிகள் {disease} ஐ குறிக்கின்றன. உடனடியாக {treatment} பயன்படுத்தவும்।",
    fertilizer: "உங்கள் மண் வகைக்கு, {fertilizer} ஐ ஏக்கருக்கு {dosage} கிலோ வீதம் பயன்படுத்தவும்।",
    irrigation: "உங்கள் பயிர்களுக்கு வாரத்திற்கு {amount} தண்ணீர் தேவை. {method} நீர்ப்பாசன முறையைக் கருத்தில் கொள்ளுங்கள்।",
    general: "உங்கள் அனைத்து விவசாய தேவைகளிலும் உதவ நான் இங்கே இருக்கிறேன். பயிர் பரிந்துரை, நோய் அடையாளம், வானிலை ஆலோசனை மற்றும் சந்தை விலைகள் பற்றி கேளுங்கள்!"
  },
  english: {
    cropRecommendation: "Based on your soil and climate conditions, I recommend {crop} cultivation. The optimal planting season is {season} with expected yield of {yield} tons per acre.",
    weather: "Current weather conditions show {condition}. This is {suitability} for your crops.",
    disease: "The symptoms you described indicate {disease}. Apply {treatment} immediately.",
    fertilizer: "For your soil type, apply {fertilizer} at {dosage} kg per acre.",
    irrigation: "Your crops need {amount} water per week. Consider {method} irrigation method.",
    general: "I'm here to help with all your farming needs! Ask about crop recommendations, disease identification, weather advice, and market prices."
  }
};

// Chat endpoint with improved language detection
router.post('/chat', async (req, res) => {
  try {
    const { message, userId = 'anonymous', language: selectedLanguage = null } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Detect language or use selected language  
    let detectedLanguage;
    
    if (selectedLanguage) {
      // Manual language selection
      const langMap = {
        'hi': 'hindi', 'hindi': 'hindi',
        'mr': 'marathi', 'marathi': 'marathi', 
        'te': 'telugu', 'telugu': 'telugu',
        'ta': 'tamil', 'tamil': 'tamil',
        'gu': 'gujarati', 'gujarati': 'gujarati',
        'pa': 'punjabi', 'punjabi': 'punjabi',
        'kn': 'kannada', 'kannada': 'kannada',
        'ml': 'malayalam', 'malayalam': 'malayalam',
        'bn': 'bengali', 'bengali': 'bengali',
        'en': 'english', 'english': 'english'
      };
      
      const langKey = langMap[selectedLanguage.toLowerCase()] || 'english';
      
      detectedLanguage = {
        language: langKey,
        code: getLanguageCode(langKey),
        confidence: 1.0,
        name: getLanguageName(langKey),
        nativeName: getNativeName(langKey),
        script: getScript(langKey)
      };
      
      console.log(`🌐 Manual language: ${detectedLanguage.name}`);
    } else {
      // Auto-detect using utility
      detectedLanguage = detectLanguage(message);
      console.log(`🌐 Auto-detected: ${detectedLanguage.name} (${detectedLanguage.confidence})`);
    }    console.log(`🌐 Language: ${detectedLanguage.name} (confidence: ${detectedLanguage.confidence})`);

    // Get response in the detected/selected language
    let response;
    let languageKey = detectedLanguage.language;
    console.log(`🔧 Initial languageKey: "${languageKey}"`);
    console.log(`🔧 detectedLanguage.code: "${detectedLanguage.code}"`);
    
    // Map language codes to language keys
    if (detectedLanguage.code) {
      const codeToLanguage = {
        'hi': 'hindi',
        'mr': 'marathi', 
        'te': 'telugu',
        'ta': 'tamil',
        'gu': 'gujarati',
        'pa': 'punjabi',
        'kn': 'kannada',
        'ml': 'malayalam',
        'bn': 'bengali',
        'en': 'english'
      };
      const mappedLanguage = codeToLanguage[detectedLanguage.code];
      console.log(`🔧 Mapped language from code "${detectedLanguage.code}": "${mappedLanguage}"`);
      languageKey = mappedLanguage || languageKey;
      console.log(`🔧 Final languageKey: "${languageKey}"`);
    }
    
    console.log(`🔧 Using FARMING_RESPONSES["${languageKey}"]`);
    
    // Force Hindi responses for testing when language is selected as 'hi'
    let responses;
    if (selectedLanguage === 'hi') {
      console.log(`🔧 FORCING Hindi responses because selectedLanguage = "${selectedLanguage}"`);
      responses = FARMING_RESPONSES.hindi;
    } else {
      responses = FARMING_RESPONSES[languageKey] || FARMING_RESPONSES.english;
    }
    console.log(`🔧 Selected responses object:`, Object.keys(responses));
    
    // Simple keyword matching to determine response type
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('crop') || lowerMessage.includes('फसल') || lowerMessage.includes('पीक') || lowerMessage.includes('పంట') || lowerMessage.includes('பயிர्') || lowerMessage.includes('बारिश') || lowerMessage.includes('पावसाळ')) {
      console.log(`🔧 Using crop recommendation template: "${responses.cropRecommendation}"`);
      const cropName = getCropName(selectedLanguage === 'hi' ? 'hindi' : languageKey);
      const seasonName = getSeasonName(selectedLanguage === 'hi' ? 'hindi' : languageKey);
      console.log(`🔧 cropName: "${cropName}", seasonName: "${seasonName}"`);
      response = responses.cropRecommendation
        .replace('{crop}', cropName)
        .replace('{season}', seasonName)
        .replace('{yield}', '2-3');
      console.log(`🔧 Final response after replacements: "${response}"`);
    } else if (lowerMessage.includes('weather') || lowerMessage.includes('मौसम') || lowerMessage.includes('हवामान') || lowerMessage.includes('వాతావరణం') || lowerMessage.includes('வானிலை')) {
      response = responses.weather
        .replace('{condition}', getWeatherCondition(languageKey))
        .replace('{suitability}', getSuitability(languageKey));
    } else if (lowerMessage.includes('disease') || lowerMessage.includes('रोग') || lowerMessage.includes('వ్యాధి') || lowerMessage.includes('நோய்')) {
      response = responses.disease
        .replace('{disease}', getDiseaseName(languageKey))
        .replace('{treatment}', getTreatmentName(languageKey));
    } else if (lowerMessage.includes('fertilizer') || lowerMessage.includes('खाद') || lowerMessage.includes('मूद') || lowerMessage.includes('ఎరువు') || lowerMessage.includes('உரம்')) {
      response = responses.fertilizer
        .replace('{fertilizer}', getFertilizerName(languageKey))
        .replace('{dosage}', '50');
    } else if (lowerMessage.includes('water') || lowerMessage.includes('irrigation') || lowerMessage.includes('पानी') || lowerMessage.includes('सिंचाई') || lowerMessage.includes('నీరు') || lowerMessage.includes('தண்ணீர்')) {
      response = responses.irrigation
        .replace('{amount}', getWaterAmount(languageKey))
        .replace('{method}', getIrrigationMethod(languageKey));
    } else {
      response = responses.general;
    }

    console.log(`🚀 Final detectedLanguage before response:`, JSON.stringify(detectedLanguage, null, 2));
    console.log(`🚀 Final response:`, response);
    
    res.json({
      success: true,
      data: {
        response,
        detectedLanguage,
        originalQuery: message,
        timestamp: new Date().toISOString(),
        userId
      }
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process your message'
    });
  }
});

// Helper functions for language-specific content
function getLanguageName(langCode) {
  const names = {
    'hi': 'Hindi', 'mr': 'Marathi', 'te': 'Telugu', 'ta': 'Tamil',
    'gu': 'Gujarati', 'pa': 'Punjabi', 'kn': 'Kannada', 'ml': 'Malayalam',
    'bn': 'Bengali', 'en': 'English',
    'hindi': 'Hindi', 'marathi': 'Marathi', 'telugu': 'Telugu', 'tamil': 'Tamil',
    'gujarati': 'Gujarati', 'punjabi': 'Punjabi', 'kannada': 'Kannada', 'malayalam': 'Malayalam',
    'bengali': 'Bengali', 'english': 'English'
  };
  return names[langCode] || 'English';
}

function getLanguageCode(language) {
  const codes = {
    'hindi': 'hi', 'marathi': 'mr', 'telugu': 'te', 'tamil': 'ta',
    'gujarati': 'gu', 'punjabi': 'pa', 'kannada': 'kn', 'malayalam': 'ml',
    'bengali': 'bn', 'english': 'en', 'hi': 'hi', 'mr': 'mr', 'te': 'te', 
    'ta': 'ta', 'gu': 'gu', 'pa': 'pa', 'kn': 'kn', 'ml': 'ml', 'bn': 'bn', 'en': 'en'
  };
  return codes[language] || 'en';
}

function getCropName(language) {
  const crops = {
    hindi: 'धान',
    marathi: 'भात',
    telugu: 'వరి',
    tamil: 'நெல்',
    english: 'Rice'
  };
  return crops[language] || crops.english;
}

function getSeasonName(language) {
  const seasons = {
    hindi: 'खरीफ (जून-जुलाई)',
    marathi: 'खरीप (जून-जुलै)',
    telugu: 'ఖరీఫ్ (జూన్-జులై)',
    tamil: 'கரீப் (ஜூன்-ஜூலை)',
    english: 'Kharif (June-July)'
  };
  return seasons[language] || seasons.english;
}

function getWeatherCondition(language) {
  const conditions = {
    hindi: 'अनुकूल मौसम',
    marathi: 'अनुकूल हवामान',
    telugu: 'అనుకూల వాతావరణం',
    tamil: 'சாதகமான வானிலை',
    english: 'favorable weather'
  };
  return conditions[language] || conditions.english;
}

function getSuitability(language) {
  const suitability = {
    hindi: 'अच्छा',
    marathi: 'चांगला',
    telugu: 'మంచిది',
    tamil: 'நல்லது',
    english: 'good'
  };
  return suitability[language] || suitability.english;
}

function getDiseaseName(language) {
  const diseases = {
    hindi: 'पत्ती झुलसा रोग',
    marathi: 'पानांचा करपा रोग',
    telugu: 'ఆకు కాలిక వ్యాధి',
    tamil: 'இலை கருகல் நோய்',
    english: 'leaf blight'
  };
  return diseases[language] || diseases.english;
}

function getTreatmentName(language) {
  const treatments = {
    hindi: 'कॉपर सल्फेट का छिड़काव',
    marathi: 'कॉपर सल्फेटची फवारणी',
    telugu: 'కాపర్ సల్ఫేట్ స్ప్రే',
    tamil: 'காப்பர் சல்பேट் தெளிப்பு',
    english: 'copper sulfate spray'
  };
  return treatments[language] || treatments.english;
}

function getFertilizerName(language) {
  const fertilizers = {
    hindi: 'यूरिया',
    marathi: 'युरिया',
    telugu: 'యూరియా',
    tamil: 'யூரியா',
    english: 'urea'
  };
  return fertilizers[language] || fertilizers.english;
}

function getWaterAmount(language) {
  const amounts = {
    hindi: '25-30 मिमी',
    marathi: '25-30 मिमी',
    telugu: '25-30 మిమీ',
    tamil: '25-30 மிமீ',
    english: '25-30mm'
  };
  return amounts[language] || amounts.english;
}

function getIrrigationMethod(language) {
  const methods = {
    hindi: 'ड्रिप सिंचाई',
    marathi: 'ड्रिप सिंचन',
    telugu: 'డ్రిప్ నీటిపారుదల',
    tamil: 'நூல் நீர்ப்பாசனம்',
    english: 'drip irrigation'
  };
  return methods[language] || methods.english;
}

// Get supported languages
router.get('/languages', (req, res) => {
  try {
    const languages = [
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
      { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
      { code: 'en', name: 'English', nativeName: 'English' }
    ];

    res.json({
      success: true,
      data: languages
    });
  } catch (error) {
    console.error('Languages endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve supported languages'
    });
  }
});

// Test endpoint to debug language object creation
router.post('/test-lang', (req, res) => {
  const { language: selectedLanguage } = req.body;
  
  let testObj;
  if (selectedLanguage === 'hi') {
    testObj = {
      language: 'hindi',
      name: 'Hindi',
      code: 'hi',
      confidence: 1.0
    };
  } else {
    testObj = {
      language: 'english',
      name: 'English', 
      code: 'en',
      confidence: 1.0
    };
  }
  
  console.log('Test object created:', JSON.stringify(testObj, null, 2));
  
  res.json({
    success: true,
    input: selectedLanguage,
    output: testObj,
    timestamp: new Date().toISOString()
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

function getSuitability(language) {
  const suitability = {
    hindi: 'अच्छा',
    marathi: 'चांगला',
    telugu: 'మంచిది',
    tamil: 'நல்லது',
    english: 'good'
  };
  return suitability[language] || suitability.english;
}

function getFertilizerName(language) {
  const fertilizers = {
    hindi: 'यूरिया और डीएपी',
    marathi: 'युरिया आणि डीएपी',
    telugu: 'యూరియా మరియు డీఏపి',
    tamil: 'யூரியா மற்றும் டிஏபி',
    english: 'Urea and DAP'
  };
  return fertilizers[language] || fertilizers.english;
}

function getWaterAmount(language) {
  const amounts = {
    hindi: '25-30 लीटर',
    marathi: '25-30 लीटर',
    telugu: '25-30 లీటర్లు',
    tamil: '25-30 லிட்டர்',
    english: '25-30 liters'
  };
  return amounts[language] || amounts.english;
}

function getIrrigationMethod(language) {
  const methods = {
    hindi: 'ड्रिप सिंचाई',
    marathi: 'ड्रिप सिंचन',
    telugu: 'డ్రిప్ నీటిపారుదల',
    tamil: 'துளி நீர்ப்பாசனம்',
    english: 'Drip irrigation'
  };
  return methods[language] || methods.english;
}

function getLanguageCode(language) {
  const codes = {
    'hindi': 'hi', 'marathi': 'mr', 'telugu': 'te', 'tamil': 'ta',
    'gujarati': 'gu', 'punjabi': 'pa', 'kannada': 'kn', 'malayalam': 'ml',
    'bengali': 'bn', 'english': 'en'
  };
  return codes[language] || 'en';
}

function getLanguageName(language) {
  const names = {
    'hindi': 'Hindi', 'marathi': 'Marathi', 'telugu': 'Telugu', 'tamil': 'Tamil',
    'gujarati': 'Gujarati', 'punjabi': 'Punjabi', 'kannada': 'Kannada', 'malayalam': 'Malayalam',
    'bengali': 'Bengali', 'english': 'English'
  };
  return names[language] || 'English';
}

function getNativeName(language) {
  const names = {
    'hindi': 'हिन्दी', 'marathi': 'मराठी', 'telugu': 'తెలుగు', 'tamil': 'தமிழ்',
    'gujarati': 'ગુજરાતી', 'punjabi': 'ਪੰਜਾਬੀ', 'kannada': 'ಕನ್ನಡ', 'malayalam': 'മലയാളം',
    'bengali': 'বাংলা', 'english': 'English'
  };
  return names[language] || 'English';
}

function getScript(language) {
  const scripts = {
    'hindi': 'devanagari', 'marathi': 'devanagari', 'telugu': 'telugu', 'tamil': 'tamil',
    'gujarati': 'gujarati', 'punjabi': 'gurmukhi', 'kannada': 'kannada', 'malayalam': 'malayalam',
    'bengali': 'bengali', 'english': 'latin'
  };
  return scripts[language] || 'latin';
}

module.exports = router;