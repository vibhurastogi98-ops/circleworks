"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send, ShieldCheck, Sparkles, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

import {
  feedbackTimeline,
  recognitionWall,
  type FeedbackEntry,
  type FeedbackType,
} from "@/data/mockPerformance";
import { employees, getEmployeeName } from "@/lib/hris-module-data";
import { formatDate } from "@/utils/formatDate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const feedbackTypes: Array<"All" | FeedbackType> = ["All", "Praise", "Constructive", "Thanks"];

export default function PerformanceFeedbackPage() {
  const [recipient, setRecipient] = useState(getEmployeeName(employees[1]));
  const [type, setType] = useState<FeedbackType>("Praise");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [senderFilter, setSenderFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | FeedbackType>("All");
  const [dateFilter, setDateFilter] = useState("");
  const [reactionCounts, setReactionCounts] = useState(recognitionWall);

  const feedbackQuery = useQuery({
    queryKey: ["performance-feedback"],
    queryFn: async () => feedbackTimeline,
  });

  const sendFeedbackMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient, type, message, anonymous }),
      });
      if (!response.ok) throw new Error("Failed to send feedback");
      return (await response.json()) as { feedback: FeedbackEntry };
    },
    onSuccess: () => {
      toast.success(`Feedback sent to ${recipient}.`);
      setMessage("");
    },
    onError: () => {
      toast.error("Failed to send feedback. Please try again.");
    },
  });

  const filteredFeedback = useMemo(() => {
    const rows = feedbackQuery.data || [];
    return rows.filter((entry) => {
      const matchesSender = !senderFilter || entry.sender.toLowerCase().includes(senderFilter.toLowerCase());
      const matchesType = typeFilter === "All" || entry.type === typeFilter;
      const matchesDate = !dateFilter || entry.date >= dateFilter;
      return matchesSender && matchesType && matchesDate;
    });
  }, [dateFilter, feedbackQuery.data, senderFilter, typeFilter]);

  const sendFeedback = () => {
    if (message.trim().length < 20) {
      toast.error("Feedback message should be at least 20 characters.");
      return;
    }
    sendFeedbackMutation.mutate();
  };

  const addReaction = (recognitionId: string, emoji: string) => {
    setReactionCounts((rows) =>
      rows.map((row) =>
        row.id === recognitionId
          ? { ...row, reactions: { ...row.reactions, [emoji]: (row.reactions[emoji] || 0) + 1 } }
          : row,
      ),
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300">
          Continuous Feedback
        </p>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Feedback and Recognition</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Send timely praise, constructive notes, private thanks, and public recognition.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Send Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="space-y-2 block">
              <span className="text-xs font-bold uppercase text-slate-500">Recipient</span>
              <select
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--text-primary)]"
              >
                {employees.slice(0, 8).map((employee) => (
                  <option key={employee.id}>{getEmployeeName(employee)}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 block">
              <span className="text-xs font-bold uppercase text-slate-500">Type</span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as FeedbackType)}
                className="h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--text-primary)]"
              >
                <option>Praise</option>
                <option>Constructive</option>
                <option>Thanks</option>
              </select>
            </label>
            <label className="space-y-2 block">
              <span className="text-xs font-bold uppercase text-slate-500">Message</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                placeholder="Be specific: behavior, impact, and the next useful action."
                className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm leading-6 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white">
                <ShieldCheck size={16} className="text-purple-500" />
                Send anonymously
              </span>
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(event) => setAnonymous(event.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-purple-600"
              />
            </label>
            <Button
              className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
              onClick={sendFeedback}
              disabled={sendFeedbackMutation.isPending}
            >
              <Send size={16} />
              {sendFeedbackMutation.isPending ? "Sending..." : "Send Feedback"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Received Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                value={senderFilter}
                onChange={(event) => setSenderFilter(event.target.value)}
                placeholder="Filter sender"
              />
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as "All" | FeedbackType)}
                className="h-11 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--text-primary)]"
              >
                {feedbackTypes.map((feedbackType) => (
                  <option key={feedbackType}>{feedbackType}</option>
                ))}
              </select>
              <Input value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} type="date" />
            </div>
            <div className="space-y-3">
              {filteredFeedback.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          entry.type === "Praise"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                            : entry.type === "Constructive"
                              ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300"
                              : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300"
                        }
                      >
                        {entry.type}
                      </Badge>
                      <span className="text-sm font-bold text-slate-950 dark:text-white">{entry.sender}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-500">{formatDate(entry.date)}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{entry.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recognition Wall</CardTitle>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Public praise across the company from the last 30 days.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {reactionCounts.map((recognition) => (
            <article key={recognition.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white">
                <Sparkles size={16} className="text-amber-500" />
                {recognition.from} recognized {recognition.to}
              </div>
              <p className="mt-1 text-xs font-medium text-slate-500">{formatDate(recognition.date)}</p>
              <p className="mt-4 text-sm leading-6 text-slate-700 dark:text-slate-300">{recognition.message}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["👏", "💙", "🚀", "🙌"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addReaction(recognition.id, emoji)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    {emoji} {recognition.reactions[emoji] || 0}
                  </button>
                ))}
              </div>
            </article>
          ))}
          <div className="rounded-2xl border border-dashed border-slate-300 p-5 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white">
              <ThumbsUp size={16} className="text-blue-600" />
              Recognition guidance
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Recognition is public by default, meant for praise and thanks. Use private feedback for sensitive coaching.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
