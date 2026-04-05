"use client";

import React, { useState } from "react";
import { FileText, Plus, Search, Upload, CheckCircle2, Clock, XCircle, AlertTriangle, Download, Edit, Trash2, Link as LinkIcon } from "lucide-react";
import { mockDocumentTemplates } from "@/data/mockOnboarding";

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(mockDocumentTemplates.map(d => d.category)))];
  const filtered = mockDocumentTemplates.filter(d => {
    if (categoryFilter !== 'All' && d.category !== categoryFilter) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Signed': return { icon: CheckCircle2, class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
      case 'Pending Signature': return { icon: Clock, class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
      case 'Expired': return { icon: AlertTriangle, class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
      default: return { icon: XCircle, class: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' };
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Document Templates</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage reusable legal templates for offer letters, NDAs, and more.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
            <Upload size={16} /> Upload Document
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus size={16} /> Create Template
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${categoryFilter === cat ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" />
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium tracking-wide">
              <tr>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">E-Sign Status</th>
                <th className="px-6 py-4">Assigned Templates</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(doc => {
                const statusInfo = getStatusStyle(doc.esignStatus);
                const StatusIcon = statusInfo.icon;
                return (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center shrink-0">
                          <FileText size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{doc.name}</div>
                          <div className="text-xs text-slate-500">{doc.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{doc.category}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.class}`}>
                        <StatusIcon size={14} /> {doc.esignStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {doc.assignedTemplates.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <LinkIcon size={12} className="text-slate-400" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{doc.assignedTemplates.length} template{doc.assignedTemplates.length > 1 ? 's' : ''}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(doc.lastUpdated).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="Download"><Download size={16} /></button>
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded" title="Edit"><Edit size={16} /></button>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
