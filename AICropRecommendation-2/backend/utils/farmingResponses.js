/**
 * Multilingual Response Templates for AI Farming Assistant
 * Contains farming advice responses in multiple Indian languages
 */

const FARMING_RESPONSES = {
  // Hindi responses
  hindi: {
    greeting: [
      "नमस्ते! मैं आपका AI कृषि सहायक हूँ। खेती से जुड़े किसी भी सवाल में आपकी मदद कर सकता हूँ।",
      "आपका स्वागत है! फसल, रोग, मौसम या खेती की तकनीकों के बारे में पूछें।"
    ],
    cropRecommendation: [
      "आपकी मिट्टी और जलवायु के अनुसार, मैं {crop} की खेती की सिफारिश करता हूँ। बुआई का सबसे अच्छा समय {season} है।",
      "आपके खेत की स्थिति के लिए {crop} सबसे उपयुक्त होगी। पानी की उपलब्धता और बाजार भाव को ध्यान में रखें।",
      "मिट्टी की जांच के आधार पर {crop} उगाना सबसे बेहतर होगा। अपेक्षित उत्पादन {yield} टन प्रति एकड़ है।"
    ],
    diseaseIdentification: [
      "आपके द्वारा बताए गए लक्षणों से लगता है कि यह {disease} है। तुरंत {treatment} का प्रयोग करें।",
      "यह {disease} का मामला लग रहा है। {remedy} का छिड़काव करें और 7-10 दिन तक निगरानी रखें।",
      "इस समस्या का समाधान {solution} है। भविष्य में बचाव के लिए {prevention} अपनाएं।"
    ],
    weatherAdvice: [
      "मौसम की जानकारी के अनुसार {condition} है। आपकी फसल के लिए यह {suitability} है।",
      "आने वाले दिनों में {forecast} की संभावना है। फसल की सुरक्षा के लिए {action} करें।",
      "बारिश और तापमान को देखते हुए {recommendation} की सलाह दी जाती है।"
    ],
    fertilizerAdvice: [
      "आपकी मिट्टी के लिए {fertilizer} का प्रयोग करें। मात्रा {dosage} किलो प्रति एकड़ रखें।",
      "मिट्टी जांच के आधार पर आपकी भूमि में {nutrients} की कमी है। {timing} पर डालें।",
      "बेहतर उत्पादन के लिए {type} खाद का प्रयोग करें। {schedule} के अनुसार डालते रहें।"
    ],
    irrigationAdvice: [
      "आपकी फसल को सप्ताह में {amount} पानी चाहिए। {method} सिंचाई की सलाह है।",
      "पानी देने का सबसे अच्छा समय {schedule} है। मिट्टी की नमी की जांच करते रहें।",
      "पानी की बचत के लिए {technique} का प्रयोग करें। इससे उत्पादन भी बेहतर होगा।"
    ],
    general: [
      "खेती से जुड़ी किसी भी समस्या में मैं आपकी मदद कर सकता हूँ। कृपया अपना प्रश्न विस्तार से बताएं।",
      "मैं यहाँ आपकी सहायता के लिए हूँ। फसल, बीमारी, खाद या सिंचाई के बारे में पूछें।"
    ]
  },

  // Marathi responses
  marathi: {
    greeting: [
      "नमस्कार! मी तुमचा AI शेती सहाय्यक आहे। शेतीशी संबंधित कोणत्याही प्रश्नात मदत करू शकतो।",
      "तुमचे स्वागत आहे! पिके, रोग, हवामान किंवा शेतीच्या तंत्रांबद्दल विचारा।"
    ],
    cropRecommendation: [
      "तुमच्या मातीचा आणि हवामानाचा विचार करता {crop} पिकाची शिफारस करतो। लागवडीचा सर्वोत्तम काळ {season} आहे।",
      "तुमच्या शेताच्या परिस्थितीसाठी {crop} सर्वात योग्य आहे। पाण्याची उपलब्धता आणि बाजारभाव लक्षात घ्या।",
      "मातीच्या तपासणीच्या आधारे {crop} लागवड करणे चांगले होईल। अपेक्षित उत्पादन {yield} टन प्रति एकर आहे।"
    ],
    diseaseIdentification: [
      "तुम्ही सांगितलेल्या लक्षणांवरून हा {disease} आजार दिसतो. त्वरित {treatment} वापरा।",
      "हे {disease} चे प्रकरण आहे असे दिसते. {remedy} ची फवारणी करा आणि 7-10 दिवस निरीक्षण ठेवा।",
      "या समस्येचा उपाय {solution} आहे. भविष्यात टाळण्यासाठी {prevention} अवलंबा।"
    ],
    weatherAdvice: [
      "हवामानाच्या माहितीनुसार {condition} आहे. तुमच्या पिकासाठी हे {suitability} आहे।",
      "येत्या दिवसांत {forecast} ची शक्यता आहे. पिकांच्या संरक्षणासाठी {action} करा।",
      "पाऊस आणि तापमान पाहता {recommendation} चा सल्ला दिला जातो।"
    ],
    fertilizerAdvice: [
      "तुमच्या मातीसाठी {fertilizer} वापरा. प्रमाण {dosage} किलो प्रति एकर ठेवा।",
      "मातीच्या तपासणीनुसार तुमच्या जमिनीत {nutrients} ची कमतरता आहे. {timing} वर टाका।",
      "चांगल्या उत्पादनासाठी {type} खत वापरा. {schedule} प्रमाणे टाकत रहा।"
    ],
    irrigationAdvice: [
      "तुमच्या पिकाला आठवड्यातून {amount} पाणी लागते. {method} सिंचनाचा सल्ला आहे।",
      "पाणी देण्याचा सर्वोत्तम वेळ {schedule} आहे. मातीतील ओलावा तपासत रहा।",
      "पाण्याची बचत करण्यासाठी {technique} वापरा. यातून उत्पादनही चांगले होईल।"
    ],
    general: [
      "शेतीशी संबंधित कोणत्याही समस्येत मी तुमची मदत करू शकतो. कृपया तुमचा प्रश्न तपशीलाने सांगा।",
      "मी तुमच्या मदतीसाठी येथे आहे. पिके, आजार, खत किंवा सिंचनाबद्दल विचारा।"
    ]
  },

  // Telugu responses
  telugu: {
    greeting: [
      "నమస్కారం! నేను మీ AI వ్యవసాయ సహాయకుడిని. వ్యవసాయానికి సంబంధించిన ఏ ప్రశ్నలోనైనా సహాయం చేయగలను।",
      "మీకు స్వాగతం! పంటలు, వ్యాధులు, వాతావరణం లేదా వ్యవసాయ పద్ధతుల గురించి అడగండి।"
    ],
    cropRecommendation: [
      "మీ నేల మరియు వాతావరణ పరిస్థితులను బట్టి {crop} సాగును సిఫార్సు చేస్తున్నాను. విత్తనాలకు ఉత్తమ సమయం {season}.",
      "మీ పొలం పరిస్థితులకు {crop} అత్యంత అనుకూలంగా ఉంటుంది. నీటి అందుబాటు మరియు మార్కెట్ ధరలను దృష్టిలో ఉంచుకోండి।",
      "నేల పరీక్ష ఆధారంగా {crop} సాగు చేయడం మంచిది. అంచనా దిగుబడి {yield} టన్నుల ప్రతి ఎకరానికి."
    ],
    diseaseIdentification: [
      "మీరు చెప్పిన లక్షణాలను బట్టి ఇది {disease} వ్యాధిగా కనిపిస్తుంది. వెంటనే {treatment} ఉపయోగించండి।",
      "ఇది {disease} కేసుగా అనిపిస్తుంది. {remedy} స్ప్రే చేసి 7-10 రోజులు పరిశీలించండి।",
      "ఈ సమస్యకు పరిష్కారం {solution}. భవిష్యత్తులో నివారణకు {prevention} అనుసరించండి।"
    ],
    general: [
      "వ్యవసాయానికి సంబంధించిన ఏ సమస్యలోనైనా మీకు సహాయం చేయగలను. దయచేసి మీ ప్రశ్నను వివరంగా చెప్పండి।",
      "నేను మీ సహాయం కోసం ఇక్కడ ఉన్నాను. పంటలు, వ్యాధులు, ఎరువులు లేదా నీటిపారుదల గురించి అడగండి।"
    ]
  },

  // Tamil responses
  tamil: {
    greeting: [
      "வணக்கம்! நான் உங்கள் AI விவசாய உதவியாளர். விவசாயம் தொடர்பான எந்த கேள்விகளிலும் உதவ முடியும்।",
      "உங்களை வரவேற்கிறேன்! பயிர்கள், நோய்கள், வானிலை அல்லது விவசாய முறைகள் பற்றி கேளுங்கள்।"
    ],
    cropRecommendation: [
      "உங்கள் மண் மற்றும் தட்பவெப்பநிலையின் அடிப்படையில் {crop} சாகுபடியை பரிந்துரைக்கிறேன். விதைப்புக்கு சிறந்த நேரம் {season}.",
      "உங்கள் வயல் நிலைமைகளுக்கு {crop} மிகவும் பொருத்தமானது. நீர் கிடைக்கும் தன்மை மற்றும் சந்தை விலைகளை கவனித்துக் கொள்ளுங்கள்।"
    ],
    general: [
      "விவசாயம் தொடர்பான எந்த பிரச்சினையிலும் உங்களுக்கு உதவ முடியும். தயவுசெய்து உங்கள் கேள்வியை விரிவாக சொல்லுங்கள்।",
      "நான் உங்கள் உதவிக்காக இங்கே இருக்கிறேன். பயிர்கள், நோய்கள், உரங்கள் அல்லது நீர்ப்பாசனம் பற்றி கேளுங்கள்।"
    ]
  },

  // English responses (fallback)
  english: {
    greeting: [
      "Hello! I'm your AI farming assistant. I can help with any agriculture-related questions.",
      "Welcome! Feel free to ask about crops, diseases, weather, or farming techniques."
    ],
    cropRecommendation: [
      "Based on your soil and climate conditions, I recommend {crop} cultivation. The best planting season is {season}.",
      "For your farm conditions, {crop} would be most suitable. Consider water availability and market prices.",
      "According to soil analysis, {crop} farming would be optimal. Expected yield is {yield} tons per acre."
    ],
    diseaseIdentification: [
      "The symptoms you described indicate {disease}. Apply {treatment} immediately.",
      "This appears to be {disease}. Use {remedy} and monitor for 7-10 days.",
      "The solution for this problem is {solution}. For future prevention, follow {prevention}."
    ],
    weatherAdvice: [
      "Current weather conditions show {condition}. This is {suitability} for your crops.",
      "Weather forecast indicates {forecast}. I recommend {action} for crop protection.",
      "Considering rainfall and temperature, {recommendation} is advised."
    ],
    fertilizerAdvice: [
      "For your soil type, apply {fertilizer} at {dosage} kg per acre.",
      "Based on soil analysis, your land needs {nutrients}. Apply during {timing}.",
      "For better production, use {type} fertilizer following {schedule}."
    ],
    irrigationAdvice: [
      "Your crops need {amount} water per week. {method} irrigation is recommended.",
      "Optimal watering time is {schedule}. Monitor soil moisture regularly.",
      "Use {technique} for water conservation and better yield."
    ],
    general: [
      "I can help with any farming-related issues. Please describe your question in detail.",
      "I'm here to assist you. Ask about crops, diseases, fertilizers, or irrigation."
    ]
  }
};

/**
 * Get a random response from a category in specified language
 * @param {string} language - Target language
 * @param {string} category - Response category
 * @param {Object} placeholders - Values to replace in template
 * @returns {string} Formatted response
 */
function getResponse(language, category, placeholders = {}) {
  // Fallback to English if language not supported
  const supportedLanguage = FARMING_RESPONSES[language] ? language : 'english';
  const responses = FARMING_RESPONSES[supportedLanguage];
  
  if (!responses || !responses[category]) {
    return FARMING_RESPONSES.english.general[0];
  }

  // Get random response from category
  const categoryResponses = responses[category];
  const randomResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];

  // Replace placeholders
  let finalResponse = randomResponse;
  Object.entries(placeholders).forEach(([key, value]) => {
    finalResponse = finalResponse.replace(new RegExp(`{${key}}`, 'g'), value);
  });

  return finalResponse;
}

/**
 * Determine response category based on user query
 * @param {string} query - User's question
 * @param {string} language - Detected language
 * @returns {string} Response category
 */
function categorizeQuery(query, language) {
  const lowerQuery = query.toLowerCase();

  // Farming/crop related keywords in multiple languages
  const cropKeywords = {
    english: ['crop', 'plant', 'grow', 'cultivation', 'farming', 'agriculture', 'seed', 'harvest'],
    hindi: ['फसल', 'पौधा', 'उगाना', 'खेती', 'कृषि', 'बीज', 'फ़सल', 'किस्म'],
    marathi: ['पीक', 'रोप', 'लागवड', 'शेती', 'बी', 'कापणी'],
    telugu: ['పంట', 'మొక్క', 'వృద్ధి', 'సాగు', 'వ్యవసాయం', 'విత్తనం'],
    tamil: ['பயிர்', 'செடி', 'வளர்', 'சாகுபடி', 'விவசாயம், விதை']
  };

  // Disease related keywords
  const diseaseKeywords = {
    english: ['disease', 'pest', 'infection', 'problem', 'leaf', 'spot', 'blight', 'fungus'],
    hindi: ['बीमारी', 'रोग', 'कीट', 'संक्रमण', 'समस्या', 'पत्ती', 'धब्बा'],
    marathi: ['आजार', 'रोग', 'किडे', 'संसर्ग', 'समस्या', 'पान'],
    telugu: ['వ్యాధి', 'రోగం', 'పురుగులు', 'సంక్రమణ', 'సమస్య', 'ఆకు'],
    tamil: ['நோய்', 'பூச்சி', 'தொற்று', 'பிரச்சினை', 'இலை']
  };

  // Weather related keywords
  const weatherKeywords = {
    english: ['weather', 'rain', 'temperature', 'climate', 'season', 'monsoon'],
    hindi: ['मौसम', 'बारिश', 'तापमान', 'जलवायु', 'सीजन', 'मानसून'],
    marathi: ['हवामान', 'पाऊस', 'तापमान', 'हवामान', 'हंगाम', 'पावसाळा'],
    telugu: ['వాతావరణం', 'వర్షం', 'ఉష్ణోగ్రత', 'వాతావరణం', 'కాలం'],
    tamil: ['வானிலை', 'மழை', 'வெப்பநிலை', 'தட்பவெప்பநிலை', 'பருவம்']
  };

  // Check for category matches
  const allKeywords = [
    ...cropKeywords[language] || [],
    ...cropKeywords.english
  ];
  
  if (allKeywords.some(keyword => lowerQuery.includes(keyword))) {
    return 'cropRecommendation';
  }

  const allDiseaseKeywords = [
    ...diseaseKeywords[language] || [],
    ...diseaseKeywords.english
  ];
  
  if (allDiseaseKeywords.some(keyword => lowerQuery.includes(keyword))) {
    return 'diseaseIdentification';
  }

  const allWeatherKeywords = [
    ...weatherKeywords[language] || [],
    ...weatherKeywords.english
  ];
  
  if (allWeatherKeywords.some(keyword => lowerQuery.includes(keyword))) {
    return 'weatherAdvice';
  }

  // Default to general
  return 'general';
}

module.exports = {
  FARMING_RESPONSES,
  getResponse,
  categorizeQuery
};