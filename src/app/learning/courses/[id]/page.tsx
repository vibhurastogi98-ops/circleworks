"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Download,
  FileText,
  MonitorPlay,
  Play,
  Presentation,
  ShieldCheck,
} from "lucide-react";

import {
  getCourse,
  getCourseProgress,
  type CourseModule,
  type QuizQuestion,
} from "@/data/mockLearning";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function moduleIcon(module: CourseModule) {
  if (module.type === "Video") return <Play size={16} />;
  if (module.type === "Slides") return <Presentation size={16} />;
  if (module.type === "Quiz") return <Award size={16} />;
  return <FileText size={16} />;
}

function QuizViewer({
  questions,
  onPassed,
}: {
  questions: QuizQuestion[];
  onPassed: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const current = questions[index];
  const hasAnswered = current.id in answers;
  const isCorrect = answers[current.id];
  const score = Math.round((Object.values(answers).filter(Boolean).length / questions.length) * 100);
  const isComplete = Object.keys(answers).length === questions.length;

  const submit = () => {
    if (!selected) return;
    const nextAnswers = { ...answers, [current.id]: selected === current.answer };
    setAnswers(nextAnswers);
    const nextScore = Math.round((Object.values(nextAnswers).filter(Boolean).length / questions.length) * 100);
    if (Object.keys(nextAnswers).length === questions.length && nextScore >= 80) onPassed();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Badge className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300">
          Question {index + 1} of {questions.length}
        </Badge>
        <span className="text-sm font-black text-slate-700 dark:text-slate-200">Score {score}%</span>
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">{current.prompt}</h2>
        <div className="mt-5 grid gap-3">
          {current.choices.map((choice) => (
            <button
              key={choice}
              type="button"
              disabled={hasAnswered}
              onClick={() => setSelected(choice)}
              className={`rounded-xl border p-4 text-left text-sm font-bold transition ${
                selected === choice
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                  : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
      {hasAnswered ? (
        <div
          className={`rounded-xl border p-4 text-sm ${
            isCorrect
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200"
          }`}
        >
          <p className="font-black">{isCorrect ? "Correct" : "Not quite"}</p>
          <p className="mt-1 leading-6">{current.explanation}</p>
        </div>
      ) : null}
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setIndex((value) => Math.max(0, value - 1));
            setSelected("");
          }}
          disabled={index === 0}
        >
          Previous
        </Button>
        {hasAnswered ? (
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setIndex((value) => Math.min(questions.length - 1, value + 1));
              setSelected("");
            }}
            disabled={index === questions.length - 1}
          >
            Next
          </Button>
        ) : (
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={submit} disabled={!selected}>
            Submit Answer
          </Button>
        )}
      </div>
      {isComplete ? (
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-sm font-bold text-slate-950 dark:text-white">
            {score >= 80 ? "Passed. Certificate is ready." : "Score below 80%. Review the material and try again."}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ModuleContent({
  module,
  onQuizPassed,
}: {
  module: CourseModule;
  onQuizPassed: () => void;
}) {
  if (module.type === "Video") {
    return (
      <div className="space-y-4">
        <div className="aspect-video overflow-hidden rounded-2xl bg-slate-950">
          <iframe
            src={module.embedUrl}
            title={module.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (module.type === "Slides") {
    return (
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 dark:border-slate-800">
        <iframe title={module.title} className="h-full w-full opacity-0" src="about:blank" />
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-200">Slides</p>
            <h2 className="mt-3 text-3xl font-black">{module.title}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Embedded slide content placeholder. Admins can replace this iframe source with a hosted deck.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (module.type === "Quiz") {
    return <QuizViewer questions={module.quiz || []} onPassed={onQuizPassed} />;
  }

  return (
    <article className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
      <h2 className="text-xl font-bold text-slate-950 dark:text-white">{module.title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{module.body}</p>
    </article>
  );
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = String(params.id || "security-compliance-101");
  const course = getCourse(courseId);
  const [activeModuleId, setActiveModuleId] = useState(course.modules[0]?.id);
  const [quizPassed, setQuizPassed] = useState(false);

  const activeModule = useMemo(
    () => course.modules.find((module) => module.id === activeModuleId) || course.modules[0],
    [activeModuleId, course.modules],
  );
  const progress = Math.max(getCourseProgress(course), quizPassed ? 100 : 0);
  const certificateReady = progress === 100 || quizPassed;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex gap-4">
          <Link
            href="/learning"
            className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
            aria-label="Back to learning"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-950 dark:text-white">{course.title}</h1>
              <Badge variant="secondary">{course.category}</Badge>
              {course.isMandatory ? (
                <Badge className="border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Mandatory
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {course.duration} · {course.enrolledCount} enrolled · {course.completionRate}% completion rate
            </p>
          </div>
        </div>
        <a
          href={`/api/learning/certificates/${course.id}?learner=Vibhu%20Rastogi`}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
            certificateReady
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "pointer-events-none bg-slate-200 text-slate-500 dark:bg-slate-800"
          }`}
        >
          <Download size={16} />
          Certificate
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Course Chapters</CardTitle>
            <div className="mt-3">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {course.modules.map((module, index) => {
              const isActive = module.id === activeModule.id;
              const isComplete = module.completed || (module.type === "Quiz" && quizPassed);
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => setActiveModuleId(module.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                    isActive
                      ? "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10"
                      : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {isComplete ? <CheckCircle2 size={16} className="text-emerald-500" /> : moduleIcon(module)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-950 dark:text-white">
                      {index + 1}. {module.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {module.type} · {module.duration}
                    </p>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <CardTitle>{activeModule.title}</CardTitle>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {activeModule.type} module · {activeModule.duration}
                </p>
              </div>
              <Badge className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300">
                <MonitorPlay className="mr-1 h-3 w-3" />
                {activeModule.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ModuleContent module={activeModule} onQuizPassed={() => setQuizPassed(true)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
