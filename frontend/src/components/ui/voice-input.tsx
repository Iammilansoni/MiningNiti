"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Mining industry specific vocabulary and jargon
const MINING_VOCABULARY = {
  "hematite": "hematite",
  "magnetite": "magnetite",
  "conveyor": "conveyor belt",
  "haul truck": "haul truck",
  "excavator": "excavator",
  "crusher": "crusher",
  "tailings": "tailings",
  "overburden": "overburden",
  "pit": "mining pit",
  "shaft": "mine shaft",
  "ventilation": "ventilation system",
  "safety protocol": "safety protocol",
  "ppe": "personal protective equipment",
  "lockout tagout": "lockout tagout procedure",
  "blasting": "controlled blasting",
  "ore grade": "ore grade",
  "dilution": "ore dilution",
  "metallurgy": "metallurgy",
  "flotation": "flotation process",
  "mill": "processing mill"
};

export function VoiceInput({ onText }: { onText: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState<unknown>(null);
  const [isSupported, setIsSupported] = useState(true);

  // Function to enhance transcript with mining-specific corrections
  const enhanceTranscript = (transcript: string): string => {
    let enhanced = transcript.toLowerCase();
    
    // Replace common misheard mining terms
    Object.entries(MINING_VOCABULARY).forEach(([pattern, replacement]) => {
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
      enhanced = enhanced.replace(regex, replacement);
    });
    
    return enhanced;
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition: any =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition || 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = "en-US";
      recog.maxAlternatives = 3;
      
      // Configure for better technical term recognition with mining vocabulary
      if ('webkitSpeechGrammarList' in window) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const SpeechGrammarList = (window as any).webkitSpeechGrammarList;
          const speechRecognitionList = new SpeechGrammarList();
          
          // Create grammar with mining-specific terms
          const miningTerms = Object.keys(MINING_VOCABULARY).join(' | ');
          const grammar = `#JSGF V1.0; grammar mining; public <term> = ${miningTerms};`;
          
          speechRecognitionList.addFromString(grammar, 1);
          recog.grammars = speechRecognitionList;
        } catch (error) {
          // Fallback: don't set grammars if there's an error
          console.warn('Could not set speech grammars:', error);
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recog.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        
        if (transcript) {
          const enhancedTranscript = enhanceTranscript(transcript);
          onText(enhancedTranscript);
          setListening(false);
        }
      };

      recog.onspeechend = () => {
        setListening(false);
        recog.stop();
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recog.onerror = (event: any) => {
        setListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied', {
            description: 'Please allow microphone access to use voice input.'
          });
        } else if (event.error === 'no-speech') {
          toast.error('No speech detected', {
            description: 'Please try speaking closer to your microphone.'
          });
        } else {
          toast.error('Speech recognition error', {
            description: 'Please try again or check your microphone.'
          });
        }
      };

      recog.onstart = () => {
        toast.success('Listening...', {
          description: 'Speak now. Optimized for mining terminology.'
        });
      };

      setRecognition(recog);
    } else {
      setIsSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }
  }, [onText]);

  const handleStart = () => {
    if (!isSupported) {
      toast.error('Speech recognition not supported', {
        description: 'Please use a supported browser like Chrome or Edge.'
      });
      return;
    }

    if (recognition && !listening) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (recognition as any).start();
        setListening(true);
      } catch {
        toast.error('Failed to start voice recognition', {
          description: 'Please check your microphone permissions.'
        });
      }
    }
  };

  const handleStop = () => {
    if (recognition && listening) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recognition as any).stop();
      setListening(false);
    }
  };

  if (!isSupported) {
    return null; // Don't show the button if not supported
  }

  return (
    <Button
      variant={listening ? "default" : "outline"}
      size="icon"
      onClick={listening ? handleStop : handleStart}
      className={listening ? "bg-red-500 hover:bg-red-600 animate-pulse" : ""}
      title={listening ? "Stop listening" : "Start voice input (optimized for mining terminology)"}
    >
      {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      <span className="sr-only">{listening ? "Stop listening" : "Start voice input"}</span>
    </Button>
  );
}
