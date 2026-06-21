'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, FileText, ChevronRight, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type QueryScenario = {
  id: string;
  question: string;
  answerSteps: { text: string; type: 'text' | 'citation' | 'warning' | 'success' | 'delay' }[];
};

const SCENARIOS: QueryScenario[] = [
  {
    id: '1',
    question: "What is the DGMS penalty for missing ventilation logs?",
    answerSteps: [
      { text: "Searching DGMS regulations and internal safety logs...", type: 'delay' },
      { text: "Under ", type: 'text' },
      { text: "DGMS Regulation 153(2)", type: 'citation' },
      { text: ", failure to maintain accurate and up-to-date ventilation logs constitutes a serious breach of safety protocols.\n\n", type: 'text' },
      { text: "⚠ Penalties include:", type: 'warning' },
      { text: "\n1. Immediate suspension of mining operations in the affected shaft.\n2. Fines up to ₹5,00,000 for the mine manager.\n3. Potential criminal liability under the Mines Act, 1952 if negligence leads to an incident.\n\n", type: 'text' },
      { text: "Note: Your last logged ventilation check for Shaft C was 14 hours ago (4 hours overdue).", type: 'text' }
    ]
  },
  {
    id: '2',
    question: "Are there any compliance gaps in our latest environmental audit?",
    answerSteps: [
      { text: "Analyzing Q3 Environmental Audit against active permits...", type: 'delay' },
      { text: "I found 2 critical gaps in the recent Q3 Audit:\n\n", type: 'text' },
      { text: "⚠ 1. Water Discharge Levels", type: 'warning' },
      { text: "\nThe audit indicates TSS (Total Suspended Solids) at 112 mg/L at Outlet B. Your active ", type: 'text' },
      { text: "Water Permit WD-2024", type: 'citation' },
      { text: " caps TSS at 100 mg/L. You are in violation.\n\n", type: 'text' },
      { text: "⚠ 2. Missing Signature", type: 'warning' },
      { text: "\nThe hazardous waste disposal manifest for Sept 12 is missing the authorized counter-signature.\n\n", type: 'text' },
      { text: "✓ Air quality and noise levels are fully compliant.", type: 'success' }
    ]
  },
  {
    id: '3',
    question: "Show me the failure history for Drill Rig #7",
    answerSteps: [
      { text: "Compiling 5 years of maintenance logs for Asset DR-07...", type: 'delay' },
      { text: "Drill Rig #7 has experienced 14 unscheduled downtime events in the past 24 months.\n\n", type: 'text' },
      { text: "Top Failure Modes:\n", type: 'text' },
      { text: "• Hydraulic Seal Rupture (6 incidents) — ", type: 'text' },
      { text: "See Log #4492", type: 'citation' },
      { text: "\n• Overheating in primary motor (4 incidents)\n• Drill bit structural fatigue (3 incidents)\n\n", type: 'text' },
      { text: "Pattern Detected:", type: 'warning' },
      { text: " Hydraulic failures consistently occur when ambient temperatures exceed 40°C for >3 consecutive days.", type: 'text' }
    ]
  }
];

export function MagicInputDemo() {
  const [activeScenario, setActiveScenario] = useState<QueryScenario | null>(null);
  const [displayedText, setDisplayedText] = useState<React.ReactNode[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Ref to auto-scroll only the chat container (prevents the whole page from jumping)
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      });
    }
  }, [displayedText, searchQuery, isTyping]);

  const handleScenarioClick = async (scenario: QueryScenario) => {
    if (isTyping) return;
    
    // Reset state
    setDisplayedText([]);
    setSearchQuery("");
    setActiveScenario(scenario);
    setIsTyping(true);

    // Animate typing into the search bar
    let currentQuery = "";
    for (let i = 0; i < scenario.question.length; i++) {
      currentQuery += scenario.question[i];
      setSearchQuery(currentQuery);
      await new Promise(r => setTimeout(r, 20 + Math.random() * 30)); // random typing speed
    }

    await new Promise(r => setTimeout(r, 400)); // Pause before answering

    // Animate the answer blocks
    const newDisplayed: React.ReactNode[] = [];
    
    for (let stepIndex = 0; stepIndex < scenario.answerSteps.length; stepIndex++) {
      const step = scenario.answerSteps[stepIndex];
      
      if (step.type === 'delay') {
        // Show a temporary loading state
        const loadingId = `loading-${stepIndex}`;
        newDisplayed.push(
          <motion.div key={loadingId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-white/40 text-sm mb-4 font-mono">
            <Sparkles className="size-3.5 animate-pulse" />
            {step.text}
          </motion.div>
        );
        setDisplayedText([...newDisplayed]);
        await new Promise(r => setTimeout(r, 1500)); // "Thinking" time
        newDisplayed.pop(); // Remove loading state
      } 
      else {
        // Render text progressively or instantly based on type
        if (step.type === 'citation') {
          newDisplayed.push(
            <span key={`cit-${stepIndex}`} className="inline-flex items-center gap-1 bg-purple-400/20 border border-[#947AFC]/30 text-purple-400 px-1.5 py-0.5 rounded cursor-pointer hover:bg-purple-400/30 transition-colors">
              <FileText className="size-3" />
              {step.text}
            </span>
          );
          setDisplayedText([...newDisplayed]);
          await new Promise(r => setTimeout(r, 200));
        } else if (step.type === 'warning') {
          newDisplayed.push(<span key={`warn-${stepIndex}`} className="text-amber-400 font-semibold">{step.text}</span>);
          setDisplayedText([...newDisplayed]);
          await new Promise(r => setTimeout(r, 200));
        } else if (step.type === 'success') {
          newDisplayed.push(<span key={`succ-${stepIndex}`} className="text-emerald-400 font-semibold">{step.text}</span>);
          setDisplayedText([...newDisplayed]);
          await new Promise(r => setTimeout(r, 200));
        } else {
          // Standard text - let's type it out fast
          const words = step.text.split(/(\s+)/); // Keep spaces
          let currentSentence = "";
          
          for (let i = 0; i < words.length; i++) {
            currentSentence += words[i];
            
            // Re-render the current block
            const tempDisplayed = [...newDisplayed, <span key={`text-${stepIndex}`}>{currentSentence}</span>];
            setDisplayedText(tempDisplayed);
            
            if (words[i].trim() !== "") {
              await new Promise(r => setTimeout(r, 15)); // fast word-by-word typing
            }
          }
          // Lock in the final sentence for this block
          newDisplayed.push(<span key={`text-${stepIndex}`}>{currentSentence}</span>);
        }
      }
    }
    
    setIsTyping(false);
  };

  return (
    <section className="py-24 sm:py-32 bg-[#05030A] border-t border-white/5 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,rgba(148,122,252,0.06),transparent_60%)] pointer-events-none" />

      <div className="mx-auto max-w-[1000px] px-6 relative z-10">
        
        <div className="text-center mb-12">
          <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-purple-400 mb-4">
            Interactive Demo
          </p>
          <h2 className="text-[clamp(2rem,3vw,2.5rem)] font-bold tracking-tight text-white mb-4">
            Experience operational intelligence
          </h2>
          <p className="text-white/50 text-lg">
            Select a real-world scenario below to see how MiningNiti answers complex compliance and operational questions instantly.
          </p>
        </div>

        {/* The Magic Interface */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[500px]">
          
          {/* Left Sidebar: Suggested Queries */}
          <div className="md:w-1/3 bg-[#0C0C0C] border-r border-white/5 p-6 flex flex-col gap-4">
            <div className="text-[11px] font-mono tracking-widest uppercase text-white/30 mb-2">Suggested Queries</div>
            
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleScenarioClick(scenario)}
                disabled={isTyping}
                suppressHydrationWarning
                className={cn(
                  "text-left p-4 rounded-xl border transition-all duration-300 group flex flex-col",
                  activeScenario?.id === scenario.id
                    ? "bg-purple-400/10 border-[#947AFC]/30"
                    : "bg-white/2 border-white/5 hover:border-white/15 hover:bg-white/4"
                )}
              >
                <span className="flex items-start justify-between gap-2 w-full">
                  <span className={cn(
                    "text-sm font-medium leading-snug",
                    activeScenario?.id === scenario.id ? "text-white" : "text-white/60 group-hover:text-white/90"
                  )}>
                    "{scenario.question}"
                  </span>
                  <ChevronRight className={cn(
                    "size-4 shrink-0 mt-0.5",
                    activeScenario?.id === scenario.id ? "text-purple-400" : "text-white/20 group-hover:text-white/40"
                  )} />
                </span>
              </button>
            ))}
          </div>

          {/* Right Area: The Chat / Terminal */}
          <div className="md:w-2/3 flex flex-col relative bg-[#05030A]">
            
            {/* Top Bar */}
            <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 bg-[#0C0C0C]">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="size-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                <div className="size-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
              </div>
              <div className="mx-auto text-[10px] font-mono text-white/20 uppercase tracking-widest">MiningNiti Engine</div>
            </div>

            {/* Chat Output Area */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <AnimatePresence>
                {displayedText.length === 0 && !isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center px-8"
                  >
                    <div className="size-12 rounded-full bg-purple-400/10 flex items-center justify-center mb-4 border border-purple-400/20">
                      <Sparkles className="size-5 text-purple-400" />
                    </div>
                    <p className="text-white/40 text-sm">Select a query from the left to run a simulated intelligence search.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* The actual generated content */}
              <div className="text-[15px] leading-[1.7] text-white/80 whitespace-pre-wrap">
                {displayedText.map((node, i) => (
                  <span key={i}>{node}</span>
                ))}
                
                {/* Blinking cursor while typing the answer (after delay is gone) */}
                {isTyping && displayedText.length > 0 && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    className="inline-block w-2 h-4 bg-purple-400 ml-1 align-middle translate-y-[-2px]"
                  />
                )}
              </div>
            </div>

            {/* Input Bar (Bottom) */}
            <div className="p-4 border-t border-white/5 bg-[#0C0C0C]">
              <div className="relative flex items-center bg-[#141414] border border-white/10 rounded-lg px-4 py-3">
                <Search className="size-4 text-white/30 mr-3 shrink-0" />
                <div className="flex-1 min-w-0 font-mono text-sm text-white/90 truncate">
                  {searchQuery || <span className="text-white/20">Ask anything about your operations...</span>}
                  {/* Blinking cursor while typing the question */}
                  {isTyping && displayedText.length === 0 && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="inline-block w-2 h-4 bg-purple-400 ml-0.5 align-middle translate-y-[-1px]"
                    />
                  )}
                </div>
                <CornerDownLeft className="size-4 text-white/20 shrink-0 ml-3" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
