import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  Paperclip,
  Mic,
  MicOff,
  Calendar,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  FileText,
  RefreshCw,
  Info,
} from "lucide-react";
import { searchKnowledgeBase, type RAGSearchResult } from "@/data/ragKnowledge";
import { BookingModal } from "@/components/BookingModal";
import { Link } from "@tanstack/react-router";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  citation?: {
    source: string;
    section: string;
  } | undefined;
  suggestedAction?: {
    type: "book_call" | "view_services" | "contact_form";
    label: string;
  } | undefined;
  rating?: "up" | "down" | undefined;
  latencyMs?: number | undefined;
  tokensCount?: number | undefined;
}

const STARTER_PROMPTS = [
  "What AI agents can you build?",
  "How much does a typical project cost?",
  "What are FangScript's 5 service categories?",
  "Do we own the custom source code?",
];

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: "msg-init",
        sender: "bot",
        text: "Welcome to FangScript. I am your AI Knowledge Assistant, grounded in our verified service catalog, engineering standards, and pricing models. How can I assist you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        citation: {
          source: "FangScript SRS & Positioning",
          section: "Core Agency OS",
        },
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  // Voice recording simulation
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isRecording) {
      timeout = setTimeout(() => {
        setIsRecording(false);
        setInput("Can you explain your approval-gated Hermes agent architecture?");
      }, 3500);
    }
    return () => clearTimeout(timeout);
  }, [isRecording]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query && !attachedFile) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsgText = attachedFile ? `[Attached: ${attachedFile}] ${query}` : query;

    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        sender: "user",
        text: userMsgText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];

    setMessages(newMessages);
    setInput("");
    setAttachedFile(null);
    setIsTyping(true);

    // Simulate RAG vector retrieval & token generation latency (FR-CHAT-03)
    const startTime = performance.now();
    setTimeout(() => {
      const result: RAGSearchResult = searchKnowledgeBase(query);
      const latency = Math.round(performance.now() - startTime);
      const estimatedTokens = Math.round(result.answer.length / 4) + 35;

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: result.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        citation: result.citation,
        suggestedAction: result.suggestedAction,
        latencyMs: latency,
        tokensCount: estimatedTokens,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      // Session telemetry logging (FR-CHAT-03)
      try {
        const sessionLog = {
          query,
          latencyMs: latency,
          tokens: estimatedTokens,
          model: "gemini-3.8-flash-rag",
          timestamp: new Date().toISOString(),
        };
        const logs = JSON.parse(localStorage.getItem("fangscript_chat_telemetry") || "[]");
        logs.push(sessionLog);
        localStorage.setItem("fangscript_chat_telemetry", JSON.stringify(logs.slice(-50)));
      } catch {
        // ignore
      }
    }, 750);
  };

  const handleRate = (msgId: string, rating: "up" | "down") => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === msgId ? { ...msg, rating } : msg))
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file.name);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative flex items-center"
            >
              {/* Pulsing glow ring */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500/40 via-yellow-400/30 to-amber-600/40 blur-md animate-pulse" />

              <button
                id="chatbot-trigger-btn"
                onClick={() => {
                  setIsOpen(true);
                  setIsMinimized(false);
                }}
                className="relative flex items-center gap-3 rounded-full border border-amber-400/40 bg-[#090C17] px-4 py-3 text-slate-100 shadow-2xl transition-all duration-300 hover:border-amber-400 hover:scale-105 active:scale-95 group"
                aria-label="Open FangScript AI Assistant"
              >
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-md">
                  <Bot size={18} />
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#090C17]" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-white group-hover:text-amber-300 flex items-center gap-1.5">
                    Ask FangScript AI
                    <Sparkles size={11} className="text-amber-400" />
                  </div>
                  <div className="text-[10px] text-slate-400">RAG Grounded • 24/7</div>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                height: isMinimized ? "60px" : "580px",
              }}
              exit={{ opacity: 0, y: 30, scale: 0.94 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-[92vw] sm:w-[410px] rounded-2xl border border-amber-500/25 bg-[#080B15]/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0B0F1C]/80">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400">
                    <Bot size={18} />
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <span>FangScript Assistant</span>
                      <span className="rounded bg-amber-400/10 px-1 py-0.2 text-[9px] font-medium text-amber-400 border border-amber-400/20">
                        RAG v1.0
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <ShieldCheck size={11} className="text-emerald-400" />
                      Strict human-in-the-loop safety
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                    title={isMinimized ? "Expand" : "Minimize"}
                  >
                    <ChevronDown size={17} className={`transition-transform ${isMinimized ? "rotate-180" : ""}`} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                    title="Close chat"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] ${
                            msg.sender === "user"
                              ? "bg-amber-400 text-slate-950 font-bold"
                              : "bg-white/10 text-amber-400"
                          }`}
                        >
                          {msg.sender === "user" ? <User size={12} /> : <Bot size={12} />}
                        </div>

                        <div
                          className={`max-w-[82%] rounded-2xl p-3 leading-relaxed ${
                            msg.sender === "user"
                              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-medium"
                              : "bg-white/5 border border-white/10 text-slate-200"
                          }`}
                        >
                          <p>{msg.text}</p>

                          {/* Citation Tag (FR-CHAT-01) */}
                          {msg.citation && (
                            <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-slate-400 flex items-start gap-1">
                              <Info size={11} className="text-amber-400 shrink-0 mt-0.5" />
                              <span>
                                Grounded in: <em className="text-amber-300 not-italic font-medium">{msg.citation.source}</em> ({msg.citation.section})
                              </span>
                            </div>
                          )}

                          {/* Interactive Action Button inside message */}
                          {msg.suggestedAction && (
                            <div className="mt-2.5">
                              {msg.suggestedAction.type === "book_call" ? (
                                <button
                                  onClick={() => setShowBookingModal(true)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-[11px] font-semibold hover:bg-amber-300 transition-colors shadow-sm"
                                >
                                  <Calendar size={12} />
                                  {msg.suggestedAction.label}
                                </button>
                              ) : msg.suggestedAction.type === "view_services" ? (
                                <Link
                                  to="/services"
                                  onClick={() => setIsOpen(false)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-[11px] font-medium hover:bg-white/20 transition-colors"
                                >
                                  {msg.suggestedAction.label}
                                  <ExternalLink size={11} />
                                </Link>
                              ) : (
                                <Link
                                  to="/contact"
                                  onClick={() => setIsOpen(false)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-[11px] font-semibold hover:bg-amber-300 transition-colors"
                                >
                                  {msg.suggestedAction.label}
                                </Link>
                              )}
                            </div>
                          )}

                          {/* Message Footer with Latency and Thumbs Rating (FR-CHAT-04) */}
                          {msg.sender === "bot" && msg.id !== "msg-init" && (
                            <div className="mt-2 flex items-center justify-between text-[9px] text-slate-500 pt-1">
                              <span>
                                {msg.latencyMs ? `${msg.latencyMs}ms` : ""}
                                {msg.tokensCount ? ` • ~${msg.tokensCount} tokens` : ""}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleRate(msg.id, "up")}
                                  className={`p-1 rounded hover:text-emerald-400 transition-colors ${
                                    msg.rating === "up" ? "text-emerald-400" : ""
                                  }`}
                                  title="Accurate response"
                                >
                                  <ThumbsUp size={11} />
                                </button>
                                <button
                                  onClick={() => handleRate(msg.id, "down")}
                                  className={`p-1 rounded hover:text-rose-400 transition-colors ${
                                    msg.rating === "down" ? "text-rose-400" : ""
                                  }`}
                                  title="Inaccurate or incomplete"
                                >
                                  <ThumbsDown size={11} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Typing Animation */}
                    {isTyping && (
                      <div className="flex gap-2.5 items-center">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-amber-400 text-[10px]">
                          <Bot size={12} />
                        </div>
                        <div className="rounded-2xl bg-white/5 border border-white/10 px-3.5 py-2 text-slate-400 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" />
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.15s]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.3s]" />
                          <span className="text-[10px] ml-1 text-slate-500">Synthesizing citations...</span>
                        </div>
                      </div>
                    )}

                    {/* Starter Prompts pills when few messages */}
                    {messages.length <= 2 && !isTyping && (
                      <div className="pt-2">
                        <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 mb-2">
                          Suggested questions
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {STARTER_PROMPTS.map((prompt) => (
                            <button
                              key={prompt}
                              onClick={() => handleSend(prompt)}
                              className="text-left rounded-xl bg-white/5 border border-white/10 px-2.5 py-1.5 text-[11px] text-slate-300 hover:border-amber-400/40 hover:text-amber-300 transition-colors"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Attachment indicator if file selected */}
                  {attachedFile && (
                    <div className="px-4 py-1.5 bg-amber-400/10 border-t border-amber-400/20 flex items-center justify-between text-xs text-amber-300">
                      <div className="flex items-center gap-1.5 truncate">
                        <FileText size={13} />
                        <span className="truncate">{attachedFile}</span>
                      </div>
                      <button
                        onClick={() => setAttachedFile(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}

                  {/* Voice recording visualizer (FR-PUB-05) */}
                  {isRecording && (
                    <div className="px-4 py-2 bg-rose-500/10 border-t border-rose-500/20 flex items-center justify-between text-xs text-rose-300 animate-pulse">
                      <div className="flex items-center gap-2">
                        <Mic size={14} className="text-rose-400" />
                        <span>Listening... (Speak your project question)</span>
                      </div>
                      <button
                        onClick={() => setIsRecording(false)}
                        className="text-[10px] font-semibold underline text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Input Footer */}
                  <div className="p-3 border-t border-white/10 bg-[#0A0E1A]">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                      }}
                      className="flex items-center gap-2"
                    >
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.json"
                      />

                      {/* File attachment button (FR-PUB-05) */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
                        title="Attach project brief or RFP"
                      >
                        <Paperclip size={16} />
                      </button>

                      {/* Voice input toggle (FR-PUB-05) */}
                      <button
                        type="button"
                        onClick={() => setIsRecording(!isRecording)}
                        className={`p-2 rounded-xl transition-colors ${
                          isRecording
                            ? "bg-rose-500 text-white"
                            : "text-slate-400 hover:text-amber-400 hover:bg-white/5"
                        }`}
                        title={isRecording ? "Stop dictation" : "Voice input"}
                      >
                        {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                      </button>

                      {/* Text Input */}
                      <input
                        type="text"
                        placeholder="Ask anything about capabilities, pricing..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                      />

                      {/* Send Button */}
                      <button
                        type="submit"
                        disabled={!input.trim() && !attachedFile}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-semibold hover:bg-amber-300 disabled:opacity-40 transition-colors"
                        aria-label="Send message"
                      >
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Booking Modal triggered from chat or direct action */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </>
  );
}
