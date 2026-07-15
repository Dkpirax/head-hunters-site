import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Check, User, Bot, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface Message {
  id: string;
  conversationId: string;
  senderType: "USER" | "ADMIN" | "BOT";
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  userId: string;
  status: string; // 'BOT_ACTIVE' | 'HUMAN_ACTIVE' | 'CLOSED'
  takenBy: string | null;
  needsHuman?: boolean;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

function formatRelativeTime(dateString: string) {
  const now = new Date();
  const diffMs = now.getTime() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function AdminChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const adminEmail = "admin@headhunters.com.au";

  const [searchParams] = useSearchParams();
  const selectId = searchParams.get("select");

  useEffect(() => {
    if (selectId) {
      setSelectedId(selectId);
    }
  }, [selectId]);

  const activeConversation = conversations.find((c) => c.id === selectedId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll active conversations list and selected conversation messages every 2 seconds
  useEffect(() => {
    let active = true;

    async function pollConversations() {
      try {
        if (selectedId) {
          const mRes = await fetch(`/api/admin/chat/sessions/${selectedId}/messages`);
          if (mRes.ok) {
            const data = (await mRes.json()) as {
              messages: Message[];
              status: string;
              takenBy: string | null;
              needsHuman?: boolean;
            };
            if (active) {
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === selectedId
                    ? {
                        ...c,
                        status: data.status,
                        takenBy: data.takenBy,
                        needsHuman: data.needsHuman,
                        messages: data.messages,
                        updatedAt: new Date().toISOString(),
                      }
                    : c
                )
              );
            }
          }
        }
      } catch (e) {
        console.error("Poll error in admin chat:", e);
      }
    }

    const timer = setInterval(pollConversations, 2000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [selectedId]);

  // Dynamic check: also update the conversations list counts and last messages by polling the general list endpoint
  useEffect(() => {
    let active = true;

    async function pollList() {
      try {
        const res = await fetch("/api/admin/chat/active_list");
        if (res.ok) {
          const list = await res.json();
          if (active) {
            setConversations(list);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    
    pollList();
    const timer = setInterval(pollList, 4000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  // Scroll details window to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages?.length]);

  const handleTakeOver = async () => {
    if (!selectedId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/chat/sessions/${selectedId}/takeover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail })
      });
      if (!res.ok) throw new Error("Failed to take over chat");
      
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                status: "HUMAN_ACTIVE",
                takenBy: adminEmail,
              }
            : c
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = async () => {
    if (!selectedId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/chat/sessions/${selectedId}/close`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to close chat");
      
      setConversations((prev) => prev.filter((c) => c.id !== selectedId));
      setSelectedId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePause = async () => {
    if (!selectedId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/chat/sessions/${selectedId}/pause`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to pause chat");
      
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                status: "BOT_ACTIVE",
                takenBy: null,
                needsHuman: false,
              }
            : c
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || !selectedId || isSubmitting) return;

    const messageText = inputVal;
    setInputVal("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/chat/sessions/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderType: "ADMIN", content: messageText })
      });
      if (!res.ok) throw new Error("Failed to send message");
      
      const msg = await res.json();
      
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                messages: [...c.messages, msg],
              }
            : c
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Live Chat Sessions</h1>
          <p className="text-white/40 text-sm">
            Monitor ongoing conversations, provide customer support, and take over bot threads.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-6 flex-1 overflow-hidden min-h-0">
        {/* Chats Sidebar */}
        <div className="bg-white/3 border border-white/8 rounded-[16px] overflow-hidden flex flex-col h-full min-h-0">
          <div className="p-4 border-b border-white/6 bg-white/1 shrink-0">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Active Conversations</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-white/4 scrollbar-thin scrollbar-thumb-white/10">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-white/30 text-xs">
                No active conversations at the moment.
              </div>
            ) : (
              conversations.map((c) => {
                const lastMsg = c.messages[c.messages.length - 1];
                const displayName = `Visitor #${c.userId.substring(c.userId.length - 4)}`;
                const isSelected = c.id === selectedId;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-white/4 flex flex-col gap-1.5 ${
                      isSelected ? "bg-white/5" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-white">{displayName}</span>
                        {c.needsHuman && (
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" title="User requested human assistance!" />
                        )}
                      </div>
                      <span className="text-[10px] text-white/20 shrink-0">
                        {formatRelativeTime(c.updatedAt)}
                      </span>
                    </div>

                    <p className="text-xs text-white/40 truncate">
                      {lastMsg ? lastMsg.content : "No messages yet"}
                    </p>

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-[4px] uppercase ${
                            c.status === "HUMAN_ACTIVE"
                              ? "bg-[#04a891]/20 text-[#04a891]"
                              : "bg-blue-500/15 text-blue-400"
                          }`}
                        >
                          {c.status === "HUMAN_ACTIVE" ? "Consultant" : "Bot"}
                        </span>
                        {c.needsHuman && (
                          <span className="text-[8px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-[4px] animate-pulse">
                            Wants Live Chat
                          </span>
                        )}
                      </div>
                      {c.takenBy && (
                        <span className="text-[9px] text-white/20 truncate max-w-[150px]">
                          taken by: {c.takenBy.split("@")[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Window Panel */}
        <div className="bg-white/3 border border-white/8 rounded-[16px] flex flex-col h-full overflow-hidden min-h-0">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/6 bg-white/1 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#02695e] to-[#04a891] grid place-items-center text-white text-sm font-bold shadow-sm">
                    V
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Visitor #{activeConversation.userId.substring(activeConversation.userId.length - 4)}
                    </h3>
                    <p className="text-[10px] text-white/40">
                      ID: {activeConversation.userId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeConversation.status === "BOT_ACTIVE" ? (
                    <button
                      onClick={handleTakeOver}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[8px] bg-[#02695e] text-white text-xs font-semibold hover:bg-[#027d6f] transition-colors cursor-pointer"
                    >
                      <Check size={12} /> Take Over Chat
                    </button>
                  ) : (
                    <>
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#04a891] bg-[#04a891]/10 px-2.5 py-1 rounded-[6px]">
                        <CheckCircle2 size={12} /> Live Takeover Active
                      </div>
                      <button
                        onClick={handlePause}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-[8px] bg-amber-600 text-white text-[11px] font-semibold hover:bg-amber-700 transition-colors cursor-pointer"
                        title="Pause live support and return control to the Automated Bot"
                      >
                        ⏸️ Pause Chat
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[8px] border border-white/10 bg-white/5 text-white/60 text-xs font-semibold hover:text-red-400 hover:border-red-400/20 transition-all cursor-pointer"
                  >
                    Close Session
                  </button>
                </div>
              </div>

              {/* Message History */}
              <div 
                data-lenis-prevent
                className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-black/10 scrollbar-thin scrollbar-thumb-white/10"
              >
                {activeConversation.messages.map((m) => {
                  const isMe = m.senderType === "ADMIN";
                  const isBot = m.senderType === "BOT";

                  return (
                    <div key={m.id} className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                      <div
                        className={`w-7 h-7 rounded-full grid place-items-center text-[10px] font-bold shrink-0 ${
                          isMe
                            ? "bg-gradient-to-br from-[#02695e] to-[#04a891] text-white"
                            : isBot
                            ? "bg-white/8 text-white/40"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {isMe ? "A" : isBot ? <Bot size={12} /> : <User size={12} />}
                      </div>

                      <div className="max-w-[70%] space-y-1">
                        <div
                          className={`px-4 py-2.5 rounded-[16px] text-sm leading-relaxed whitespace-pre-wrap ${
                            isMe
                              ? "bg-[#02695e] text-white rounded-tr-none"
                              : isBot
                              ? "bg-white/5 border border-white/6 text-white/60 rounded-tl-none font-mono text-xs"
                              : "bg-white/8 text-white/95 rounded-tl-none"
                          }`}
                        >
                          {m.content}
                        </div>
                        <p className={`text-[9px] text-white/20 ${isMe ? "text-right" : ""}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Footer Input Form */}
              <form onSubmit={handleSend} className="p-4 border-t border-white/6 bg-white/1 shrink-0 flex gap-2 items-center">
                {activeConversation.status === "BOT_ACTIVE" ? (
                  <div className="flex-1 h-10 px-4 rounded-[10px] border border-dashed border-white/10 bg-white/2 flex items-center justify-between text-xs text-white/40">
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={14} className="text-[#04a891]" />
                      <span>Chat is currently automated in Bot Mode. Click takeover to type replies.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleTakeOver}
                      className="text-[#04a891] font-bold hover:underline"
                    >
                      Takeover now
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder="Type your message as admin..."
                      className="flex-1 h-10 px-4 rounded-[10px] border border-white/8 bg-white/5 text-white placeholder:text-white/20 text-xs focus:border-[#04a891]/50 focus:bg-white/8 outline-none transition-all duration-200"
                    />
                    <button
                      type="submit"
                      disabled={!inputVal.trim() || isSubmitting}
                      className="w-10 h-10 rounded-[10px] bg-[#02695e] text-white flex items-center justify-center hover:bg-[#037c6f] disabled:bg-white/5 disabled:text-white/20 transition-all cursor-pointer"
                    >
                      <Send size={14} />
                    </button>
                  </>
                )}
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageSquare size={36} className="text-white/15 mb-3" />
              <h3 className="text-white font-bold text-sm mb-1">Select a Conversation</h3>
              <p className="text-white/30 text-xs max-w-[280px]">
                Click on a live conversation in the sidebar to review logs or take over from the bot.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
