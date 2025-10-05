const express = require('express');
const router = express.Router();

// Gemini AI configuration (will be imported when dependencies are installed)
let genai;
try {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  if (process.env.GEMINI_API_KEY) {
    genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (error) {
  console.log('Google Generative AI not installed. Install it with: npm install @google/generative-ai');
}

/**
 * Call Gemini API for a response
 * @param {string} prompt - The user's message
 * @param {string} model - The model to use (default: gemini-2.0-flash-exp)
 * @param {string} language - The language preference (optional)
 * @returns {Promise<string>} - The AI response
 */
async function geminiChat(prompt, model = "gemini-2.0-flash-exp", selectedLanguage = null) {
  try {
    if (!genai) {
      return "AI service is not configured. Please check the server configuration.";
    }

    // Create model instance
    const modelInstance = genai.getGenerativeModel({ model });
    
    // Map frontend language codes to display names
    const languageMapping = {
      'hi-IN': 'Hindi',
      'en-IN': 'English',
      'en-US': 'English',
      'mr-IN': 'Marathi',
      'ta-IN': 'Tamil',
      'te-IN': 'Telugu',
      'gu-IN': 'Gujarati',
      'kn-IN': 'Kannada',
      'ml-IN': 'Malayalam',
      'bn-IN': 'Bengali',
      'pa-IN': 'Punjabi',
      'or-IN': 'Odia'
    };
    
    // Use manually selected language if provided, otherwise detect from text
    let targetLanguage = 'English';
    let useSelectedLanguage = false;
    
    if (selectedLanguage && languageMapping[selectedLanguage]) {
      targetLanguage = languageMapping[selectedLanguage];
      useSelectedLanguage = true;
      console.log(`Using manually selected language: ${targetLanguage} (${selectedLanguage})`);
    } else {
      // Fallback to automatic detection
      const containsDevanagari = /[\u0900-\u097F]/.test(prompt);
      const containsTamil = /[\u0B80-\u0BFF]/.test(prompt);
      const containsTelugu = /[\u0C00-\u0C7F]/.test(prompt);
      const containsGujarati = /[\u0A80-\u0AFF]/.test(prompt);
      const containsBengali = /[\u0980-\u09FF]/.test(prompt);
      const containsKannada = /[\u0C80-\u0CFF]/.test(prompt);
      const containsMalayalam = /[\u0D00-\u0D7F]/.test(prompt);
      const containsPunjabi = /[\u0A00-\u0A7F]/.test(prompt);
      const containsOdia = /[\u0B00-\u0B7F]/.test(prompt);
      
      if (containsDevanagari) {
        if (/[ळ]/.test(prompt) || /\bआहे\b|\bमी\b|\bतू\b|\bत्या\b|\bहा\b|\bया\b/.test(prompt)) {
          targetLanguage = 'Marathi';
        } else {
          targetLanguage = 'Hindi';
        }
      } else if (containsTamil) {
        targetLanguage = 'Tamil';
      } else if (containsTelugu) {
        targetLanguage = 'Telugu';
      } else if (containsGujarati) {
        targetLanguage = 'Gujarati';
      } else if (containsBengali) {
        targetLanguage = 'Bengali';
      } else if (containsKannada) {
        targetLanguage = 'Kannada';
      } else if (containsMalayalam) {
        targetLanguage = 'Malayalam';
      } else if (containsPunjabi) {
        targetLanguage = 'Punjabi';
      } else if (containsOdia) {
        targetLanguage = 'Odia';
      }
      console.log(`Auto-detected language: ${targetLanguage}`);
    }
    
    const isIndianLanguage = targetLanguage !== 'English';
    
    // Enhanced prompt for farming context with specific language matching
    let farmingPrompt = `You are a friendly and knowledgeable farming assistant chatbot for CropAI platform.
You specialize in:
- Crop recommendations and cultivation practices
- Disease identification and treatment
- Soil management and fertilization
- Weather considerations for farming
- Market insights and pricing
- Sustainable farming practices
- Pest control and prevention
- Irrigation and water management

CRITICAL LANGUAGE MATCHING INSTRUCTIONS:
${useSelectedLanguage ? 
  `- The user has MANUALLY SELECTED ${targetLanguage} as their preferred language
- You MUST respond ONLY in ${targetLanguage} language
- IGNORE the language of the input text - respond in ${targetLanguage} only
- This is a MANUAL LANGUAGE PREFERENCE that overrides text detection` :
  `- The user has asked in ${targetLanguage} (auto-detected from text)
- You MUST respond ONLY in ${targetLanguage} language`}

- DO NOT mix languages in your response
- If the target language is Marathi, respond completely in Marathi (मराठी)
- If the target language is Hindi, respond completely in Hindi (हिंदी)
- If the target language is Tamil, respond completely in Tamil (தமிழ்)
- If the target language is Telugu, respond completely in Telugu (తెలుగు)
- If the target language is Gujarati, respond completely in Gujarati (ગુજરાતી)
- If the target language is Bengali, respond completely in Bengali (বাংলা)
- If the target language is Kannada, respond completely in Kannada (ಕನ್ನಡ)
- If the target language is Malayalam, respond completely in Malayalam (മലയാളം)
- If the target language is Punjabi, respond completely in Punjabi (ਪੰਜਾਬੀ)
- If the target language is English, respond in clear, simple English

${isIndianLanguage ? `Provide practical farming advice relevant to Indian agriculture in ${targetLanguage}.` : 'Focus on practical farming advice.'}

ABSOLUTE REQUIREMENT: Your entire response must be in ${targetLanguage} language only. Do not use any other language.

User asked: ${prompt}`;
    
    // Generate response
    const result = await modelInstance.generateContent(farmingPrompt);
    
    if (result.response && result.response.text) {
      return result.response.text().trim();
    } else {
      // Language-specific error messages
      const errorMessages = {
        'Hindi': 'कोई उत्तर उत्पन्न नहीं हुआ। कृपया अपना प्रश्न अलग तरीके से पूछने का प्रयास करें।',
        'Marathi': 'कोणताही उत्तर तयार झाला नाही. कृपया तुमचा प्रश्न वेगळ्या पद्धतीने विचारण्याचा प्रयत्न करा.',
        'Tamil': 'எந்த பதிலும் உருவாக்கப்படவில்லை. தயவுசெய்து உங்கள் கேள்வியை வேறு வழியில் கேட்க முயற்சிக்கவும்.',
        'Telugu': 'ఎలాంటి సమాధానం రాలేదు. దయచేసి మీ ప్రశ్నను వేరే విధంగా అడిగే ప్రయత్నం చేయండి.',
        'Gujarati': 'કોઈ જવાબ બનાવાયો નથી. કૃપયા તમારો પ્રશ્ન અલગ રીતે પૂછવાનો પ્રયાસ કરો.',
        'Bengali': 'কোন উত্তর তৈরি হয়নি। দয়া করে আপনার প্রশ্নটি ভিন্নভাবে জিজ্ঞাসা করার চেষ্টা করুন।',
        'Kannada': 'ಯಾವುದೇ ಉತ್ತರ ಸೃಷ್ಟಿಯಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ವಿಭಿನ್ನ ರೀತಿಯಲ್ಲಿ ಕೇಳಲು ಪ್ರಯತ್ನಿಸಿ.',
        'Malayalam': 'ഒരു മറുപടിയും സൃഷ്ടിച്ചിട്ടില്ല. ദയവായി നിങ്ങളുടെ ചോദ്യം വ്യത്യസ്തമായി ചോദിക്കാൻ ശ്രമിക്കുക.',
        'Punjabi': 'ਕੋਈ ਜਵਾਬ ਤਿਆਰ ਨਹੀਂ ਹੋਇਆ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਸਵਾਲ ਵੱਖਰੇ ਤਰੀਕੇ ਨਾਲ ਪੁੱਛਣ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
        'Odia': 'କୌଣସି ଉତ୍ତର ସୃଷ୍ଟି ହୋଇନାହିଁ। ଦୟାକରି ଆପଣଙ୍କ ପ୍ରଶ୍ନକୁ ଅଲଗା ଉପାୟରେ ପଚାରିବାକୁ ଚେଷ୍ଟା କରନ୍ତୁ।',
        'English': 'No response generated. Please try asking your question differently.'
      };
      return errorMessages[targetLanguage] || errorMessages['English'];
    }
    
  } catch (error) {
    console.error('Gemini API error:', error);
    // Language-specific error messages for API errors
    const apiErrorMessages = {
      'Hindi': 'क्षमा करें, मुझे अभी उत्तर देने में समस्या हो रही है। कृपया बाद में फिर कोशिश करें।',
      'Marathi': 'क्षमा करा, मला सध्या उत्तर देण्यात समस्या येत आहे. कृपया नंतर पुन्हा प्रयत्न करा.',
      'Tamil': 'மன்னிக்கவும், எனக்கு இப்போது பதிலளிப்பதில் சிக்கல் உள்ளது. தயவுசெய்து பின்னர் மீண்டும் முயற்சிக்கவும்.',
      'Telugu': 'క్షమించండి, నాకు ఇప్పుడు సమాధానం ఇవ్వడంలో ఇబ్బంది ఉంది. దయచేసి తరువాత మళ్ళీ ప్రయత్నించండి.',
      'Gujarati': 'માફ કરશો, મને અત્યારે જવાબ આપવામાં મુશ્કેલી આવી રહી છે. કૃપયા પછીથી ફરી પ્રયાસ કરો.',
      'Bengali': 'দুঃখিত, আমার এখন উত্তর দিতে সমস্যা হচ্ছে। দয়া করে পরে আবার চেষ্টা করুন।',
      'Kannada': 'ಕ್ಷಮಿಸಿ, ನನಗೆ ಈಗ ಉತ್ತರಿಸಲು ತೊಂದರೆಯಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
      'Malayalam': 'ക്ഷമിക്കണം, എനിക്ക് ഇപ്പോൾ ഉത്തരം നൽകുന്നതിൽ പ്രശ്‌നമുണ്ട്. ദയവായി പിന്നീട് വീണ്ടും ശ്രമിക്കുക.',
      'Punjabi': 'ਮਾਫ ਕਰਨਾ, ਮੈਨੂੰ ਹੁਣ ਜਵਾਬ ਦੇਣ ਵਿੱਚ ਮੁਸ਼ਕਲ ਆ ਰਹੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਫਿਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      'Odia': 'କ୍ଷମା କରନ୍ତୁ, ମୋର ବର୍ତ୍ତମାନ ଉତ୍ତର ଦେବାରେ ସମସ୍ୟା ହେଉଛି। ଦୟାକରି ପରେ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
      'English': 'Sorry, I am having trouble answering right now. Please try again later.'
    };
    return apiErrorMessages[targetLanguage] || apiErrorMessages['English'];
  }
}

// POST /api/chatbot - Send message to AI chatbot
router.post('/', async (req, res) => {
  try {
    const { message, selectedLanguage } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        error: 'Message is required',
        response: 'Please type something!' 
      });
    }

    // Get AI response with selected language preference
    const botResponse = await geminiChat(message, "gemini-2.0-flash-exp", selectedLanguage);
    
    res.json({ response: botResponse });
    
  } catch (error) {
    console.error('Chatbot route error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      response: 'Sorry, I am having trouble answering right now. Please try again later.'
    });
  }
});

// GET /api/chatbot - Health check
router.get('/', (req, res) => {
  res.json({ 
    message: 'CropAI Chatbot API is running',
    status: 'healthy',
    aiConfigured: !!genai
  });
});

module.exports = router;