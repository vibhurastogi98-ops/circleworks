"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check, UploadCloud, FileText, AlertCircle, Download, Loader2 } from "lucide-react";

const STEPS = ["Upload File", "Map Fields", "Review & Import"];

export default function BulkImportPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // Mock field mapping
  const [mapping, setMapping] = useState({
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    jobTitle: "Role",
    department: "Dept"
  });

  const handleNext = async () => {
    if (currentStep === 0 && !file) {
      toast.error("Please upload a CSV file to continue.");
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      // FINAL STEP - PERFORM IMPORT
      if (isImporting) return;
      setIsImporting(true);
      
      try {
        // Prepare data based on mapping
        const employeesToImport = parsedData.map(row => {
          return {
            firstName: row[mapping.firstName] || '',
            lastName: row[mapping.firstName === mapping.lastName ? 'IGNORE' : mapping.lastName] || '', // Handle if user mapped same col
            email: row[mapping.email] || '',
            jobTitle: row[mapping.jobTitle] || '',
            department: row[mapping.department] || '',
            employmentType: 'full-time', // Default
            locationType: 'Remote',     // Default
          };
        }).filter(emp => emp.firstName && emp.email); // Basic validation

        const response = await fetch('/api/employees/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employees: employeesToImport }),
        });

        if (response.ok) {
          const result = await response.json();
          toast.success(`Success! ${result.count} employees imported.`);
          router.push("/employees");
        } else {
          toast.error("Failed to import employees. Please try again.");
        }
      } catch (err) {
        console.error("Import error:", err);
        toast.error("An error occurred during import.");
      } finally {
        setIsImporting(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim());
          setCsvHeaders(headers);
          
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj: any = {};
            headers.forEach((header, i) => {
              obj[header] = values[i] || '';
            });
            return obj;
          });
          setParsedData(data);
          
          // Auto-map if possible
          const newMapping = { ...mapping };
          headers.forEach(header => {
            const h = header.toLowerCase().replace(/[\s_-]/g, '');
            if (h === 'firstname') newMapping.firstName = header;
            if (h === 'lastname') newMapping.lastName = header;
            if (h === 'email' || h === 'emailaddress') newMapping.email = header;
            if (h === 'jobtitle' || h === 'role') newMapping.jobTitle = header;
            if (h === 'department' || h === 'dept') newMapping.department = header;
          });
          setMapping(newMapping);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleDownloadCSV = () => {
    // Create CSV template with headers for bulk import
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
      'Bank Name',
      'Routing Number',
      'Account Number'
    ];
    
    // Create sample data rows for bulk import
    const sampleData = [
      [
        'John',
        'Doe',
        'john.doe@company.com',
        'Software Engineer',
        'Engineering',
        'Full-Time',
        '2024-01-15',
        '85000',
        'Remote',
        'Chase Bank',
        '123456789',
        '********1234'
      ],
      [
        'Jane',
        'Smith',
        'jane.smith@company.com',
        'Product Manager',
        'Product',
        'Full-Time',
        '2024-02-01',
        '95000',
        'Hybrid',
        'Bank of America',
        '987654321',
        '********5678'
      ],
      [
        'Mike',
        'Johnson',
        'mike.johnson@company.com',
        'UX Designer',
        'Design',
        'Part-Time',
        '2024-03-01',
        '65000',
        'On-Site',
        'Wells Fargo',
        '456789123',
        '********9012'
      ]
    ];
    
    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'bulk_employee_template.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link href="/employees" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors w-fit">
          <ChevronLeft size={16} /> Back to Directory
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bulk Import Employees</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 flex flex-col">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200 dark:border-slate-800 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 -z-10" />
          {STEPS.map((step, idx) => {
             const isActive = currentStep === idx;
             const isPast = currentStep > idx;
             return (
               <div key={step} className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900 px-2 pt-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                    ${isActive ? "border-blue-600 bg-blue-600 text-white" : 
                      isPast ? "border-green-500 bg-green-500 text-white" : 
                      "border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-900"}`}
                  >
                    {isPast ? <Check size={18} /> : idx + 1}
                  </div>
                  <span className={`text-sm font-semibold max-w-[80px] text-center ${isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                    {step}
                  </span>
               </div>
             )
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          {currentStep === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 pt-4 animate-in fade-in duration-500">
              <label 
                className={`border-2 border-dashed rounded-xl w-full max-w-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors
                  ${file ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"}
                `}
              >
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                {file ? (
                   <>
                     <FileText size={40} className="text-blue-500" />
                     <div className="text-center">
                       <p className="font-semibold text-sm text-slate-900 dark:text-white">{file.name}</p>
                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{(file.size / 1024).toFixed(2)} KB</p>
                     </div>
                   </>
                ) : (
                   <>
                     <UploadCloud size={40} className="text-slate-400" />
                     <div className="text-center">
                       <p className="font-semibold text-sm text-slate-900 dark:text-white">Click to upload or drag and drop</p>
                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">CSV file only (max 10MB)</p>
                     </div>
                   </>
                )}
              </label>
              
              <div className="mt-2">
                 <button 
                   onClick={handleDownloadCSV}
                   className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors"
                 >
                   <Download size={16} />
                   Download CSV Template
                 </button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg flex items-start gap-3">
                 <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={18} />
                 <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Please map your CSV columns</h4>
                    <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">We guessed some of the mappings based on column headers. Please verify to ensure data is imported correctly.</p>
                 </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 font-medium text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3">CircleWorks Field</th>
                      <th className="px-4 py-3">Your CSV Column</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {Object.entries(mapping).map(([sysField, csvCol]) => (
                      <tr key={sysField}>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white capitalize">{sysField.replace(/([A-Z])/g, ' $1').trim()}</td>
                        <td className="px-4 py-3">
                           <select 
                             value={csvCol}
                             onChange={(e) => setMapping({...mapping, [sysField]: e.target.value})}
                             className="w-full max-w-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm focus:ring-2 focus:ring-blue-500"
                           >
                              <option value="Ignore">Ignore</option>
                              {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                           </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentStep === 2 && (
             <div className="flex flex-col items-center justify-center pt-4 gap-6 animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                   <UsersIcon size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-center max-w-md">
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white">Ready to Import {parsedData.length} Employees</h3>
                   <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">All fields are mapped successfully. Clicking finish will import the records and take you back to the directory.</p>
                </div>
             </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Back
          </button>
          <button 
            onClick={handleNext}
            disabled={isImporting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : currentStep === STEPS.length - 1 ? (
              <>Finish Import <Check size={16} /></>
            ) : (
              <>Next <ChevronRight size={16} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Just a small helper since Users is missing import above
function UsersIcon(props: any) {
   return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
         <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
         <circle cx="9" cy="7" r="4" />
         <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
         <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
   )
}
