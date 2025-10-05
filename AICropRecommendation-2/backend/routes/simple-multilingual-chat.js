const express = require('express');
const router = express.Router();

// Simple multilingual responses for farming AI
const RESPONSES = {
  hindi: {
    greeting: "नमस्ते! मैं आपका AI कृषि सहायक हूं। खेती से जुड़े किसी भी सवाल में आपकी मदद कर सकता हूं।",
    crop: "आपकी मिट्टी और जलवायु के अनुसार, मैं धान की खेती की सिफारिश करता हूं। बुआई का सबसे अच्छा समय खरीफ (जून-जुलाई) है।",
    weather: "वर्तमान मौसम की स्थिति अनुकूल दिखा रही है। यह आपकी फसलों के लिए अच्छी है।",
    disease: "आपके द्वारा बताए गए लक्षण पत्ती झुलसा रोग को दर्शाते हैं। तुरंत कॉपर सल्फेट का छिड़काव करें।",
    fertilizer: "आपकी मिट्टी के लिए यूरिया और डीएपी का प्रयोग करें। मात्रा 25-30 किलो प्रति एकड़ रखें।",
    general: "मैं आपकी सभी कृषि आवश्यकताओं में मदद के लिए यहां हूं। फसल की सिफारिश, रोग की पहचान, मौसम की सलाह और बाजार की कीमतों के बारे में पूछें!"
  },
  marathi: {
    greeting: "नमस्कार! मी तुमचा AI शेती सहाय्यक आहे। शेतीशी संबंधित कोणत्याही प्रश्नात मदत करू शकतो।",
    crop: "तुमच्या मातीच्या आणि हवामानाच्या परिस्थितीनुसार, मी भात पिकाची शिफारस करतो। लागवडीचा सर्वोत्तम काळ खरीप (जून-जुलै) आहे।",
    weather: "सध्याची हवामान परिस्थिती अनुकूल दिसते। हे तुमच्या पिकांसाठी चांगले आहे।",
    disease: "तुम्ही सांगितलेली लक्षणे पानांचा करपा रोग दर्शवतात। ताबडतोब कॉपर सल्फेटची फवारणी करा।",
    fertilizer: "तुमच्या मातीसाठी युरिया आणि डीएपी वापरा। प्रमाण 25-30 किलो प्रति एकर ठेवा।",
    general: "मी तुमच्या सर्व शेती गरजांमध्ये मदत करण्यासाठी येथे आहे। पीक शिफारस, रोग ओळख, हवामान सल्ला आणि बाजार भावांबद्दल विचारा!"
  },
  telugu: {
    greeting: "నమస్కారం! నేను మీ AI వ్యవసాయ సహాయకుడిని। వ్యవసాయానికి సంబంధించిన ఏ ప్రశ్నలోనైనా సహాయం చేయగలను।",
    crop: "మీ నేల మరియు వాతావరణ పరిస్థితులను బట్టి వరి సాగును సిఫార్సు చేస్తున్నాను। విత్తనాలకు ఉత్తమ సమయం ఖరీఫ్ (జూన్-జులై)।",
    weather: "ప్రస్తుత వాతావరణ పరిస్థితులు అనుకూలంగా ఉన్నాయి। ఇది మీ పంటలకు మంచిది।",
    disease: "మీరు చెప్పిన లక్షణాలు ఆకు కాలిక వ్యాధిని చూపిస్తున్నాయి। వెంటనే కాపర్ సల్ఫేట్ స్ప్రే చేయండి।",
    fertilizer: "మీ నేలకు యూరియా మరియు డీఏపి వాడండి। మోతాదు ఎకరానికి 25-30 కిలోలు ఉంచండి।",
    general: "వ్యవసాయానికి సంబంధించిన ఏ సమస్యలోనైనా మీకు సహాయం చేయగలను। పంటలు, వ్యాధులు, వాతావరణం మరియు మార్కెట్ ధరల గురించి అడగండి!"
  },
  tamil: {
    greeting: "வணக்கம்! நான் உங்கள் AI விவசாய உதவியாளர். விவசாயம் தொடர்பான எந்த கேள்விகளிலும் உதவ முடியும்।",
    crop: "உங்கள் மண் மற்றும் தட்பவெப்பநிலையின் அடிப்படையில் நெல் சாகுபடியை பரிந்துரைக்கிறேன். விதைப்புக்கு சிறந்த நேரம் கரீப் (ஜூன்-ஜூலை)।",
    weather: "தற்போதைய வானிலை நிலைமைகள் சாதகமாக உள்ளன। இது உங்கள் பயிர்களுக்கு நல்லது।",
    disease: "நீங்கள் சொன்ன அறிகுறிகள் இலை கருகல் நோயைக் காட்டுகின்றன. உடனே காப்பர் சல்பேட் தெளிப்பு செய்யுங்கள்।",
    fertilizer: "உங்கள் மண்ணுக்கு யூரியா மற்றும் டிஏபி பயன்படுத்துங்கள். அளவு ஏக்கருக்கு 25-30 கிலோ வைக்கவும்।",
    general: "விவசாயம் தொடர்பான எல்லா தேவைகளிலும் உங்களுக்கு உதவ நான் இங்கே இருக்கிறேன். பயிர் பரிந்துரை, நோய் அடையாளம், வானிலை ஆலோசனை மற்றும் சந்தை விலைகள் பற்றி கேளுங்கள்!"
  },
  english: {
    greeting: "Hello! I'm your AI farming assistant. I can help with any agriculture-related questions.",
    crop: "Based on your soil and climate conditions, I recommend Rice cultivation. The optimal planting season is Kharif (June-July).",
    weather: "Current weather conditions are favorable. This is good for your crops.",
    disease: "The symptoms you described indicate Leaf blight. Apply Copper sulfate spray immediately.",
    fertilizer: "For your soil type, use Urea and DAP. Keep the quantity at 25-30 kg per acre.",
    general: "I'm here to help with all your farming needs! Ask about crop recommendations, disease identification, weather advice, and market prices."
  }
};

// Simple language detection based on Unicode ranges
function detectLanguage(text) {
  if (!text) return 'english';
  
  // Hindi/Marathi (Devanagari)
  if (/[\u0900-\u097F]/.test(text)) {
    // More specific Marathi patterns
    if (/मराठी|महाराष्ट्र|पावसाळ्यात|खरीप|पीक/.test(text)) {
      return 'marathi';
    }
    return 'hindi';
  }
  
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(text)) return 'telugu';
  
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(text)) return 'tamil';
  
  return 'english';
}

// Simple category detection
function getCategory(message) {
  const lower = message.toLowerCase();
  
  if (lower.includes('crop') || lower.includes('फसल') || lower.includes('पीक') || lower.includes('పంట') || lower.includes('பயிர்')) {
    return 'crop';
  }
  if (lower.includes('weather') || lower.includes('मौसम') || lower.includes('हवामान') || lower.includes('వాతావరణం') || lower.includes('வானிலை')) {
    return 'weather';
  }
  if (lower.includes('disease') || lower.includes('रोग') || lower.includes('आजार') || lower.includes('వ్యాధి') || lower.includes('நோய்')) {
    return 'disease';
  }
  if (lower.includes('fertilizer') || lower.includes('खाद') || lower.includes('खत') || lower.includes('ఎరువు') || lower.includes('உரம்')) {
    return 'fertilizer';
  }
  
  return 'general';
}

router.post('/chat', (req, res) => {
  try {
    const { message, language, userId = 'anonymous' } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    // Determine language
    let selectedLanguage;
    if (language) {
      // Manual selection
      const langMap = {
        'hi': 'hindi', 'hindi': 'hindi',
        'mr': 'marathi', 'marathi': 'marathi',
        'te': 'telugu', 'telugu': 'telugu', 
        'ta': 'tamil', 'tamil': 'tamil',
        'en': 'english', 'english': 'english'
      };
      selectedLanguage = langMap[language.toLowerCase()] || 'english';
    } else {
      // Auto-detect
      selectedLanguage = detectLanguage(message);
    }
    
    // Get category and response
    const category = getCategory(message);
    const responses = RESPONSES[selectedLanguage] || RESPONSES.english;
    const response = responses[category] || responses.general;
    
    console.log(`✅ Language: ${selectedLanguage}, Category: ${category}`);
    console.log(`✅ Response: ${response.substring(0, 100)}...`);
    
    res.json({
      success: true,
      data: {
        response,
        detectedLanguage: {
          language: selectedLanguage,
          name: selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1),
          code: getLanguageCode(selectedLanguage),
          confidence: language ? 1.0 : 0.9
        },
        originalQuery: message,
        timestamp: new Date().toISOString(),
        userId
      }
    });
    
  } catch (error) {
    console.error('Simple chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
});

function getLanguageCode(language) {
  const codes = { hindi: 'hi', marathi: 'mr', telugu: 'te', tamil: 'ta', english: 'en' };
  return codes[language] || 'en';
}

module.exports = router;