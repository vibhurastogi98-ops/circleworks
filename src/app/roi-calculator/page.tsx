"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { 
  Calculator, 
  DollarSign, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Mail,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TOOLS = [
  "ADP", 
  "Gusto", 
  "QuickBooks", 
  "Rippling", 
  "Spreadsheets",
  "Paychex",
  "Workday",
  "Other"
];

export default function ROICalculatorPage() {
  // Inputs state
  const [employees, setEmployees] = useState(50);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [hours, setHours] = useState(40);
  const [hourlyRate, setHourlyRate] = useState(35);
  const [errors, setErrors] = useState(2);
  const [errorCost, setErrorCost] = useState(500);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Toggle tool selection
  const toggleTool = (tool: string) => {
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter(t => t !== tool));
    } else {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  // Calculations
  const currentAdminCost = (hours * 12 * hourlyRate);
  const currentErrorCost = (errors * 12 * errorCost);
  const currentTotalCost = currentAdminCost + currentErrorCost;

  const circleWorksCost = employees * 14 * 12; // Pro plan at $14/user/mo
  
  const timeSavedPerMonth = hours * 0.7; // 70% time savings
  const newAdminCost = (hours - timeSavedPerMonth) * 12 * hourlyRate;
  
  // Assume errors are eliminated or significantly reduced (we'll assume 100% eliminated for ROI)
  const estimatedSavings = currentTotalCost - circleWorksCost - newAdminCost;

  const chartData = [
    {
      name: "Current Stack",
      "Admin Time": currentAdminCost,
      "Error Costs": currentErrorCost,
      "Software Cost": 0, // Simplified, could add average software cost based on selectedTools
    },
    {
      name: "With CircleWorks",
      "Admin Time": newAdminCost,
      "Error Costs": 0, // Eliminated
      "Software Cost": circleWorksCost,
    }
  ];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Calculate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">ROI with CircleWorks</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              See how much time and money you can save by consolidating your HR, payroll, and benefits into one unified platform.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: INPUTS */}
            <div className="w-full lg:w-5/12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Current Setup</h2>
              </div>

              <div className="space-y-8">
                {/* 1. Employees */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" /> Number of Employees
                    </label>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{employees}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="500" 
                    value={employees} 
                    onChange={(e) => setEmployees(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-slate-700"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>1</span>
                    <span>500</span>
                  </div>
                </div>

                {/* 2. Tools */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-3">
                    Current Tools You Use
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TOOLS.map(tool => (
                      <button
                        key={tool}
                        onClick={() => toggleTool(tool)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-all border ${
                          selectedTools.includes(tool)
                            ? "bg-blue-50 dark:bg-blue-500/10 border-blue-600 text-blue-700 dark:text-blue-400 font-medium"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        {tool}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Hours on manual tasks */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" /> Manual HR Hours / Month
                    </label>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{hours} hrs</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={hours} 
                    onChange={(e) => setHours(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-slate-700"
                  />
                </div>

                {/* 4. Hourly Rate */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                    Hourly Rate of HR Staff ($)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* 5. Payroll Errors */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-slate-400" /> Payroll Errors / Month
                    </label>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{errors}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="20" 
                    value={errors} 
                    onChange={(e) => setErrors(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-slate-700"
                  />
                </div>

                {/* 6. Error Cost */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                    Average Cost per Error ($)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={errorCost}
                      onChange={(e) => setErrorCost(parseInt(e.target.value) || 0)}
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: RESULTS */}
            <div className="w-full lg:w-7/12 space-y-6">
              
              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card 1 */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Current Annual Cost</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(currentTotalCost)}</p>
                  <p className="text-xs text-slate-400 mt-2">Admin time + error costs</p>
                </div>
                
                {/* Card 2 */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30 shadow-sm flex flex-col justify-center">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">CircleWorks Annual Cost</p>
                  <p className="text-3xl font-bold text-blue-800 dark:text-blue-300">{formatCurrency(circleWorksCost)}</p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-2">Based on Pro plan ($14/user/mo)</p>
                </div>

                {/* Card 3 - Hero Metric */}
                <div className="sm:col-span-2 bg-gradient-to-br from-blue-600 to-cyan-500 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <DollarSign className="w-48 h-48" />
                  </div>
                  <p className="text-blue-100 font-medium mb-1 relative z-10">Estimated Annual Savings</p>
                  <p className="text-5xl font-extrabold relative z-10">{formatCurrency(Math.max(0, estimatedSavings))}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm bg-white/20 w-fit px-3 py-1.5 rounded-full relative z-10">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pays for itself in {estimatedSavings > 0 ? ((circleWorksCost / (estimatedSavings + circleWorksCost)) * 12).toFixed(1) : "N/A"} months</span>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="sm:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Clock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Time Saved Per Month</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{timeSavedPerMonth.toFixed(0)} hours</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">That's {(timeSavedPerMonth / 8).toFixed(1)} work days freed up for strategic HR.</p>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-80">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Cost Breakdown Comparison</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} tick={{ fill: '#64748b' }} />
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(Number(value))}
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="Admin Time" stackId="a" fill="#94a3b8" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="Error Costs" stackId="a" fill="#f87171" />
                    <Bar dataKey="Software Cost" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* CTA Section */}
              <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-2xl text-center text-white shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
                <h3 className="text-2xl font-bold mb-4">Save {formatCurrency(Math.max(0, estimatedSavings))} this year</h3>
                <p className="text-slate-300 mb-6 max-w-md mx-auto">
                  Stop overpaying for fragmented tools and manual errors. Start your free trial today.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                  <a href="/signup" className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                    Start your free trial <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href="/contact" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors backdrop-blur-sm">
                    Book a Demo
                  </a>
                </div>

                {/* Email Capture */}
                <div className="max-w-sm mx-auto pt-6 border-t border-white/10">
                  <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
                    <label className="text-sm text-slate-300 font-medium">Email me this report</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="work@email.com" 
                          className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="px-4 py-2.5 bg-white text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors shrink-0 flex items-center justify-center"
                        disabled={emailSent}
                      >
                        {emailSent ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : "Send"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Assumptions Accordion */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <button 
                  onClick={() => setShowAssumptions(!showAssumptions)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    How we calculate this
                  </span>
                  {showAssumptions ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                <AnimatePresence>
                  {showAssumptions && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-sm text-slate-600 dark:text-slate-400 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4"
                    >
                      <p><strong>Current HR Admin Cost:</strong> Calculated as (Manual HR Hours per Month × 12 months × Hourly Rate) + (Payroll Errors per Month × 12 months × Average Cost per Error).</p>
                      <p><strong>CircleWorks Annual Cost:</strong> Based on our Pro plan pricing of $14 per user per month, billed annually.</p>
                      <p><strong>Time Saved:</strong> We estimate CircleWorks saves 70% of manual HR time through automated workflows, self-service portals, and unified data.</p>
                      <p><strong>Error Reduction:</strong> For the purpose of this calculation, we assume unified data eliminates 100% of costly manual data entry errors.</p>
                      <p><em>Note: This calculator provides an estimate. Actual savings may vary based on your specific business processes and implementation.</em></p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
