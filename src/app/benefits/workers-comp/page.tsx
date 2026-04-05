"use client";

import React from "react";
import { Shield, Download, FileText, AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { mockWcClaims } from "@/data/mockBenefits";

export default function WorkersCompPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workers&apos; Compensation</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Policy details, class codes, premium logs, and claims management.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
            <FileText size={16} /> Generate COI
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
            <Download size={16} /> Year-End Audit Export
          </button>
        </div>
      </div>

      {/* Policy Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Shield size={18} className="text-blue-500" /> Policy Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-8">
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Carrier</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">Hartford Insurance</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Policy Number</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">WC-2024-4458</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Effective Period</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">Jan 1 – Dec 31, 2024</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Annual Premium</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">$18,400</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Experience Mod</span>
              <span className="text-sm font-bold text-green-600">0.92</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Premium Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">YTD Premiums Paid</span>
              <span className="font-bold text-slate-900 dark:text-white">$13,800</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Remaining</span>
              <span className="font-bold text-slate-900 dark:text-white">$4,600</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-blue-500" style={{ width: '75%' }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Open Claims</span>
              <span className="font-bold text-amber-600">{mockWcClaims.filter(c => c.status === 'Open').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Claims Paid</span>
              <span className="font-bold text-slate-900 dark:text-white">${mockWcClaims.reduce((s, c) => s + c.totalPaid, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Class Codes */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Class Code Assignments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Class Code</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Job Titles</th>
                <th className="px-6 py-3 text-right">Rate per $100</th>
                <th className="px-6 py-3 text-right">Employees</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { code: '8810', desc: 'Clerical Office', titles: 'HR, Admin, Accounting', rate: 0.18, employees: 12 },
                { code: '8742', desc: 'Sales Outside', titles: 'Sales Rep, Account Exec', rate: 0.42, employees: 8 },
                { code: '7600', desc: 'Telecom / Engineering', titles: 'Software Engineer, DevOps', rate: 0.35, employees: 20 },
                { code: '8017', desc: 'Warehouse / Fulfillment', titles: 'Warehouse Staff, Shipping', rate: 1.85, employees: 5 },
              ].map((cc, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{cc.code}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{cc.desc}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{cc.titles}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">${cc.rate.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">{cc.employees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claims List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Claims</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Date of Injury</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Total Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockWcClaims.map(claim => (
                <tr key={claim.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{claim.employeeName}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(claim.dateOfInjury).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{claim.description}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
                      ${claim.status === 'Open' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        claim.status === 'Closed' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                        claim.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {claim.status === 'Open' && <AlertTriangle size={12}/>}
                      {claim.status === 'Closed' && <CheckCircle2 size={12}/>}
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">${claim.totalPaid.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
