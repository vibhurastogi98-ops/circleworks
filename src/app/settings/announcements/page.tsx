"use client";

import React, { useState, useEffect } from "react";
import { Plus, Eye, Pin, Trash2, X, Paperclip, ChevronDown, ChevronUp, BarChart3, Users, Percent, Building2, Bold, Italic, List, Link2, Smile, Edit3 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

/* ─── Rich Text Toolbar (visual-only — decorates textarea) ──────────── */
function RichTextToolbar({ textareaRef }: { textareaRef: React.RefObject<HTMLTextAreaElement | null> }) {
  const wrap = (before: string, after: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = ta.value.substring(start, end);
    const replacement = `${before}${sel}${after}`;
    ta.setRangeText(replacement, start, end, "end");
    ta.focus();
    ta.dispatchEvent(new Event("input", { bubbles: true }));
  };

  return (
    <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-t-lg">
      <button type="button" onClick={() => wrap("**", "**")} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500" title="Bold"><Bold size={14} /></button>
      <button type="button" onClick={() => wrap("*", "*")} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500" title="Italic"><Italic size={14} /></button>
      <button type="button" onClick={() => wrap("\n- ", "")} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500" title="List"><List size={14} /></button>
      <button type="button" onClick={() => wrap("[", "](url)")} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500" title="Link"><Link2 size={14} /></button>
      <button type="button" onClick={() => wrap("😊", "")} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500" title="Emoji"><Smile size={14} /></button>
    </div>
  );
}

/* ─── Analytics Row ─────────────────────────────────────────────────── */
function AnalyticsRow({ ann }: { ann: any }) {
  const totalEmployees = 50; // Simulated company size
  const readPct = totalEmployees > 0 ? Math.round((ann.uniqueReaders / totalEmployees) * 100) : 0;

  // Simulated dept breakdown from reads
  const deptBreakdown = [
    { dept: "Engineering", count: Math.ceil(ann.uniqueReaders * 0.35) },
    { dept: "Marketing", count: Math.ceil(ann.uniqueReaders * 0.2) },
    { dept: "Sales", count: Math.ceil(ann.uniqueReaders * 0.2) },
    { dept: "HR", count: Math.ceil(ann.uniqueReaders * 0.15) },
    { dept: "Finance", count: Math.floor(ann.uniqueReaders * 0.1) },
  ].filter(d => d.count > 0);

  return (
    <tr>
      <td colSpan={5} className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/30">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Eye size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Views</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{ann.viewsCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
              <Users size={16} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Unique Readers</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{ann.uniqueReaders}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <Percent size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Read %</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{readPct}%</p>
            </div>
          </div>
        </div>
        {/* Department breakdown */}
        <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={14} className="text-slate-500" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Department Breakdown</p>
          </div>
          {deptBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400">No reads recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {deptBreakdown.map(d => (
                <div key={d.dept} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 dark:text-slate-400 w-24">{d.dept}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500" style={{ width: `${Math.min(100, Math.round((d.count / ann.uniqueReaders) * 100))}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-8 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function AnnouncementsSettingsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Scheduled' | 'Expired'>('All');
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingAnn, setEditingAnn] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('All Employees');
  const [priority, setPriority] = useState('Normal');
  const [publishImmediate, setPublishImmediate] = useState(true);
  const [publishAtDate, setPublishAtDate] = useState('');
  const [publishAtTime, setPublishAtTime] = useState('');
  const [expireAtDate, setExpireAtDate] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/announcements?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) {
      toast.error("Title and body are required");
      return;
    }

    try {
      setIsSubmitting(true);
      let publishTime = new Date();
      if (!publishImmediate && publishAtDate && publishAtTime) {
        publishTime = new Date(`${publishAtDate}T${publishAtTime}`);
      }

      let expireTime = expireAtDate ? new Date(expireAtDate) : null;
      let status = publishImmediate ? 'Published' : 'Scheduled';

      if (!publishImmediate && publishTime <= new Date()) {
        status = 'Published';
      }

      const payload = {
        title,
        body,
        audience,
        priority,
        status,
        publishAt: publishTime.toISOString(),
        expireAt: expireTime ? expireTime.toISOString() : null,
        isPinned,
      };

      let res;
      if (editingAnn) {
        res = await fetch(`/api/announcements/${editingAnn.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast.success(editingAnn ? "Announcement updated" : "Announcement created");
        setIsSlideOverOpen(false);
        setEditingAnn(null);
        resetForm();
        fetchAnnouncements();
      } else {
        toast.error("Failed to save announcement");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (ann: any) => {
    setEditingAnn(ann);
    setTitle(ann.title);
    setBody(ann.body);
    setAudience(ann.audience || 'All Employees');
    setPriority(ann.priority || 'Normal');
    setIsPinned(ann.isPinned || false);
    if (ann.publishAt) {
      const d = new Date(ann.publishAt);
      setPublishImmediate(false);
      setPublishAtDate(format(d, 'yyyy-MM-dd'));
      setPublishAtTime(format(d, 'HH:mm'));
    } else {
      setPublishImmediate(true);
    }
    if (ann.expireAt) {
      setExpireAtDate(format(new Date(ann.expireAt), 'yyyy-MM-dd'));
    }
    setIsSlideOverOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      toast.success("Deleted successfully");
    }
  };

  const resetForm = () => {
    setTitle('');
    setBody('');
    setAudience('All Employees');
    setPriority('Normal');
    setPublishImmediate(true);
    setPublishAtDate('');
    setPublishAtTime('');
    setExpireAtDate('');
    setIsPinned(false);
    setEditingAnn(null);
  };

  const statusCounts = {
    All: announcements.length,
    Active: announcements.filter(a => a.status === 'Published').length,
    Scheduled: announcements.filter(a => a.status === 'Scheduled').length,
    Expired: announcements.filter(a => a.status === 'Expired').length,
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Announcements</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage company-wide bulletin board announcements.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsSlideOverOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} /> Create Announcement
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {(['All', 'Active', 'Scheduled', 'Expired'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${filter === f ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {f}
            {!loading && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filter === f ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                {statusCounts[f]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Announcements Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
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
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Loading...</div>
                </td></tr>
              ) : announcements.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center">
                  <div className="text-slate-400 flex flex-col items-center gap-2">
                    <BarChart3 size={28} className="opacity-50" />
                    <span className="text-sm">No announcements found.</span>
                    <button onClick={() => { resetForm(); setIsSlideOverOpen(true); }} className="text-blue-600 text-sm hover:underline mt-1">Create your first announcement</button>
                  </div>
                </td></tr>
              ) : (
                announcements.map((ann) => (
                  <React.Fragment key={ann.id}>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer" onClick={() => setExpandedId(expandedId === ann.id ? null : ann.id)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {ann.isPinned && <Pin size={14} className="text-orange-500 flex-shrink-0" />}
                          <span className="font-bold text-slate-900 dark:text-white">{ann.title}</span>
                          {ann.priority === 'Important' && <span className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase">Important</span>}
                          {ann.priority === 'Urgent' && <span className="text-[9px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded font-bold uppercase">Urgent</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{ann.audience}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          ann.status === 'Published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          ann.status === 'Scheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          ann.status === 'Draft' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {ann.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <Eye size={14} /> {ann.viewsCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setExpandedId(expandedId === ann.id ? null : ann.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors" title="Analytics">
                            {expandedId === ann.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <button onClick={() => handleEdit(ann)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors" title="Edit">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDelete(ann.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === ann.id && <AnalyticsRow ann={ann} />}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Panel — Create / Edit */}
      {isSlideOverOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => { setIsSlideOverOpen(false); setEditingAnn(null); }} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editingAnn ? 'Edit Announcement' : 'Create Announcement'}</h2>
              <button onClick={() => { setIsSlideOverOpen(false); setEditingAnn(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="announcement-form" onSubmit={handleSubmit} className="space-y-5 flex flex-col">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title <span className="text-red-500">*</span></label>
                  <input
                    required
                    maxLength={100}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg dark:bg-slate-950 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="E.g., Quarterly Townhall"
                  />
                  <p className="text-[11px] text-slate-400 mt-1 text-right">{title.length}/100</p>
                </div>

                {/* Body with toolbar */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Body <span className="text-red-500">*</span></label>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <RichTextToolbar textareaRef={bodyRef} />
                    <textarea
                      ref={bodyRef}
                      required
                      rows={6}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full px-3 py-2 dark:bg-slate-950 dark:text-white text-sm border-0 outline-none resize-none focus:ring-0"
                      placeholder="Write the announcement body. Supports **bold**, *italic*, - lists, and [links](url)..."
                    />
                  </div>
                </div>

                {/* Audience */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg dark:bg-slate-950 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="All Employees">All Employees</option>
                    <option value="By Department">By Department</option>
                    <option value="By Location">By Location</option>
                    <option value="Custom Group">Custom Group</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <div className="flex gap-3">
                    {[
                      { val: 'Normal', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
                      { val: 'Important', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
                      { val: 'Urgent', color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' },
                    ].map(p => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setPriority(p.val)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${priority === p.val ? `${p.color} ring-2 ring-offset-1 ring-blue-500` : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'}`}
                      >
                        {p.val}
                      </button>
                    ))}
                  </div>
                  {priority === 'Important' && <p className="text-[11px] text-amber-600 mt-1">📢 Shows as a banner in the portal</p>}
                  {priority === 'Urgent' && <p className="text-[11px] text-red-600 mt-1">🚨 Triggers push notification to all recipients</p>}
                </div>

                {/* Publishing */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Publishing</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input type="radio" checked={publishImmediate} onChange={() => setPublishImmediate(true)} className="text-blue-600 focus:ring-blue-600" />
                      Immediately
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input type="radio" checked={!publishImmediate} onChange={() => setPublishImmediate(false)} className="text-blue-600 focus:ring-blue-600" />
                      Scheduled
                    </label>
                  </div>
                  {!publishImmediate && (
                    <div className="mt-3 flex gap-3">
                      <input type="date" value={publishAtDate} onChange={e => setPublishAtDate(e.target.value)} required={!publishImmediate} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg dark:bg-slate-950 dark:text-white text-sm" />
                      <input type="time" value={publishAtTime} onChange={e => setPublishAtTime(e.target.value)} required={!publishImmediate} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg dark:bg-slate-950 dark:text-white text-sm" />
                    </div>
                  )}
                </div>

                {/* Expiry */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date <span className="text-slate-400 font-normal">(Optional — auto-archives)</span></label>
                  <input type="date" value={expireAtDate} onChange={e => setExpireAtDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg dark:bg-slate-950 dark:text-white text-sm" />
                </div>

                {/* Pin toggle */}
                <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium cursor-pointer p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-600 w-4 h-4" />
                  <div className="flex items-center gap-2">
                    <Pin size={14} className="text-orange-500" /> Pin to top of bulletin board
                  </div>
                </label>

                {/* Attachment upload area */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Attachment</label>
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer text-center">
                    <Paperclip size={24} className="mb-2" />
                    <span className="text-sm font-medium">Click to upload (Max 10MB)</span>
                    <span className="text-xs">PDF, PNG, JPG</span>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <button
                type="submit"
                form="announcement-form"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : editingAnn ? "Save Changes" : publishImmediate ? "Publish Now" : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
