"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEmployee } from "@/hooks/useEmployees";
import { useQueryClient } from "@tanstack/react-query";
import { useDataSync } from "@/hooks/useDataSync";
import { toast } from "sonner";
import { ArrowLeft, Save, X, Check, UploadCloud, Landmark, ShieldCheck } from "lucide-react";

const STEPS = ["Personal Info", "Employment", "Compensation", "Tax & Banking"];

export default function EditEmployeePage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { notifyEmployeeChange } = useDataSync();
  const { data: employee, isLoading, error } = useEmployee(id as string);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    personalEmail: "",
    workEmail: "",
    jobTitle: "",
    department: "",
    type: "Full-Time",
    locationType: "Remote",
    salary: "",
    payFrequency: "Bi-Weekly",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    plaidAccessToken: "",
  });

  // Populate form with employee data when it loads
  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        personalEmail: employee.personalEmail || "",
        workEmail: employee.email || "",
        jobTitle: employee.jobTitle || "",
        department: employee.department || "",
        type: employee.employmentType === "full-time" ? "Full-Time" : 
              employee.employmentType === "part-time" ? "Part-Time" : "Contractor",
        locationType: employee.locationType || "Remote",
        salary: employee.salary?.toString() || "",
        payFrequency: employee.payFrequency || "Bi-Weekly",
        bankName: employee.bankName || "",
        accountNumber: employee.accountNumber || "",
        routingNumber: employee.routingNumber || "",
        plaidAccessToken: employee.plaidAccessToken || "",
      });
    }
  }, [employee]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">Failed to load employee data</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const validateStep = (step: number) => {
    switch(step) {
      case 0:
        return formData.firstName && formData.lastName && formData.workEmail;
      case 1:
        return formData.jobTitle && formData.department;
      case 2:
        return formData.salary && formData.payFrequency;
      case 3:
        return formData.bankName && formData.routingNumber && formData.accountNumber;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save employee data
      await handleSave();
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.workEmail,
        jobTitle: formData.jobTitle,
        department: formData.department,
        employmentType: formData.type.toLowerCase(),
        startDate: employee.startDate, // Keep original start date
        salary: parseInt(formData.salary),
        locationType: formData.locationType,
        bankInfo: {
          bankName: formData.bankName,
          routingNumber: formData.routingNumber,
          accountNumberMasked: formData.accountNumber,
          plaidAccessToken: formData.plaidAccessToken,
        },
        compensation: {
          salary: parseInt(formData.salary),
          payFrequency: formData.payFrequency,
        }
      };

      const response = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to update employee");
        setIsSubmitting(false);
        return;
      }

      toast.success("Employee updated successfully");
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      notifyEmployeeChange();
      router.push("/employees");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update employee. Please check your connection.");
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Personal Email</label>
              <input
                type="email"
                value={formData.personalEmail}
                onChange={(e) => setFormData({...formData, personalEmail: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="jane.smith@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Work Email *</label>
              <input
                type="email"
                value={formData.workEmail}
                onChange={(e) => setFormData({...formData, workEmail: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="jane.smith@company.com"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Title *</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Employment Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contractor">Contractor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location Type</label>
              <select
                value={formData.locationType}
                onChange={(e) => setFormData({...formData, locationType: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="On-Site">On-Site</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Salary *</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="75000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pay Frequency</label>
              <select
                value={formData.payFrequency}
                onChange={(e) => setFormData({...formData, payFrequency: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Weekly">Weekly</option>
                <option value="Bi-Weekly">Bi-Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bank Name *</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Chase Bank"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Routing Number *</label>
              <input
                type="text"
                value={formData.routingNumber}
                onChange={(e) => setFormData({...formData, routingNumber: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Account Number *</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="********1234"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Employee</h1>
          <p className="text-slate-500 dark:text-slate-400">{employee.firstName} {employee.lastName}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {index < currentStep ? <Check size={16} /> : index + 1}
              </div>
              <span className={`text-sm font-medium ${
                index <= currentStep 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {step}
              </span>
              {index < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            {STEPS[currentStep]}
          </h2>
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <button 
            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Back
          </button>
          <button 
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : currentStep === STEPS.length - 1 ? (
              <>Save Changes <Check size={16} /></>
            ) : (
              <>Next <ArrowLeft size={16} className="rotate-180" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
