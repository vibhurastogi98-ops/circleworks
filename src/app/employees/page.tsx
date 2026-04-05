"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useEmployees } from "@/hooks/useEmployees";
import { Employee, Department, EmploymentStatus } from "@/data/mockEmployees";
import { 
  Search, Filter, Plus, Upload, Download, Grid, List as ListIcon, 
  MoreVertical, Network, Loader2
} from "lucide-react";
import { format } from "date-fns";

export default function EmployeesDirectoryPage() {
  const { data: employees = [], isLoading, error } = useEmployees();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("Active");

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = (emp.firstName + " " + emp.lastName + " " + emp.title).toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === "All" || emp.department === deptFilter;
      const matchStatus = statusFilter === "All" || emp.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [employees, search, deptFilter, statusFilter]);

  const departments = ["All", "Engineering", "Product", "Design", "Sales", "Marketing", "HR", "Finance", "Executive"];
  const statuses = ["All", "Active", "On Leave", "Terminated", "Onboarding"];

  const getStatusColor = (status: EmploymentStatus) => {
    switch (status) {
      case 'Active': return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30";
      case 'On Leave': return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";
      case 'Onboarding': return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30";
      case 'Terminated': return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">People Directory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your team members and contractors.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/employees/bulk" className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
            <Upload size={16} />
            <span className="hidden sm:inline">Import</span>
          </Link>
          <Link href="/employees/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus size={16} />
            <span>Add Person</span>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search people..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="text-slate-400 ml-1 hidden sm:block" size={18} />
            <select 
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white flex-1 sm:flex-none cursor-pointer"
            >
              <optgroup label="Department">
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </optgroup>
            </select>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white flex-1 sm:flex-none cursor-pointer"
            >
              <optgroup label="Status">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </optgroup>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center shadow-inner">
            <button 
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              <ListIcon size={18} />
            </button>
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              <Grid size={18} />
            </button>
          </div>
          <Link href="/employees/org-chart" className="p-2 ml-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-800/50" title="View Org Chart">
            <Network size={20} />
          </Link>
          <button className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors" title="Export CSV">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Directory Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
           <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
           <p className="text-slate-500 font-medium">Loading employees...</p>
        </div>
      ) : viewMode === "list" ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="employee-table">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                  <th scope="col" className="px-6 py-4 whitespace-nowrap">Employee</th>
                  <th scope="col" className="px-6 py-4 whitespace-nowrap">Role</th>
                  <th scope="col" className="px-6 py-4 whitespace-nowrap">Location</th>
                  <th scope="col" className="px-6 py-4 whitespace-nowrap">Start Date</th>
                  <th scope="col" className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th scope="col" className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 focus-within:bg-slate-50/50 dark:focus-within:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <Link href={`/employees/${emp.id}`} className="flex items-center gap-3 w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1 -m-1">
                        <img src={emp.avatar} alt="" className="w-10 h-10 rounded-full bg-slate-200 border border-slate-200 dark:border-slate-700 object-cover" />
                        <div>
                          <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-[13px] text-slate-500 dark:text-slate-400">{emp.email}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      <div className="font-medium">{emp.title}</div>
                      <div className="text-[13px] text-slate-500 dark:text-slate-400">{emp.department} • {emp.type}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {emp.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {format(new Date(emp.startDate), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(emp.status)}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                        aria-label={`Actions for ${emp.firstName} ${emp.lastName}`}
                      >
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredEmployees.length === 0 && (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              No employees found matching your criteria.
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEmployees.map(emp => (
            <div key={emp.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 group">
              <div className="flex justify-between items-start">
                <Link href={`/employees/${emp.id}`} className="focus:outline-none">
                  <img src={emp.avatar} alt="" className="w-14 h-14 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800 shadow-sm object-cover" />
                </Link>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(emp.status)}`}>
                  {emp.status}
                </span>
              </div>
              <div>
                <Link href={`/employees/${emp.id}`} className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors focus:outline-none line-clamp-1">
                  {emp.firstName} {emp.lastName}
                </Link>
                <div className="font-medium text-sm text-slate-700 dark:text-slate-300 mt-0.5 line-clamp-1">{emp.title}</div>
                <div className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">{emp.department}</div>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="text-xs text-slate-500 dark:text-slate-400">{emp.locationType}</div>
                <button className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          ))}
          {filteredEmployees.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl border-dashed">
              No employees found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
