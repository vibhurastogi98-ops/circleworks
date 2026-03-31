export interface SegmentContent {
  title: string;
  sub: string;
  ctaHero: string;
  ctaSub: string;
  heroGradient: string;
  painPoints: { icon: string; title: string; description: string }[];
  features: { name: string; description: string; icon: string }[];
  testimonial: { quote: string; author: string; role: string; avatar: string };
  faq: { q: string; a: string }[];
  seoTitle: string;
  seoDesc: string;
}

export const segments: Record<string, SegmentContent> = {
  agencies: {
    title: "Payroll for agencies & professional service firms",
    sub: "From consulting to creative agencies. Manage billable hours, track project costs, and manage your clients from one centralized dashboard.",
    ctaHero: "Start Free Trial",
    ctaSub: "See Agency Features",
    heroGradient: "from-blue-600 via-indigo-500 to-purple-600",
    painPoints: [
      { icon: "🏢", title: "Client Multi-Tenancy", description: "Switching between dozens of client logins is slow and error-prone." },
      { icon: "⏰", title: "Billable Hour Prep", description: "Syncing time tracking data to payroll and invoicing is a manual slog." },
      { icon: "🏷️", title: "Project Costing", description: "Not knowing the true labor cost of your fixed-fee projects." }
    ],
    features: [
      { name: "Single-Sign-On Portal", description: "One login to rule them all. Access and manage every client from a central hub.", icon: "🔑" },
      { name: "Unified Time Sync", description: "Connect with Harvest, Toggl, or Everhour to move billable time into payroll.", icon: "⏰" },
      { name: "White-Label Reporting", description: "Your brand, our engine. Send professional, branded reports to your clients.", icon: "🏷️" },
      { name: "Partner-Level Access", description: "Invite your accountant or partner to view specific financial reports.", icon: "👤" },
      { name: "Multi-State Tax Filings", description: "We handle the nexus. Automated filings for every jurisdiction your clients occupy.", icon: "🗺️" }
    ],
    testimonial: {
      quote: "CircleWorks is the perfect fit. It's clean, professional, and handles both our internal consulting payouts and our client accounts perfectly.",
      author: "Jessica Miller",
      role: "Founder, Peak Performance Agency",
      avatar: "JM"
    },
    faq: [
      { q: "Can I manage multiple companies from one login?", a: "Yes, our Agency portal allows you to toggle between client accounts instantly without logging out." },
      { q: "Do you support both W-2 and 1099?", a: "Yes, we are a unified platform for employees and contractors of all types." }
    ],
    seoTitle: "Payroll for Professional Services & Agencies | CircleWorks",
    seoDesc: "The \#1 payroll platform for marketing, creative, and consulting agencies. Manage multiple clients, white-label reports, and track project costs."
  },
  services: {
    title: "Payroll for professional service firms",
    sub: "From consulting to creative agencies. Manage billable hours, track project costs, and manage your clients from one centralized dashboard.",
    ctaHero: "Start Free Trial",
    ctaSub: "See Agency Features",
    heroGradient: "from-blue-600 via-indigo-500 to-purple-600",
    painPoints: [
      { icon: "🏢", title: "Client Multi-Tenancy", description: "Switching between dozens of client logins is slow and error-prone." },
      { icon: "⏰", title: "Billable Hour Prep", description: "Syncing time tracking data to payroll and invoicing is a manual slog." },
      { icon: "🏷️", title: "Project Costing", description: "Not knowing the true labor cost of your fixed-fee projects." }
    ],
    features: [
      { name: "Single-Sign-On Portal", description: "One login to rule them all. Access and manage every client from a central hub.", icon: "🔑" },
      { name: "Unified Time Sync", description: "Connect with Harvest, Toggl, or Everhour to move billable time into payroll.", icon: "⏰" },
      { name: "White-Label Reporting", description: "Your brand, our engine. Send professional, branded reports to your clients.", icon: "🏷️" },
      { name: "Partner-Level Access", description: "Invite your accountant or partner to view specific financial reports.", icon: "👤" },
      { name: "Multi-State Tax Filings", description: "We handle the nexus. Automated filings for every jurisdiction your clients occupy.", icon: "🗺️" }
    ],
    testimonial: {
      quote: "CircleWorks is the perfect fit. It's clean, professional, and handles both our internal consulting payouts and our client accounts perfectly.",
      author: "Jessica Miller",
      role: "Founder, Peak Performance Agency",
      avatar: "JM"
    },
    faq: [
      { q: "Can I manage multiple companies from one login?", a: "Yes, our Agency portal allows you to toggle between client accounts instantly without logging out." },
      { q: "Do you support both W-2 and 1099?", a: "Yes, we are a unified platform for employees and contractors of all types." }
    ],
    seoTitle: "Payroll for Professional Services & Agencies | CircleWorks",
    seoDesc: "The \#1 payroll platform for marketing, creative, and consulting agencies. Manage multiple clients, white-label reports, and track project costs."
  },
  agency: {
    title: "Payroll for agencies & professional service firms",
    sub: "From consulting to creative agencies. Manage billable hours, track project costs, and manage your clients from one centralized dashboard.",
    ctaHero: "Start Free Trial",
    ctaSub: "See Agency Features",
    heroGradient: "from-blue-600 via-indigo-500 to-purple-600",
    painPoints: [
      { icon: "🏢", title: "Client Multi-Tenancy", description: "Switching between dozens of client logins is slow and error-prone." },
      { icon: "⏰", title: "Billable Hour Prep", description: "Syncing time tracking data to payroll and invoicing is a manual slog." },
      { icon: "🏷️", title: "Project Costing", description: "Not knowing the true labor cost of your fixed-fee projects." }
    ],
    features: [
      { name: "Single-Sign-On Portal", description: "One login to rule them all. Access and manage every client from a central hub.", icon: "🔑" },
      { name: "Unified Time Sync", description: "Connect with Harvest, Toggl, or Everhour to move billable time into payroll.", icon: "⏰" },
      { name: "White-Label Reporting", description: "Your brand, our engine. Send professional, branded reports to your clients.", icon: "🏷️" },
      { name: "Partner-Level Access", description: "Invite your accountant or partner to view specific financial reports.", icon: "👤" },
      { name: "Multi-State Tax Filings", description: "We handle the nexus. Automated filings for every jurisdiction your clients occupy.", icon: "🗺️" }
    ],
    testimonial: {
      quote: "CircleWorks is the perfect fit. It's clean, professional, and handles both our internal consulting payouts and our client accounts perfectly.",
      author: "Jessica Miller",
      role: "Founder, Peak Performance Agency",
      avatar: "JM"
    },
    faq: [
      { q: "Can I manage multiple companies from one login?", a: "Yes, our Agency portal allows you to toggle between client accounts instantly without logging out." },
      { q: "Do you support both W-2 and 1099?", a: "Yes, we are a unified platform for employees and contractors of all types." }
    ],
    seoTitle: "Payroll for Professional Services & Agencies | CircleWorks",
    seoDesc: "The \#1 payroll platform for marketing, creative, and consulting agencies. Manage multiple clients, white-label reports, and track project costs."
  },
  creators: {
    title: "Pay your talent, track royalties, and file 1099s — all in one place",
    sub: "The all-in-one financial stack for creators, influencers, and production houses. Get back to creating while we handle the back-office.",
    ctaHero: "Start Free Trial",
    ctaSub: "See Creator Features",
    heroGradient: "from-pink-500 via-rose-500 to-orange-500",
    painPoints: [
      { icon: "💸", title: "Talent Payouts", description: "Manual payments to editors, designers, and collaborators are messy." },
      { icon: "📄", title: "1099 Chaos", description: "Reporting income for dozens of contractors at year-end is a nightmare." },
      { icon: "📈", title: "Expense Tracking", description: "Mixing personal and business expenses makes tax season impossible." }
    ],
    features: [
      { name: "Automated 1099 Filing", description: "We track every payment and file your 1099-NECs automatically at year-end.", icon: "📝" },
      { name: "Talent Portals", description: "Let your collaborators upload their own tax info and track their payouts.", icon: "🎥" },
      { name: "Instant Payouts", description: "Send money to your team instantly. No more waiting for bank transfers.", icon: "⚡" },
      { name: "Project-Based Costing", description: "Track exactly how much you're spending on each video or campaign.", icon: "🎬" }
    ],
    testimonial: {
      quote: "Before CircleWorks, I spent two days a month just paying my editors. Now it's automated. It's life-changing.",
      author: "David V.",
      role: "Tech Creator (2M+ Subs)",
      avatar: "DV"
    },
    faq: [
      { q: "How do I generate 1099s for my talent?", a: "CircleWorks tracks all contractor payments throughout the year and files 1099s automatically for you in January." },
      { q: "Can I pay international collaborators?", a: "Yes, we support payments to over 120 countries with local currency options." }
    ],
    seoTitle: "Payroll for Creators & Influencers | CircleWorks",
    seoDesc: "Automate your talent payouts and 1099 filings. The premier financial platform built for the creator economy."
  },
  startups: {
    title: "The payroll platform built for rapid growth",
    sub: "Scale from your first hire to IPO. CircleWorks handles the complexity of equity payroll, multi-state growth, and R&D tax credits.",
    ctaHero: "Start Free Trial",
    ctaSub: "See Startup Features",
    heroGradient: "from-blue-400 via-cyan-400 to-emerald-400",
    painPoints: [
      { icon: "🚀", title: "Rapid Hiring", description: "Onboarding new hires across multiple states is a compliance trap." },
      { icon: "💎", title: "Equity Payroll", description: "Tracking stock options and tax withholdings on exercise is manual." },
      { icon: "📉", title: "R&D Credits", description: "Startups leave millions on the table by not tracking qualifying payroll." }
    ],
    features: [
      { name: "Equity Sync", description: "Connect with Carta or Pulley to automate equity-related payroll adjustments.", icon: "📊" },
      { name: "Multi-State Onboarding", description: "Hire anywhere in the US. We handle state-specific registrations automatically.", icon: "🇺🇸" },
      { name: "R&D Credit Tracking", description: "Automatically identify and document payroll expenses for R&D tax credits.", icon: "🧪" }
    ],
    testimonial: {
      quote: "CircleWorks is the only platform that moved at our speed. They handled our expansion into 12 states in one month.",
      author: "Sarah Chen",
      role: "CFO, Flux AI",
      avatar: "SC"
    },
    faq: [
      { q: "Does CircleWorks support international hiring?", a: "Yes, through our EOR and independent contractor portals, you can hire in 150+ countries." }
    ],
    seoTitle: "Payroll for High-Growth Startups | CircleWorks",
    seoDesc: "The preferred payroll and HR stack for VC-backed startups. Scale faster with automated state nexus and equity sync."
  },
  healthcare: {
    title: "Compliant payroll for hospitals and clinics",
    sub: "Manage complex shift differentials, overtime rules, and credentialing. Stay audit-ready with HIPAA-compliant HR.",
    ctaHero: "Start Free Trial",
    ctaSub: "See Healthcare Features",
    heroGradient: "from-emerald-500 via-teal-500 to-blue-500",
    painPoints: [
      { icon: "🏥", title: "Shift Differentials", description: "Calculating night, weekend, and holiday pay manually leads to errors." },
      { icon: "🗄️", title: "Credentialing", description: "Tracking certifications and licenses for medical staff is a bottleneck." },
      { icon: "⚖️", title: "Labor Law", description: "Healthcare specific overtime rules (8/80) are difficult to configure." }
    ],
    features: [
      { name: "Advanced Scheduling", description: "Sync schedules directly to payroll. No more manual time entry.", icon: "📅" },
      { name: "License Monitoring", description: "Automated alerts when staff certifications are nearing expiration.", icon: "🪪" },
      { name: "HIPAA-Safe Storage", description: "All sensitive employee data is stored in our fully encrypted, HIPAA-compliant cloud.", icon: "🔐" }
    ],
    testimonial: {
      quote: "The shift differential automation alone saved our billing department 20 hours a week. It's built for medicine.",
      author: "Dr. Elena Rossi",
      role: "Director, City Health Network",
      avatar: "ER"
    },
    faq: [
      { q: "Do you support 8/80 overtime rules?", a: "Yes, our engine is fully configurable for healthcare-specific wage and hour rules." }
    ],
    seoTitle: "Healthcare Payroll & HR Software | CircleWorks",
    seoDesc: "HIPAA-compliant payroll and HR for medical practices, clinics, and hospitals. Manage shifts and credentials with ease."
  },
  tech: {
    title: "Payroll for the modern technology workforce",
    sub: "Unified payroll, benefits, and IT provisioning. The operating system for your remote-first tech company.",
    ctaHero: "Start Free Trial",
    ctaSub: "See Tech Features",
    heroGradient: "from-slate-800 via-blue-900 to-indigo-900",
    painPoints: [
      { icon: "🌐", title: "Remote Onboarding", description: "Shipping laptops and granting access to 50+ apps is a manual slog." },
      { icon: "💻", title: "Equipment Tracking", description: "Losing track of company assets as employees come and go." },
      { icon: "🛡️", title: "Security Compliance", description: "Granting 'least privilege' access manually for SOC-2 is tough." }
    ],
    features: [
      { name: "Laptop Provisioning", description: "Order, ship, and manage employee laptops directly from the HR dashboard.", icon: "💻" },
      { name: "1-Click Offboarding", description: "Instantly revoke access to G-Suite, Slack, GitHub, and 100+ other apps.", icon: "🚫" },
      { name: "Global EOR", description: "Hire global talent in minutes without setting up local entities.", icon: "🌍" }
    ],
    testimonial: {
      quote: "The IT provisioning integration is absolute magic. We onboarded 15 developers in a week without a single manual invite.",
      author: "Marcus Thorne",
      role: "CTO, DataStream",
      avatar: "MT"
    },
    faq: [
      { q: "Which apps do you integrate with for security?", a: "We integrate with Okta, Google Workspace, Slack, Jira, GitHub, and 1,000+ others via OAuth." }
    ],
    seoTitle: "Payroll & IT Provisioning for Tech Companies | CircleWorks",
    seoDesc: "The modern workforce OS. Unified payroll, benefits, and automated IT onboarding for tech teams."
  },
  restaurants: {
    title: "Payroll that understands hospitality",
    sub: "Handle tip credit, multiple pay rates, and high turnover without the headache. Built for kitchens and front-of-house.",
    ctaHero: "Start Free Trial",
    ctaSub: "See Restaurant Features",
    heroGradient: "from-orange-500 via-red-500 to-rose-600",
    painPoints: [
      { icon: "🍳", title: "Tip Management", description: "Calculating tip credits and FICA tax offsets is a math nightmare." },
      { icon: "🏃", title: "High Turnover", description: "Onboarding and offboarding staff weekly takes up too much time." },
      { icon: "🍕", title: "Split Shifts", description: "Tracking staff moving between different roles and rates in one shift." }
    ],
    features: [
      { name: "POS Integrations", description: "Sync sales and tip data directly from Toast, Square, or Clover.", icon: "📠" },
      { name: "FICA Tip Credit", description: "Automatically calculate and report your tip credits for maximum tax savings.", icon: "💰" },
      { name: "Mobile Onboarding", description: "Let new staff complete their W-4 and I-9 on their phones before their first shift.", icon: "📱" }
    ],
    testimonial: {
      quote: "Running three restaurants meant three times the payroll stress. CircleWorks consolidated everything and automated our tip credits.",
      author: "Mario Batali",
      role: "Owner, Gusto Group",
      avatar: "MB"
    },
    faq: [
      { q: "Does this integrate with my POS?", a: "Yes, we have native integrations with Toast, Square, Clover, and Breadcrumb." }
    ],
    seoTitle: "Restaurant Payroll Software | Tip Management | CircleWorks",
    seoDesc: "The #1 payroll platform for restaurants and hospitality. Automate tip credits, POS sync, and high-volume onboarding."
  },
  smbs: {
    title: "The all-in-one HR & payroll for small business",
    sub: "Finally, a payroll platform that saves you time instead of taking it. Tax filings, 401k, and health insurance — all on autopilot.",
    ctaHero: "Start Free Trial",
    ctaSub: "See SMB Features",
    heroGradient: "from-blue-600 via-indigo-600 to-violet-600",
    painPoints: [
      { icon: "⏰", title: "Manual Data Entry", description: "Spending hours on spreadsheets every pay period is a waste of your talent." },
      { icon: "💸", title: "Hidden Fees", description: "Legacy providers charge for every filing, every year-end, and every small change." },
      { icon: "🛑", title: "Compliance Stress", description: "The fear of getting a letter from the IRS keeps most small owners up at night." }
    ],
    features: [
      { name: "Autopilot Payroll", description: "Set it and forget it. Payroll runs automatically unless you make changes.", icon: "✈️" },
      { name: "Integrated Benefits", description: "Sync health and 401k deductions directly with payroll in one click.", icon: "🏥" },
      { name: "Employee Self-Service", description: "Let your team download their own paystubs and W-2s from a sleek mobile app.", icon: "📱" }
    ],
    testimonial: {
      quote: "CircleWorks is like having an extra person on my team. I don't even think about payroll anymore—it just happens.",
      author: "Alan Wright",
      role: "Owner, Wright Designs",
      avatar: "AW"
    },
    faq: [
      { q: "How fast can I run payroll?", a: "With 2rd-day direct deposit, you can run payroll on Tuesday for a Friday payday." }
    ],
    seoTitle: "Small Business Payroll & HR Software | CircleWorks",
    seoDesc: "Everything small businesses need to pay, manage, and care for their teams. Automated tax filings and easy benefits."
  },
  "mid-market": {
    title: "Sophisticated HR for the scale-up era",
    sub: "Bridging the gap between 'small business' and 'enterprise'. CircleWorks provides the advanced reporting and HR automation mid-sized firms need.",
    ctaHero: "Schedule Demo",
    ctaSub: "See Platform Deck",
    heroGradient: "from-slate-700 via-slate-800 to-slate-900",
    painPoints: [
      { icon: "📊", title: "Reporting Gaps", description: "Standard reports no longer meet the needs of your leadership team." },
      { icon: "🤝", title: "Handover Friction", description: "Finance and HR are operating in two different worlds with two different datasets." },
      { icon: "📈", title: "Performance Management", description: "Tracking annual reviews in Docs or Spreadsheets is no longer sustainable." }
    ],
    features: [
      { name: "Custom Report Builder", description: "Create, save, and automate any report you need for board meetings or internal audits.", icon: "📁" },
      { name: "Performance Reviews", description: "Integrated 360 reviews, goal tracking, and compensation cycle management.", icon: "🏆" },
      { name: "Advanced GL Sync", description: "Custom mapping to NetSuite, Sage Intacct, or Microsoft Dynamics.", icon: "🔄" }
    ],
    testimonial: {
      quote: "CircleWorks gave us the visibility we needed to grow from 100 to 500 employees without doubling our HR headcount.",
      author: "Karen Smith",
      role: "VP of People, ScaleFlow",
      avatar: "KS"
    },
    faq: [
      { q: "Do you support custom general ledger mapping?", a: "Yes, our native accounting integrations support complex, multi-entity mapping." }
    ],
    seoTitle: "Mid-Market Payroll & HRIS | CircleWorks",
    seoDesc: "The modern HR stack for growing mid-sized companies. Advanced analytics, global payroll, and automated performance reviews."
  },
  enterprise: {
    title: "Global payroll & HR for the modern enterprise",
    sub: "Unified visibility across your entire global workforce. CircleWorks delivers the security, scale, and dedicated support elite organizations demand.",
    ctaHero: "Contact Sales",
    ctaSub: "Request Whitepaper",
    heroGradient: "from-[#0A1628] to-[#1E3A8A]",
    painPoints: [
      { icon: "🌍", title: "Global Silos", description: "Different systems for every country make global reporting impossible." },
      { icon: "🔒", title: "Security Risk", description: "Scaling access while maintaining SOC-2 and GDPR compliance is a constant battle." },
      { icon: "⚡", title: "Integration Debt", description: "Legacy systems don't talk to your modern ERP or SSO providers." }
    ],
    features: [
      { name: "Unified Global Payroll", description: "One platform for your team in the US, EMEA, and APAC. Local compliance everywhere.", icon: "🗺️" },
      { name: "Identity Management", description: "Deep integrations with Okta, Azure AD, and Ping Identity for automated provisioning.", icon: "🆔" },
      { name: "Dedicated CSM", description: "A technical account manager who knows your business and your complex configurations.", icon: "📞" }
    ],
    testimonial: {
      quote: "Switching to CircleWorks was the best decision for our digital transformation. Global compliance is no longer a 'risk'—it's a solved problem.",
      author: "Tom H.",
      role: "Director of Global HR Operations, TechCorp",
      avatar: "TH"
    },
    faq: [
      { q: "Is the platform SOC-2 Type II compliant?", a: "Yes, CircleWorks maintains SOC-2 Type II, GDPR, CCPA, and HIPAA compliance." }
    ],
    seoTitle: "Enterprise Payroll & Global HR Platform | CircleWorks",
    seoDesc: "Scale your workforce globally with safe, compliant, and unified payroll. Built for the world's most demanding enterprises."
  },
  retail: {
    title: "Workforce management for modern retail",
    sub: "From the storefront to the warehouse. Automate scheduling, handle high turnover, and simplify multi-location payroll.",
    ctaHero: "Start Free Trial",
    ctaSub: "See Retail Case Studies",
    heroGradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    painPoints: [
      { icon: "🏪", title: "Multi-Location Chaos", description: "Consolidating hours and taxes for 10+ stores is a manual nightmare." },
      { icon: "🌀", title: "Staff Turnover", description: "The constant cycle of hiring and exiting staff eats up 40% of store manager time." },
      { icon: "🕒", title: "Shift Compliance", description: "Managing predictive scheduling laws and overtime across locations is risky." }
    ],
    features: [
      { name: "Mobile Shift Swap", description: "Let staff swap shifts via the app. Managers just approve with a tap.", icon: "📲" },
      { name: "Multi-Location Taxing", description: "Automatically calculate taxes based on where the work was performed.", icon: "📍" },
      { name: "Paperless Onboarding", description: "Hire in minutes. Employees complete everything on their phone in the store.", icon: "📄" }
    ],
    testimonial: {
      quote: "Our store managers finally have their time back. Onboarding is a breeze, and scheduling is handled by the staff themselves.",
      author: "Linda G.",
      role: "Operations Director, Trendset Retail",
      avatar: "LG"
    },
    faq: [
      { q: "Can I manage different pay rates for differet roles?", a: "Yes, CircleWorks supports unlimited pay rates per employee based on location or role." }
    ],
    seoTitle: "Retail Payroll & Scheduling Software | CircleWorks",
    seoDesc: "Modernize your retail operations. Automated multi-location payroll, shift scheduling, and mobile-first onboarding."
  },
  nonprofit: {
    title: "HR & Payroll for mission-driven organizations",
    sub: "Focus on your mission, not your paperwork. CircleWorks handles the complexities of grant-based cost tracking and non-profit compliance.",
    ctaHero: "Start Free Trial",
    ctaSub: "Get Non-Profit Pricing",
    heroGradient: "from-teal-600 via-emerald-600 to-green-600",
    painPoints: [
      { icon: "📜", title: "Grant Allocation", description: "Manually splitting payroll across multiple grants and funds is tedious." },
      { icon: "💎", title: "Tight Budgets", description: "Every dollar spent on HR admin is a dollar taken from the mission." },
      { icon: "📋", title: "Volunteer Risk", description: "Managing workers compensation and insurance for different staff categories." }
    ],
    features: [
      { name: "Labor Distribution Hub", description: "Easily allocate staff time and costs across different grants and programs.", icon: "📊" },
      { name: "Preferential Pricing", description: "Deep discounts for verified 501(c)(3) organizations.", icon: "📢" },
      { name: "Automated Tax Filing", description: "We handle form 941, 940, and all state-specific non-profit filings.", icon: "🗳️" }
    ],
    testimonial: {
      quote: "CircleWorks understands the unique world of non-profits. The grant tracking feature alone is worth the switch.",
      author: "Sarah J.",
      role: "Executive Director, Hope Foundation",
      avatar: "SJ"
    },
    faq: [
      { q: "Do you offer discounts for non-profits?", a: "Yes, we offer special pricing tiers for 501(c)(3) organizations." }
    ],
    seoTitle: "Non-Profit Payroll & HR Software | CircleWorks",
    seoDesc: "Empower your mission with automated payroll and grant-based cost tracking. Discounted pricing for 501(c)(3) organizations."
  },
  "rapid-scaling": {
    title: "Scale your workforce from 10 to 500 without breaking",
    sub: "Automated state registrations, bulk onboarding, and sophisticated HR workflows. The growth engine for high-velocity teams.",
    ctaHero: "Get Scaling Plan",
    ctaSub: "See Growth Tools",
    heroGradient: "from-indigo-600 via-blue-600 to-cyan-500",
    painPoints: [
      { icon: "📈", title: "Onboarding Bottlenecks", description: "Manual data entry for 20 new hires a week is a recipe for disaster." },
      { icon: "🗺️", title: "State Nexus Risk", description: "Hiring in new states without proper tax registration leads to massive fines." },
      { icon: "📊", title: "Reporting Drag", description: "Leadership needs headcount and burnout data, but gathering it takes days." }
    ],
    features: [
      { name: "Bulk Onboarding", description: "Onboard entire cohorts in minutes with automated offer letters and I-9 check-ins.", icon: "🚀" },
      { name: "Auto-State Registration", description: "We handle the paperwork for every new state your team expands into.", icon: "📍" },
      { name: "Predictive Analytics", description: "Heads-up alerts on burnout risk and turnover trends before they happen.", icon: "📉" }
    ],
    testimonial: {
      quote: "We grew from 50 to 200 people in 6 months. CircleWorks was the only system that didn't just 'work'—it accelerated us.",
      author: "Michael R.",
      role: "Head of People, AstroTech",
      avatar: "MR"
    },
    faq: [
      { q: "How many states do you support?", a: "All 50 US states, plus DC. We handle registrations, filings, and payments everywhere." }
    ],
    seoTitle: "HR & Payroll for Rapidly Scaling Companies | CircleWorks",
    seoDesc: "Automate your growth. High-velocity hiring, multi-state tax compliance, and advanced HR analytics for scale-ups."
  },
  "compliance": {
    title: "Bulletproof compliance for complex industries",
    sub: "Automated labor law tracking, secure document storage, and audit-ready reporting. Sleep better knowing your back-office is secure.",
    ctaHero: "Audit Modernization",
    ctaSub: "Security Overview",
    heroGradient: "from-slate-800 via-slate-900 to-black",
    painPoints: [
      { icon: "⚖️", title: "Labor Law Changes", description: "Missing a local wage update can cost tens of thousands in penalties." },
      { icon: "📂", title: "Document Splrawl", description: "I-9s and sensitive contracts scattered across email and shared drives." },
      { icon: "🔍", title: "Audit Anxiety", description: "Spending weeks gathering data when the DOL or IRS comes knocking." }
    ],
    features: [
      { name: "Compliance Guard", description: "Real-time alerts for local labor law changes affecting your specific locations.", icon: "🛡️" },
      { name: "Secure Vault", description: "Encrypted, permission-based storage for all essential employee documents.", icon: "🔐" },
      { name: "1-Click Audit Export", description: "Generate comprehensive compliance reports for any period in seconds.", icon: "📑" }
    ],
    testimonial: {
      quote: "Our SOC-2 audit was a breeze because CircleWorks had every document organized and every check documented.",
      author: "Rachel K.",
      role: "Compliance Officer, SecureHealth",
      avatar: "RK"
    },
    faq: [
      { q: "Is your platform SOC-2 compliant?", a: "Yes, we are SOC-2 Type II compliant and undergo regular security audits." }
    ],
    seoTitle: "HR Compliance & Risk Management Software | CircleWorks",
    seoDesc: "Automate your labor law compliance. Multi-state tax filings, secure I-9 storage, and audit-ready financial reporting."
  },
  "cost-optimization": {
    title: "Optimize your labor spend & maximize tax credits",
    sub: "Identify R&D credits, reduce payroll overhead, and get deep visibility into your true cost of labor. CircleWorks pays for itself.",
    ctaHero: "Start Saving",
    ctaSub: "Calculate My ROI",
    heroGradient: "from-emerald-700 via-green-600 to-teal-500",
    painPoints: [
      { icon: "💸", title: "Wasted Overhead", description: "Legacy payroll fees and manual admin time are eating your margins." },
      { icon: "💎", title: "Missed Tax Credits", description: "Companies leave billions in R&D and ERTC credits on the table every year." },
      { icon: "📊", title: "Shadow Labor Costs", description: "Not understanding the fully-loaded cost of each department or project." }
    ],
    features: [
      { name: "R&D Credit Finder", description: "Automatically identify payroll expenses qualifying for high-value tax credits.", icon: "🧪" },
      { name: "Benefit Price-Matching", description: "We shop the market to find the best rates for your team's health and 401k.", icon: "🏥" },
      { name: "Fully-Loaded Costing", description: "See the true cost of every employee, inclusive of taxes, benefits, and overhead.", icon: "💰" }
    ],
    testimonial: {
      quote: "CircleWorks found $45k in R&D credits we didn't even know we qualified for. The platform paid for itself in day one.",
      author: "David L.",
      role: "Founder, InnovateCo",
      avatar: "DL"
    },
    faq: [
      { q: "How much can I save on payroll fees?", a: "Most companies save 30-50% on legacy processing fees by switching to our unified platform." }
    ],
    seoTitle: "Payroll Cost Optimization & Tax Credit Software | CircleWorks",
    seoDesc: "Reduce your labor costs. Automated R&D credit tracking, benefit optimization, and transparent payroll pricing."
  },
  "remote-teams": {
    title: "The operating system for global, remote teams",
    sub: "IT provisioning, global EOR, and culture-building tools in one unified dashboard. Hire, pay, and equip your team anywhere on Earth.",
    ctaHero: "Go Global",
    ctaSub: "See Remote Features",
    heroGradient: "from-blue-600 via-indigo-600 to-sky-500",
    painPoints: [
      { icon: "🌍", title: "Global Nexus Chaos", description: "Managing compliance and currencies for a 20-country team is impossible." },
      { icon: "💻", title: "IT Logistical Hell", description: "Spending hours tracking down laptops and setting up software accounts." },
      { icon: "🤝", title: "Cultural Isolation", description: "Remote employees feeling disconnected from the company mission and team." }
    ],
    features: [
      { name: "IT Provisioning", description: "Automated hardware shipping and software account creation in one click.", icon: "💻" },
      { name: "Global EOR Portal", description: "Hire in 150+ countries without setting up local legal entities.", icon: "🌍" },
      { name: "Remote Culture Hub", description: "Integrated shout-outs, birthday alerts, and team-building workflows.", icon: "🎉" }
    ],
    testimonial: {
      quote: "CircleWorks made our 'remote-first' promise actually scalable. We can now hire talent anywhere without the HR overhead.",
      author: "Emma S.",
      role: "COO, Horizon Global",
      avatar: "ES"
    },
    faq: [
      { q: "Can I pay international contractors?", a: "Yes, we support contractor payments in 120+ currencies with local compliance built-in." }
    ],
    seoTitle: "HR & Payroll for Remote & Global Teams | CircleWorks",
    seoDesc: "The premier platform for global hiring. IT provisioning, localized payroll, and remote culture tools for modern teams."
  },
};

// Aliases for the specific names requested by the user
segments["technology-saas"] = segments.tech;
segments["health-wellness"] = segments.healthcare;
segments["retail-ecommerce"] = segments.retail;
segments["professional-services"] = segments.agencies;
