"use client";

import React, { useState, useEffect } from "react";
import { Plus, Megaphone, Eye, Calendar, Pin, Trash2, X, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AnnouncementsSettingsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Scheduled' | 'Expired'>('All');
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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

      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Announcement created");
        setIsSlideOverOpen(false);
        resetForm();
        fetchAnnouncements();
      } else {
        toast.error("Failed to create announcement");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
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

      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {['All', 'Active', 'Scheduled', 'Expired'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${filter === f ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {f}
          </button>
        ))}
      </div>

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
                <tr><td colSpan={5} className="p-6 text-center text-slate-500">Loading...</td></tr>
              ) : announcements.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-slate-500">No announcements found.</td></tr>
              ) : (
                announcements.map((ann) => (
                  <tr key={ann.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       {ann.isPinned && <Pin size={14} className="text-orange-500" />}
                       {ann.title}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{ann.audience}</td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          ann.status === 'Published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          ann.status === 'Scheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                       }`}>
                          {ann.status}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <Eye size={14} /> {ann.viewsCount}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(ann.id)} className="p-1.5 ml-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Panel */}
      {isSlideOverOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsSlideOverOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Announcement</h2>
              <button onClick={() => setIsSlideOverOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="announcement-form" onSubmit={handleSubmit} className="space-y-5 flex flex-col h-full">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title <span className="text-red-500">*</span></label>
                  <input
                    required
                    maxLength={100}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg dark:bg-slate-950 dark:text-white text-sm"
                    placeholder="E.g., Quarterly Townhall"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Body <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={6}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg dark:bg-slate-950 dark:text-white text-sm"
                    placeholder="Use simple markdown/text for the announcement body..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg dark:bg-slate-950 dark:text-white text-sm"
                  >
                    <option value="All Employees">All Employees</option>
                    <option value="By Department">By Department</option>
                    <option value="By Location">By Location</option>
                    <option value="Custom Group">Custom Group</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <div className="flex gap-4">
                    {['Normal', 'Important', 'Urgent'].map(p => (
                      <label key={p} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name="priority"
                          value={p}
                          checked={priority === p}
                          onChange={() => setPriority(p)}
                          className="text-blue-600 focus:ring-blue-600"
                        />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Publishing</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        checked={publishImmediate}
                        onChange={() => setPublishImmediate(true)}
                        className="text-blue-600 focus:ring-blue-600"
                      />
                      Immediately
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        checked={!publishImmediate}
                        onChange={() => setPublishImmediate(false)}
                        className="text-blue-600 focus:ring-blue-600"
                      />
                      Scheduled
                    </label>
                  </div>
                  {!publishImmediate && (
                    <div className="mt-3 flex gap-3">
                      <input type="date" value={publishAtDate} onChange={e=>setPublishAtDate(e.target.value)} required={!publishImmediate} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg dark:bg-slate-950 dark:text-white text-sm" />
                      <input type="time" value={publishAtTime} onChange={e=>setPublishAtTime(e.target.value)} required={!publishImmediate} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg dark:bg-slate-950 dark:text-white text-sm" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date (Optional)</label>
                  <input type="date" value={expireAtDate} onChange={e=>setExpireAtDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg dark:bg-slate-950 dark:text-white text-sm" />
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium">
                  <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-600" />
                  Pin to top
                </label>
                
                {/* Visual Attachment upload placeholder */}
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
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <button 
                type="submit" 
                form="announcement-form"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : publishImmediate ? "Publish Now" : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
