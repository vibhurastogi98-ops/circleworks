"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEmployees } from "@/hooks/useEmployees";
import { useQueryClient } from "@tanstack/react-query";
import { useDataSync } from "@/hooks/useDataSync";
import { toast } from "sonner";
import {
  Search, Filter, Plus, Upload, Download, Grid, List,
  MoreVertical, Network, Loader2, Edit, Trash2, Mail, Phone, UserX
} from "lucide-react";
import { format } from "date-fns";

interface Employee {
  id: string | number;
  firstName: string;
  lastName?: string;
  email?: string;
  jobTitle?: string;
  department?: string;
  employmentType?: string;
  status?: string;
  avatar?: string;
  location?: string;
  locationType?: string;
  startDate?: string | Date;
  salary?: string | number;
  phone?: string;
}

export default function EmployeesDirectoryPage() {
  const router = useRouter();
  const { data: employees = [], isLoading, error } = useEmployees();
  const queryClient = useQueryClient();
  const { notifyEmployeeChange } = useDataSync();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Debug: Log employee data
  console.log("Employee data from API:", employees);
  console.log("Number of employees:", employees?.length || 0);

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-semibold">Error loading employees</h3>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error.message || "Unknown error occurred"}</p>
        </div>
      </div>
    );
  }

  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() => {
    if (!employees || employees.length === 0) return [];
    
    const filtered = (employees as Employee[]).filter((emp: Employee) => {
      const matchSearch = (`${emp.firstName} ${emp.lastName || ""} ${emp.jobTitle || ""}`).toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === "All" || emp.department === deptFilter;

      // Case-insensitive status matching to handle "onboarding" vs "Onboarding"
      const matchStatus = statusFilter === "All" ||
        emp.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchDept && matchStatus;
    });
    
    console.log("Filtered employees:", filtered);
    console.log("Search term:", search);
    console.log("Department filter:", deptFilter);
    console.log("Status filter:", statusFilter);
    
    return filtered;
  }, [employees, search, deptFilter, statusFilter]);

  const handleActionClick = async (employeeId: string, action: string) => {
    console.log(`Action: ${action} for employee: ${employeeId}`);
    setActiveDropdown(null);
    
    // Add a small delay to ensure the dropdown closes before executing the action
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Handle different actions
    switch (action) {
      case 'edit':
        // Navigate to edit page
        router.push(`/employees/${employeeId}/edit`);
        break;
      case 'delete':
        try {
          const response = await fetch(`/api/employees/${employeeId}`, {
            method: 'DELETE',
          });
          
          if (response.ok) {
            toast.success('Employee deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            notifyEmployeeChange();
          } else {
            toast.error('Failed to delete employee');
          }
        } catch (error) {
          console.error('Delete error:', error);
          toast.error('Error deleting employee');
        }
        break;
      case 'email':
        // Send email
        window.location.href = `mailto:${employees.find((emp: any) => emp.id === employeeId)?.email}`;
        break;
      case 'call':
        // Make call
        const phone = employees.find((emp: any) => emp.id === employeeId)?.phone;
        if (phone) {
          window.location.href = `tel:${phone}`;
        } else {
          toast.error('Phone number not available');
        }
        break;
      case 'terminate':
        toast.info('Termination feature coming soon');
        break;
      default:
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const target = event.target as Element;
        // Check if click is outside any dropdown menu
        const isInsideDropdown = target.closest('[data-dropdown-menu]');
        if (!isInsideDropdown) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const handleDownloadCSV = () => {
    console.log("CSV download button clicked!");
    
    // Create CSV headers
    const headers = [
      'First Name',
      'Last Name', 
      'Email',
      'Job Title',
      'Department',
      'Employment Type',
      'Start Date',
      'Salary',
      'Location Type',
      'Status'
    ];
    
    let csvContent;
    let filename;
    
    if (filteredEmployees.length === 0) {
      // Create template with sample data
      const sampleData = [
        'John',
        'Doe',
        'john.doe@company.com',
        'Software Engineer',
        'Engineering',
        'Full-Time',
        '2024-01-15',
        '85000',
        'Remote',
        'Active'
      ];
      
      csvContent = [
        headers.join(','),
        sampleData.join(',')
      ].join('\n');
      filename = 'employee_template.csv';
      toast.success('CSV template downloaded successfully');
    } else {
      // Export current employee data
      const employeeRows = (filteredEmployees as Employee[]).map((emp: Employee) => [
        emp.firstName || '',
        emp.lastName || '',
        emp.email || '',
        emp.jobTitle || '',
        emp.department || '',
        emp.employmentType || '',
        emp.startDate ? format(new Date(emp.startDate), 'yyyy-MM-dd') : '',
        emp.salary || '',
        emp.locationType || '',
        emp.status || ''
      ]);
      
      csvContent = [
        headers.join(','),
        ...employeeRows.map((row: any[]) => row.join(','))
      ].join('\n');
      filename = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
      toast.success(`Exported ${filteredEmployees.length} employees to CSV`);
    }
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add programmatic event listener as backup
  useEffect(() => {
    const button = document.getElementById('csv-download-btn');
    if (button) {
      const handleClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("CSV download button clicked via programmatic listener!");
        handleDownloadCSV();
      };
      
      button.addEventListener('click', handleClick, true);
      
      return () => {
        button.removeEventListener('click', handleClick, true);
      };
    }
  }, [handleDownloadCSV]);

  const departments = ["All", "Engineering", "Product", "Design", "Sales", "Marketing", "HR", "Finance", "Executive"];
  const statuses = ["All", "Active", "On Leave", "Terminated", "Onboarding"];

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'active': return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30";
      case 'on leave': return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";
      case 'onboarding': return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30";
      case 'terminated': return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30";
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
              onClick={() => {
                console.log("List view clicked");
                setViewMode("list");
              }}
              className={`p-1.5 rounded-md transition-all flex items-center justify-center ${viewMode === "list" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              title="List View"
            >
              <List size={18} />
              <span className="sr-only">List</span>
            </button>
            <button
              onClick={() => {
                console.log("Grid view clicked");
                setViewMode("grid");
              }}
              className={`p-1.5 rounded-md transition-all flex items-center justify-center ${viewMode === "grid" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              title="Grid View"
            >
              <Grid size={18} />
              <span className="sr-only">Grid</span>
            </button>
          </div>
          <Link href="/employees/org-chart" className="p-2 ml-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-800/50" title="View Org Chart">
            <Network size={20} />
          </Link>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("CSV download button clicked!");
                handleDownloadCSV();
              }}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-transparent hover:border-blue-100 dark:hover:border-blue-800/50" 
              title="Export CSV"
              type="button"
              id="csv-download-btn"
            >
              <Download size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Directory Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading employees...</p>
        </div>
      ) : viewMode === "list" ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <div className="overflow-x-visible">
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
                {(filteredEmployees as Employee[]).map((emp: Employee) => (
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
                      <div className="font-medium">{emp.jobTitle}</div>
                      <div className="text-[13px] text-slate-500 dark:text-slate-400">{emp.department} • {emp.employmentType}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {emp.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {emp.startDate ? format(new Date(emp.startDate), "MMM d, yyyy") : "Not set"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(emp.status || "")}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === emp.id ? null : emp.id);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                        aria-label={`Actions for ${emp.firstName} ${emp.lastName}`}
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {activeDropdown === emp.id && (
                        <div 
                          data-dropdown-menu 
                          className="absolute right-4 top-12 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-[100] overflow-hidden"
                          style={{ minWidth: '180px' }}
                        >
                          <button
                            onClick={() => handleActionClick(emp.id, 'edit')}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                          >
                            <Edit size={14} />
                            Edit Employee
                          </button>
                          <button
                            onClick={() => handleActionClick(emp.id, 'email')}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                          >
                            <Mail size={14} />
                            Send Email
                          </button>
                          <button
                            onClick={() => handleActionClick(emp.id, 'call')}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                          >
                            <Phone size={14} />
                            Call Employee
                          </button>
                          <div className="border-t border-slate-200 dark:border-slate-700"></div>
                          <button
                            onClick={() => handleActionClick(emp.id, 'terminate')}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                          >
                            <UserX size={14} />
                            Terminate
                          </button>
                          <button
                            onClick={() => handleActionClick(emp.id, 'delete')}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
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
          {(filteredEmployees as Employee[]).map((emp: Employee) => (
            <div key={emp.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 group">
              <div className="flex justify-between items-start">
                <Link href={`/employees/${emp.id}`} className="focus:outline-none">
                  <img src={emp.avatar} alt="" className="w-14 h-14 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800 shadow-sm object-cover" />
                </Link>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(emp.status || "")}`}>
                  {emp.status}
                </span>
              </div>
              <div>
                <Link href={`/employees/${emp.id}`} className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors focus:outline-none line-clamp-1">
                  {emp.firstName} {emp.lastName}
                </Link>
                <div className="font-medium text-sm text-slate-700 dark:text-slate-300 mt-0.5 line-clamp-1">{emp.jobTitle}</div>
                <div className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">{emp.department}</div>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center relative">
                <div className="text-xs text-slate-500 dark:text-slate-400">{emp.locationType}</div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === emp.id ? null : emp.id);
                  }}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
                
                {/* Dropdown Menu */}
                {activeDropdown === emp.id && (
                  <div data-dropdown-menu className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
                    <button
                      onClick={() => handleActionClick(emp.id, 'edit')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                    >
                      <Edit size={14} />
                      Edit Employee
                    </button>
                    <button
                      onClick={() => handleActionClick(emp.id, 'email')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                    >
                      <Mail size={14} />
                      Send Email
                    </button>
                    <button
                      onClick={() => handleActionClick(emp.id, 'call')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                    >
                      <Phone size={14} />
                      Call Employee
                    </button>
                    <div className="border-t border-slate-200 dark:border-slate-700"></div>
                    <button
                      onClick={() => handleActionClick(emp.id, 'terminate')}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                    >
                      <UserX size={14} />
                      Terminate
                    </button>
                    <button
                      onClick={() => handleActionClick(emp.id, 'delete')}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}
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
