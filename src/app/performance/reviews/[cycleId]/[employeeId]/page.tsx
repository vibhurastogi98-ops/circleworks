"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  EyeOff,
  Save,
  Send,
  ShieldCheck,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import {
  getReviewCycle,
  getReviewParticipant,
  managerReviewQuestions,
  okrTree,
  peerReviewQuestions,
  selfReviewQuestions,
  type ReviewQuestion,
} from "@/data/mockPerformance";
import { formatDate } from "@/utils/formatDate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FormMode = "self" | "manager" | "peer";

const sampleAnswer =
  "This cycle I focused on measurable business outcomes, sharper cross-functional communication, and repeatable operating systems. The strongest example was coordinating the review readiness workflow, where I clarified owners, reduced decision latency, and helped managers complete calibration inputs earlier than the prior cycle.";

function questionKey(mode: FormMode, questionId: string) {
  return `${mode}-${questionId}`;
}

function QuestionFields({
  mode,
  questions,
  answers,
  errors,
  onChange,
}: {
  mode: FormMode;
  questions: ReviewQuestion[];
  answers: Record<string, string>;
  errors: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {questions.map((question) => {
        const key = questionKey(mode, question.id);
        const value = answers[key] || "";

        if (question.type === "rating") {
          return (
            <div key={question.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-sm font-bold text-slate-950 dark:text-white">{question.prompt}</p>
              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => onChange(key, String(rating))}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-black transition ${
                      value === String(rating)
                        ? "border-amber-400 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          );
        }

        if (question.type === "choice") {
          return (
            <label key={question.id} className="block space-y-2">
              <span className="text-sm font-bold text-slate-950 dark:text-white">{question.prompt}</span>
              <select
                value={value}
                onChange={(event) => onChange(key, event.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--text-primary)]"
              >
                <option value="">Select rating...</option>
                <option>Exceeds Expectations</option>
                <option>Meets Expectations</option>
                <option>Below Expectations</option>
              </select>
              {errors[key] ? <p className="text-[13px] font-medium text-red-600">{errors[key]}</p> : null}
            </label>
          );
        }

        return (
          <label key={question.id} className="block space-y-2">
            <span className="text-sm font-bold text-slate-950 dark:text-white">{question.prompt}</span>
            <textarea
              value={value}
              onChange={(event) => onChange(key, event.target.value)}
              rows={5}
              placeholder={sampleAnswer}
              className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm leading-6 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <div className="flex items-center justify-between">
              {errors[key] ? <p className="text-[13px] font-medium text-red-600">{errors[key]}</p> : <span />}
              {question.minLength ? (
                <span className="text-xs font-medium text-slate-500">
                  {value.length}/{question.minLength} min
                </span>
              ) : null}
            </div>
          </label>
        );
      })}
    </div>
  );
}

export default function ReviewFormPage() {
  const params = useParams();
  const cycleId = String(params.cycleId || "q2-2026");
  const employeeId = String(params.employeeId || "2");
  const cycle = getReviewCycle(cycleId);
  const participant = getReviewParticipant(employeeId);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shareWithEmployee, setShareWithEmployee] = useState(true);
  const [anonymousPeer, setAnonymousPeer] = useState(true);

  const submitMutation = useMutation({
    mutationFn: async (mode: FormMode) => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return mode;
    },
    onSuccess: (mode) => {
      toast.success(
        mode === "manager"
          ? "Manager review submitted. Employee notification queued."
          : mode === "peer"
            ? "Peer review submitted."
            : "Self-review submitted.",
      );
    },
  });

  const goalRows = useMemo(
    () =>
      okrTree[0].children?.flatMap((departmentOkr) =>
        (departmentOkr.children || [departmentOkr]).map((okr) => ({
          objective: okr.objective,
          owner: okr.owner,
          progress: Math.round(
            okr.keyResults.reduce((sum, keyResult) => sum + Math.min(100, (keyResult.current / keyResult.target) * 100), 0) /
              okr.keyResults.length,
          ),
        })),
      ) || [],
    [],
  );

  const updateAnswer = (key: string, value: string) => {
    setAnswers((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const validateAndSubmit = (mode: FormMode, questions: ReviewQuestion[]) => {
    const nextErrors: Record<string, string> = {};

    questions.forEach((question) => {
      const key = questionKey(mode, question.id);
      const value = answers[key] || "";
      if (question.type === "textarea" && question.minLength && value.trim().length < question.minLength) {
        nextErrors[key] = `Please enter at least ${question.minLength} characters.`;
      }
      if (question.type !== "textarea" && !value) {
        nextErrors[key] = "Please choose an option.";
      }
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted review fields before submitting.");
      return;
    }

    submitMutation.mutate(mode);
  };

  const saveDraft = () => toast.success("Draft saved.");

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex gap-4">
          <Link
            href={`/performance/reviews/${cycle.id}`}
            className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
            aria-label="Back to cycle detail"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Review Form</h1>
              <Badge className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300">
                {cycle.name}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {participant.employee} · {participant.title} · Manager: {participant.manager}
            </p>
          </div>
        </div>
        <p className="text-sm font-bold text-slate-500">Self-review due {formatDate(cycle.selfReviewDueDate)}</p>
      </div>

      <Tabs defaultValue="self" className="space-y-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="self">Self Review</TabsTrigger>
          <TabsTrigger value="manager">Manager Review</TabsTrigger>
          <TabsTrigger value="peer">Peer Review</TabsTrigger>
        </TabsList>

        <TabsContent value="self" className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Self-review responses</CardTitle>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Text responses require at least 100 characters.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <QuestionFields
                mode="self"
                questions={selfReviewQuestions}
                answers={answers}
                errors={errors}
                onChange={updateAnswer}
              />
              <div className="flex justify-end gap-3">
                <Button variant="outline" className="gap-2" onClick={saveDraft}>
                  <Save size={16} />
                  Save Draft
                </Button>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => validateAndSubmit("self", selfReviewQuestions)}>
                  <Send size={16} />
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Goal Achievement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {goalRows.slice(0, 3).map((goal) => (
                <div key={goal.objective} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-950 dark:text-white">{goal.objective}</p>
                  <p className="mt-1 text-xs text-slate-500">Owner: {goal.owner}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full bg-emerald-500" style={{ width: `${goal.progress}%` }} />
                  </div>
                  <p className="mt-1 text-right text-xs font-bold text-slate-500">{goal.progress}%</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manager" className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Manager review</CardTitle>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Compensation recommendation is hidden from the employee.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <QuestionFields
                mode="manager"
                questions={managerReviewQuestions}
                answers={answers}
                errors={errors}
                onChange={updateAnswer}
              />
              <label className="block space-y-2 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-400/30 dark:bg-red-500/10">
                <span className="flex items-center gap-2 text-sm font-bold text-red-700 dark:text-red-300">
                  <EyeOff size={16} />
                  Compensation recommendation
                </span>
                <Input placeholder="Example: 4% merit increase; promotion readiness in H2" />
                <p className="text-xs font-medium text-red-700/80 dark:text-red-300/80">Visible to HR and compensation admins only.</p>
              </label>
              <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <span>
                  <span className="block text-sm font-bold text-slate-950 dark:text-white">Share with employee after submission</span>
                  <span className="text-xs text-slate-500">Employee notification is sent after submission.</span>
                </span>
                <input
                  type="checkbox"
                  checked={shareWithEmployee}
                  onChange={(event) => setShareWithEmployee(event.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600"
                />
              </label>
              <div className="flex justify-end gap-3">
                <Button variant="outline" className="gap-2" onClick={saveDraft}>
                  <Save size={16} />
                  Save Draft
                </Button>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => validateAndSubmit("manager", managerReviewQuestions)}>
                  <Send size={16} />
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manager checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Read self-review", "Review OKR progress", "Add restricted comp note", "Confirm share toggle"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peer" className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Peer review</CardTitle>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                3-5 short questions with optional anonymity.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <label className="flex items-center justify-between gap-3 rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-400/30 dark:bg-purple-500/10">
                <span className="flex items-center gap-2 text-sm font-bold text-purple-700 dark:text-purple-300">
                  <ShieldCheck size={16} />
                  Submit anonymously
                </span>
                <input
                  type="checkbox"
                  checked={anonymousPeer}
                  onChange={(event) => setAnonymousPeer(event.target.checked)}
                  className="h-5 w-5 rounded border-purple-300 text-purple-600"
                />
              </label>
              <QuestionFields
                mode="peer"
                questions={peerReviewQuestions}
                answers={answers}
                errors={errors}
                onChange={updateAnswer}
              />
              <div className="flex justify-end gap-3">
                <Button variant="outline" className="gap-2" onClick={saveDraft}>
                  <Save size={16} />
                  Save Draft
                </Button>
                <Button className="gap-2 bg-purple-600 hover:bg-purple-700" onClick={() => validateAndSubmit("peer", peerReviewQuestions)}>
                  <Star size={16} />
                  Submit Peer Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
