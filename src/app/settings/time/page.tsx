"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Users, DollarSign, Clock, LayoutGrid, CheckCircle, Loader2 } from 'lucide-react';

export default function TimeAndProjectsSettings() {
  const [showCreate, setShowCreate] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    budget: '',
    status: 'Active'
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, cliRes, empRes] = await Promise.all([
          fetch("/api/agency/projects"),
          fetch("/api/agency/clients"),
          fetch("/api/employees")
        ]);
        const [proj, cli, emp] = await Promise.all([
          projRes.json(),
          cliRes.json(),
          empRes.json()
        ]);
        if (proj.success) setProjects(proj.projects);
        if (cli.success) setClients(cli.clients);
        if (emp.success) setEmployees(emp.employees);
      } catch (err) {
        console.error("Failed to fetch settings data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/agency/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          companyId: 1, // Default for demo
          budget: formData.budget ? parseInt(formData.budget) * 100 : 0
        })
      });
      const data = await res.json();
      if (data.success) {
        setProjects([data.project, ...projects]);
        setShowCreate(false);
        setFormData({ name: '', clientId: '', budget: '', status: 'Active' });
      }
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Time & Projects</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage client projects, billable hours, and team assignments.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">New Project</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="e.g. Website Redesign" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client</label>
              <select 
                value={formData.clientId}
                onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Budget ($)</label>
              <input 
                type="number" 
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="10000" 
              />
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Assign Team Members</h3>
            <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Select employees who can log time to this project.</p>
              <div className="flex flex-wrap gap-2">
                {employees.map(emp => (
                  <label key={emp.id} className="inline-flex items-center gap-1 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 px-2 py-1 rounded-md text-xs font-medium cursor-pointer">
                    <input type="checkbox" className="rounded text-indigo-600" /> {emp.firstName} {emp.lastName}
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
            <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">Save Project</button>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font-medium">Project</th>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Rate / Budget</th>
                <th className="px-6 py-3 font-medium">Team</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No projects found.</td>
                </tr>
              ) : projects.map(proj => (
                <tr key={proj.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{proj.name}</div>
                    <div className="text-xs text-slate-500">ID: {proj.id}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{proj.client?.name || 'Internal'}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <div>Budget: ${((proj.budget || 0) / 100).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-medium text-indigo-700">T</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {proj.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
