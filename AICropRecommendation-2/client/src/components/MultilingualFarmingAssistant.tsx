"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Send, 
  Bot, 
  User, 
  Languages, 
  Loader2, 
  Copy,
  RefreshCw,
  MessageCircle,
  Sparkles,
  Globe
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  language?: {
    language: string;
    name: string;
    nativeName: string;
    code: string;
    confidence: number;
  };
  category?: string;
}

interface SupportedLanguage {
  key: string;
  code: string;
  name: string;
  nativeName: string;
  script: string;
}

export default function MultilingualFarmingAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLanguage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Welcome messages in different languages
  const welcomeMessages = {
    hindi: "नमस्ते! मैं आपका AI कृषि सहायक हूँ। फसल, रोग, मौसम या खेती की तकनीकों के बारे में हिंदी में पूछें।",
    marathi: "नमस्कार! मी तुमचा AI शेती सहाय्यक आहे। पिके, रोग, हवामान किंवा शेतीच्या तंत्रांबद्दल मराठीत विचारा।",
    telugu: "నమస్కారం! నేను మీ AI వ్యవసాయ సహాయకుడిని. పంటలు, వ్యాధులు, వాతావరణం లేదా వ్యవసాయ పద్ధతుల గురించి తెలుగులో అడగండి।",
    tamil: "வணக்கம்! நான் உங்கள் AI விவசாய உதவியாளர். பயிர்கள், நோய்கள், வானிலை அல்லது விவசாய நுட்பங்கள் பற்றி தமிழில் கேளுங்கள்।",
    english: "Hello! I'm your AI farming assistant. Ask me about crops, diseases, weather, or farming techniques in any Indian language or English."
  };

  useEffect(() => {
    fetchSupportedLanguages();
    addWelcomeMessage();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSupportedLanguages = async () => {
    try {
      const response = await fetch('/api/multilingual-chat/languages');
      const result = await response.json();
      if (result.success) {
        setSupportedLanguages(result.data.languages);
      }
    } catch (error) {
      console.error('Failed to fetch supported languages:', error);
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: welcomeMessages.english,
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/multilingual-chat/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          userId: 'demo-user'
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.data.response,
          sender: 'ai',
          timestamp: new Date(),
          language: data.data.detectedLanguage,
          category: data.data.category
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setError('Failed to send message. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble responding right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearChat = () => {
    setMessages([]);
    addWelcomeMessage();
    setError(null);
  };

  const getLanguageDisplayName = (lang: any) => {
    if (!lang) return '';
    return lang.nativeName !== lang.name ? `${lang.name} (${lang.nativeName})` : lang.name;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Globe className="h-6 w-6" />
              </div>
              AI Farming Assistant - Multilingual
            </CardTitle>
            <div className="text-green-100 mt-2">
              <p>Ask questions in Hindi (हिन्दी), Marathi (मराठी), Telugu (తెలుగు), Tamil (தமிழ்), or English</p>
              <p className="text-sm mt-1">Get expert farming advice in your preferred language!</p>
            </div>
          </CardHeader>
        </Card>

        {/* Language Selection */}
        <Card className="mb-4 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Input Language:</span>
              </div>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Auto-detect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">🌐 Auto-detect</SelectItem>
                  {supportedLanguages.map((lang) => (
                    <SelectItem key={lang.key} value={lang.key}>
                      {lang.nativeName} ({lang.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Input = Output Language
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Chat Container */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-green-500 text-white'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    <div className={`inline-block p-3 rounded-lg shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-200'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.text}
                      </p>
                      
                      {/* Language and category info for AI messages */}
                      {message.sender === 'ai' && message.language && (
                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2 text-xs">
                          <Languages className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-500">
                            {getLanguageDisplayName(message.language)} 
                            {message.category && ` • ${message.category}`}
                          </span>
                          <Badge variant="outline" className="ml-auto">
                            {(message.language.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    {/* Message Actions */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      <button
                        onClick={() => copyMessage(message.text)}
                        className="hover:text-gray-700 transition-colors"
                        title="Copy message"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">AI is analyzing your question...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your farming question in any language... (हिन्दी, मराठी, తెలుగు, தமிழ், English, etc.)"
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={sendMessage}
                    disabled={!inputText.trim() || isLoading}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 h-auto"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    onClick={clearChat}
                    variant="outline"
                    className="px-4 py-2 h-auto"
                    title="Clear chat"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example Questions */}
        <Card className="mt-6 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Example Questions (उदाहरण प्रश्न)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">हिन्दी (Hindi):</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>"बारिश के मौसम में कौन सी फसल बोनी चाहिए?"</p>
                  <p>"धान में पत्ती झुलसा रोग का इलाज कैसे करें?"</p>
                  <p>"टमाटर के पौधों के लिए सबसे अच्छी खाद कौन सी है?"</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">मराठी (Marathi):</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>"पावसाळ्यात कोणती पिके लावावीत?"</p>
                  <p>"भातामध्ये पानांचा करपा रोग कसा बरा करावा?"</p>
                  <p>"टोमॅटोच्या रोपांसाठी सर्वोत्तम खत कोणते?"</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">తెలుగు (Telugu):</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>"వర్షాకాలంలో ఏ పంటలు వేయాలి?"</p>
                  <p>"వరిలో ఆకు కాలిక వ్యాధికి చికిత్స ఎలా చేయాలి?"</p>
                  <p>"టమోటా మొక్కలకు ఉత్తమ ఎరువు ఏది?"</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">English:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>"What crops should I plant during monsoon season?"</p>
                  <p>"How to treat leaf blight disease in rice?"</p>
                  <p>"What is the best fertilizer for tomato plants?"</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}