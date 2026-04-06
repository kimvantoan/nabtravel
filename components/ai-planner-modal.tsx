"use client";

import { X, Send, RotateCcw, User } from "lucide-react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLanguage } from "@/app/providers";
import { useSession } from "next-auth/react";
import { AiHotelCard } from "./ai-hotel-card";

// NabTravel Logo Icon (matching system branding)
function NabLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 8c0-3.5 2.5-6 6-6s4 2 4 4" />
      <path d="M21 8c0-3.5-2.5-6-6-6s-4 2-4 4" />
      <path d="M12 6l-4 8 2 6h4l2-6-4-8z" />
      <path d="M8 14l-4 2 2-4" />
      <path d="M16 14l4 2-2-4" />
    </svg>
  );
}

interface AiPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function MessageContent({ content }: { content: string }) {
  // Auto-close hotel-cards block if it's currently being streamed
  let safeContent = content;
  const openBlocks = (safeContent.match(/```hotel-cards/g) || []).length;
  const closedBlocks = (safeContent.match(/```hotel-cards\n?([\s\S]*?)```/g) || []).length;
  if (openBlocks > closedBlocks) {
    safeContent += '\n```';
  }

  // Split by hotel-cards code blocks
  const parts = safeContent.split(/```hotel-cards\n?([\s\S]*?)```/g);

  return (
    <div className="ai-message-content">
      {parts.map((part, i) => {
        // Odd indices are the hotel-cards JSON
        if (i % 2 === 1) {
          try {
            const hotels = JSON.parse(part.trim());
            if (Array.isArray(hotels)) {
              return (
                <div key={i} className="flex flex-col gap-1.5 my-2">
                  {hotels.map((h: { slug: string; name: string }, idx: number) => (
                    <AiHotelCard key={idx} slug={h.slug} name={h.name} />
                  ))}
                </div>
              );
            }
          } catch {
            // If JSON parsing fails, render as text
          }
        }

        // Render text with basic markdown-like formatting
        if (!part.trim()) return null;
        return (
          <div key={i} className="whitespace-pre-wrap text-[14.5px] leading-relaxed">
            {part.split('\n').map((line, lineIdx) => {
              // Bold text
              let processed: React.ReactNode = line;
              if (line.includes('**')) {
                const boldParts = line.split(/\*\*(.*?)\*\*/g);
                processed = boldParts.map((bp, bpi) =>
                  bpi % 2 === 1
                    ? <strong key={bpi} className="font-bold">{bp}</strong>
                    : <span key={bpi}>{bp}</span>
                );
              }
              return (
                <span key={lineIdx}>
                  {processed}
                  {lineIdx < line.length - 1 && '\n'}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function AiPlannerModal({ isOpen, onClose }: AiPlannerModalProps) {
  const { dict, locale } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const { data: session } = useSession();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const aiChat = (dict as any).aiChat || {};

  // Quick prompt suggestions — from dictionary
  const quickPrompts: string[] = aiChat.quickPrompts || (
    locale === 'vi'
      ? [
          "🏖️ Gợi ý resort 5 sao ở Đà Nẵng",
          "💰 Khách sạn giá rẻ dưới 1 triệu",
          "🗓️ Lên lịch du lịch Phú Quốc 3 ngày",
          "🌄 Nơi nghỉ dưỡng tốt nhất ở Đà Lạt",
        ]
      : [
          "🏖️ Suggest 5-star resorts in Da Nang",
          "💰 Budget hotels under 1 million VND",
          "🗓️ Plan a 3-day trip to Phu Quoc",
          "🌄 Best stays in Da Lat",
        ]
  );

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: ChatMessage = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    // Create streaming assistant message
    const assistantMessage: ChatMessage = { role: "assistant", content: "" };
    setMessages([...updatedMessages, assistantMessage]);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, locale }),
        signal: controller.signal,
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("rate_limited");
        }
        throw new Error("API error");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        
        if (value) {
          buffer += decoder.decode(value, { stream: true });
        }
        if (done) {
          buffer += decoder.decode();
        }

        const lines = buffer.split('\n');
        buffer = done ? '' : (lines.pop() || '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: fullText };
                  return updated;
                });
              }
            } catch { /* skip */ }
          }
        }
        
        if (done) break;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      const isRateLimit = err.message === 'rate_limited';
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: isRateLimit
            ? (locale === 'vi'
              ? "⏳ AI đang bận do quá nhiều yêu cầu. Vui lòng thử lại sau **30 giây** nhé!"
              : "⏳ AI is busy due to high demand. Please try again in **30 seconds**!")
            : (locale === 'vi'
              ? "❌ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại!"
              : "❌ Sorry, something went wrong. Please try again!")
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [messages, isStreaming, locale]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setIsStreaming(false);
    setInput("");
  };

  if (!isOpen) return null;

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Chat Panel */}
      <div className="fixed inset-0 md:inset-y-0 md:inset-x-auto md:right-0 z-[101] w-full md:w-[480px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#004f32] rounded-full flex items-center justify-center shadow-sm p-1.5 text-white">
              <NabLogo />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-gray-900 leading-tight">
                {aiChat.title}
              </h2>
              <p className="text-[11px] text-[#004f32] font-medium">
                NabTravel • AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {hasMessages && (
              <button
                onClick={handleReset}
                className="p-2 hover:bg-white/80 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                title={aiChat.newChat}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/80 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            /* Welcome Screen */
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-20 h-20 bg-[#004f32] rounded-3xl flex items-center justify-center mb-5 shadow-sm p-4 text-white">
                <NabLogo />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {aiChat.welcome}
              </h3>
              <p className="text-[14px] text-gray-500 mb-8 max-w-sm leading-relaxed">
                {aiChat.welcomeDesc}
              </p>
              
              {/* Quick Prompts */}
              <div className="w-full space-y-2.5">
                <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">
                  {aiChat.suggestions}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt)}
                      className="text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50/50 text-[13.5px] font-medium text-gray-700 hover:text-green-800 transition-all duration-200 cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="px-4 py-4 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-[#004f32] flex items-center justify-center shrink-0 mt-0.5 shadow-sm p-1 text-white">
                      <NabLogo />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-green-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    ) : msg.content ? (
                      <MessageContent content={msg.content} />
                    ) : (
                      /* Streaming indicator */
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-[13px] text-gray-400 ml-1">
                          {aiChat.thinking}
                        </span>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden shadow-sm">
                      {session?.user?.image ? (
                        <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="shrink-0 border-t border-gray-100 p-4 bg-white">
          <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={aiChat.placeholder}
              disabled={isStreaming}
              className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-[14.5px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all disabled:opacity-60 border border-transparent focus:border-green-200"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md cursor-pointer"
            >
              <Send className="w-[18px] h-[18px]" />
            </button>
          </form>
          <p className="text-[11px] text-gray-400 text-center mt-2.5">
            {aiChat.disclaimer}
          </p>
        </div>
      </div>
    </>
  );
}
