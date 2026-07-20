"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, X, RotateCcw, Bot, User, ShieldAlert, ChevronDown, Check, MessagesSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";
import { playSound } from "@/lib/sounds";
import ReactMarkdown from 'react-markdown';
import { useTawk } from "@/hooks/useTawk";

const getChatConfig = async (): Promise<any> => {
  return apiClient("/api/chat/config");
};

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

const requestInternalHumanTakeover = async (id: string): Promise<any> => {
  return apiClient(`/api/chat/conversations/${id}/request-human`, {
    method: "POST"
  });
};

const tawkIdentity = async (id: string, data: any): Promise<any> => {
  return apiClient(`/api/chat/conversations/${id}/tawk-identity`, {
    method: "POST",
    body: JSON.stringify(data)
  });
};

const updateHandoffStatus = async (id: string, status: string, failureReason?: string): Promise<any> => {
  return apiClient(`/api/chat/conversations/${id}/handoff-status`, {
    method: "POST",
    body: JSON.stringify({ status, failureReason })
  });
};

export function Chatbot({ onClose, inline }: { onClose?: () => void, inline?: boolean }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [mode, setMode] = useState<string>("AI");
  const [chatStatus, setChatStatus] = useState<string>("OPEN");
  const [config, setConfig] = useState<any>(null);
  
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tawk Handoff state
  const [handoffStep, setHandoffStep] = useState<"NONE" | "CONSENT" | "DETAILS" | "CONNECTING" | "AWAY_PROMPT" | "OFFLINE_PROMPT">("NONE");
  const [visitorDetails, setVisitorDetails] = useState({ name: "", email: "", phone: "", reason: "", type: "candidate" });
  const [isMinimized, setIsMinimized] = useState(false);

  const { isLoaded, status: tawkStatus, showTawk, hideTawk } = useTawk({
    propertyId: config?.tawkPropertyId,
    widgetId: config?.tawkWidgetId,
    enabled: config?.tawkEnabled && config?.humanSupportProvider === 'TAWK'
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const prevModeRef = useRef<string>("AI");
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    async function initChat() {
      try {
        const conf = await getChatConfig();
        setConfig(conf);
        
        const conversation = await getOrCreateConversation();
        setConversationId(conversation.id);
        setMode(conversation.mode || "AI");
        setChatStatus(conversation.chatStatus || "OPEN");
        prevModeRef.current = conversation.mode || "AI";
        setMessages(conversation.messages || []);

        // Restore handoff step if needed
        if (conversation.chatStatus === "TAWK_OPENED" || conversation.chatStatus === "AGENT_JOINED") {
          setIsMinimized(true);
        }
      } catch (e) {
        console.error("Failed to load chat conversation:", e);
      }
    }
    initChat();
  }, []);

  const messagesLengthRef = useRef<number>(0);
  useEffect(() => {
    if (!conversationId) return;

    let active = true;
    async function poll() {
      if (document.hidden) return; 
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
      } catch (e) {}
    }

    const interval = setInterval(poll, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, handoffStep]);

  // Tawk Callbacks
  useEffect(() => {
    if (!window.Tawk_API || !conversationId) return;

    window.Tawk_API.onChatEnded = () => {
      updateHandoffStatus(conversationId, "COMPLETED");
      setMode("AI");
      setChatStatus("OPEN");
      setIsMinimized(false);
      hideTawk();
    };

    window.Tawk_API.onChatMinimized = () => {
      // If user minimizes Tawk chat, hide the widget entirely to remove attention grabbers,
      // and bring the AI chat button back.
      setIsMinimized(false);
      hideTawk();
    };

    window.Tawk_API.onAgentJoinChat = () => {
      updateHandoffStatus(conversationId, "AGENT_JOINED");
    };

  }, [conversationId, hideTawk]);


  const startFreshConversation = async () => {
    setIsSubmitting(true);
    try {
      if (conversationId) {
        const res = await apiClient(`/api/chat/conversations/${conversationId}/refresh`, { method: "POST" });
        setMessages((prev) => [...prev, res]);
        setMode("AI");
        setChatStatus("OPEN");
        setHandoffStep("NONE");
        setIsMinimized(false);
      } else {
        const conversation = await getOrCreateConversation();
        setConversationId(conversation.id);
        setMode(conversation.mode || "AI");
        setChatStatus(conversation.chatStatus || "OPEN");
        setMessages(conversation.messages || []);
        setHandoffStep("NONE");
        setIsMinimized(false);
      }
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

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, {
      id: tempId,
      senderType: "USER",
      sender: "USER",
      content: text,
      createdAt: new Date(),
    }]);

    if (mode === "AI") setIsTyping(true);

    try {
      if (window.Tawk_API) {
        window.Tawk_API.addEvent("ai_question_sent", { conversationId });
      }
      const result = await addChatMessage(conversationId, text);
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

  const initiateHumanHandoff = async () => {
    if (!conversationId || !config) return;

    if (config.humanSupportProvider === 'TAWK') {
      if (window.Tawk_API) {
        window.Tawk_API.addEvent("human_handoff_requested", { conversationId });
      }
      setHandoffStep("CONSENT");
      await updateHandoffStatus(conversationId, "DETAILS_REQUIRED");
    } else if (config.humanSupportProvider === 'INTERNAL') {
      setIsSubmitting(true);
      try {
        await requestInternalHumanTakeover(conversationId);
        setMode("HUMAN");
        setChatStatus("WAITING_FOR_ADMIN");
        playSound("reverted");
      } catch (error) {
        console.error("Failed to request human", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const proceedToTawk = async () => {
    if (!conversationId) return;
    setHandoffStep("CONNECTING");
    
    try {
      await updateHandoffStatus(conversationId, "REQUESTED");
      const identity = await tawkIdentity(conversationId, visitorDetails);
      
      if (identity && window.Tawk_API) {
        if (identity.visitor.hash && window.Tawk_API.secureMode) {
          window.Tawk_API.secureMode(identity.visitor.hash);
        }
        window.Tawk_API.setAttributes({
          name: identity.visitor.name,
          email: identity.visitor.email,
          phone: identity.visitor.phone,
          "visitor-type": visitorDetails.type,
          "handoff-reason": visitorDetails.reason,
          "ai-conversation-id": conversationId
        });
        window.Tawk_API.addTags(["headhunters-ai-handoff", visitorDetails.type === "employer" ? "employer-lead" : "candidate-lead"]);
        
        if (tawkStatus === 'online') {
          openTawkChat();
        } else if (tawkStatus === 'away') {
          setHandoffStep("AWAY_PROMPT");
        } else {
          setHandoffStep("OFFLINE_PROMPT");
        }
      } else {
        throw new Error("Invalid identity response");
      }
    } catch (e) {
      console.error(e);
      setHandoffStep("NONE");
      await updateHandoffStatus(conversationId, "FAILED", String(e));
      setMessages((prev) => [...prev, {
        id: `sys-${Date.now()}`,
        senderType: "SYSTEM",
        sender: "SYSTEM",
        content: "Live support could not be opened right now. You can continue here or contact us on WhatsApp.",
        createdAt: new Date(),
      }]);
    }
  };

  const openTawkChat = async () => {
    if (!conversationId || !window.Tawk_API) return;
    setIsMinimized(true);
    setMode("TAWK_HANDOFF");
    setHandoffStep("NONE");
    await updateHandoffStatus(conversationId, "TAWK_OPENED");
    window.Tawk_API.addEvent("tawk_opened", { conversationId });
    showTawk();
  };

  const cancelHandoff = async () => {
    setHandoffStep("NONE");
    if (conversationId) {
      await updateHandoffStatus(conversationId, "NOT_REQUESTED");
    }
  };

  const renderHandoffFlow = () => {
    if (handoffStep === "NONE") return null;

    return (
      <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-md flex flex-col p-6 animate-in fade-in duration-200">
        {handoffStep === "CONSENT" && (
          <div className="flex flex-col h-full justify-center space-y-6">
            <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert size={24} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Live Support Transfer</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                To connect you with our recruitment team, we’ll share the contact details you provide with our live-chat service, Tawk.to. Do you want to continue?
              </p>
            </div>
            <div className="space-y-3 pt-4">
              <button 
                onClick={() => setHandoffStep("DETAILS")}
                className="w-full h-11 bg-[#02695e] text-white font-semibold rounded-[12px] hover:bg-[#027d6f] transition-colors shadow-sm"
              >
                Continue to live support
              </button>
              <button 
                onClick={cancelHandoff}
                className="w-full h-11 bg-slate-100 text-slate-700 font-semibold rounded-[12px] hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {handoffStep === "DETAILS" && (
          <div className="flex flex-col h-full overflow-y-auto pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Your Details</h3>
              <button onClick={cancelHandoff} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setVisitorDetails({...visitorDetails, type: 'candidate'})} className={`h-10 text-sm font-medium rounded-lg border ${visitorDetails.type === 'candidate' ? 'border-[#02695e] bg-teal-50 text-[#02695e]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'} transition-all`}>Job Seeker</button>
                  <button onClick={() => setVisitorDetails({...visitorDetails, type: 'employer'})} className={`h-10 text-sm font-medium rounded-lg border ${visitorDetails.type === 'employer' ? 'border-[#02695e] bg-teal-50 text-[#02695e]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'} transition-all`}>Employer</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Name</label>
                <input type="text" value={visitorDetails.name} onChange={e => setVisitorDetails({...visitorDetails, name: e.target.value})} className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02695e]/20 focus:border-[#02695e] transition-all" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Email</label>
                <input type="email" value={visitorDetails.email} onChange={e => setVisitorDetails({...visitorDetails, email: e.target.value})} className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02695e]/20 focus:border-[#02695e] transition-all" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Phone (Optional)</label>
                <input type="tel" value={visitorDetails.phone} onChange={e => setVisitorDetails({...visitorDetails, phone: e.target.value})} className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02695e]/20 focus:border-[#02695e] transition-all" placeholder="+94 77 ..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">How can we help?</label>
                <textarea value={visitorDetails.reason} onChange={e => setVisitorDetails({...visitorDetails, reason: e.target.value})} className="w-full h-20 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02695e]/20 focus:border-[#02695e] transition-all resize-none" placeholder="Briefly describe what you need..." />
              </div>
            </div>
            <div className="pt-6 mt-auto">
              <button 
                disabled={!visitorDetails.name || !visitorDetails.email}
                onClick={proceedToTawk}
                className="w-full h-11 bg-[#02695e] text-white font-semibold rounded-[12px] hover:bg-[#027d6f] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Connect with team
              </button>
            </div>
          </div>
        )}

        {handoffStep === "CONNECTING" && (
          <div className="flex flex-col h-full items-center justify-center space-y-4">
            <div className="w-8 h-8 border-3 border-[#02695e]/20 border-t-[#02695e] rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-600">Connecting you with our recruitment team...</p>
          </div>
        )}

        {handoffStep === "AWAY_PROMPT" && (
          <div className="flex flex-col h-full justify-center space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Team is Away</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our recruitment team may take a little longer to respond. Would you like to open live chat, continue with the AI assistant, or contact us on WhatsApp?
              </p>
            </div>
            <div className="space-y-3 pt-4">
              <button onClick={openTawkChat} className="w-full h-11 bg-[#02695e] text-white font-semibold rounded-[12px] hover:bg-[#027d6f] transition-colors shadow-sm">
                Open Live Chat
              </button>
              <a href={`https://wa.me/${config?.tawkWhatsAppNumber?.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="w-full h-11 flex items-center justify-center bg-green-600 text-white font-semibold rounded-[12px] hover:bg-green-700 transition-colors shadow-sm">
                WhatsApp Us
              </a>
              <button onClick={cancelHandoff} className="w-full h-11 bg-slate-100 text-slate-700 font-semibold rounded-[12px] hover:bg-slate-200 transition-colors">
                Continue with AI
              </button>
            </div>
          </div>
        )}

        {handoffStep === "OFFLINE_PROMPT" && (
          <div className="flex flex-col h-full justify-center space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Team Offline</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {config?.tawkOfflineMessage || "Our recruitment team is currently offline. You can leave a message, continue with the AI assistant, or contact us on WhatsApp."}
              </p>
            </div>
            <div className="space-y-3 pt-4">
              <button onClick={openTawkChat} className="w-full h-11 bg-[#02695e] text-white font-semibold rounded-[12px] hover:bg-[#027d6f] transition-colors shadow-sm">
                Leave a message
              </button>
              <a href={`https://wa.me/${config?.tawkWhatsAppNumber?.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="w-full h-11 flex items-center justify-center bg-green-600 text-white font-semibold rounded-[12px] hover:bg-green-700 transition-colors shadow-sm">
                WhatsApp Us
              </a>
              <button onClick={cancelHandoff} className="w-full h-11 bg-slate-100 text-slate-700 font-semibold rounded-[12px] hover:bg-slate-200 transition-colors">
                Continue with AI
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getStatusText = () => {
    if (handoffStep === "CONNECTING") return "Connecting...";
    if (mode === "TAWK_HANDOFF") return "Live Support Active";
    if (mode === "HUMAN") {
      return chatStatus === "WAITING_FOR_ADMIN" ? "Waiting for consultant..." : "Human agent joined";
    }
    return "AI-powered recruitment support";
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => {
            setIsMinimized(false);
            if (mode === "TAWK_HANDOFF") {
              // Usually we wouldn't show the Tawk widget AND this maximized, but we let them return to AI.
              hideTawk();
              setMode("AI");
            }
          }}
          className="bg-white px-5 py-3 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-slate-100 flex items-center gap-3 hover:scale-105 transition-transform"
        >
          <Bot className="text-[#02695e] w-5 h-5" />
          <span className="text-sm font-semibold text-slate-700">Return to AI Assistant</span>
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 25, scale: 0.96 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={inline 
        ? "w-full h-[600px] rounded-[24px] bg-white border border-slate-100 shadow-[0_8px_30px_rgba(2,105,94,0.08)] flex flex-col overflow-hidden text-slate-800 font-sans relative"
        : "fixed top-0 left-0 w-full h-[100dvh] rounded-none md:absolute md:top-auto md:left-auto md:bottom-20 md:right-0 md:w-[400px] md:h-[680px] md:max-w-[calc(100vw-32px)] md:max-h-[calc(100vh-100px)] md:rounded-[22px] bg-white md:border border-slate-100 shadow-[0_24px_60px_rgba(2,105,94,0.12)] flex flex-col overflow-hidden z-40 md:z-[100] text-slate-800 font-sans"
      }
    >
      {renderHandoffFlow()}

      {/* Header */}
      <div className="px-5 py-4 pt-[max(env(safe-area-inset-top,1rem),1rem)] md:pt-4 border-b border-[#02695e]/10 bg-[#0B0B0C] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#02695e] to-[#04a891] flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight tracking-wide">
              Headhunters Assistant
            </h4>
            <p className="text-[11px] text-white/60 mt-0.5 font-medium flex items-center gap-1.5">
              {getStatusText()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mode === "AI" && config?.humanSupportProvider && config.humanSupportProvider !== 'DISABLED' && (
            <button
              onClick={initiateHumanHandoff}
              disabled={isSubmitting}
              className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] font-semibold transition-colors whitespace-nowrap"
            >
              {config.humanSupportProvider === 'TAWK' ? 'Live Chat (Tawk)' : 'Talk to Human'}
            </button>
          )}
          <button
            onClick={startFreshConversation}
            disabled={isSubmitting || mode === "TAWK_HANDOFF"}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-white/60 hover:text-white disabled:opacity-40"
            title="Restart conversation"
          >
            <RotateCcw size={14} />
          </button>
          {!inline && onClose && (
            <button
              onClick={() => setIsMinimized(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer text-white/60 hover:text-white"
              title="Minimize"
            >
              <ChevronDown size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-start justify-center text-center shrink-0">
        <p className="text-[10px] leading-tight text-slate-500 font-medium">
          Please don’t share passwords, bank details or identity documents in this chat.
        </p>
      </div>

      {/* Messages list */}
      <div 
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="flex-1 overflow-y-auto px-5 py-6 space-y-5 bg-[#FAFAFA] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
              <MessagesSquare className="text-[#02695e] w-8 h-8 opacity-80" />
            </div>
            <div className="space-y-2 max-w-[280px]">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Hi! I can help you explore vacancies, submit your CV, request staff, or learn about our recruitment services. How can I help today?
              </p>
              <p className="text-[10px] text-slate-400">Answers are based on approved Headhunters.lk information.</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <button onClick={() => handleSendText("Find a job")} className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[13px] font-semibold text-slate-700 hover:border-[#02695e] hover:text-[#02695e] shadow-sm transition-all">Find a job</button>
              <button onClick={() => handleSendText("Submit my CV")} className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[13px] font-semibold text-slate-700 hover:border-[#02695e] hover:text-[#02695e] shadow-sm transition-all">Submit my CV</button>
              <button onClick={() => handleSendText("Hire talent")} className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[13px] font-semibold text-slate-700 hover:border-[#02695e] hover:text-[#02695e] shadow-sm transition-all">Hire talent</button>
              <button onClick={() => handleSendText("Ask a question")} className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[13px] font-semibold text-slate-700 hover:border-[#02695e] hover:text-[#02695e] shadow-sm transition-all">Ask a question</button>
            </div>
          </div>
        )}

        {messages.map((m) => {
          return (
            <div key={m.id} className={`flex items-end gap-2.5 ${m.senderType === "USER" ? "flex-row-reverse" : ""}`}>
              {m.senderType !== "USER" && (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${m.senderType === "ADMIN" ? "bg-[#04a891]" : "bg-[#02695e]"}`}>
                   {m.senderType === "ADMIN" ? <User size={12} className="text-white" /> : <Bot size={12} className="text-white" />}
                </div>
              )}
              
              <div className="max-w-[75%] space-y-1">
                {m.senderType === "SYSTEM" ? (
                   <div className="text-center w-full px-4 text-xs font-medium text-slate-400 my-2">{m.content}</div>
                ) : (
                  <div className={`px-4 py-2.5 text-[13px] leading-relaxed font-medium overflow-wrap-anywhere ${
                    m.senderType === "USER" 
                      ? "bg-slate-800 text-white rounded-[18px] rounded-br-[6px] shadow-sm" 
                      : m.senderType === "ADMIN"
                      ? "bg-[#04a891] text-white rounded-[18px] rounded-bl-[6px] shadow-sm"
                      : "bg-white border border-slate-100 text-slate-800 rounded-[18px] rounded-bl-[6px] shadow-sm prose prose-sm prose-slate max-w-none"
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
                              return <span>{props.children}</span>; 
                            }
                            return <a {...props} target="_blank" rel="noopener noreferrer" className="text-[#04a891] font-bold hover:underline break-all" />;
                          },
                          code: ({ node, ...props }) => <code {...props} className="bg-slate-50 text-[#02695e] px-1 py-0.5 rounded text-[11px] break-words" />,
                          p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    )}
                  </div>
                )}
                {m.senderType === "BOT" && m.grounded && (
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 font-semibold uppercase tracking-wider ml-2">
                    <Check size={10} /> Verified
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-end gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#02695e] flex items-center justify-center shrink-0">
               <Bot size={12} className="text-white" />
            </div>
            <div className="px-4 py-3 bg-white border border-slate-100 rounded-[18px] rounded-bl-[6px] shadow-sm">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 ml-1 mb-1 font-medium">Checking our approved information...</span>
          </div>
        )}

        {messages.length > 0 && mode === "AI" && config?.humanSupportProvider !== 'DISABLED' && (
          <div className="mt-8 mb-2 flex justify-center">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 w-[280px] shadow-sm text-center space-y-3">
              <p className="text-xs text-slate-500 font-medium">Need personal assistance? Connect with a recruitment consultant.</p>
              <button 
                onClick={initiateHumanHandoff}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-bold rounded-xl transition-colors"
              >
                Speak with our team
              </button>
            </div>
          </div>
        )}

        <div ref={scrollRef} className="h-2" />
      </div>

      {/* Input area */}
      {(mode === "AI" || mode === "HUMAN") && (
        <div className="px-4 py-4 bg-white border-t border-slate-100 shrink-0 mb-[env(safe-area-inset-bottom,0px)]">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendText(inputVal); }}
            className="flex items-end gap-2"
          >
            <textarea
              rows={1}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendText(inputVal);
                }
              }}
              placeholder="Ask about jobs or recruitment services..."
              className="flex-1 max-h-32 min-h-[44px] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#02695e]/20 focus:border-[#02695e] transition-all resize-none shadow-inner"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isSubmitting}
              className="w-11 h-11 shrink-0 rounded-full bg-[#02695e] text-white flex items-center justify-center hover:bg-[#027d6f] transition-all disabled:opacity-50 shadow-sm"
            >
              <Send size={18} className={inputVal.trim() ? "ml-0.5" : ""} />
            </button>
          </form>
        </div>
      )}
    </motion.div>
  );
}
