"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, CheckCheck, Loader2, ArrowLeft, Building } from "lucide-react";
import Link from "next/link";

interface Participant {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

interface Conversation {
  id: string;
  property: {
    id: string;
    title: string;
    price: number;
    transactionType: string;
  } | null;
  counterpart: Participant | null;
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export default function DashboardMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");

  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch current user and list of threads
  useEffect(() => {
    async function initInbox() {
      try {
        const [meRes, convRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/conversations"),
        ]);
        const meData = await meRes.json();
        const convData = await convRes.json();
        
        if (meData.user) setCurrentUser(meData.user);
        if (convData.conversations) setConversations(convData.conversations);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingList(false);
      }
    }
    initInbox();
  }, []);

  // 2. Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Poll active conversation for new messages every 6 seconds
  useEffect(() => {
    if (!activeConvId) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/conversations/${activeConvId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch (e) {
        // Silent poll failure — don't interrupt UI
      }
    };

    const interval = setInterval(poll, 6000);
    return () => clearInterval(interval);
  }, [activeConvId]);

  // 4. Poll conversation list for new threads every 15 seconds
  useEffect(() => {
    const pollList = async () => {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          const data = await res.json();
          if (data.conversations) setConversations(data.conversations);
        }
      } catch (e) {
        // Silent
      }
    };

    const listInterval = setInterval(pollList, 15000);
    return () => clearInterval(listInterval);
  }, []);

  // 3. Load active conversation details & messages
  const loadConversation = async (convId: string) => {
    setActiveConvId(convId);
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/conversations/${convId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveConv(data.conversation);
        setMessages(data.messages);

        // Reset unread count locally for this conversation in list
        setConversations(prev =>
          prev.map(c => (c.id === convId ? { ...c, unreadCount: 0 } : c))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMessages(false);
    }
  };

  // 4. Send Message Reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConvId) return;

    setSendingMessage(true);
    try {
      const res = await fetch(`/api/conversations/${activeConvId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.chatMessage]);
        
        // Update last message in the thread list
        setConversations(prev =>
          prev.map(c => (c.id === activeConvId ? {
            ...c,
            lastMessage: {
              content: replyText,
              createdAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString()
          } : c))
        );
        
        setReplyText("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loadingList) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Opening your inbox...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[450px]">
      
      {/* Page Header */}
      <div className="border-b border-line pb-4 mb-4 text-left">
        <h2 className="font-serif text-xl sm:text-2xl text-primary font-semibold">Inbox Messages</h2>
        <p className="text-xs text-slate-500 mt-1">Chat directly with property landlords, tenants, and verified agents.</p>
      </div>

      <div className="flex-1 flex overflow-hidden border border-line rounded-xl bg-white shadow-xs">
        
        {/* Left Side: Threads list */}
        <div className={`w-full md:w-80 border-r border-line flex flex-col overflow-y-auto no-scrollbar shrink-0 ${activeConvId ? "hidden md:flex" : "flex"}`}>
          {conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs">No active chat sessions.</p>
            </div>
          ) : (
            <div className="divide-y divide-line/60">
              {conversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                const counter = conv.counterpart;
                const lastMsg = conv.lastMessage;
                const hasUnread = conv.unreadCount > 0;

                return (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className={`w-full text-left p-4 hover:bg-secondary/40 transition flex items-start gap-3 cursor-pointer ${
                      isActive ? "bg-secondary" : ""
                    }`}
                  >
                    {/* User Avatar */}
                    {counter?.avatar ? (
                      <img src={counter.avatar} className="w-10 h-10 rounded-full object-cover shrink-0 border border-line" />
                    ) : (
                      <span className="w-10 h-10 rounded-full bg-primary text-secondary flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-line">
                        {counter?.name.charAt(0) || "?"}
                      </span>
                    )}

                    {/* Meta details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs font-semibold text-primary truncate leading-normal">{counter?.name}</h4>
                        {lastMsg && (
                          <span className="text-[9px] text-slate-400 font-mono">
                            {new Date(lastMsg.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "numeric", hour12: true })}
                          </span>
                        )}
                      </div>
                      
                      {conv.property && (
                        <p className="text-[9px] text-accent font-semibold leading-relaxed truncate">{conv.property.title}</p>
                      )}

                      <p className={`text-xs mt-1 truncate leading-normal ${hasUnread ? "text-primary font-bold" : "text-slate-400"}`}>
                        {lastMsg ? lastMsg.content : "No messages yet."}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {hasUnread && (
                      <span className="w-5 h-5 bg-accent text-primary rounded-full grid place-items-center text-[10px] font-bold shrink-0 self-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Message Detail bubble box */}
        <div className={`flex-1 flex flex-col overflow-hidden bg-secondary/15 ${!activeConvId ? "hidden md:flex justify-center items-center text-center p-10" : "flex"}`}>
          
          {!activeConvId ? (
            <div className="space-y-3">
              <MessageSquare className="w-12 h-12 text-accent mx-auto" />
              <h3 className="font-serif text-sm font-semibold text-primary">No Chat Selected</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Select a thread from the side panel to view messages or negotiate listings.
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-line p-4 flex items-center justify-between shadow-xs z-10">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveConvId(null)}
                    className="md:hidden p-1.5 border border-line rounded-lg text-primary mr-1"
                    aria-label="Back to threads"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div>
                    <h3 className="font-serif text-sm font-semibold text-primary">
                      {activeConv?.participants.find((p: any) => p.id !== currentUser.id)?.name}
                    </h3>
                    {activeConv?.property && (
                      <Link 
                        href={`/properties/${activeConv.property.id}`}
                        className="text-[10px] text-accent hover:underline font-semibold flex items-center gap-0.5 mt-0.5 uppercase tracking-wider"
                      >
                        <Building className="w-3.5 h-3.5" />
                        {activeConv.property.title}
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Lists Scrollable Pane */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSender = msg.senderId === currentUser.id;
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                      >
                        <div 
                          className={`max-w-[70%] px-4 py-3 rounded-2xl text-xs leading-normal shadow-xs ${
                            isSender 
                              ? "bg-primary text-secondary rounded-tr-none" 
                              : "bg-white text-primary border border-line rounded-tl-none"
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.content}</p>
                          <div className="flex items-center justify-end gap-1 text-[9px] mt-1.5 opacity-55 font-mono">
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "numeric", hour12: true })}
                            </span>
                            {isSender && (
                              <CheckCheck className={`w-3 h-3 ${msg.isRead ? "text-accent" : ""}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input Form */}
              <form onSubmit={handleSendReply} className="bg-white border-t border-line p-3 flex gap-2 shadow-sm z-10">
                <input
                  type="text"
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 border border-line rounded-xl px-4 py-2.5 text-xs bg-secondary text-primary focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !replyText.trim()}
                  className="bg-primary hover:bg-slate-800 text-secondary px-5 py-2.5 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {sendingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-accent" />
                  )}
                </button>
              </form>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
