"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { usePlatformStore } from "@/store/usePlatformStore";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTED = [
  "How does payroll work?",
  "What plans do you offer?",
  "Can you handle California payroll?",
];

const MARKETING_PATH_PREFIXES = [
  "/",
  "/about",
  "/accountants",
  "/blog",
  "/community",
  "/compare",
  "/contact",
  "/customers",
  "/demo",
  "/docs",
  "/guides",
  "/integrations",
  "/partners",
  "/press",
  "/pricing",
  "/privacy",
  "/product",
  "/security",
  "/solutions",
  "/status",
  "/switch",
  "/templates",
  "/terms",
  "/trial",
  "/trust",
  "/webinars",
  "/resources",
];

const AUTH_PATH_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

export default function CirceWidget() {
  const pathname = usePathname();
  const { isCirceOpen: open, toggleCirce, setIsCirceOpen } = usePlatformStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m Circe. Ask me anything about CircleWorks payroll, plans, compliance, or onboarding.",
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

  const isAuthPage = AUTH_PATH_PREFIXES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const isMarketingPage = MARKETING_PATH_PREFIXES.some((path) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`),
  );

  useEffect(() => {
    if (isAuthPage) setIsCirceOpen(false);
  }, [isAuthPage, setIsCirceOpen]);

  if (isAuthPage || !isMarketingPage) return null;

  return (
    <>
      <div className="group fixed bottom-6 right-6 z-50">
        {!open ? (
          <div className="pointer-events-none absolute bottom-full right-0 mb-3 translate-y-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            Ask Circe — AI HR Assistant
          </div>
        ) : null}

        <button
          id="tour-circe"
          onClick={() => toggleCirce()}
          aria-label="Ask Circe — AI HR Assistant"
          title="Ask Circe — AI HR Assistant"
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
            open
              ? "bg-slate-900 text-white"
              : "bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 text-white hover:scale-105 hover:shadow-[0_0_28px_rgba(147,51,234,0.45)]"
          }`}
        >
          {open ? <X size={22} /> : <Sparkles size={22} />}
        </button>
      </div>

      <div
        className={`fixed bottom-24 right-6 z-50 flex h-[480px] w-[320px] origin-bottom-right flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_-20px_rgba(0,0,0,0.35)] transition-all duration-300 dark:border-slate-800 dark:bg-slate-950 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-5 opacity-0"
        }`}
        role="dialog"
        aria-label="Circe chat drawer"
        aria-modal="false"
      >
        <div className="flex items-center gap-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 px-5 py-4 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15">
            <Sparkles size={17} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-bold leading-tight">Circe — CircleWorks AI</div>
            <div className="text-[11px] font-medium text-white/75">
              AI assistant for CircleWorks payroll and HR
            </div>
          </div>
          <button
            onClick={() => setIsCirceOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            aria-label="Close Circe chat"
          >
            <X size={14} />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-violet-50/60 via-white to-white px-4 py-4 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950"
        >
          {messages.map((msg, i) => (
            <div
              key={`${msg.role}-${i}`}
              className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                msg.role === "assistant"
                  ? "self-start rounded-bl-md bg-white text-slate-800 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
                  : "ml-auto rounded-br-md bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white"
              }`}
            >
              {msg.content}
            </div>
          ))}

          {loading ? (
            <div className="flex items-center gap-1.5 self-start rounded-2xl rounded-bl-md bg-white px-4 py-3 text-[14px] text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "300ms" }} />
            </div>
          ) : null}

          {messages.length <= 1 && !loading ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {SUGGESTED.map((question) => (
                <button
                  key={question}
                  onClick={() => sendMessage(question)}
                  className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[12px] font-semibold text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-200 dark:hover:bg-violet-900/40"
                >
                  {question}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-slate-200 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-950"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={loading}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[14px] text-slate-800 placeholder:text-slate-400 transition-colors focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white transition-all hover:shadow-md disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );
}
