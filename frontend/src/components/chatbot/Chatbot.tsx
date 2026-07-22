"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, X, RotateCcw, User, ChevronDown, Check, MessagesSquare, Headphones, MessageCircle, Paperclip } from "lucide-react";
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
  const [initError, setInitError] = useState(false);
  
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
        const [conf, conversation] = await Promise.all([
          getChatConfig(),
          getOrCreateConversation()
        ]);
        setConfig(conf);
        setConversationId(conversation.id);
        setMode(conversation.mode || "AI");
        setChatStatus(conversation.chatStatus || "OPEN");
        prevModeRef.current = conversation.mode || "AI";
        setMessages(conversation.messages || []);
      } catch (e) {
        console.error("Failed to load chat conversation:", e);
        setInitError(true);
      }
    }
    initChat();
  }, []);

  const messagesLengthRef = useRef<number>(0);
  useEffect(() => {
    if (!conversationId) return;

    let active = true;
    const poll = async () => {
      if (document.hidden || isMinimized) return; 
      try {
        const result = await apiClient(`/api/chat/messages?conversationId=${conversationId}`);
        
        if (active && result) {
          if (result.mode === "HUMAN" && prevModeRef.current !== "HUMAN") {
            playSound("connected");
          } else if ((result.mode === "AI" || result.chatStatus === "RESOLVED" || result.chatStatus === "CLOSED") && prevModeRef.current === "HUMAN") {
            playSound("reverted");
            setMode("AI");
            setChatStatus("OPEN");
          }
          prevModeRef.current = result.mode;
          if (result.chatStatus !== "RESOLVED" && result.chatStatus !== "CLOSED") {
            setMode(result.mode);
            setChatStatus(result.chatStatus);
          }
          
          if (result.messages.length !== messagesLengthRef.current) {
            messagesLengthRef.current = result.messages.length;
            setMessages(result.messages);
            localStorage.setItem("hh_chat_read_timestamp", Date.now().toString());
          }
        }
      } catch (e) {}
    }

    const interval = setInterval(poll, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [conversationId, isMinimized]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
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
        setMessages((prev) => {
          // Replace temp message with actual messages from server on next poll
          return [...prev.filter(m => m.id !== tempId), result.message];
        });
      }
    } catch (error) {
      console.error("Failed to send message", error);
      // Remove temp message on error
      setMessages((prev) => prev.filter(m => m.id !== tempId));
    } finally {
      setIsTyping(false);
      setIsSubmitting(false);
    }
  };

  const initiateHumanHandoff = () => {
    setHandoffStep("DETAILS");
  };

  const proceedToTawk = async () => {
    if (!conversationId) return;
    setHandoffStep("CONNECTING");
    
    try {
      await updateHandoffStatus(conversationId, "REQUESTED");

      // 1. Send enquiry directly to Admin Enquiries database
      try {
        await apiClient('/api/enquiries', {
          method: 'POST',
          body: JSON.stringify({
            name: visitorDetails.name,
            email: visitorDetails.email,
            phone: visitorDetails.phone || '',
            type: visitorDetails.type === 'employer' ? 'EMPLOYER' : 'CANDIDATE',
            message: `Chatbot Consultation Request: ${visitorDetails.reason || 'General inquiry'} (Session ID: ${conversationId})`
          })
        });
      } catch (err) {
        console.warn("Failed to post enquiry:", err);
      }

      // 2. Mark conversation in Admin Live Chat as requesting human
      try {
        await apiClient(`/api/admin/conversations/${conversationId}/status`, {
          method: 'PUT',
          body: JSON.stringify({
            status: 'HUMAN_ACTIVE',
            needsHuman: true,
            chatStatus: 'WAITING_FOR_ADMIN'
          })
        });
      } catch (err) {
        console.warn("Failed to update conv status:", err);
      }

      const identity = await tawkIdentity(conversationId, visitorDetails).catch(() => null);

      if (window.Tawk_API || config?.humanSupportProvider === 'TAWK') {
        if (identity && window.Tawk_API) {
          if (identity.visitor?.hash && window.Tawk_API.secureMode) {
            window.Tawk_API.secureMode(identity.visitor.hash);
          }
          window.Tawk_API.setAttributes({
            name: identity.visitor?.name || visitorDetails.name,
            email: identity.visitor?.email || visitorDetails.email,
            phone: identity.visitor?.phone || visitorDetails.phone,
            "visitor-type": visitorDetails.type,
            "handoff-reason": visitorDetails.reason,
            "ai-conversation-id": conversationId
          });
          window.Tawk_API.addTags(["headhunters-ai-handoff", visitorDetails.type === "employer" ? "employer-lead" : "candidate-lead"]);
        }
        
        // Always switch to Tawk.to live chat widget!
        await openTawkChat();
        return;
      }

      // Fallback: details saved successfully to Admin Enquiries
      setHandoffStep("NONE");
      setMessages((prev) => [...prev, {
        id: `sys-${Date.now()}`,
        senderType: "SYSTEM",
        sender: "SYSTEM",
        content: "Thank you! Your details and inquiry have been received. A recruitment consultant will review your request and get back to you shortly at " + visitorDetails.email + ".",
        createdAt: new Date(),
      }]);
    } catch (e) {
      console.error(e);
      setHandoffStep("NONE");
      setMessages((prev) => [...prev, {
        id: `sys-${Date.now()}`,
        senderType: "SYSTEM",
        sender: "SYSTEM",
        content: "Thank you! Your details have been submitted to our team. A consultant will respond to you shortly.",
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
      <div className="absolute inset-0 z-10 bg-white/97 backdrop-blur-md flex flex-col p-6 animate-in fade-in duration-200">
        {handoffStep === "CONSENT" && (
          <div className="flex flex-col h-full justify-center space-y-6">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-[#02695e] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Headphones size={26} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Connect with Our Team</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[260px] mx-auto">
                We'll connect you with a recruitment consultant. Your details will be shared securely with our live-chat platform.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <button 
                onClick={() => setHandoffStep("DETAILS")}
                className="w-full h-12 bg-gradient-to-r from-[#02695e] to-[#04a891] text-white font-semibold rounded-[14px] hover:shadow-lg hover:shadow-teal-500/25 transition-all"
              >
                Continue to live support
              </button>
              <button 
                onClick={cancelHandoff}
                className="w-full h-12 bg-slate-100 text-slate-600 font-semibold rounded-[14px] hover:bg-slate-200 transition-colors"
              >
                Stay with AI assistant
              </button>
            </div>
          </div>
        )}

        {handoffStep === "DETAILS" && (
          <div className="flex flex-col h-full justify-between overflow-hidden">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <h3 className="text-base font-bold text-slate-800">Your Details</h3>
              <button onClick={cancelHandoff} className="p-1.5 -mr-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2 flex-1 min-h-0">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-0.5 uppercase tracking-wider">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setVisitorDetails({...visitorDetails, type: 'candidate'})} className={`h-8.5 text-xs font-semibold rounded-xl border transition-all ${visitorDetails.type === 'candidate' ? 'border-[#02695e] bg-teal-50 text-[#02695e]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>Job Seeker</button>
                  <button onClick={() => setVisitorDetails({...visitorDetails, type: 'employer'})} className={`h-8.5 text-xs font-semibold rounded-xl border transition-all ${visitorDetails.type === 'employer' ? 'border-[#02695e] bg-teal-50 text-[#02695e]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>Employer</button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-0.5 uppercase tracking-wider">Name *</label>
                <input type="text" value={visitorDetails.name} onChange={e => setVisitorDetails({...visitorDetails, name: e.target.value})} className="w-full h-8.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#02695e]/20 focus:border-[#02695e] transition-all" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-0.5 uppercase tracking-wider">Email *</label>
                <input type="email" value={visitorDetails.email} onChange={e => setVisitorDetails({...visitorDetails, email: e.target.value})} className="w-full h-8.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#02695e]/20 focus:border-[#02695e] transition-all" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-0.5 uppercase tracking-wider">Phone (optional)</label>
                <input type="tel" value={visitorDetails.phone} onChange={e => setVisitorDetails({...visitorDetails, phone: e.target.value})} className="w-full h-8.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#02695e]/20 focus:border-[#02695e] transition-all" placeholder="+94 77 ..." />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-0.5 uppercase tracking-wider">How can we help?</label>
                <textarea value={visitorDetails.reason} onChange={e => setVisitorDetails({...visitorDetails, reason: e.target.value})} className="w-full h-14 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#02695e]/20 focus:border-[#02695e] transition-all resize-none" placeholder="Briefly describe what you need..." />
              </div>
            </div>
            <div className="pt-2 shrink-0">
              <button 
                disabled={!visitorDetails.name || !visitorDetails.email}
                onClick={proceedToTawk}
                className="w-full h-10 bg-gradient-to-r from-[#02695e] to-[#04a891] text-white text-xs font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <Headphones size={14} />
                Connect with our team
              </button>
            </div>
          </div>
        )}

        {handoffStep === "CONNECTING" && (
          <div className="flex flex-col h-full items-center justify-center space-y-4">
            <div className="w-12 h-12 border-[3px] border-[#02695e]/20 border-t-[#02695e] rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-600">Connecting you with our team...</p>
          </div>
        )}

        {handoffStep === "AWAY_PROMPT" && (
          <div className="flex flex-col h-full justify-center space-y-6">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <Headphones size={26} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Team is Away</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[260px] mx-auto">
                Our recruitment team may take a little longer to respond. You can open live chat, continue with AI, or contact us on WhatsApp.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <button onClick={openTawkChat} className="w-full h-12 bg-gradient-to-r from-[#02695e] to-[#04a891] text-white font-semibold rounded-[14px] transition-all hover:shadow-lg hover:shadow-teal-500/25">
                Open Live Chat
              </button>
              <a href={`https://wa.me/${config?.tawkWhatsAppNumber?.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="w-full h-12 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold rounded-[14px] hover:bg-green-700 transition-colors">
                <MessageCircle size={16} /> WhatsApp Us
              </a>
              <button onClick={cancelHandoff} className="w-full h-12 bg-slate-100 text-slate-600 font-semibold rounded-[14px] hover:bg-slate-200 transition-colors">
                Continue with AI
              </button>
            </div>
          </div>
        )}

        {handoffStep === "OFFLINE_PROMPT" && (
          <div className="flex flex-col h-full justify-center space-y-6">
            <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
              <Headphones size={26} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Team Offline</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[260px] mx-auto">
                {config?.tawkOfflineMessage || "Our team is currently offline. Leave a message, contact us on WhatsApp, or let our AI assistant help you."}
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <button onClick={openTawkChat} className="w-full h-12 bg-gradient-to-r from-[#02695e] to-[#04a891] text-white font-semibold rounded-[14px] transition-all hover:shadow-lg hover:shadow-teal-500/25">
                Leave a message
              </button>
              <a href={`https://wa.me/${config?.tawkWhatsAppNumber?.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="w-full h-12 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold rounded-[14px] hover:bg-green-700 transition-colors">
                <MessageCircle size={16} /> WhatsApp Us
              </a>
              <button onClick={cancelHandoff} className="w-full h-12 bg-slate-100 text-slate-600 font-semibold rounded-[14px] hover:bg-slate-200 transition-colors">
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
    if (chatStatus === "ADMIN_JOINED") return "Consultant joined";
    if (chatStatus === "WAITING_FOR_ADMIN") return "Waiting for a consultant...";
    return "AI-powered recruitment support";
  };

  const getLiveAgentButtonLabel = () => {
    if (!config) return null;
    if (config.humanSupportProvider === 'TAWK' || config.humanSupportProvider === 'INTERNAL') return 'Live Support';
    return null;
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <button 
          onClick={() => {
            setIsMinimized(false);
            if (mode === "TAWK_HANDOFF") {
              hideTawk();
              setMode("AI");
            }
          }}
          className="bg-white h-12 px-5 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-slate-200 flex items-center gap-2.5 hover:scale-105 transition-all cursor-pointer"
        >
          <img src="/logo/favicon-mark.png" alt="HH" className="w-5 h-5 object-contain" />
          <span className="text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">Return to AI Assistant</span>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-[#02695e] to-[#04a891] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(4,168,145,0.35)] hover:scale-105 transition-all cursor-pointer shrink-0"
            aria-label="Close Chat"
            title="Close"
          >
            <X size={20} />
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={
        inline
          ? "w-full h-full flex flex-col bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden relative"
          : "fixed inset-0 sm:inset-auto sm:relative sm:w-[390px] h-[100dvh] sm:h-[580px] sm:max-h-[calc(100dvh-120px)] flex flex-col bg-white sm:rounded-3xl border-0 sm:border border-slate-100 sm:shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden z-[100] w-full"
      }
    >
      {renderHandoffFlow()}
      {/* Top Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#02695e] to-[#04a891] text-white flex items-center justify-between shrink-0 shadow-sm gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
              <img src="/logo/favicon-mark.png" alt="HH" className="w-4 h-4 object-contain" />
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#02695e]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-xs sm:text-sm leading-tight text-white truncate">Headhunters Assistant</h3>
            <p className="text-[10px] text-white/80 font-medium truncate">{getStatusText()}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {getLiveAgentButtonLabel() && (
            <button
              onClick={initiateHumanHandoff}
              disabled={isSubmitting || handoffStep === "CONNECTING"}
              className="text-[11px] font-bold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full text-white transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 border border-white/20"
              title="Connect with a Live Agent"
            >
              <Headphones size={12} />
              <span>Live Support</span>
            </button>
          )}
          <button
            onClick={startFreshConversation}
            disabled={isSubmitting || mode === "TAWK_HANDOFF"}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer text-white/80 hover:text-white disabled:opacity-40"
            title="Reset Conversation"
          >
            <RotateCcw size={13} />
          </button>
          {!inline && onClose && (
            <button
              onClick={() => setIsMinimized(true)}
              className="w-7 h-7 hidden sm:flex items-center justify-center rounded-full hover:bg-white/20 transition-colors cursor-pointer text-white/80 hover:text-white"
              title="Minimize"
            >
              <ChevronDown size={17} />
            </button>
          )}
          {!inline && onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 flex sm:hidden items-center justify-center rounded-full hover:bg-white/20 transition-colors cursor-pointer text-white/80 hover:text-white"
              title="Close"
            >
              <X size={17} />
            </button>
          )}
        </div>
      </div>

      {/* Messages list */}
      <div 
        ref={chatContainerRef}
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="flex-1 overflow-y-auto px-5 py-6 space-y-5 bg-[#F9FAFB] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
      >
        {initError && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <X className="text-red-400 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Could not connect</p>
              <p className="text-xs text-slate-400 mt-1">Please refresh the page or contact us at info@headhunters.lk</p>
            </div>
          </div>
        )}

        {!initError && messages.length === 0 && !conversationId && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in duration-500">
            <div className="w-10 h-10 border-3 border-[#02695e]/20 border-t-[#02695e] rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Starting your session...</p>
          </div>
        )}

        {!initError && messages.length === 0 && conversationId && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center shadow-inner">
              <MessagesSquare className="text-[#02695e] w-8 h-8 opacity-80" />
            </div>
            <div className="space-y-2 max-w-[280px]">
              <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                Hi! I'm your Headhunters AI assistant.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                I can help you explore vacancies, submit your CV, request staff, or answer questions about our recruitment services.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <button onClick={() => handleSendText("Find a job")} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-[12px] font-semibold text-slate-600 hover:border-[#02695e] hover:text-[#02695e] shadow-sm transition-all hover:shadow-md">🔍 Find a job</button>
              <button onClick={() => handleSendText("Submit my CV")} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-[12px] font-semibold text-slate-600 hover:border-[#02695e] hover:text-[#02695e] shadow-sm transition-all hover:shadow-md">📄 Submit my CV</button>
              <button onClick={() => handleSendText("Hire talent")} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-[12px] font-semibold text-slate-600 hover:border-[#02695e] hover:text-[#02695e] shadow-sm transition-all hover:shadow-md">🤝 Hire talent</button>
              <button onClick={() => handleSendText("What services do you offer?")} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-[12px] font-semibold text-slate-600 hover:border-[#02695e] hover:text-[#02695e] shadow-sm transition-all hover:shadow-md">❓ Our services</button>
            </div>
          </div>
        )}

        {messages.map((m) => {
          return (
            <div key={m.id} className={`flex items-end gap-2.5 ${m.senderType === "USER" ? "flex-row-reverse" : ""}`}>
              {m.senderType !== "USER" && (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${m.senderType === "ADMIN" ? "bg-gradient-to-br from-[#02695e] to-[#04a891]" : "bg-gradient-to-br from-[#02695e] to-[#04a891]"}`}>
                   {m.senderType === "ADMIN" ? <User size={12} className="text-white" /> : <img src="/logo/favicon-mark.png" alt="AI" className="w-4 h-4 object-contain rounded" />}
                </div>
              )}
              
              <div className="max-w-[75%] space-y-1">
                {m.senderType === "SYSTEM" ? (
                   <div className="text-center w-full px-4 text-xs font-medium text-slate-400 my-2 italic">{m.content}</div>
                ) : (
                  <div className={`px-4 py-2.5 text-[13px] leading-relaxed font-medium overflow-wrap-anywhere ${
                    m.senderType === "USER" 
                      ? "bg-gradient-to-br from-[#02695e] to-[#04a891] text-white rounded-[18px] rounded-br-[6px] shadow-sm" 
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
                            return <a {...props} target="_blank" rel="noopener noreferrer" className="text-[#02695e] font-bold hover:underline break-all" />;
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
                  <div className="flex items-center gap-1 text-[9px] text-[#02695e]/70 font-semibold uppercase tracking-wider ml-2">
                    <Check size={10} /> Verified info
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-end gap-2.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#02695e] to-[#04a891] flex items-center justify-center shrink-0">
               <img src="/logo/favicon-mark.png" alt="AI" className="w-4 h-4 object-contain rounded" />
            </div>
            <div className="px-4 py-3 bg-white border border-slate-100 rounded-[18px] rounded-bl-[6px] shadow-sm">
              <span className="flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-[#02695e]/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-[#02695e]/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-[#02695e]/40 rounded-full animate-bounce"></span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 ml-1 mb-1 font-medium">Searching our knowledge base...</span>
          </div>
        )}

        <div ref={scrollRef} className="h-2" />
      </div>

      {/* Input area */}
      {(mode === "AI" || mode === "HUMAN") && (
        <div className="px-4 py-4 bg-white border-t border-slate-100 shrink-0 mb-[env(safe-area-inset-bottom,0px)]">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendText(inputVal); }}
            className="flex items-center gap-2"
          >
            <label
              className="p-2.5 rounded-full text-slate-400 hover:text-[#02695e] hover:bg-teal-50 transition-colors cursor-pointer shrink-0"
              title="Upload CV (.pdf, .doc, .docx)"
            >
              <Paperclip size={18} />
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={async (e) => {
                  const selectedFile = e.target.files?.[0];
                  if (!selectedFile) return;

                  if (selectedFile.size > 10 * 1024 * 1024) {
                    alert("File too large. Please upload a CV under 10 MB.");
                    return;
                  }

                  const formData = new FormData();
                  formData.append('file', selectedFile);

                  try {
                    const res = await fetch('/api/chat/upload-cv', {
                      method: 'POST',
                      body: formData
                    });
                    const data = await res.json();
                    if (res.ok && data.file) {
                      setVisitorDetails(prev => ({ ...prev, cvFileName: data.file.fileName }));
                      setMessages(prev => [...prev, {
                        id: `cv-${Date.now()}`,
                        senderType: 'USER',
                        sender: 'USER',
                        content: `📄 Uploaded CV: ${data.file.originalName}`,
                        createdAt: new Date()
                      }]);
                      setHandoffStep("DETAILS");
                    } else {
                      alert(`CV Upload failed: ${data.error || 'Invalid file format'}`);
                    }
                  } catch (err) {
                    alert("Error uploading CV. Please try again.");
                  }
                }}
              />
            </label>

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
              placeholder="Type a message..."
              className="flex-1 max-h-32 min-h-[44px] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#02695e]/20 focus:border-[#02695e] transition-all resize-none shadow-inner placeholder:text-slate-400"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isSubmitting}
              className="w-11 h-11 bg-gradient-to-r from-[#02695e] to-[#04a891] text-white rounded-2xl flex items-center justify-center shrink-0 hover:shadow-md hover:scale-105 transition-all disabled:opacity-40 disabled:hover:scale-100 cursor-pointer shadow-sm"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </motion.div>
  );
}
