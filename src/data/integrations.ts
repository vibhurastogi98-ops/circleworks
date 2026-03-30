export const categories = [
  "All", "Accounting", "HR & ATS", "Identity & SSO", "Benefits", "Communication", "Background Check", "Banking", "Insurance", "Signing"
];

export const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const integrations = [
  { id: 1, name: "QuickBooks", cat: "Accounting", desc: "Sync payroll journal entries automatically", status: "Live", logo: "QB" },
  { id: 2, name: "Slack", cat: "Communication", desc: "Payroll approvals and HR alerts in Slack", status: "Live", logo: "S" },
  { id: 3, name: "Okta", cat: "Identity & SSO", desc: "SSO + auto provision/deprovision users", status: "Live", logo: "OK" },
  { id: 4, name: "Xero", cat: "Accounting", desc: "Export general ledger summaries instantly.", status: "Live", logo: "X" },
  { id: 5, name: "Google Workspace", cat: "Identity & SSO", desc: "Automated account creation during onboarding.", status: "Live", logo: "G" },
  { id: 6, name: "Microsoft Teams", cat: "Communication", desc: "Approve expenses and PTO directly from chat.", status: "Live", logo: "T" },
  { id: 7, name: "Guideline 401(k)", cat: "Benefits", desc: "360-degree integration for retirement contributions.", status: "Live", logo: "GL" },
  { id: 8, name: "Human Interest", cat: "Benefits", desc: "Automate 401(k) deductions natively.", status: "Live", logo: "HI" },
  { id: 9, name: "Brex", cat: "Banking", desc: "Sync company cards and employee expenses.", status: "Live", logo: "B" },
  { id: 10, name: "Ramp", cat: "Banking", desc: "Seamless corporate card reconciliation.", status: "Live", logo: "R" },
  { id: 11, name: "Greenhouse", cat: "HR & ATS", desc: "Push hired candidates directly into payroll.", status: "Live", logo: "GH" },
  { id: 12, name: "Lever", cat: "HR & ATS", desc: "Automated new hire data sync.", status: "Live", logo: "L" },
  { id: 13, name: "Checkr", cat: "Background Check", desc: "Trigger background checks from the offer stage.", status: "Live", logo: "C" },
  { id: 14, name: "Gusto", cat: "Accounting", desc: "Migrate historical payroll data effortlessly via API.", status: "Live", logo: "G" },
  { id: 15, name: "SimplyInsured", cat: "Insurance", desc: "Sync medical, dental, and vision deductions.", status: "Live", logo: "SI" },
  { id: 16, name: "DocuSign", cat: "Signing", desc: "Automate form signing during onboarding.", status: "Live", logo: "DS" }
];
