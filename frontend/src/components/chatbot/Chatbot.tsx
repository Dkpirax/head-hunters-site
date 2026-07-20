"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, X, RotateCcw, Bot, User, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api";
import { playSound } from "@/lib/sounds";

import ReactMarkdown from 'react-markdown';

const getOrCreateConversation = async (): Promise<any> => {
  return apiClient("/api/chat/conversations", {
    method: "POST"
  });
};

const addChatMessage = async (id: string, content: string): Promise<any> => {
  return apiClient(`/api/chat/conversations/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ senderType: "USER", content })
  });
};

const requestHumanTakeover = async (id: string): Promise<any> => {
  return apiClient(`/api/chat/conversations/${id}/request-human`, {
    method: "POST"
  });
};



export function Chatbot({ onClose }: { onClose: () => void }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [mode, setMode] = useState<string>("AI");
  const [chatStatus, setChatStatus] = useState<string>("OPEN");
  
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevModeRef = useRef<string>("AI");
  const hasInitializedRef = useRef(false);

  // Initialize UUID and load conversation
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    async function initChat() {
      try {
        const conversation = await getOrCreateConversation();
        setConversationId(conversation.id);
        setMode(conversation.mode || "AI");
        setChatStatus(conversation.chatStatus || "OPEN");
        prevModeRef.current = conversation.mode || "AI";
        setMessages(conversation.messages || []);
      } catch (e) {
        console.error("Failed to load chat conversation:", e);
      }
    }

    initChat();
  }, []);

  // Poll for new messages every 2 seconds
  const messagesLengthRef = useRef<number>(0);
  useEffect(() => {
    if (!conversationId) return;

    let active = true;

    async function poll() {
      if (document.hidden) return; // Pause polling when tab is hidden
      
      try {
        const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
        if (!res.ok) return;
        const result = await res.json();
        
        if (active) {
          if (result.mode === "HUMAN" && prevModeRef.current !== "HUMAN") {
            playSound("connected");
          } else if (result.mode === "AI" && prevModeRef.current === "HUMAN") {
            playSound("reverted");
          }
          prevModeRef.current = result.mode;
          setMode(result.mode);
          setChatStatus(result.chatStatus);
          
          if (result.messages.length !== messagesLengthRef.current) {
            messagesLengthRef.current = result.messages.length;
            setMessages(result.messages);
            localStorage.setItem("hh_chat_read_timestamp", Date.now().toString());
          }
        }
      } catch (e) {
        // Silently ignore poll errors
      }
    }

    const interval = setInterval(poll, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [conversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const startFreshConversation = async () => {
    setIsSubmitting(true);
    try {
      // The backend will generate a new conversation attached to the existing visitor token
      const conversation = await getOrCreateConversation();
      setConversationId(conversation.id);
      setMode(conversation.mode || "AI");
      setChatStatus(conversation.chatStatus || "OPEN");
      setMessages(conversation.messages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendText = async (text: string) => {
    if (!text.trim() || isSubmitting || !conversationId) return;
    setInputVal("");
    setIsSubmitting(true);

    // Optimistically add user message
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, {
      id: tempId,
      senderType: "USER",
      sender: "USER",
      content: text,
      createdAt: new Date(),
    }]);

    if (mode === "AI") {
      setIsTyping(true);
    }

    try {
      const result = await addChatMessage(conversationId, text);
      
      // If AI generated a reply immediately, add it.
      if (result.ai_generated && result.message) {
        setMessages((prev) => [...prev, result.message]);
      }
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsTyping(false);
      setIsSubmitting(false);
    }
  };

  const handleRequestHandoff = async () => {
    if (!conversationId) return;
    setIsSubmitting(true);
    try {
      await requestHumanTakeover(conversationId);
      setMode("HUMAN");
      setChatStatus("WAITING_FOR_ADMIN");
      playSound("reverted");
    } catch (error) {
      console.error("Failed to request human", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 25, scale: 0.96 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(e, info) => {
        if (Math.abs(info.offset.x) > 100) {
          onClose();
        }
      }}
      className="fixed top-0 left-0 w-full h-[100dvh] rounded-none md:absolute md:top-auto md:left-auto md:bottom-18 md:right-0 md:w-[380px] md:h-[540px] md:max-w-[calc(100vw-32px)] md:max-h-[calc(100vh-100px)] md:rounded-[24px] bg-white/95 md:bg-white/90 backdrop-blur-2xl md:border border-white/60 shadow-[0_24px_60px_rgba(2,105,94,0.16)] flex flex-col overflow-hidden z-40 md:z-[100] text-slate-800 font-sans"
    >
      {/* Header */}
      <div className="px-5 py-4 pt-[max(env(safe-area-inset-top,1rem),1rem)] md:pt-4 border-b border-[#02695e]/10 bg-gradient-to-r from-[#02695e]/5 via-[#04a891]/4 to-[#02695e]/3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#02695e] to-[#04a891] flex items-center justify-center shadow-[0_4px_12px_rgba(4,168,145,0.25)]">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#02695e] leading-tight">
              {mode === "HUMAN" ? "Consultant Chat" : "AI Assistant"}
            </h4>
            <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
              <span className={`w-1.5 h-1.5 rounded-full inline-block animate-pulse relative ${
                mode === "HUMAN" ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.7)]" : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]"
              }`} />
              {mode === "HUMAN" 
                ? (chatStatus === "WAITING_FOR_ADMIN" ? "Waiting for consultant..." : "Consultant Online") 
                : "AI Assistant Online"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={startFreshConversation}
            disabled={isSubmitting}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#02695e]/8 transition-colors cursor-pointer text-slate-400 hover:text-[#02695e] disabled:opacity-40"
            title="Reset Chat"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#02695e]/8 transition-colors cursor-pointer text-slate-400 hover:text-[#02695e]"
            title="Close Chat"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-100 flex items-start gap-2 shrink-0">
        <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-tight text-blue-800/80">
          Please do not share passwords, bank details, identity documents or other highly sensitive information in this chat.
        </p>
      </div>

      {/* AI Disclosure */}
      {mode === "AI" && (
        <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100 flex items-start gap-2 shrink-0">
          <Bot className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-tight text-amber-800/80">
            You are talking to an AI agent based on our official company documents. It may occasionally make mistakes. You can <button type="button" onClick={handleRequestHandoff} className="font-bold underline cursor-pointer hover:text-amber-900 focus:outline-none">request a human consultant</button> at any time.
          </p>
        </div>
      )}

      {/* Messages list */}
      <div 
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-gradient-to-b from-[#f4f7f6] to-[#f8faf9] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
      >
        {messages.map((m) => {
          return (
            <div key={m.id} className={`flex items-start gap-2.5 ${m.senderType === "USER" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                m.senderType === "USER" ? "bg-slate-200 text-slate-600 shadow-sm" : "bg-gradient-to-br from-[#02695e] to-[#04a891] text-white shadow-sm"
              }`}>
                {m.senderType === "USER" ? <User size={12} /> : <Bot size={12} />}
              </div>
              
              <div className="max-w-[75%] space-y-1">
                <div className={`px-4 py-2.5 text-xs md:text-[13px] leading-relaxed font-medium overflow-wrap-anywhere ${
                  m.senderType === "USER" 
                    ? "bg-[#02695e] text-white rounded-[16px] rounded-tr-[4px] shadow-[0_4px_12px_rgba(2,105,94,0.14)]" 
                    : m.senderType === "ADMIN"
                    ? "bg-[#04a891] text-white rounded-[16px] rounded-tl-[4px] shadow-[0_4px_12px_rgba(4,168,145,0.14)]"
                    : "bg-white border border-[#02695e]/8 text-slate-800 rounded-[16px] rounded-tl-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] prose prose-sm prose-slate max-w-none"
                }`}>
                  {m.senderType === "USER" ? (
                    <span className="whitespace-pre-wrap">{m.content}</span>
                  ) : (
                    <ReactMarkdown
                      allowedElements={['p', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'br', 'code', 'pre']}
                      components={{
                        a: ({ node, ...props }) => {
                          const href = props.href || '';
                          if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                            return <span>{props.children}</span>; // strip invalid links
                          }
                          return <a {...props} target="_blank" rel="noopener noreferrer" aria-label={`Opens link in new tab: ${props.children}`} className="text-[#04a891] hover:underline break-all" />;
                        },
                        code: ({ node, ...props }) => <code {...props} className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-[11px] break-words" />,
                        p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  )}
                </div>
                {m.createdAt && (
                  <p className={`text-[8.5px] font-semibold text-slate-400 px-1 ${m.senderType === "USER" ? "text-right" : ""}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {m.senderType === "BOT" && m.grounded && " ✓ Document Verified"}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#02695e] to-[#04a891] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
              <Bot size={12} />
            </div>
            <div className="bg-white border border-[#02695e]/8 text-slate-800 px-4 py-2.5 rounded-[16px] rounded-tl-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        
        <div ref={scrollRef} />
      </div>

      {/* Input container */}
      {chatStatus === "CLOSED" || chatStatus === "RESOLVED" ? (
        <div className="p-3.5 border-t border-[#02695e]/8 bg-white/75 backdrop-blur-md flex flex-col gap-2 items-center justify-center h-[70px]">
          <p className="text-sm font-medium text-slate-500">This conversation has been closed.</p>
          <button onClick={startFreshConversation} className="text-xs font-bold text-[#02695e] hover:underline">Start a new chat</button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendText(inputVal);
          }}
          className="p-3.5 border-t border-[#02695e]/8 bg-white/75 backdrop-blur-md flex gap-2 items-center"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={
              mode === "HUMAN"
                ? "Type your reply to consultant..."
                : "Ask me anything..."
            }
            disabled={isSubmitting}
            className="flex-1 h-10 px-4 rounded-[14px] border border-slate-200 bg-white/80 text-slate-800 placeholder:text-slate-400 text-xs focus:border-[#04a891]/80 focus:bg-white focus:shadow-[0_0_0_3px_rgba(4,168,145,0.12)] outline-none transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isSubmitting}
            className="w-10 h-10 rounded-[14px] bg-[#02695e] text-white flex items-center justify-center hover:bg-[#037c6f] hover:scale-105 active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:scale-100 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(2,105,94,0.15)] transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </form>
      )}
    </motion.div>
  );
}
