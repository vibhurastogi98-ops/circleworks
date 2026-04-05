"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTED = [
  "How does payroll work?",
  "What plans do you offer?",
  "Can you handle California payroll?",
];

export default function CirceWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey! 👋 I'm Circe, CircleWorks' AI HR assistant. Ask me anything about payroll, benefits, compliance, or our platform.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/circe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = (await res.json()) as { reply?: string };
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Sorry, I couldn't process that. Please try again." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again in a moment, or reach out to support@circleworks.com.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* --- FAB Button --- */}
      <button
        id="tour-circe"
        onClick={() => setOpen(!open)}
        aria-label="Ask Circe — AI HR Assistant"
        title="Ask Circe — AI HR Assistant"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group ${
          open
            ? "bg-slate-800 rotate-90 scale-90"
            : "bg-gradient-to-br from-purple-600 to-fuchsia-500 hover:shadow-[0_0_24px_rgba(168,85,247,0.5)] hover:scale-110"
        }`}
      >
        {open ? (
          <X size={22} className="text-white" />
        ) : (
          <Sparkles size={22} className="text-white" />
        )}
      </button>

      {/* --- Chat Drawer --- */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[340px] h-[480px] bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.25)] border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-[15px] leading-tight">Circe</div>
            <div className="text-[11px] text-white/70 font-medium">CircleWorks AI Assistant</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Messages Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 scroll-smooth">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${
                msg.role === "assistant"
                  ? "bg-slate-100 text-slate-800 self-start rounded-bl-md"
                  : "bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white self-end rounded-br-md"
              }`}
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="bg-slate-100 text-slate-500 self-start px-4 py-3 rounded-2xl rounded-bl-md text-[14px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}

          {/* Suggested Chips (show only when 1 message) */}
          {messages.length <= 1 && !loading && (
            <div className="flex flex-wrap gap-2 mt-2">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-full text-[12px] font-semibold hover:bg-purple-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-slate-200 bg-white">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={loading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white flex items-center justify-center disabled:opacity-40 hover:shadow-md transition-all shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );
}
