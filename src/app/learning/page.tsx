"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";

import {
  courseCategories,
  getCourse,
  mockAssignments,
  mockCourses,
  type CourseCategory,
} from "@/data/mockLearning";
import { formatDate } from "@/utils/formatDate";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categoryClasses: Record<CourseCategory, string> = {
  Compliance:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300",
  Leadership:
    "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-400/30 dark:bg-purple-500/10 dark:text-purple-300",
  Technical:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300",
  Onboarding:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  Custom:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300",
};

export default function LearningDashboard() {
  const [category, setCategory] = useState<"All" | CourseCategory>("All");
  const learningQuery = useQuery({
    queryKey: ["learning-overview"],
    queryFn: async () => ({
      courses: mockCourses,
      assignments: mockAssignments,
    }),
  });

  const courses = learningQuery.data?.courses || [];
  const assignments = learningQuery.data?.assignments || [];
  const filteredCourses = courses.filter((course) => category === "All" || course.category === category);

  const assigned = assignments.filter((assignment) => assignment.status === "Assigned");
  const inProgress = assignments.filter((assignment) => assignment.status === "In Progress");
  const completed = assignments.filter((assignment) => assignment.status === "Completed");

  const complianceProgress = useMemo(() => {
    const compliance = courses.filter((course) => course.category === "Compliance");
    if (!compliance.length) return 0;
    return Math.round(compliance.reduce((sum, course) => sum + course.completionRate, 0) / compliance.length);
  }, [courses]);
  const summaryCards = [
    {
      label: "Assigned",
      value: assigned.length,
      icon: CalendarDays,
      className: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300",
    },
    {
      label: "In progress",
      value: inProgress.length,
      icon: PlayCircle,
      className: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-300",
    },
    {
      label: "Completed",
      value: completed.length,
      icon: CheckCircle2,
      className: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300",
    },
    {
      label: "Compliance",
      value: `${complianceProgress}%`,
      icon: ShieldCheck,
      className: "text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-300",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">Learning Management</p>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">LMS Overview</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Deliver compliance, leadership, technical, onboarding, and custom training.
          </p>
        </div>
        <Link
          href="/learning/courses"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <BookOpen size={16} />
          Course Catalog
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon, className }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${className}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-950 dark:text-white">{value}</p>
                <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Course Library</CardTitle>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Filter by category and inspect enrollment and completion health.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {courseCategories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  category === item
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Link
              key={course.id}
              href={`/learning/courses/${course.id}`}
              className="group rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-blue-800 dark:hover:bg-slate-800/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <GraduationCap size={22} />
                </div>
                <Badge className={categoryClasses[course.category]}>{course.category}</Badge>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-950 transition group-hover:text-blue-600 dark:text-white">
                {course.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{course.description}</p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="font-black text-slate-950 dark:text-white">{course.duration}</p>
                  <p className="font-bold uppercase text-slate-500">Duration</p>
                </div>
                <div>
                  <p className="font-black text-slate-950 dark:text-white">{course.enrolledCount}</p>
                  <p className="font-bold uppercase text-slate-500">Enrolled</p>
                </div>
                <div>
                  <p className="font-black text-slate-950 dark:text-white">{course.completionRate}%</p>
                  <p className="font-bold uppercase text-slate-500">Complete</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${course.completionRate}%` }} />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>In-progress Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inProgress.map((assignment) => {
              const course = getCourse(assignment.courseId);
              return (
                <Link
                  key={assignment.id}
                  href={`/learning/courses/${assignment.courseId}`}
                  className="block rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{assignment.courseTitle}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={13} />
                        {course.duration}
                      </p>
                    </div>
                    <Badge className={categoryClasses[course.category]}>{course.category}</Badge>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${assignment.progress}%` }} />
                  </div>
                  <p className="mt-1 text-right text-xs font-black text-slate-500">{assignment.progress}%</p>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completed.map((assignment) => (
              <div key={assignment.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <Award size={18} className="mt-0.5 text-amber-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-950 dark:text-white">{assignment.courseTitle}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Certificate {assignment.certificateId || "ready"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assigned.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/learning/courses/${assignment.courseId}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{assignment.courseTitle}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <Layers size={13} />
                    Must complete by {formatDate(assignment.dueDate)}
                  </p>
                </div>
                <span className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white">Start</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
