/**
 * Language Detection Utility for Indian Languages
 * Detects input language and provides response templates
 */

// Language patterns for better detection of Indian languages
const LANGUAGE_PATTERNS = {
  hindi: {
    script: 'devanagari',
    unicodeRange: /[\u0900-\u097F]/,
    commonWords: ['में', 'है', 'के', 'की', 'और', 'से', 'को', 'पर', 'यह', 'वह', 'मैं', 'आप', 'हम', 'तुम'],
    patterns: [/क्या/, /कैसे/, /कहाँ/, /कब/, /कौन/, /क्यों/, /जो/, /जब/, /जहाँ/],
    name: 'Hindi',
    nativeName: 'हिन्दी',
    code: 'hi'
  },
  marathi: {
    script: 'devanagari',
    unicodeRange: /[\u0900-\u097F]/,
    commonWords: ['मध्ये', 'आहे', 'च्या', 'ची', 'आणि', 'पासून', 'ला', 'वर', 'हे', 'ते', 'मी', 'तुम्ही', 'आम्ही'],
    patterns: [/काय/, /कसे/, /कुठे/, /केव्हा/, /कोण/, /का/, /जे/, /जेव्हा/, /जिथे/],
    name: 'Marathi',
    nativeName: 'मराठी',
    code: 'mr'
  },
  gujarati: {
    script: 'gujarati',
    unicodeRange: /[\u0A80-\u0AFF]/,
    commonWords: ['માં', 'છે', 'ના', 'ની', 'અને', 'થી', 'ને', 'પર', 'આ', 'તે', 'હું', 'તમે', 'અમે'],
    patterns: [/શું/, /કેમ/, /ક્યાં/, /ક્યારે/, /કોણ/, /શા માટે/],
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    code: 'gu'
  },
  punjabi: {
    script: 'gurmukhi',
    unicodeRange: /[\u0A00-\u0A7F]/,
    commonWords: ['ਵਿੱਚ', 'ਹੈ', 'ਦੇ', 'ਦੀ', 'ਅਤੇ', 'ਤੋਂ', 'ਨੂੰ', 'ਤੇ', 'ਇਹ', 'ਉਹ', 'ਮੈਂ', 'ਤੁਸੀਂ', 'ਅਸੀਂ'],
    patterns: [/ਕੀ/, /ਕਿਵੇਂ/, /ਕਿੱਥੇ/, /ਕਦੋਂ/, /ਕੌਣ/, /ਕਿਉਂ/],
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    code: 'pa'
  },
  telugu: {
    script: 'telugu',
    unicodeRange: /[\u0C00-\u0C7F]/,
    commonWords: ['లో', 'ఉంది', 'యొక్క', 'మరియు', 'నుండి', 'కు', 'పై', 'ఇది', 'అది', 'నేను', 'మీరు', 'మేము'],
    patterns: [/ఏమిటి/, /ఎలా/, /ఎక్కడ/, /ఎప్పుడు/, /ఎవరు/, /ఎందుకు/],
    name: 'Telugu',
    nativeName: 'తెలుగు',
    code: 'te'
  },
  tamil: {
    script: 'tamil',
    unicodeRange: /[\u0B80-\u0BFF]/,
    commonWords: ['இல்', 'உள்ளது', 'ன்', 'மற்றும்', 'இருந்து', 'க்கு', 'மேல்', 'இது', 'அது', 'நான்', 'நீங்கள்', 'நாங்கள்'],
    patterns: [/என்ன/, /எப்படி/, /எங்கே/, /எப்போது/, /யார்/, /ஏன்/],
    name: 'Tamil',
    nativeName: 'தமிழ்',
    code: 'ta'
  },
  kannada: {
    script: 'kannada',
    unicodeRange: /[\u0C80-\u0CFF]/,
    commonWords: ['ನಲ್ಲಿ', 'ಇದೆ', 'ದ', 'ಮತ್ತು', 'ಇಂದ', 'ಗೆ', 'ಮೇಲೆ', 'ಇದು', 'ಅದು', 'ನಾನು', 'ನೀವು', 'ನಾವು'],
    patterns: [/ಏನು/, /ಹೇಗೆ/, /ಎಲ್ಲಿ/, /ಯಾವಾಗ/, /ಯಾರು/, /ಏಕೆ/],
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    code: 'kn'
  },
  malayalam: {
    script: 'malayalam',
    unicodeRange: /[\u0D00-\u0D7F]/,
    commonWords: ['ൽ', 'ഉണ്ട്', 'ന്റെ', 'ഉം', 'ൽ നിന്ന്', 'ക്ക്', 'മേൽ', 'ഇത്', 'അത്', 'ഞാൻ', 'നിങ്ങൾ', 'ഞങ്ങൾ'],
    patterns: [/എന്ത്/, /എങ്ങനെ/, /എവിടെ/, /എപ്പോൾ/, /ആര്/, /എന്തുകൊണ്ട്/],
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    code: 'ml'
  },
  bengali: {
    script: 'bengali',
    unicodeRange: /[\u0980-\u09FF]/,
    commonWords: ['এ', 'আছে', 'র', 'এবং', 'থেকে', 'কে', 'উপর', 'এই', 'সেই', 'আমি', 'আপনি', 'আমরা'],
    patterns: [/কি/, /কিভাবে/, /কোথায়/, /কখন/, /কে/, /কেন/],
    name: 'Bengali',
    nativeName: 'বাংলা',
    code: 'bn'
  },
  english: {
    script: 'latin',
    unicodeRange: /[a-zA-Z]/,
    commonWords: ['the', 'in', 'is', 'of', 'and', 'from', 'to', 'on', 'this', 'that', 'I', 'you', 'we'],
    patterns: [/what/, /how/, /where/, /when/, /who/, /why/, /which/],
    name: 'English',
    nativeName: 'English',
    code: 'en'
  }
};

/**
 * Detect language from input text
 * @param {string} text - Input text to analyze
 * @returns {Object} Language detection result
 */
function detectLanguage(text) {
  if (!text || typeof text !== 'string') {
    return {
      language: 'english',
      code: 'en',
      confidence: 0.5,
      name: 'English'
    };
  }

  const cleanText = text.trim().toLowerCase();
  const scores = {};

  // Initialize scores
  Object.keys(LANGUAGE_PATTERNS).forEach(lang => {
    scores[lang] = 0;
  });

  // Score based on Unicode ranges (highest weight)
  Object.entries(LANGUAGE_PATTERNS).forEach(([lang, config]) => {
    const matches = text.match(config.unicodeRange);
    if (matches) {
      scores[lang] += matches.length * 10; // High weight for script detection
    }
  });

  // Score based on common words (medium weight)
  Object.entries(LANGUAGE_PATTERNS).forEach(([lang, config]) => {
    config.commonWords.forEach(word => {
      if (cleanText.includes(word.toLowerCase())) {
        scores[lang] += 5;
      }
    });
  });

  // Score based on patterns (medium weight)
  Object.entries(LANGUAGE_PATTERNS).forEach(([lang, config]) => {
    config.patterns.forEach(pattern => {
      if (pattern.test(text)) {
        scores[lang] += 3;
      }
    });
  });

  // Find the language with highest score
  let detectedLang = 'english';
  let maxScore = 0;

  Object.entries(scores).forEach(([lang, score]) => {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  });

  // Calculate confidence based on score
  const totalPossibleScore = text.length * 2; // Rough estimate
  const confidence = Math.min(maxScore / totalPossibleScore, 1.0);

  const langConfig = LANGUAGE_PATTERNS[detectedLang];
  
  return {
    language: detectedLang,
    code: langConfig.code,
    confidence: Math.max(confidence, 0.1), // Minimum confidence
    name: langConfig.name,
    nativeName: langConfig.nativeName,
    script: langConfig.script
  };
}

/**
 * Get all supported languages
 * @returns {Array} List of supported languages
 */
function getSupportedLanguages() {
  return Object.entries(LANGUAGE_PATTERNS).map(([key, config]) => ({
    key,
    code: config.code,
    name: config.name,
    nativeName: config.nativeName,
    script: config.script
  }));
}

module.exports = {
  detectLanguage,
  getSupportedLanguages,
  LANGUAGE_PATTERNS
};