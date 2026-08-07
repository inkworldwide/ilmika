"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Bot, Sparkles, Send, X, Minimize2, ExternalLink, RefreshCw, 
  MessageSquare, ChevronRight, GraduationCap, Award, HelpCircle 
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  actionLink?: string;
  actionLabel?: string;
  timestamp: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    sender: "bot",
    text: "👋 **Welcome to ILMIKA Global Education!**\n\nI am your AI Admissions Assistant. Ask me anything about discovering colleges across 180+ countries, scholarships, entrance exam cutoffs, or direct applications.",
    timestamp: "Just now",
  },
];

const SUGGESTED_PROMPTS = [
  { label: "🎓 Scholarships", query: "How do I search for scholarships and tuition fee waivers?" },
  { label: "🎯 Entrance Cutoffs", query: "What entrance exams and cut-off scores are required?" },
  { label: "📝 How to Apply", query: "How do I submit an application to a university?" },
  { label: "👨‍💼 Book Counselling", query: "How can I book a counselling session with an advisor?" },
  { label: "🏛 List a College", query: "How can a university administrator list a college?" },
];

const CuteIlmikaMascot = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Head shape */}
    <rect x="10" y="18" width="44" height="38" rx="16" fill="url(#botGradient)" stroke="#D4AF37" strokeWidth="2.5" />
    {/* Graduation Cap */}
    <path d="M32 4L6 16L32 24L58 16L32 4Z" fill="#0F172A" stroke="#D4AF37" strokeWidth="2" strokeLinejoin="round" />
    <path d="M50 19.5V29C50 29 48 31 46 31" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <circle cx="46" cy="32" r="2.5" fill="#F59E0B" />
    {/* Cute Ears */}
    <circle cx="8" cy="36" r="3.5" fill="#F59E0B" />
    <circle cx="56" cy="36" r="3.5" fill="#F59E0B" />
    {/* Cute Eyes */}
    <circle cx="23" cy="34" r="5" fill="#0F172A" />
    <circle cx="21.5" cy="32.5" r="2" fill="white" />
    <circle cx="41" cy="34" r="5" fill="#0F172A" />
    <circle cx="39.5" cy="32.5" r="2" fill="white" />
    {/* Rosy Cheeks */}
    <circle cx="17" cy="40" r="3" fill="#F472B6" opacity="0.7" />
    <circle cx="47" cy="40" r="3" fill="#F472B6" opacity="0.7" />
    {/* Cute Happy Smile */}
    <path d="M27 41C27 41 29.5 45 32 45C34.5 45 37 41 37 41" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="botGradient" x1="10" y1="18" x2="54" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A" />
        <stop offset="0.5" stopColor="#D4AF37" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
);

export default function GlobalChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputQuery.trim();
    if (!query || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: data.reply || "I am here to assist you with ILMIKA college discovery and applications.",
          actionLink: data.actionLink,
          actionLabel: data.actionLabel,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "bot",
            text: "I am having trouble connecting right now. Please try again shortly.",
            timestamp: "Now",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    setMessages(INITIAL_MESSAGES);
  };

  // Helper to parse markdown bold text
  const renderFormattedText = (rawText: string) => {
    const parts = rawText.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx} className="font-bold text-primary">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Floating Trigger Badge / Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-[#D4AF37]/60 hover:border-[#D4AF37] text-white p-2.5 pr-5 rounded-full shadow-2xl shadow-slate-950/40 backdrop-blur-xl transition duration-300 hover:scale-105 cursor-pointer ring-1 ring-white/10"
        >
          <div className="relative flex items-center justify-center p-1.5 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-full border border-[#D4AF37]/40 group-hover:rotate-6 transition duration-300">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-[#D4AF37] opacity-75"></span>
            <CuteIlmikaMascot className="w-8 h-8 drop-shadow-sm" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Ask ILMIKA AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </p>
            <p className="text-[10px] text-amber-300 font-medium">Colleges, Fees &amp; Cutoffs</p>
          </div>
        </button>
      )}

      {/* Chatbot Light Window */}
      {isOpen && (
        <div className="bg-white/98 border border-slate-200 shadow-2xl shadow-slate-900/20 backdrop-blur-2xl rounded-3xl w-[92vw] sm:w-[410px] h-[540px] max-h-[85vh] flex flex-col overflow-hidden ring-1 ring-black/5 animate-fadeIn text-left">
          
          {/* Header */}
          <div className="bg-[#0F172A] text-white p-4 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-xs shrink-0">
                <CuteIlmikaMascot className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-white flex items-center gap-1.5">
                  <span>ILMIKA AI Assistant</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </h3>
                <p className="text-[10px] text-amber-300 font-mono">Global Admissions &amp; Guidance Desk</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition cursor-pointer"
                title="Reset Conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition cursor-pointer"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 bg-slate-50/70 overflow-y-auto space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-300">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#0F172A] font-semibold rounded-br-none shadow-xs"
                      : "bg-white border border-slate-200/90 text-slate-800 rounded-bl-none shadow-2xs"
                  }`}
                >
                  <p className="whitespace-pre-line">{renderFormattedText(msg.text)}</p>

                  {/* Optional Action Button */}
                  {msg.actionLink && (
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <Link
                        href={msg.actionLink}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1.5 bg-[#0F172A] hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition duration-200 shadow-2xs"
                      >
                        <span>{msg.actionLabel || "Explore"}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-accent" />
                      </Link>
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-500 p-3 rounded-2xl w-fit shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[10px] font-mono text-slate-500 ml-1">ILMIKA AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 bg-white">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => handleSend(prompt.query)}
                  className="bg-slate-100 hover:bg-amber-50 border border-slate-200 hover:border-[#D4AF37] text-slate-700 hover:text-primary px-2.5 py-1 rounded-lg text-[10px] whitespace-nowrap transition cursor-pointer font-semibold shadow-2xs"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about colleges, cutoffs, fees..."
              className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition font-medium"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] hover:brightness-105 text-[#0F172A] p-2.5 rounded-xl transition duration-200 disabled:opacity-40 cursor-pointer shrink-0 font-bold shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
