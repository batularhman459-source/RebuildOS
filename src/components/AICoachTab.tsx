import React, { useState, useRef, useEffect } from 'react';
import { RebuildOSState } from '../types';
import {
  Bot,
  User,
  RefreshCw,
  Plus,
  AudioLines,
  MicOff,
  Navigation,
} from 'lucide-react';

interface AICoachTabProps {
  state: RebuildOSState;
  onSendMessage: (userText: string) => Promise<void>;
}

export const AICoachTab: React.FC<AICoachTabProps> = ({ state, onSendMessage }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.chatHistory, isTyping]);

  // Voice speech-to-text integration using Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      setInput((prev) => (prev ? `${prev} [Voice Input]` : 'What should I focus on right now?'));
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      }
    }
  };

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isTyping) return;

    setInput('');
    setIsTyping(true);

    // Auto reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      await onSendMessage(trimmed);
    } catch (e) {
      console.error('Coach chat error:', e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const SUGGESTED_PROMPTS = [
    { label: 'Next priority', text: 'What is the single most important action I should take right now?' },
    { label: 'Feeling stuck', text: 'I am feeling friction and resistance to starting. How do I get past it?' },
    { label: 'Momentum review', text: 'Look at my current streak and execution score. How am I doing overall?' },
    { label: 'Break down task', text: 'Help me break down a daunting task into a 5-minute easy starting step.' },
  ];

  return (
    <div className="w-full pb-20 md:pb-6 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Desktop Only Sidebar with Coach Status & Quick Prompts) */}
        <div className="hidden lg:flex lg:col-span-4 xl:col-span-3 flex-col gap-4 sticky top-20">
          {/* Coach Status Card */}
          <div className="relative overflow-hidden rounded-[24px] p-5 bg-gradient-to-b from-white/[0.14] via-white/[0.07] to-white/[0.03] backdrop-blur-2xl border border-white/20 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.3),0_15px_35px_rgba(0,0,0,0.35)] text-white space-y-3">
            <div className="absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-10" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/90 shadow-sm backdrop-blur-md">
                <Bot className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2 tracking-tight">
                  Coach
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h2>
                <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/80 uppercase tracking-wider">
                  Always Available
                </span>
              </div>
            </div>

            <p className="text-xs text-white/70 font-sans leading-relaxed relative z-10">
              Your direct, honest accountability partner. Ask what to do next, troubleshoot friction, or reflect on your day.
            </p>
          </div>

          {/* Quick Prompts Panel */}
          <div className="relative overflow-hidden rounded-[24px] p-4 bg-gradient-to-b from-white/[0.10] via-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/15 text-white space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-semibold text-white/60 uppercase tracking-wider block">
                Quick Prompts
              </span>
            </div>

            <div className="space-y-1.5">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(prompt.text)}
                  disabled={isTyping}
                  className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-xs text-white/90 hover:text-white font-sans cursor-pointer group disabled:opacity-50"
                >
                  <span className="font-semibold block text-white/80 group-hover:text-white text-[11px]">
                    {prompt.label}
                  </span>
                  <span className="text-[10px] text-white/50 block truncate">
                    {prompt.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Chat Stream & Prompt Bar */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-[calc(100vh-140px)] min-h-[500px] max-h-[850px] space-y-3">
          {/* Mobile-Only Header */}
          <div className="lg:hidden relative overflow-hidden rounded-[20px] p-3.5 bg-gradient-to-b from-white/[0.14] via-white/[0.07] to-white/[0.03] backdrop-blur-2xl border border-white/20 shadow-sm text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/90">
                  <Bot className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    Coach
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h2>
                  <p className="text-[10px] font-sans text-white/60">Direct feedback & clarity</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-white/10 border border-white/15 text-[9px] font-sans font-semibold text-white/80 uppercase tracking-wider">
                Online
              </span>
            </div>
          </div>

          {/* Messages Scroll View */}
          <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-gradient-to-b from-white/[0.10] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/15 rounded-[24px] shadow-sm scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scrollbar-track-transparent">
            {state.chatHistory.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm backdrop-blur-md ${
                      isUser
                        ? 'bg-white text-zinc-950 font-sans'
                        : 'bg-white/10 border border-white/15 text-white/90'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-white text-zinc-950 font-medium rounded-tr-xs shadow-md'
                        : 'bg-black/40 border border-white/15 text-zinc-100 rounded-tl-xs space-y-1.5 shadow-sm font-sans backdrop-blur-md'
                    }`}
                  >
                    {/* Format simple line breaks or bolding */}
                    {msg.text.split('\n').map((line, idx) => (
                      <p key={idx} className={line.startsWith('**') ? 'font-semibold text-white' : ''}>
                        {line}
                      </p>
                    ))}

                    <span
                      className={`text-[9px] font-sans block text-right mt-1 ${
                        isUser ? 'text-zinc-500' : 'text-white/40'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2.5" role="status" aria-live="polite">
                <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-center backdrop-blur-md">
                  <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                <div className="bg-black/40 border border-white/15 rounded-2xl px-3.5 py-2 text-xs text-white/70 flex items-center gap-2 backdrop-blur-md font-sans">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" aria-hidden="true" />
                  <span>Thinking…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* AI PROMPT BAR - Matching Homepage Frosted Glass Bar */}
          <div className="relative pt-1 pb-0.5 flex-shrink-0">
            <div className="relative overflow-hidden rounded-[24px] p-2 sm:p-2.5 bg-gradient-to-b from-white/[0.14] via-white/[0.07] to-white/[0.03] backdrop-blur-2xl border border-white/20 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.3),0_15px_35px_rgba(0,0,0,0.4)] text-white space-y-2">
              {/* Specular Top Rim */}
              <div className="absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-10" />

              {/* Top Row: Ask anything... Input */}
              <div className="relative flex items-center min-h-[28px] px-1 relative z-10">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                  placeholder="Ask what to do next, talk through a slip, or get honest feedback..."
                  aria-label="Ask Coach"
                  className="w-full bg-transparent border-0 text-white placeholder:text-white/40 text-xs sm:text-sm leading-snug resize-none focus:outline-none focus:ring-0 focus-visible:outline-none py-1 max-h-[100px] scrollbar-none font-sans font-normal"
                />
              </div>

              {/* Bottom Row: Controls */}
              <div className="flex items-center justify-between gap-2 select-none pt-0.5 px-1 relative z-10">
                {/* Left Controls: (+) Action Button */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (textareaRef.current) textareaRef.current.focus();
                    }}
                    aria-label="Focus input"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white transition-all active:scale-95 cursor-pointer backdrop-blur-md"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>
                </div>

                {/* Right Controls: Voice Pill + Send Button */}
                <div className="flex items-center gap-2">
                  {/* Voice Pill Button */}
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    aria-label={isListening ? 'Stop voice recording' : 'Start voice input'}
                    className={`px-3 py-1 rounded-xl border text-[11px] sm:text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-500/20 text-rose-200 border-rose-500/40 animate-pulse'
                        : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/90 backdrop-blur-md'
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-3 h-3 text-rose-300" />
                    ) : (
                      <AudioLines className="w-3 h-3 text-white/80" />
                    )}
                    <span>{isListening ? 'Listening…' : 'Voice'}</span>
                  </button>

                  {/* High Contrast Send Button */}
                  <button
                    type="button"
                    aria-label="Send message"
                    title="Send message"
                    disabled={!input.trim() || isTyping}
                    onClick={() => handleSend(input)}
                    className="w-8 h-8 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 flex items-center justify-center transition-all active:scale-95 shadow-md disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 fill-current text-zinc-950 rotate-45 -ml-0.5 -mt-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


