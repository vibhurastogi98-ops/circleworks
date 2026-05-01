"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useCompanyStore } from "@/store/useCompanyStore";
import { CheckCircle2, Building2, Users, Settings, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  required: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'company',
    title: 'Set up your company',
    description: 'Add your company details and branding',
    icon: Building2,
    required: true
  },
  {
    id: 'team',
    title: 'Invite your team',
    description: 'Add team members and set permissions',
    icon: Users,
    required: false
  },
  {
    id: 'settings',
    title: 'Configure settings',
    description: 'Set up payroll, compliance, and preferences',
    icon: Settings,
    required: true
  }
];

export default function CompanyOnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { currentCompany, addCompany, setCurrentCompany } = useCompanyStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: '',
    industry: '',
    size: '',
    timezone: 'America/New_York',
    currency: 'USD'
  });

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    }
  }, [isLoaded, user, router]);

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create company
      const newCompany = {
        id: `company-${Date.now()}`,
        name: companyData.name,
        settings: {
          timezone: companyData.timezone,
          currency: companyData.currency,
          dateFormat: 'MM/dd/yyyy'
        }
      };

      addCompany(newCompany);
      setCurrentStep(1);
    } catch (error) {
      console.error('Failed to create company:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    // Mark onboarding as complete
    router.push('/dashboard');
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome to CircleWorks! 🎉
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Let's get your account set up in just a few steps
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {ONBOARDING_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index <= currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-300 dark:border-slate-600 text-slate-400'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <step.icon size={18} />
                  )}
                </div>
                {index < ONBOARDING_STEPS.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {ONBOARDING_STEPS[currentStep]?.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {ONBOARDING_STEPS[currentStep]?.description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="company-setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8"
            >
              <form onSubmit={handleCompanySubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyData.name}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Enter your company name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Industry
                    </label>
                    <select
                      value={companyData.industry}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Select industry</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="education">Education</option>
                      <option value="retail">Retail</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Company Size
                    </label>
                    <select
                      value={companyData.size}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, size: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-1000">201-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                  >
                    Skip for now
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !companyData.name.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        Continue
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="team-invite"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center"
            >
              <Users size={48} className="mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Invite Your Team
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Add team members to collaborate on HR and payroll tasks
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Invite Team Members
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center"
            >
              <Settings size={48} className="mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Configure Your Settings
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Set up payroll schedules, compliance settings, and preferences
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleComplete}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Complete Setup
                </button>
                <button
                  onClick={handleComplete}
                  className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}