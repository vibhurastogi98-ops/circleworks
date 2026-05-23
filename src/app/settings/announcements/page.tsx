"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Bold,
  Building2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  Italic,
  Link2,
  List,
  Paperclip,
  Percent,
  Pin,
  Plus,
  Smile,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import type { AnnouncementAttachment } from "@/lib/announcements";

type FilterTab = "All" | "Active" | "Scheduled" | "Expired";

type AnnouncementRecord = {
  id: number;
  title: string;
  body: string;
  audience: string;
  audienceLabel: string;
  department?: string | null;
  location?: string | null;
  priority: "Normal" | "Important" | "Urgent";
  status: "Draft" | "Scheduled" | "Published" | "Expired";
  publishAt?: string | null;
  expireAt?: string | null;
  isPinned: boolean;
  attachments: AnnouncementAttachment[];
  viewsCount: number;
  uniqueReaders: number;
  createdAt: string;
  analytics: {
    totalViews: number;
    uniqueReaders: number;
    readPercent: number;
    departmentBreakdown: Array<{ dept: string; count: number }>;
  };
};

function RichTextToolbar({ textareaRef }: { textareaRef: React.RefObject<HTMLTextAreaElement | null> }) {
  const wrap = (before: string, after: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selection = ta.value.substring(start, end);
    ta.setRangeText(`${before}${selection}${after}`, start, end, "end");
    ta.focus();
    ta.dispatchEvent(new Event("input", { bubbles: true }));
  };

  return (
    <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-800/50">
      <button type="button" onClick={() => wrap("**", "**")} className="rounded p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700" title="Bold"><Bold size={14} /></button>
      <button type="button" onClick={() => wrap("*", "*")} className="rounded p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700" title="Italic"><Italic size={14} /></button>
      <button type="button" onClick={() => wrap("\n- ", "")} className="rounded p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700" title="List"><List size={14} /></button>
      <button type="button" onClick={() => wrap("[", "](url)")} className="rounded p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700" title="Link"><Link2 size={14} /></button>
      <button type="button" onClick={() => wrap("😊", "")} className="rounded p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700" title="Emoji"><Smile size={14} /></button>
    </div>
  );
}

function AnalyticsRow({ announcement }: { announcement: AnnouncementRecord }) {
  return (
    <tr>
      <td colSpan={5} className="bg-slate-50/80 px-6 py-4 dark:bg-slate-800/30">
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
              <Eye size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Views</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{announcement.analytics.totalViews}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/30">
              <Users size={16} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Unique Readers</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{announcement.analytics.uniqueReaders}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
              <Percent size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Read %</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{announcement.analytics.readPercent}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center gap-2">
            <Building2 size={14} className="text-slate-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Department Breakdown</p>
          </div>
          {announcement.analytics.departmentBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400">No reads recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {announcement.analytics.departmentBreakdown.map((dept) => (
                <div key={dept.dept} className="flex items-center gap-3">
                  <span className="w-28 text-xs text-slate-600 dark:text-slate-400">{dept.dept}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                      style={{ width: `${announcement.analytics.uniqueReaders > 0 ? Math.round((dept.count / announcement.analytics.uniqueReaders) * 100) : 0}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-bold text-slate-700 dark:text-slate-300">{dept.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

const filterTabs: FilterTab[] = ["All", "Active", "Scheduled", "Expired"];
const allowedAttachmentTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];

export default function AnnouncementsSettingsPage() {
  const [allAnnouncements, setAllAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [filter, setFilter] = useState<FilterTab>("All");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementRecord | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("All Employees");
  const [audienceValue, setAudienceValue] = useState("");
  const [priority, setPriority] = useState<"Normal" | "Important" | "Urgent">("Normal");
  const [publishImmediate, setPublishImmediate] = useState(true);
  const [publishAtDate, setPublishAtDate] = useState("");
  const [publishAtTime, setPublishAtTime] = useState("");
  const [expireAtDate, setExpireAtDate] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [attachments, setAttachments] = useState<AnnouncementAttachment[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const filteredAnnouncements = useMemo(() => {
    if (filter === "All") return allAnnouncements;
    if (filter === "Active") return allAnnouncements.filter((item) => item.status === "Published");
    if (filter === "Scheduled") return allAnnouncements.filter((item) => item.status === "Scheduled");
    return allAnnouncements.filter((item) => item.status === "Expired");
  }, [allAnnouncements, filter]);

  const statusCounts = useMemo(() => ({
    All: allAnnouncements.length,
    Active: allAnnouncements.filter((item) => item.status === "Published").length,
    Scheduled: allAnnouncements.filter((item) => item.status === "Scheduled").length,
    Expired: allAnnouncements.filter((item) => item.status === "Expired").length,
  }), [allAnnouncements]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/announcements?scope=admin", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load announcements");
      const data = await res.json();
      setAllAnnouncements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const resetForm = () => {
    setTitle("");
    setBody("");
    setAudience("All Employees");
    setAudienceValue("");
    setPriority("Normal");
    setPublishImmediate(true);
    setPublishAtDate("");
    setPublishAtTime("");
    setExpireAtDate("");
    setIsPinned(false);
    setAttachments([]);
    setEditingAnnouncement(null);
  };

  const closePanel = () => {
    setIsSlideOverOpen(false);
    resetForm();
  };

  const openForCreate = () => {
    resetForm();
    setIsSlideOverOpen(true);
  };

  const handleEdit = (announcement: AnnouncementRecord) => {
    setEditingAnnouncement(announcement);
    setTitle(announcement.title);
    setBody(announcement.body);
    setAudience(announcement.audience);
    setAudienceValue(announcement.audience === "By Location" ? announcement.location ?? "" : announcement.department ?? "");
    setPriority(announcement.priority);
    setIsPinned(announcement.isPinned);
    setAttachments(announcement.attachments ?? []);
    setPublishImmediate(announcement.status === "Published" && !announcement.publishAt ? true : announcement.status === "Draft");

    if (announcement.publishAt) {
      const publishAt = new Date(announcement.publishAt);
      setPublishAtDate(format(publishAt, "yyyy-MM-dd"));
      setPublishAtTime(format(publishAt, "HH:mm"));
      setPublishImmediate(announcement.status === "Published" && publishAt <= new Date());
    } else {
      setPublishAtDate("");
      setPublishAtTime("");
    }

    if (announcement.expireAt) {
      setExpireAtDate(format(new Date(announcement.expireAt), "yyyy-MM-dd"));
    } else {
      setExpireAtDate("");
    }

    setIsSlideOverOpen(true);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const nextAttachments: AnnouncementAttachment[] = [];

    for (const file of files) {
      if (!allowedAttachmentTypes.includes(file.type)) {
        toast.error(`${file.name} must be a PDF or image.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 10MB limit.`);
        continue;
      }

      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      nextAttachments.push({
        name: file.name,
        type: file.type,
        size: file.size,
        url,
      });
    }

    setAttachments((current) => [...current, ...nextAttachments]);
    event.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const buildPayload = (status: "Draft" | "Published" | "Scheduled") => {
    const publishAt = publishImmediate
      ? new Date().toISOString()
      : publishAtDate && publishAtTime
        ? new Date(`${publishAtDate}T${publishAtTime}`).toISOString()
        : null;

    return {
      title: title.trim(),
      body: body.trim(),
      audience,
      audienceValue: audience === "All Employees" ? "" : audienceValue.trim(),
      priority,
      status,
      publishAt,
      expireAt: expireAtDate ? new Date(`${expireAtDate}T23:59:59`).toISOString() : null,
      isPinned,
      attachments,
    };
  };

  const submitAnnouncement = async (mode: "draft" | "publish") => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required.");
      return;
    }
    if (title.trim().length > 100) {
      toast.error("Title must be 100 characters or fewer.");
      return;
    }
    if (audience !== "All Employees" && !audienceValue.trim()) {
      toast.error("Add the department, location, or custom group.");
      return;
    }
    if (!publishImmediate && mode === "publish" && (!publishAtDate || !publishAtTime)) {
      toast.error("Scheduled announcements need a publish date and time.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = buildPayload(
        mode === "draft"
          ? "Draft"
          : publishImmediate
            ? "Published"
            : "Scheduled"
      );

      const res = await fetch(editingAnnouncement ? `/api/announcements/${editingAnnouncement.id}` : "/api/announcements", {
        method: editingAnnouncement ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.error ?? "Failed to save announcement");
      }

      toast.success(mode === "draft" ? "Announcement saved as draft" : editingAnnouncement ? "Announcement updated" : "Announcement created");
      closePanel();
      fetchAnnouncements();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to save announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete announcement");
      return;
    }

    setAllAnnouncements((current) => current.filter((announcement) => announcement.id !== id));
    toast.success("Announcement deleted");
  };

  const audienceHelpText =
    audience === "By Department"
      ? "Enter a department name exactly as employees see it."
      : audience === "By Location"
        ? "Enter a location name exactly as employees see it."
        : audience === "Custom Group"
          ? "Use a comma-separated list of employee names, emails, IDs, departments, or locations."
          : "Visible to everyone in the company.";

  return (
    <div className="relative flex max-w-6xl flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Announcements</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage company-wide bulletin board announcements.</p>
        </div>
        <button
          onClick={openForCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus size={16} /> Create Announcement
        </button>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${filter === tab ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            {tab}
            {!loading && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${filter === tab ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                {statusCounts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Audience</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Views</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : filteredAnnouncements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <BarChart3 size={28} className="opacity-50" />
                      <span className="text-sm">No announcements found.</span>
                      <button onClick={openForCreate} className="mt-1 text-sm text-blue-600 hover:underline">Create your first announcement</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <React.Fragment key={announcement.id}>
                    <tr className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30" onClick={() => setExpandedId((current) => current === announcement.id ? null : announcement.id)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {announcement.isPinned && <Pin size={14} className="shrink-0 text-orange-500" />}
                          <span className="font-bold text-slate-900 dark:text-white">{announcement.title}</span>
                          {announcement.priority === "Important" && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Important</span>}
                          {announcement.priority === "Urgent" && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-700 dark:bg-red-900/30 dark:text-red-400">Urgent</span>}
                        </div>
                        <p className="mt-1 line-clamp-1 max-w-md text-xs text-slate-500 dark:text-slate-400">{announcement.body}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{announcement.audienceLabel}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          announcement.status === "Published"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : announcement.status === "Scheduled"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : announcement.status === "Draft"
                                ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        }`}>
                          {announcement.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <Eye size={14} /> {announcement.viewsCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setExpandedId((current) => current === announcement.id ? null : announcement.id)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800" title="Analytics">
                            {expandedId === announcement.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <button onClick={() => handleEdit(announcement)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800" title="Edit">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDelete(announcement.id)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === announcement.id && <AnalyticsRow announcement={announcement} />}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isSlideOverOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={closePanel} />
          <div className="relative flex h-full w-full max-w-lg animate-in flex-col bg-white shadow-2xl duration-300 slide-in-from-right dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editingAnnouncement ? "Edit Announcement" : "Create Announcement"}</h2>
              <button onClick={closePanel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="announcement-form" className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Title <span className="text-red-500">*</span></label>
                  <input
                    required
                    maxLength={100}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Quarterly town hall"
                  />
                  <p className="mt-1 text-right text-[11px] text-slate-400">{title.length}/100</p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Body <span className="text-red-500">*</span></label>
                  <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                    <RichTextToolbar textareaRef={bodyRef} />
                    <textarea
                      ref={bodyRef}
                      required
                      rows={7}
                      value={body}
                      onChange={(event) => setBody(event.target.value)}
                      className="w-full resize-none border-0 px-3 py-2 text-sm outline-none focus:ring-0 dark:bg-slate-950 dark:text-white"
                      placeholder="Write the announcement body. Supports **bold**, *italic*, - lists, [links](url), and emoji."
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Audience</label>
                  <select
                    value={audience}
                    onChange={(event) => {
                      setAudience(event.target.value);
                      setAudienceValue("");
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="All Employees">All Employees</option>
                    <option value="By Department">By Department</option>
                    <option value="By Location">By Location</option>
                    <option value="Custom Group">Custom Group</option>
                  </select>
                  {audience !== "All Employees" && (
                    <>
                      <input
                        value={audienceValue}
                        onChange={(event) => setAudienceValue(event.target.value)}
                        className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        placeholder={audience === "By Department" ? "Engineering" : audience === "By Location" ? "San Francisco" : "alex@company.com, Priya Patel, 104"}
                      />
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{audienceHelpText}</p>
                    </>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
                  <div className="flex gap-3">
                    {[
                      { value: "Normal", classes: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },
                      { value: "Important", classes: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800" },
                      { value: "Urgent", classes: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPriority(option.value as AnnouncementRecord["priority"])}
                        className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${priority === option.value ? `${option.classes} ring-2 ring-blue-500 ring-offset-1` : "border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-950"}`}
                      >
                        {option.value}
                      </button>
                    ))}
                  </div>
                  {priority === "Important" && <p className="mt-1 text-[11px] text-amber-600">Shows as a banner in the portal.</p>}
                  {priority === "Urgent" && <p className="mt-1 text-[11px] text-red-600">Triggers the `announcement.published` push/badge event when published.</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Publish</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <input type="radio" checked={publishImmediate} onChange={() => setPublishImmediate(true)} className="text-blue-600 focus:ring-blue-600" />
                      Immediately
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <input type="radio" checked={!publishImmediate} onChange={() => setPublishImmediate(false)} className="text-blue-600 focus:ring-blue-600" />
                      Scheduled date + time
                    </label>
                  </div>
                  {!publishImmediate && (
                    <div className="mt-3 flex gap-3">
                      <input type="date" value={publishAtDate} onChange={(event) => setPublishAtDate(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
                      <input type="time" value={publishAtTime} onChange={(event) => setPublishAtTime(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Expiry date <span className="font-normal text-slate-400">(optional — auto-archives)</span></label>
                  <input
                    type="date"
                    value={expireAtDate}
                    onChange={(event) => setExpireAtDate(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/50">
                  <input type="checkbox" checked={isPinned} onChange={(event) => setIsPinned(event.target.checked)} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-600" />
                  <div className="flex items-center gap-2">
                    <Pin size={14} className="text-orange-500" /> Pin to top
                  </div>
                </label>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Attachments</label>
                  <input ref={fileInputRef} type="file" accept=".pdf,image/*" multiple className="hidden" onChange={handleFileChange} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-6 text-center text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:border-slate-800 dark:hover:bg-slate-800/50 dark:hover:text-slate-300"
                  >
                    <Paperclip size={24} className="mb-2" />
                    <span className="text-sm font-medium">Upload PDF or image</span>
                    <span className="text-xs">Max 10MB each</span>
                  </button>
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachments.map((attachment, index) => (
                        <div key={`${attachment.name}-${index}`} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-700 dark:text-slate-200">{attachment.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{(attachment.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                          <button type="button" onClick={() => removeAttachment(index)} className="text-slate-400 transition-colors hover:text-red-500">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => submitAnnouncement("draft")}
                  className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => submitAnnouncement("publish")}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : publishImmediate ? "Publish Now" : "Schedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
