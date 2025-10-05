"use client";

import { useState } from "react";
import { Mic, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function VoiceAssistantFAB() {
  const router = useRouter();

  const handleVoiceAssistant = () => {
    // Navigate to the AgriBot AI assistant page
    router.push('/help');
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Button
        onClick={handleVoiceAssistant}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-200"
        size="sm"
      >
        <Mic className="w-6 h-6 text-white" />
      </Button>
    </div>
  );
}