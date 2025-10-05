'use client';

import React, { useState, useEffect } from 'react';
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  Send,
  Globe,
  Square
} from "lucide-react";

export default function HelpPage() {
  const [messages, setMessages] = useState<Array<{text: string, sender: 'user' | 'bot'}>>([
    {
      text: "Hello! I'm your AI farming assistant. I can help you with crop recommendations, disease detection, farming practices, and more. How can I assist you today?\n\nनमस्ते! मैं आपका AI कृषि सहायक हूँ। मैं फसल की सिफारिशें, रोग की पहचान, कृषि प्रथाओं और अधिक में आपकी सहायता कर सकता हूँ। आज मैं आपकी कैसे सहायता कर सकता हूँ?",
      sender: 'bot'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('en-IN');
  const [recordingStatus, setRecordingStatus] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  // Auto-detect user's preferred language on component mount
  useEffect(() => {
    const browserLang = navigator.language || 'en-IN';
    if (browserLang.startsWith('hi') || browserLang === 'hi-IN') {
      setVoiceLanguage('hi-IN');
    } else if (browserLang.includes('IN')) {
      setVoiceLanguage('en-IN');
    }
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          selectedLanguage: voiceLanguage 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { text: data.response, sender: 'bot' }]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = voiceLanguage === 'hi-IN' 
        ? "क्षमा करें, मुझे अभी उत्तर देने में समस्या हो रही है। कृपया बाद में फिर कोशिश करें।"
        : "Sorry, I'm having trouble responding right now. Please try again later.";
      setMessages(prev => [...prev, { 
        text: errorMessage, 
        sender: 'bot' 
      }]);
    }

    setIsLoading(false);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      const message = voiceLanguage === 'hi-IN' 
        ? 'आवाज़ पहचान इस ब्राउज़र में समर्थित नहीं है। कृपया Chrome का उपयोग करें।'
        : 'Voice recognition is not supported in this browser. Please use Chrome.';
      alert(message);
      return;
    }

    const recognitionInstance = new (window as any).webkitSpeechRecognition();
    recognitionInstance.lang = voiceLanguage;
    recognitionInstance.continuous = true; // Keep listening continuously
    recognitionInstance.interimResults = true; // Show interim results
    recognitionInstance.maxAlternatives = 1;
    
    setRecognition(recognitionInstance);

    recognitionInstance.onstart = () => {
      setIsListening(true);
      setRecordingStatus(voiceLanguage === 'hi-IN' ? '🎤 सुन रहा हूँ... बोलते रहें!' : '🎤 Listening... Keep speaking!');
      console.log(`Speech recognition started for language: ${voiceLanguage}`);
    };

    recognitionInstance.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update the input with final transcript, show interim in placeholder or status
      if (finalTranscript) {
        setInputMessage(prev => prev + finalTranscript);
        console.log('Final transcript:', finalTranscript);
      }
      
      if (interimTranscript && isListening) {
        const statusText = voiceLanguage === 'hi-IN' 
          ? `🎤 सुन रहा हूँ: "${interimTranscript}"`
          : `🎤 Listening: "${interimTranscript}"`;
        setRecordingStatus(statusText);
      }
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      
      // Don't stop on no-speech error, just continue listening
      if (event.error === 'no-speech') {
        console.log('No speech detected - continuing to listen...');
        setRecordingStatus(voiceLanguage === 'hi-IN' ? '🎤 सुन रहा हूँ... बोलें!' : '🎤 Listening... Please speak!');
        return; // Don't stop recognition
      }

      // For other errors, stop and show message
      setIsListening(false);
      setRecordingStatus('');
      
      let errorMessage = voiceLanguage === 'hi-IN' 
        ? 'आवाज़ पहचान में त्रुटि। कृपया फिर कोशिश करें।'
        : 'Voice recognition error. Please try again.';
        
      if (event.error === 'audio-capture') {
        errorMessage = voiceLanguage === 'hi-IN'
          ? 'माइक्रोफ़ोन उपलब्ध नहीं है। कृपया अनुमतियां जांचें।'
          : 'Microphone not accessible. Please check permissions.';
      } else if (event.error === 'not-allowed') {
        errorMessage = voiceLanguage === 'hi-IN'
          ? 'माइक्रोफ़ोन की अनुमति नकारी गई। कृपया माइक्रोफ़ोन पहुंच की अनुमति दें।'
          : 'Microphone permission denied. Please allow microphone access.';
      } else if (event.error === 'network') {
        errorMessage = voiceLanguage === 'hi-IN'
          ? 'नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।'
          : 'Network error. Please check your internet connection.';
      }
      
      alert(errorMessage);
    };

    recognitionInstance.onend = () => {
      // Only stop if we manually stopped it, otherwise restart
      if (isListening) {
        console.log('Recognition ended unexpectedly, restarting...');
        setTimeout(() => {
          if (recognition && isListening) {
            recognitionInstance.start();
          }
        }, 100);
      } else {
        setRecordingStatus('');
      }
    };

    recognitionInstance.start();
  };

  const stopListening = () => {
    if (recognition && isListening) {
      setIsListening(false); // Set this first to prevent restart
      recognition.stop();
      setRecordingStatus(voiceLanguage === 'hi-IN' ? '✋ रिकॉर्डिंग बंद की गई' : '✋ Recording stopped');
      setTimeout(() => setRecordingStatus(''), 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Page Header */}
      <div className="pt-8 pb-8 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              AI Farming Assistant
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Get instant farming advice from our AgriBot AI assistant. Ask questions about crops, diseases, and agricultural practices.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* AI Chatbot - Full Width */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <MessageCircle className="w-6 h-6 mr-2" />
              AI Farming Assistant
            </h2>
            <p className="text-green-100 text-sm">
              Ask me anything about farming, crops, diseases, or agricultural practices
            </p>
          </div>

          {/* Messages */}
          <div className="h-[600px] overflow-y-auto p-6 bg-gray-50">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Language Selector */}
          <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Voice Language:</span>
              </div>
              <select
                value={voiceLanguage}
                onChange={(e) => setVoiceLanguage(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="hi-IN">हिंदी (Hindi)</option>
                <option value="en-IN">English (India)</option>
                <option value="en-US">English (US)</option>
                <option value="mr-IN">मराठी (Marathi)</option>
                <option value="ta-IN">தமிழ் (Tamil)</option>
                <option value="te-IN">తెలుగు (Telugu)</option>
                <option value="gu-IN">ગુજરાતી (Gujarati)</option>
                <option value="kn-IN">ಕನ್ನಡ (Kannada)</option>
                <option value="ml-IN">മലയാளം (Malayalam)</option>
                <option value="bn-IN">বাংলা (Bengali)</option>
                <option value="pa-IN">ਪੰਜਾਬੀ (Punjabi)</option>
              </select>
            </div>
            
            {/* Recording Status */}
            {recordingStatus && (
              <div className="mt-2 text-center">
                <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  {recordingStatus}
                </span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    voiceLanguage === 'hi-IN' 
                      ? "मुझसे खेती, फसलों, बीमारियों के बारे में पूछें..." 
                      : "Ask me about farming, crops, diseases..."
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              {/* Start Voice Button */}
              <Button
                onClick={startListening}
                disabled={isListening}
                variant="outline"
                size="sm"
                className={`relative ${
                  isListening 
                    ? 'bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed' 
                    : 'border-green-300 text-green-600 hover:bg-green-50'
                }`}
                title={`Start voice input (${voiceLanguage === 'hi-IN' ? 'Hindi' : voiceLanguage === 'en-IN' ? 'English (India)' : voiceLanguage})`}
              >
                <Mic className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 text-[10px] bg-green-500 text-white rounded-full px-1 leading-none">
                  {voiceLanguage === 'hi-IN' ? 'हि' : voiceLanguage === 'en-IN' ? 'EN' : voiceLanguage.split('-')[0].toUpperCase()}
                </span>
              </Button>

              {/* Stop Voice Button */}
              <Button
                onClick={stopListening}
                disabled={!isListening}
                variant="outline"
                size="sm"
                className={`relative ${
                  isListening 
                    ? 'bg-red-100 border-red-300 text-red-600 hover:bg-red-50' 
                    : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                }`}
                title="Stop voice input"
              >
                <Square className="w-4 h-4" />
              </Button>

              {/* Send Button */}

              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              {voiceLanguage === 'hi-IN' 
                ? "भेजने के लिए Enter दबाएं • माइक्रोफ़ोन शुरू करें, बोलें, फिर रोकें और भेजें"
                : "Press Enter to send • Start microphone, speak, then stop and send"
              }
            </p>
            
            <div className="mt-2 text-xs text-gray-400">
              <p>
                {voiceLanguage === 'hi-IN' 
                  ? "💡 सुझाव: शांत वातावरण में माइक्रोफ़ोन के पास बोलें और रोकने से पहले पूरा वाक्य बोलें"
                  : "💡 Tip: Speak close to microphone in a quiet environment and finish your sentence before stopping"
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}