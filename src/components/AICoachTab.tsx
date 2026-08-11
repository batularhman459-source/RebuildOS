import React, { useState, useRef, useEffect } from 'react';
import { RebuildOSState } from '../types';
import { Bot, Send, User, RefreshCw } from 'lucide-react';

interface AICoachTabProps {
  state: RebuildOSState;
  onSendMessage: (userText: string) => Promise<void>;
}

export const AICoachTab: React.FC<AICoachTabProps> = ({ state, onSendMessage }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.chatHistory, isTyping]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isTyping) return;

    setInput('');
    setIsTyping(true);

    try {
      await onSendMessage(trimmed);
    } catch (e) {
      console.error('Coach chat error:', e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] sm:h-[calc(100vh-130px)] min-h-[480px] space-y-2 pb-1">
      {/* Top Coach Info Header */}
      <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 sm:p-4 shadow-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              AI Behavioral Coach
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
          </div>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scrollbar-track-transparent">
        {state.chatHistory.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-emerald-500 text-black'
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-white font-medium rounded-tr-xs shadow-sm'
                    : 'bg-neutral-900/90 border border-white/10 text-neutral-200 rounded-tl-xs space-y-1.5 shadow-sm'
                }`}
              >
                {/* Format simple line breaks or markdown bolding */}
                {msg.text.split('\n').map((line, idx) => (
                  <p key={idx} className={line.startsWith('**') ? 'font-bold text-white' : ''}>
                    {line}
                  </p>
                ))}

                <span className="text-[9px] font-mono text-neutral-500 block text-right mt-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-neutral-900/90 border border-white/10 rounded-2xl px-3 py-2 text-xs text-neutral-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Analyzing your system metrics...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleFormSubmit} className="flex items-center gap-2 pt-0.5 flex-shrink-0">
        <input
          type="text"
          placeholder="Ask AI Coach for strategic guidance or mindset support..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
          className="flex-grow bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="p-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold transition-all shadow-md active:scale-95 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
