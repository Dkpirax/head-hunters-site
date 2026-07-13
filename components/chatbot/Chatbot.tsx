"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, X, RotateCcw, Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import { getOrCreateConversation, addChatMessage, closeConversation, requestHumanTakeover } from "@/app/actions/chat";
import { createEnquiry } from "@/app/actions/enquiries";
import { playSound } from "@/lib/sounds";
import type { Message as PrismaMessage, EnquiryType } from "@prisma/client";

interface Message {
  id: string;
  senderType: "USER" | "ADMIN" | "BOT";
  content: string;
  createdAt?: string | Date;
  options?: string[];
}

type ChatStep =
  | "INITIAL"
  | "SELECT_PATH"
  | "HIRING_NAME"
  | "HIRING_EMAIL"
  | "HIRING_PHONE"
  | "HIRING_SERVICE"
  | "HIRING_DESC"
  | "CANDIDATE_NAME"
  | "CANDIDATE_EMAIL"
  | "CANDIDATE_PHONE"
  | "CANDIDATE_EXPERTISE"
  | "CANDIDATE_LOCATION"
  | "GENERAL_NAME"
  | "GENERAL_EMAIL"
  | "GENERAL_MESSAGE"
  | "COMPLETED"
  | "FAQ_HELP";

interface CollectedData {
  name: string;
  email: string;
  phone: string;
  serviceType?: string;
  expertise?: string;
  location?: string;
  message: string;
}

// Pure helper function defined outside component to satisfy react-hooks/purity rules
function generateUuid(): string {
  if (typeof window !== "undefined" && typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function Chatbot({ onClose }: { onClose: () => void }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatStatus, setChatStatus] = useState<string>("BOT_ACTIVE");
  const [step, setStep] = useState<ChatStep>("INITIAL");
  const [inputVal, setInputVal] = useState("");
  const [path, setPath] = useState<EnquiryType | null>(null);
  const [data, setData] = useState<CollectedData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevStatusRef = useRef<string>("BOT_ACTIVE");

  // Initialize UUID and load conversation
  useEffect(() => {
    async function initChat() {
      let userUuid = localStorage.getItem("hh_user_uuid");
      if (!userUuid) {
        userUuid = generateUuid();
        localStorage.setItem("hh_user_uuid", userUuid);
      }

      try {
        const conversation = await getOrCreateConversation(userUuid);
        setConversationId(conversation.id);
        setChatStatus(conversation.status);
        prevStatusRef.current = conversation.status;
        
        // Map messages to local model
        const mappedMsgs: Message[] = conversation.messages.map((m: PrismaMessage) => ({
          id: m.id,
          senderType: m.senderType as "USER" | "ADMIN" | "BOT",
          content: m.content,
          createdAt: m.createdAt,
        }));
        
        // Inject options to first greeting bot message if it's the only message in the conversation
        if (mappedMsgs.length === 1 && mappedMsgs[0].senderType === "BOT") {
          mappedMsgs[0].options = [
            "Hire staff",
            "Look for a job",
            "General inquiry / FAQ"
          ];
        }

        setMessages(mappedMsgs);

        // Determine step based on message history
        if (conversation.status === "HUMAN_ACTIVE") {
          setStep("INITIAL"); // Step doesn't matter for active takeover
        } else if (mappedMsgs.length > 1) {
          // If we had conversation in bot state, reset to menu for simplicity, or keep active
          setStep("SELECT_PATH");
        } else {
          setStep("SELECT_PATH");
        }
      } catch (e) {
        console.error("Failed to load chat conversation:", e);
      }
    }

    initChat();
  }, []);

  // Poll for new messages every 2 seconds
  useEffect(() => {
    if (!conversationId) return;

    let active = true;

    async function poll() {
      try {
        const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
        if (!res.ok) return;
        const result = (await res.json()) as {
          messages: {
            id: string;
            senderType: string;
            content: string;
            createdAt: string;
          }[];
          status: string;
          takenBy: string | null;
        };
        
        if (active) {
          if (result.status === "HUMAN_ACTIVE" && prevStatusRef.current !== "HUMAN_ACTIVE") {
            playSound("connected");
          } else if (result.status === "BOT_ACTIVE" && prevStatusRef.current === "HUMAN_ACTIVE") {
            playSound("reverted");
          }
          prevStatusRef.current = result.status;
          setChatStatus(result.status);
          
          const polledMsgs: Message[] = result.messages.map((m) => ({
            id: m.id,
            senderType: m.senderType as "USER" | "ADMIN" | "BOT",
            content: m.content,
            createdAt: m.createdAt,
          }));

          // Inject options to first greeting bot message if it's the only message
          if (polledMsgs.length === 1 && polledMsgs[0].senderType === "BOT") {
            polledMsgs[0].options = [
              "Hire staff",
              "Look for a job",
              "General inquiry / FAQ"
            ];
          }

          // Only update messages if lengths differ to avoid render flashing
          if (polledMsgs.length !== messages.length) {
            setMessages(polledMsgs);
            
            // Clear unread badge marker
            localStorage.setItem("hh_chat_read_timestamp", Date.now().toString());
          }
        }
      } catch (e) {
        console.error("Error polling chat messages:", e);
      }
    }

    // Set interval polling
    const interval = setInterval(poll, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [conversationId, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Reset step to FAQ_HELP if conversation status goes back to BOT_ACTIVE while on INITIAL step
  useEffect(() => {
    if (chatStatus === "BOT_ACTIVE" && step === "INITIAL") {
      setStep("FAQ_HELP");
    }
  }, [chatStatus, step]);

  const startFreshConversation = async () => {
    if (!conversationId) return;
    setIsSubmitting(true);
    try {
      await closeConversation(conversationId, "USER");
      
      // Clear localStorage session
      const userUuid = generateUuid();
      localStorage.setItem("hh_user_uuid", userUuid);

      const conversation = await getOrCreateConversation(userUuid);
      setConversationId(conversation.id);
      setChatStatus(conversation.status);
      
      const mappedMsgs: Message[] = conversation.messages.map((m: PrismaMessage) => ({
        id: m.id,
        senderType: m.senderType as "USER" | "ADMIN" | "BOT",
        content: m.content,
        createdAt: m.createdAt,
      }));

      // Inject options to first greeting bot message
      if (mappedMsgs.length === 1 && mappedMsgs[0].senderType === "BOT") {
        mappedMsgs[0].options = [
          "Hire staff",
          "Look for a job",
          "General inquiry / FAQ"
        ];
      }

      setMessages(mappedMsgs);
      setStep("SELECT_PATH");
      setPath(null);
      setData({ name: "", email: "", phone: "", message: "" });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveMessageAndBotReply = async (userText: string, botReplyGetter: () => string, nextStep: ChatStep, options?: string[]) => {
    if (!conversationId) return;
    setIsSubmitting(true);

    // Save user message to database
    const userMsg = await addChatMessage(conversationId, "USER", userText);
    setMessages((prev) => [...prev, {
      id: userMsg.id,
      senderType: "USER",
      content: userText,
      createdAt: userMsg.createdAt,
    }]);

    // Bot Typing Sim
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const botText = botReplyGetter();
    const botMsg = await addChatMessage(conversationId, "BOT", botText);
    
    setMessages((prev) => [...prev, {
      id: botMsg.id,
      senderType: "BOT",
      content: botText,
      createdAt: botMsg.createdAt,
    }]);

    setIsTyping(false);
    setStep(nextStep);
    
    // Add options selection triggers
    if (options && options.length > 0) {
      // Append options to the last bot message locally
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.senderType === "BOT") {
          last.options = options;
        }
        return copy;
      });
    }

    setIsSubmitting(false);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getFAQResponse = (input: string): string | null => {
    const q = input.toLowerCase();
    if (q.includes("location") || q.includes("where") || q.includes("office") || q.includes("australia") || q.includes("zealand") || q.includes("lanka")) {
      return "We operate and have physical offices across Australia (Sydney/Melbourne), New Zealand, and Sri Lanka (Colombo). We support localized compliance, contract management, and local payroll in each region.";
    }
    if (q.includes("price") || q.includes("cost") || q.includes("fee") || q.includes("rate") || q.includes("charge")) {
      return "Our pricing is transparent and based on results: \n• Executive Search: Retained models.\n• Permanent Staff: Percentage of starting annual salary.\n• Labour Hire: All-inclusive hourly rate.\n• Offshore Staff: Bookkeeping/VA starting from $15/hr.\nContact us directly for a specific rate card!";
    }
    if (q.includes("job") || q.includes("apply") || q.includes("cv") || q.includes("resume") || q.includes("hiring")) {
      return "You can view and apply to live openings on our /jobs page. If you'd like to get added to our talent database, selecting the 'Looking for a job' option in this chat will allow us to capture your requirements immediately!";
    }
    if (q.includes("contact") || q.includes("phone") || q.includes("email") || q.includes("talk") || q.includes("number")) {
      return "You can reach us directly at hello@headhunters.com.au. Alternatively, finish your enquiry here and our consultants will call or email you back within 1 business hour.";
    }
    if (q.includes("payroll") || q.includes("bookkeep") || q.includes("finance") || q.includes("xero") || q.includes("invoice")) {
      return "Yes! We set up, manage, and scale offshore accounting, VA services, and payroll solutions using Xero, Bullhorn, and other cloud tools integrated to meet ANZ regulatory standards.";
    }
    return null;
  };

  // Clickable quick options
  const handleSelectOption = async (option: string) => {
    if (isSubmitting) return;

    if (option.toLowerCase().includes("human") || option.toLowerCase().includes("consultant")) {
      setIsSubmitting(true);
      const userMsg = await addChatMessage(conversationId!, "USER", option);
      setMessages((prev) => [...prev, {
        id: userMsg.id,
        senderType: "USER",
        content: option,
        createdAt: userMsg.createdAt,
      }]);

      await requestHumanTakeover(conversationId!);

      setIsTyping(true);
      await new Promise((resolve) => setTimeout(resolve, 600));

      const botText = "Request sent. A consultant will join shortly.";
      const botMsg = await addChatMessage(conversationId!, "BOT", botText);
      setMessages((prev) => [...prev, {
        id: botMsg.id,
        senderType: "BOT",
        content: botText,
        createdAt: botMsg.createdAt,
      }]);

      setIsTyping(false);
      setIsSubmitting(false);
      setStep("FAQ_HELP"); // keeps text input enabled
      return;
    }

    if (step === "SELECT_PATH") {
      if (option.includes("hire")) {
        setPath("HIRING");
        saveMessageAndBotReply(
          option,
          () => "Excellent! Let's get some basic details so a hiring consultant can reach out with candidate portfolios. First, what is your full name?",
          "HIRING_NAME"
        );
      } else if (option.includes("job")) {
        setPath("CANDIDATE");
        saveMessageAndBotReply(
          option,
          () => "Fantastic, we'd love to help you find your next role! First, what is your full name?",
          "CANDIDATE_NAME"
        );
      } else {
        setPath("GENERAL");
        saveMessageAndBotReply(
          option,
          () => "Sure, I can help answer general questions. What is your full name?",
          "GENERAL_NAME"
        );
      }
      return;
    }

    if (step === "HIRING_PHONE") {
      const phoneVal = option.toLowerCase() === "skip" ? "" : option;
      setData(prev => ({ ...prev, phone: phoneVal }));
      saveMessageAndBotReply(
        option,
        () => "What staffing services are you most interested in?",
        "HIRING_SERVICE",
        ["Executive Search", "Permanent Recruitment", "Labour Hire / Casuals", "Offshore / Remote Teams"]
      );
      return;
    }

    if (step === "CANDIDATE_PHONE") {
      const cPhone = option.toLowerCase() === "skip" ? "" : option;
      setData(prev => ({ ...prev, phone: cPhone }));
      saveMessageAndBotReply(
        option,
        () => "What is your primary area of expertise?",
        "CANDIDATE_EXPERTISE",
        ["Warehousing / Logistics", "Office / Admin Support", "Accounts / Bookkeeping", "Virtual Assistant", "Executive Search", "Other"]
      );
      return;
    }

    if (step === "HIRING_SERVICE") {
      setData(prev => ({ ...prev, serviceType: option }));
      saveMessageAndBotReply(
        option,
        () => `Got it, ${option}. Could you please write a brief description of the roles, headcount, or key requirements you are looking for?`,
        "HIRING_DESC"
      );
      return;
    }

    if (step === "CANDIDATE_EXPERTISE") {
      setData(prev => ({ ...prev, expertise: option }));
      saveMessageAndBotReply(
        option,
        () => "Understood. Where are you primarily looking for work?",
        "CANDIDATE_LOCATION",
        ["Australia", "New Zealand", "Sri Lanka (Offshore/Remote)", "Other"]
      );
      return;
    }

    if (step === "CANDIDATE_LOCATION") {
      setData(prev => ({ ...prev, location: option }));
      
      const summaryMsg = `Thanks! I've set up your candidate profile:
• Name: ${data.name}
• Email: ${data.email}
• Phone: ${data.phone || "Not provided"}
• Expertise: ${data.expertise}
• Location: ${option}

Is this information correct?`;

      saveMessageAndBotReply(
        option,
        () => summaryMsg,
        "COMPLETED",
        ["Yes, submit details", "No, start over"]
      );
      return;
    }

    if (step === "FAQ_HELP") {
      if (option.includes("Connect with a consultant") || option.includes("connect")) {
        setPath("GENERAL");
        saveMessageAndBotReply(
          option,
          () => "Let's get your enquiry logged. What is your full name?",
          "GENERAL_NAME"
        );
      } else if (option.includes("Ask another question")) {
        saveMessageAndBotReply(
          option,
          () => "Feel free to type another question! (e.g. pricing, location, jobs, payroll...)",
          "FAQ_HELP"
        );
      } else {
        startFreshConversation();
      }
      return;
    }

    if (step === "COMPLETED") {
      if (option.includes("submit") || option.includes("correct")) {
        submitCollectedDetails();
      } else {
        startFreshConversation();
      }
      return;
    }
  };

  // Keyboard text submissions
  const handleSendText = async (text: string) => {
    if (!text.trim() || isSubmitting) return;
    setInputVal("");

    // If takeover is active, directly post message and wait for admin response
    if (chatStatus === "HUMAN_ACTIVE") {
      setIsSubmitting(true);
      const userMsg = await addChatMessage(conversationId!, "USER", text);
      setMessages((prev) => [...prev, {
        id: userMsg.id,
        senderType: "USER",
        content: text,
        createdAt: userMsg.createdAt,
      }]);
      setIsSubmitting(false);
      return;
    }

    // Capture human takeover keywords from input box
    const isHumanKeyword = /human|agent|support|consultant|talk to|admin|live/i.test(text);
    if (isHumanKeyword) {
      setIsSubmitting(true);
      const userMsg = await addChatMessage(conversationId!, "USER", text);
      setMessages((prev) => [...prev, {
        id: userMsg.id,
        senderType: "USER",
        content: text,
        createdAt: userMsg.createdAt,
      }]);

      await requestHumanTakeover(conversationId!);

      setIsTyping(true);
      await new Promise((resolve) => setTimeout(resolve, 600));

      const botText = "Request sent. A consultant will join shortly.";
      const botMsg = await addChatMessage(conversationId!, "BOT", botText);
      setMessages((prev) => [...prev, {
        id: botMsg.id,
        senderType: "BOT",
        content: botText,
        createdAt: botMsg.createdAt,
      }]);

      setIsTyping(false);
      setIsSubmitting(false);
      setStep("FAQ_HELP"); // Keeps input enabled
      return;
    }

    // Otherwise, guide via scripted bot state-machine
    switch (step) {
      case "SELECT_PATH":
      case "FAQ_HELP":
        const reply = getFAQResponse(text);
        if (reply) {
          saveMessageAndBotReply(
            text,
            () => reply,
            "FAQ_HELP",
            ["Connect with a consultant", "Ask another question", "Main Menu"]
          );
        } else {
          saveMessageAndBotReply(
            text,
            () => "I'm still learning and didn't quite catch that. Would you like to connect with a consultant to get assistance?",
            "FAQ_HELP",
            ["Yes, connect me", "Main Menu"]
          );
        }
        break;

      case "HIRING_NAME":
        setData(prev => ({ ...prev, name: text }));
        saveMessageAndBotReply(
          text,
          () => `Nice to meet you, ${text}! What is your work email address?`,
          "HIRING_EMAIL"
        );
        break;

      case "HIRING_EMAIL":
        if (!validateEmail(text)) {
          // Re-ask
          setIsSubmitting(true);
          const userMsg = await addChatMessage(conversationId!, "USER", text);
          setMessages(prev => [...prev, { id: userMsg.id, senderType: "USER", content: text }]);
          setIsTyping(true);
          await new Promise(r => setTimeout(r, 400));
          const botMsg = await addChatMessage(conversationId!, "BOT", "Hmm, that email doesn't look valid. Please enter a valid email address:");
          setMessages(prev => [...prev, { id: botMsg.id, senderType: "BOT", content: botMsg.content }]);
          setIsTyping(false);
          setIsSubmitting(false);
        } else {
          setData(prev => ({ ...prev, email: text }));
          saveMessageAndBotReply(
            text,
            () => "Perfect. What is your contact phone number? (Or type 'skip')",
            "HIRING_PHONE",
            ["Skip"]
          );
        }
        break;

      case "HIRING_PHONE":
        const phoneVal = text.toLowerCase() === "skip" ? "" : text;
        setData(prev => ({ ...prev, phone: phoneVal }));
        saveMessageAndBotReply(
          text,
          () => "What staffing services are you most interested in?",
          "HIRING_SERVICE",
          ["Executive Search", "Permanent Recruitment", "Labour Hire / Casuals", "Offshore / Remote Teams"]
        );
        break;

      case "HIRING_DESC":
        const compiledHiring = { ...data, message: text };
        setData(compiledHiring);
        const hiringSummary = `Here is a summary of your hiring inquiry:
• Name: ${data.name}
• Email: ${data.email}
• Phone: ${data.phone || "Not provided"}
• Service: ${data.serviceType}
• Requirements: "${text}"

Shall I send this to our recruitment team?`;

        saveMessageAndBotReply(
          text,
          () => hiringSummary,
          "COMPLETED",
          ["Yes, send details", "No, start over"]
        );
        break;

      case "CANDIDATE_NAME":
        setData(prev => ({ ...prev, name: text }));
        saveMessageAndBotReply(
          text,
          () => `Great to meet you, ${text}! What is your email address?`,
          "CANDIDATE_EMAIL"
        );
        break;

      case "CANDIDATE_EMAIL":
        if (!validateEmail(text)) {
          setIsSubmitting(true);
          const userMsg = await addChatMessage(conversationId!, "USER", text);
          setMessages(prev => [...prev, { id: userMsg.id, senderType: "USER", content: text }]);
          setIsTyping(true);
          await new Promise(r => setTimeout(r, 400));
          const botMsg = await addChatMessage(conversationId!, "BOT", "Please enter a valid email address:");
          setMessages(prev => [...prev, { id: botMsg.id, senderType: "BOT", content: botMsg.content }]);
          setIsTyping(false);
          setIsSubmitting(false);
        } else {
          setData(prev => ({ ...prev, email: text }));
          saveMessageAndBotReply(
            text,
            () => "What is your contact phone number? (Or type 'skip')",
            "CANDIDATE_PHONE",
            ["Skip"]
          );
        }
        break;

      case "CANDIDATE_PHONE":
        const cPhone = text.toLowerCase() === "skip" ? "" : text;
        setData(prev => ({ ...prev, phone: cPhone }));
        saveMessageAndBotReply(
          text,
          () => "What is your primary area of expertise?",
          "CANDIDATE_EXPERTISE",
          ["Warehousing / Logistics", "Office / Admin Support", "Accounts / Bookkeeping", "Virtual Assistant", "Executive Search", "Other"]
        );
        break;

      case "GENERAL_NAME":
        setData(prev => ({ ...prev, name: text }));
        saveMessageAndBotReply(
          text,
          () => `Thanks, ${text}. What is your email address?`,
          "GENERAL_EMAIL"
        );
        break;

      case "GENERAL_EMAIL":
        if (!validateEmail(text)) {
          setIsSubmitting(true);
          const userMsg = await addChatMessage(conversationId!, "USER", text);
          setMessages(prev => [...prev, { id: userMsg.id, senderType: "USER", content: text }]);
          setIsTyping(true);
          await new Promise(r => setTimeout(r, 400));
          const botMsg = await addChatMessage(conversationId!, "BOT", "Please enter a valid email address:");
          setMessages(prev => [...prev, { id: botMsg.id, senderType: "BOT", content: botMsg.content }]);
          setIsTyping(false);
          setIsSubmitting(false);
        } else {
          setData(prev => ({ ...prev, email: text }));
          saveMessageAndBotReply(
            text,
            () => "How can we help you today? Please type your enquiry below:",
            "GENERAL_MESSAGE"
          );
        }
        break;

      case "GENERAL_MESSAGE":
        setData(prev => ({ ...prev, message: text }));
        const genSummary = `Please review your enquiry:
• Name: ${data.name}
• Email: ${data.email}
• Message: "${text}"

Ready to submit?`;

        saveMessageAndBotReply(
          text,
          () => genSummary,
          "COMPLETED",
          ["Yes, submit", "No, start over"]
        );
        break;

      case "COMPLETED":
        if (text.toLowerCase().includes("yes") || text.toLowerCase().includes("submit") || text.toLowerCase().includes("send")) {
          submitCollectedDetails();
        } else {
          startFreshConversation();
        }
        break;

      default:
        break;
    }
  };

  const submitCollectedDetails = async () => {
    if (!path || !conversationId) return;
    setIsSubmitting(true);
    
    let finalMessage = data.message;
    if (path === "HIRING") {
      finalMessage = `Service Requested: ${data.serviceType || "Unspecified"}\nRequirements:\n${data.message}`;
    } else if (path === "CANDIDATE") {
      finalMessage = `Expertise: ${data.expertise || "Unspecified"}\nPreferred Location: ${data.location || "Unspecified"}\nLooking for active candidate recruitment openings.`;
    }

    try {
      // Create a standard Enquiry so the admin dashboard enquiries list remains unchanged
      await createEnquiry({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        type: path,
        message: finalMessage,
      });

      // Also log it as a bot submission message in the chat database
      const finalMsgText = "Enquiry submitted successfully.";
      
      const userActionMsg = await addChatMessage(conversationId, "USER", "Confirm Submit");
      const botConfirmMsg = await addChatMessage(conversationId, "BOT", finalMsgText);

      setMessages(prev => [
        ...prev,
        { id: userActionMsg.id, senderType: "USER", content: "Confirm Submit" },
        { id: botConfirmMsg.id, senderType: "BOT", content: finalMsgText }
      ]);

      setStep("INITIAL");
    } catch (e) {
      console.error(e);
      const errText = "Apologies, there was an issue logging your enquiry. Please try again or email hello@headhunters.com.au directly.";
      const errMsg = await addChatMessage(conversationId, "BOT", errText);
      setMessages(prev => [...prev, { id: errMsg.id, senderType: "BOT", content: errText }]);
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
              {chatStatus === "HUMAN_ACTIVE" ? "Consultant Chat" : "Head Hunters Assistant"}
            </h4>
            <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
              <span className={`w-1.5 h-1.5 rounded-full inline-block animate-pulse relative ${
                chatStatus === "HUMAN_ACTIVE" ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.7)]" : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]"
              }`} />
              {chatStatus === "HUMAN_ACTIVE" ? "Consultant Online" : "Bot Assistant Online"}
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

      {/* Messages list with data-lenis-prevent and event propagation stop to fix scroll hijacking */}
      <div 
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-gradient-to-b from-[#f4f7f6] to-[#f8faf9] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
      >
        {messages.map((m) => {
          const isSystem = m.senderType === "BOT" && (
            m.content.includes("joined the chat") || 
            m.content.includes("taken over") ||
            m.content.includes("marking as resolved") || 
            m.content.includes("flagged your request") ||
            m.content.includes("notified our consultants") ||
            m.content.includes("paged our recruitment") ||
            m.content.includes("paused")
          );

          if (isSystem) {
            return (
              <div key={m.id} className="flex justify-center my-1.5 w-full">
                <div className="text-slate-400 text-[10.5px] font-semibold text-center max-w-[85%] leading-relaxed">
                  {m.content}
                </div>
              </div>
            );
          }

          return (
            <div key={m.id} className={`flex items-start gap-2.5 ${m.senderType === "USER" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                m.senderType === "USER" ? "bg-slate-200 text-slate-600 shadow-sm" : "bg-gradient-to-br from-[#02695e] to-[#04a891] text-white shadow-sm"
              }`}>
                {m.senderType === "USER" ? <User size={12} /> : <Bot size={12} />}
              </div>
              
              <div className="max-w-[75%] space-y-1">
                <div className={`px-4 py-2.5 text-xs md:text-[13px] leading-relaxed font-medium ${
                  m.senderType === "USER" 
                    ? "bg-[#02695e] text-white rounded-[16px] rounded-tr-[4px] shadow-[0_4px_12px_rgba(2,105,94,0.14)]" 
                    : m.senderType === "ADMIN"
                    ? "bg-[#04a891] text-white rounded-[16px] rounded-tl-[4px] shadow-[0_4px_12px_rgba(4,168,145,0.14)]"
                    : "bg-white border border-[#02695e]/8 text-slate-800 rounded-[16px] rounded-tl-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                } whitespace-pre-wrap`}>
                  {m.content}
                </div>
                {m.createdAt && (
                  <p className={`text-[8.5px] font-semibold text-slate-400 px-1 ${m.senderType === "USER" ? "text-right" : ""}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}

                {/* Show options if present and is the most recent message */}
                {m.options && m.options.length > 0 && messages[messages.length - 1].id === m.id && (
                  <div className="pt-2 flex flex-col gap-1.5 max-w-full">
                    {(() => {
                      const opts = [...m.options];
                      if (chatStatus !== "HUMAN_ACTIVE" && !opts.some(o => o.toLowerCase().includes("human") || o.toLowerCase().includes("consultant"))) {
                        opts.push("Talk to a human");
                      }
                      return opts.map((opt: string) => (
                        <button
                          key={opt}
                          onClick={() => handleSelectOption(opt)}
                          disabled={isSubmitting}
                          className="text-left w-full px-4 py-2.5 text-[11px] md:text-xs font-bold rounded-[14px] border border-[#02695e]/15 bg-white/80 text-[#02695e] hover:bg-[#02695e] hover:text-white hover:border-[#02695e] shadow-[0_2px_6px_rgba(2,105,94,0.03)] hover:shadow-[0_4px_12px_rgba(2,105,94,0.15)] hover:-translate-y-[1px] transition-all duration-200 cursor-pointer"
                        >
                          {opt}
                        </button>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator animation bubble */}
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
            chatStatus === "HUMAN_ACTIVE"
              ? "Type your reply to consultant..."
              : step === "HIRING_SERVICE" || step === "CANDIDATE_EXPERTISE" || step === "CANDIDATE_LOCATION" || step === "COMPLETED"
              ? "Select an option above..."
              : "Type your message..."
          }
          disabled={
            (chatStatus !== "HUMAN_ACTIVE" && (
              step === "HIRING_SERVICE" || step === "CANDIDATE_EXPERTISE" || step === "CANDIDATE_LOCATION" || step === "COMPLETED"
            )) || isSubmitting
          }
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
    </motion.div>
  );
}
