export interface SegmentContent {
  title: string;
  sub: string;
  ctaHero: string;
  ctaSub: string;
  heroGradient: string;
  ogImage?: string;
  painPoints: { icon: string; title: string; description: string }[];
  features: { name: string; description: string; icon: string }[];
  testimonial: { quote: string; author: string; role: string; avatar: string };
  faq: { q: string; a: string }[];
  partners: { name: string; color: string }[];
  seoTitle: string;
  seoDesc: string;
}

export const segments: Record<string, SegmentContent> = {
  agencies: {
    title: "Run payroll for all your clients from one dashboard",
    sub: "The command center for agencies. Manage every client's team, automate billing-hour payroll sync, and deliver white-label reports — without ever logging out.",
    ctaHero: "Start Free Trial",
    ctaSub: "See Agency Features",
    heroGradient: "from-blue-600 via-indigo-500 to-purple-600",
    ogImage: "/og/agencies.png",
    painPoints: [
      { icon: "building", title: "Client Multi-Tenancy", description: "Switching between dozens of client logins is slow and error-prone. One mistake and you're filing in the wrong account." },
      { icon: "clock", title: "Billable Hour Prep", description: "Syncing time tracking data to payroll and invoicing manually eats hours you should be billing to clients." },
      { icon: "tag", title: "Project Costing", description: "Without true labor cost visibility, fixed-fee projects quietly eat into your agency's margins." }
    ],
    features: [
      { name: "Multi-Client Dashboard", description: "One login to rule them all. Toggle between every client account from a sleek, centralized hub — no re-authentication required.", icon: "keyboard" },
      { name: "Unified Time Sync", description: "Connect with Harvest, Toggl, or Everhour to auto-import billable hours directly into each client's payroll run.", icon: "clock" },
      { name: "White-Label Reporting", description: "Your brand, our engine. Send professional, branded payroll and cost reports to clients with your logo front and center.", icon: "tag" },
      { name: "Partner-Level Access", description: "Invite your accountant or a client's bookkeeper with scoped, read-only access to specific financial reports.", icon: "users" },
      { name: "Multi-State Tax Filings", description: "We handle nexus complexity. Automated state tax registrations and filings for every jurisdiction your clients operate in.", icon: "map" },
      { name: "Profitability Dashboard", description: "See the true cost of labor per project and client. Instantly know which accounts are profitable and which are leaking.", icon: "chart" }
    ],
    testimonial: {
      quote: "CircleWorks is the perfect fit. It's clean, professional, and handles both our internal consulting payouts and our client accounts perfectly.",
      author: "Jessica Miller",
      role: "Founder, Peak Performance Agency",
      avatar: "user"
    },
    faq: [
      { q: "Can I manage multiple companies from one login?", a: "Yes, our Agency portal lets you toggle between client accounts instantly without re-authenticating. Each client is fully isolated." },
      { q: "Do you support both W-2 and 1099 workers?", a: "Absolutely. CircleWorks is a unified platform handling employees, independent contractors, and freelancers across all your client accounts." },
      { q: "How does billing-hour sync work?", a: "We integrate natively with Harvest, Toggl, and Everhour. Approved hours flow directly into payroll runs with one click — no spreadsheets." },
      { q: "Can clients see their own payroll data?", a: "Yes. You can provision a client-facing portal with the exact permissions you choose — from read-only reports to full self-service." },
      { q: "What are your pricing terms for agencies managing multiple clients?", a: "We offer agency-specific volume pricing based on the total employee count across all your client accounts. Contact us for a custom quote." }
    ],
    partners: [
      { name: "Harvest", color: "#FA5D00" },
      { name: "Toggl", color: "#E01E5A" },
      { name: "Xero", color: "#13B5EA" },
      { name: "QuickBooks", color: "#2CA01C" }
    ],
    seoTitle: "Payroll Software for Agencies | Multi-Client Dashboard | CircleWorks",
    seoDesc: "Run payroll for all your clients from one dashboard. White-label reports, billable-hour sync, and multi-state filings built for marketing & consulting agencies."
  },
  services: {
    title: "Payroll for professional service firms",
    sub: "From consulting to creative agencies. Manage billable hours, track project costs, and manage your clients from one centralized dashboard.",
    ctaHero: "Start Free Trial",
    ctaSub: "See Agency Features",
    heroGradient: "from-blue-600 via-indigo-500 to-purple-600",
    painPoints: [
      { icon: "building", title: "Client Multi-Tenancy", description: "Switching between dozens of client logins is slow and error-prone." },
      { icon: "clock", title: "Billable Hour Prep", description: "Syncing time tracking data to payroll and invoicing is a manual slog." },
      { icon: "tag", title: "Project Costing", description: "Not knowing the true labor cost of your fixed-fee projects." }
    ],
    features: [
      { name: "Single-Sign-On Portal", description: "One login to rule them all. Access and manage every client from a central hub.", icon: "keyboard" },
      { name: "Unified Time Sync", description: "Connect with Harvest, Toggl, or Everhour to move billable time into payroll.", icon: "clock" },
      { name: "White-Label Reporting", description: "Your brand, our engine. Send professional, branded reports to your clients.", icon: "tag" },
      { name: "Partner-Level Access", description: "Invite your accountant or partner to view specific financial reports.", icon: "users" },
      { name: "Multi-State Tax Filings", description: "We handle the nexus. Automated filings for every jurisdiction your clients occupy.", icon: "map" }
    ],
    testimonial: {
      quote: "CircleWorks is the perfect fit. It's clean, professional, and handles both our internal consulting payouts and our client accounts perfectly.",
      author: "Jessica Miller",
      role: "Founder, Peak Performance Agency",
      avatar: "user"
    },
    faq: [
      { q: "Can I manage multiple companies from one login?", a: "Yes, our Agency portal allows you to toggle between client accounts instantly without logging out." },
      { q: "Do you support both W-2 and 1099?", a: "Yes, we are a unified platform for employees and contractors of all types." }
    ],
    partners: [
      { name: "Harvest", color: "#FA5D00" },
      { name: "Toggl", color: "#E01E5A" },
      { name: "Xero", color: "#13B5EA" },
      { name: "QuickBooks", color: "#2CA01C" }
    ],
    seoTitle: "Payroll for Professional Services & Agencies | CircleWorks",
    seoDesc: "The #1 payroll platform for marketing, creative, and consulting agencies. Manage multiple clients, white-label reports, and track project costs."
  },
  agency: {
    title: "Payroll for agencies & professional service firms",
    sub: "From consulting to creative agencies. Manage billable hours, track project costs, and manage your clients from one centralized dashboard.",
    ctaHero: "Start Free Trial",
    ctaSub: "See Agency Features",
    heroGradient: "from-blue-600 via-indigo-500 to-purple-600",
    painPoints: [
      { icon: "building", title: "Client Multi-Tenancy", description: "Switching between dozens of client logins is slow and error-prone." },
      { icon: "clock", title: "Billable Hour Prep", description: "Syncing time tracking data to payroll and invoicing is a manual slog." },
      { icon: "tag", title: "Project Costing", description: "Not knowing the true labor cost of your fixed-fee projects." }
    ],
    features: [
      { name: "Single-Sign-On Portal", description: "One login to rule them all. Access and manage every client from a central hub.", icon: "keyboard" },
      { name: "Unified Time Sync", description: "Connect with Harvest, Toggl, or Everhour to move billable time into payroll.", icon: "clock" },
      { name: "White-Label Reporting", description: "Your brand, our engine. Send professional, branded reports to your clients.", icon: "tag" },
      { name: "Partner-Level Access", description: "Invite your accountant or partner to view specific financial reports.", icon: "users" },
      { name: "Multi-State Tax Filings", description: "We handle the nexus. Automated filings for every jurisdiction your clients occupy.", icon: "map" }
    ],
    testimonial: {
      quote: "CircleWorks is the perfect fit. It's clean, professional, and handles both our internal consulting payouts and our client accounts perfectly.",
      author: "Jessica Miller",
      role: "Founder, Peak Performance Agency",
      avatar: "user"
    },
    faq: [
      { q: "Can I manage multiple companies from one login?", a: "Yes, our Agency portal allows you to toggle between client accounts instantly without logging out." },
      { q: "Do you support both W-2 and 1099?", a: "Yes, we are a unified platform for employees and contractors of all types." }
    ],
    partners: [
      { name: "Harvest", color: "#FA5D00" },
      { name: "Toggl", color: "#E01E5A" },
      { name: "Xero", color: "#13B5EA" },
      { name: "QuickBooks", color: "#2CA01C" }
    ],
    seoTitle: "Payroll for Professional Services & Agencies | CircleWorks",
    seoDesc: "The #1 payroll platform for marketing, creative, and consulting agencies. Manage multiple clients, white-label reports, and track project costs."
  },
  creators: {
    title: "Pay your talent, track royalties, and file 1099s — all in one place",
    sub: "The all-in-one financial stack for creators, influencers, and production houses. Get back to creating while we handle every payment, form, and filing.",
    ctaHero: "Start Free Trial",
    ctaSub: "See Creator Features",
    heroGradient: "from-pink-500 via-rose-500 to-orange-500",
    ogImage: "/og/creators.png",
    painPoints: [
      { icon: "dollar", title: "Talent Payout Hell", description: "Manually Venmo-ing your editor, thumbnail designer, and voiceover artist every month is a full-time job in itself." },
      { icon: "file", title: "1099 Season Chaos", description: "Scrambling to report income for dozens of collaborators in January — while missing half the payment records." },
      { icon: "chart", title: "No Cost Visibility", description: "Not knowing whether each video or campaign turned a profit because expenses are scattered across cards and DMs." }
    ],
    features: [
      { name: "Automated 1099-NEC Filing", description: "We track every contractor payment throughout the year and e-file 1099-NECs automatically each January — zero effort from you.", icon: "file" },
      { name: "Talent Self-Service Portals", description: "Your collaborators upload their W-9, set their bank account, and track every payout — all without emailing you.", icon: "video" },
      { name: "Instant & Scheduled Payouts", description: "Send money to your team immediately or schedule recurring payments. Same-day ACH and international wire both supported.", icon: "zap" },
      { name: "Royalty & Revenue Tracking", description: "Connect YouTube, Spotify, or Patreon revenue streams and track how much each property is generating vs. its production cost.", icon: "film" },
      { name: "Project-Based Cost Center", description: "Create a budget for each video, podcast, or campaign. CircleWorks tracks spend against it in real time.", icon: "chart" },
      { name: "Expense Categorization", description: "Auto-categorize business expenses from linked cards. Keep personal and professional finances cleanly separated for tax time.", icon: "dollar" }
    ],
    testimonial: {
      quote: "Before CircleWorks, I spent two days a month just paying my editors. Now it's automated. It's life-changing.",
      author: "David V.",
      role: "Tech Creator (2M+ Subs)",
      avatar: "user"
    },
    faq: [
      { q: "How do I generate 1099s for my talent?", a: "CircleWorks tracks all contractor payments throughout the year and automatically e-files 1099-NECs with the IRS and your state in January. You just review and approve." },
      { q: "Can I pay international collaborators?", a: "Yes. We support contractor payments to 120+ countries in local currencies via wire, ACH, or PayPal — with full tax documentation for US-based filers." },
      { q: "Does this work if my income comes from multiple platforms?", a: "Absolutely. We integrate with YouTube AdSense, Patreon, Spotify for Podcasters, and Stripe to pull in your revenue and match it against your content costs." },
      { q: "What if a contractor works on multiple projects?", a: "Each contractor can be assigned to multiple projects, and CircleWorks will track their time and payments per project for accurate cost reporting." },
      { q: "Is there a minimum number of team members required?", a: "No minimums. CircleWorks works equally well whether you have 1 editor or 50 collaborators. Pricing is per active contractor paid each month." }
    ],
    partners: [
      { name: "YouTube", color: "#FF0000" },
      { name: "Twitch", color: "#9146FF" },
      { name: "Patreon", color: "#FF424D" },
      { name: "Stripe", color: "#635BFF" }
    ],
    seoTitle: "Payroll & 1099 Filing for Creators & Influencers | CircleWorks",
    seoDesc: "Automate talent payouts and 1099-NEC filings. The premier financial platform for YouTube creators, podcasters, and production houses."
  },
  startups: {
    title: "The payroll platform built for hypergrowth",
    sub: "Scale from your first hire to Series C without breaking HR. CircleWorks handles equity payroll, automated state nexus, and R&D tax credit tracking — at startup speed.",
    ctaHero: "Start Free Trial",
    ctaSub: "See Startup Features",
    heroGradient: "from-blue-400 via-cyan-400 to-emerald-400",
    ogImage: "/og/startups.png",
    painPoints: [
      { icon: "rocket", title: "Rapid Multi-State Hiring", description: "Onboarding engineers in 3 new states this quarter? Each state requires separate tax registrations or you're exposed to massive penalties." },
      { icon: "award", title: "Equity Payroll Complexity", description: "Stock option exercises and RSU vests create complex withholding requirements that legacy payroll systems simply can't handle." },
      { icon: "trending-down", title: "Unclaimed R&D Credits", description: "Most VC-backed startups qualify for significant R&D tax credits but leave millions on the table because no one is tracking qualifying payroll." }
    ],
    features: [
      { name: "Equity Payroll Sync", description: "Connect with Carta or Pulley to automate withholding calculations for option exercises, RSU vests, and secondary sales.", icon: "chart" },
      { name: "Auto-State Registration", description: "Hire anywhere in the US and we auto-register your company for payroll taxes in every new state — zero paperwork from you.", icon: "map" },
      { name: "R&D Credit Tracking", description: "Automatically identify and document payroll expenses that qualify for federal and state R&D tax credits. Integrated with your CPA workflow.", icon: "activity" },
      { name: "Offer Letter Automation", description: "Generate, send, and track legally compliant offer letters and employment agreements directly from the HR dashboard.", icon: "file" },
      { name: "Benefits Benchmarking", description: "See how your benefits stack compares to similar-stage startups in your market. Stay competitive in the talent war without overspending.", icon: "award" },
      { name: "Global EOR Hiring", description: "Hire top talent in 150+ countries in minutes without setting up legal entities. Our EOR handles local compliance end-to-end.", icon: "globe" }
    ],
    testimonial: {
      quote: "CircleWorks is the only platform that moved at our speed. They handled our expansion into 12 states in one month.",
      author: "Sarah Chen",
      role: "CFO, Flux AI",
      avatar: "user"
    },
    faq: [
      { q: "Does CircleWorks support international hiring?", a: "Yes. Through our Employer of Record (EOR) portal, you can compliantly hire full-time employees in 150+ countries without setting up local legal entities." },
      { q: "How does equity payroll work?", a: "We integrate directly with Carta and Pulley. When an equity event occurs (option exercise, RSU vest), we automatically calculate federal and state withholding and include it in the next payroll run." },
      { q: "Can I claim R&D tax credits through CircleWorks?", a: "Yes. Our R&D credit module identifies qualifying payroll expenses (engineers, scientists, software developers) and generates the documentation needed to file Form 6765 with your taxes." },
      { q: "What if we're pre-revenue and need to manage cash flow around payroll?", a: "We offer flexible Net-30 payroll funding for early-stage companies and can help you optimize payroll timing around your funding rounds." },
      { q: "How quickly can we get set up?", a: "Most startups are fully live with their first payroll run within 24 hours. Our onboarding team handles the heavy lifting, including migrating historical payroll data." }
    ],
    partners: [
      { name: "Carta", color: "#000000" },
      { name: "Pulley", color: "#6366F1" },
      { name: "Slack", color: "#4A154B" },
      { name: "GitHub", color: "#24292F" }
    ],
    seoTitle: "Payroll for VC-Backed Startups & High-Growth Companies | CircleWorks",
    seoDesc: "The preferred payroll & HR stack for startups. Automated state nexus, equity sync with Carta/Pulley, and R&D tax credit tracking built for hypergrowth."
  },
  healthcare: {
    title: "Compliant payroll built for medicine",
    sub: "Handle shift differentials, 8/80 overtime rules, and credential tracking without the manual work. Stay audit-ready with a fully HIPAA-compliant HR platform.",
    ctaHero: "Start Free Trial",
    ctaSub: "See Healthcare Features",
    heroGradient: "from-emerald-500 via-teal-500 to-blue-500",
    ogImage: "/og/healthcare.png",
    painPoints: [
      { icon: "building", title: "Complex Shift Differentials", description: "Manually calculating night, weekend, on-call, and holiday pay multipliers for every nurse and tech leads to costly payroll errors." },
      { icon: "briefcase", title: "License & Credential Expiry", description: "A lapsed nursing license or expired CPR cert discovered mid-shift creates both legal liability and dangerous care gaps." },
      { icon: "shield", title: "Healthcare-Specific Overtime", description: "The FLSA 8/80 rule and state-level healthcare overtime laws are rarely supported by generic payroll platforms — leading to compliance violations." }
    ],
    features: [
      { name: "Shift Differential Engine", description: "Configure unlimited pay rules — nights, weekends, holidays, on-call, and charge nurse rates. Payroll pulls them automatically each period.", icon: "clock" },
      { name: "8/80 Overtime Compliance", description: "Our rules engine is fully configurable for the healthcare 8/80 overtime method and all state-level healthcare wage laws.", icon: "shield" },
      { name: "Credential & License Tracker", description: "Automated alerts 30, 60, and 90 days before any staff certification or license expires — with integrated renewal workflow.", icon: "id" },
      { name: "HIPAA-Compliant Data Storage", description: "All employee health and HR records are stored in our encrypted, HIPAA-certified cloud with full audit logging and access controls.", icon: "lock" },
      { name: "Schedule-to-Payroll Sync", description: "Import approved schedules from Kronos, ADP Scheduling, or your EHR's staffing module. Hours flow to payroll with zero re-entry.", icon: "activity" },
      { name: "PRN & Per-Diem Management", description: "Easily manage float pools, PRN staff, and agency workers alongside your permanent team. Each workforce type gets the right tax treatment.", icon: "users" }
    ],
    testimonial: {
      quote: "The shift differential automation alone saved our billing department 20 hours a week. It's built for medicine.",
      author: "Dr. Elena Rossi",
      role: "Director, City Health Network",
      avatar: "user"
    },
    faq: [
      { q: "Do you support 8/80 overtime rules?", a: "Yes. Our payroll engine fully supports the FLSA 8/80 overtime alternative for healthcare facilities, as well as state-specific healthcare overtime laws in CA, NY, and others." },
      { q: "How does credential tracking work?", a: "You upload current licenses and certifications once. CircleWorks monitors expiry dates and sends automated email/SMS alerts to both the employee and their manager 30, 60, and 90 days before expiration." },
      { q: "Is the platform actually HIPAA compliant?", a: "Yes. CircleWorks is a HIPAA Business Associate and signs BAAs with all healthcare customers. All PHI data is encrypted at rest (AES-256) and in transit (TLS 1.3)." },
      { q: "Can I manage agency and PRN staff alongside permanent employees?", a: "Absolutely. Our workforce type system handles W-2, 1099, travel nurses, and agency staff — each with the correct wage and tax treatment automatically applied." },
      { q: "Do you integrate with EHR scheduling systems?", a: "Yes. We have native integrations with Epic Scheduling, Kronos Workforce, and ADP Workforce Now. Other systems are supported via our open API." }
    ],
    partners: [
      { name: "Okta", color: "#007DC1" },
      { name: "Google", color: "#4285F4" },
      { name: "Microsoft", color: "#00A4EF" },
      { name: "Workday", color: "#E17000" }
    ],
    seoTitle: "Healthcare Payroll Software | HIPAA-Compliant HR | CircleWorks",
    seoDesc: "HIPAA-compliant payroll for hospitals, clinics & medical practices. Automate shift differentials, 8/80 overtime, and staff credentialing."
  },
  tech: {
    title: "The workforce OS for modern tech companies",
    sub: "Payroll, benefits, and IT provisioning unified in one platform. Onboard a developer in any country, ship their laptop, and grant 50+ app accesses — all in one workflow.",
    ctaHero: "Start Free Trial",
    ctaSub: "See Tech Features",
    heroGradient: "from-slate-800 via-blue-900 to-indigo-900",
    ogImage: "/og/tech.png",
    painPoints: [
      { icon: "globe", title: "Remote Onboarding Chaos", description: "Coordinating laptop shipping, SSO access, Slack invites, and GitHub org membership manually for each new hire wastes days of engineering time." },
      { icon: "monitor", title: "Asset Visibility Blind Spot", description: "You have no idea which MacBook is with which remote employee — or if company hardware was returned after an engineer quit." },
      { icon: "shield", title: "SOC-2 Access Risk", description: "Manually managing least-privilege access across dozens of SaaS tools is error-prone and fails your SOC-2 Type II auditor every time." }
    ],
    features: [
      { name: "Device Lifecycle Management", description: "Order, ship, track, and retrieve employee laptops and peripherals directly from the HR dashboard. MDM enrollment is automatic.", icon: "monitor" },
      { name: "1-Click App Provisioning", description: "Grant access to GitHub, Jira, Notion, Slack, and 1,000+ other apps the moment an offer is signed — no IT tickets required.", icon: "keyboard" },
      { name: "1-Click Offboarding", description: "Instantly revoke access to every SaaS app, transfer data ownership, and generate equipment return labels in one workflow.", icon: "ban" },
      { name: "Global EOR Hiring", description: "Hire full-time engineers and designers in 150+ countries without local entities. Local payroll, benefits, and compliance handled completely.", icon: "globe" },
      { name: "SOC-2 Access Audit Logs", description: "Every access grant, revocation, and permission change is logged with timestamp and approver — ready to export for your SOC-2 auditor.", icon: "shield" },
      { name: "Benefits & Equity Integration", description: "Sync equity schedules from Carta and health benefits from your broker. Employees see everything — vesting, PTO, health — in one self-service portal.", icon: "award" }
    ],
    testimonial: {
      quote: "The IT provisioning integration is absolute magic. We onboarded 15 developers in a week without a single manual invite.",
      author: "Marcus Thorne",
      role: "CTO, DataStream",
      avatar: "user"
    },
    faq: [
      { q: "Which apps do you integrate with for automated provisioning?", a: "We integrate with Okta, Google Workspace, Slack, GitHub, Jira, Notion, Linear, Figma, AWS IAM, and 1,000+ others via OAuth and SCIM." },
      { q: "Does CircleWorks replace our MDM solution?", a: "We integrate with Jamf, Kandji, and Mosyle for MDM. CircleWorks orchestrates the device order, enrollment trigger, and tracking — your MDM handles the device policies." },
      { q: "How does offboarding work for a remote employee?", a: "In one click, CircleWorks revokes all app access, transfers file ownership to their manager, generates a shipping label for hardware return, and processes final paycheck — simultaneously." },
      { q: "Can we hire international contractors through the platform?", a: "Yes. CircleWorks supports both EOR (full-time employees) and international contractor payments in 120+ currencies with compliant agreements auto-generated." },
      { q: "Will this help us pass a SOC-2 Type II audit?", a: "Significantly yes. Access audit logs, least-privilege enforcement via SCIM, and automated offboarding workflows directly address the access control criteria in SOC-2." }
    ],
    partners: [
      { name: "GitHub", color: "#24292F" },
      { name: "Slack", color: "#4A154B" },
      { name: "Okta", color: "#007DC1" },
      { name: "Jira", color: "#0052CC" }
    ],
    seoTitle: "Payroll & IT Provisioning for Tech Companies | CircleWorks",
    seoDesc: "The modern workforce OS for tech teams. Unified payroll, automated app provisioning, SOC-2 audit logs, and global EOR hiring."
  },
  restaurants: {
    title: "Payroll that understands hospitality",
    sub: "Handle tip credit, multiple pay rates, and front-of-house turnover without the headache. Built for the realities of kitchens, bars, and multi-location restaurant groups.",
    ctaHero: "Start Free Trial",
    ctaSub: "See Restaurant Features",
    heroGradient: "from-orange-500 via-red-500 to-rose-600",
    ogImage: "/og/restaurants.png",
    painPoints: [
      { icon: "dollar", title: "Tip Credit Calculations", description: "Getting the FICA tip credit math wrong doesn't just mean less savings — it means penalties. Manual tip credit calculation is a liability." },
      { icon: "users", title: "Revolving Door Turnover", description: "Restaurants see 70%+ annual staff turnover. Manually onboarding and offboarding staff every week consumes hours your managers can't spare." },
      { icon: "clock", title: "Split Shifts & Dual Rates", description: "An employee serving tables at $2.13/hr and then bartending at $8/hr in one shift creates payroll complexity that generic systems can't handle." }
    ],
    features: [
      { name: "POS-to-Payroll Sync", description: "Pull tip totals, sales data, and declared tips directly from Toast, Square, Clover, or Breadcrumb. No manual entry, no missed tips.", icon: "keyboard" },
      { name: "FICA Tip Credit Engine", description: "Automatically calculate your Section 45B FICA tip credit each period and generate Form 8846 documentation at year-end. Leave no money on the table.", icon: "dollar" },
      { name: "Dual-Rate & Role Tracking", description: "Assign multiple roles and pay rates to a single employee. CircleWorks correctly calculates blended overtime when they cross into a different role mid-shift.", icon: "clock" },
      { name: "5-Minute Mobile Onboarding", description: "New hires complete their W-4, I-9, and direct deposit on their smartphone before their first shift. No paperwork, no delay.", icon: "smartphone" },
      { name: "Predictive Staffing Alerts", description: "CircleWorks flags approaching overtime thresholds and minimum wage violations before they happen — giving managers time to adjust the schedule.", icon: "activity" },
      { name: "Multi-Location Payroll Consolidation", description: "Manage payroll across every location from one dashboard. Each site reports independently but rolls up to a single consolidated view for ownership.", icon: "building" }
    ],
    testimonial: {
      quote: "Running three restaurants meant three times the payroll stress. CircleWorks consolidated everything and automated our tip credits.",
      author: "Marco V.",
      role: "Owner, Gusto Group (3 Locations)",
      avatar: "user"
    },
    faq: [
      { q: "Does this integrate with my POS system?", a: "Yes. We have native, real-time integrations with Toast, Square, Clover, Breadcrumb, and Lightspeed. Tip data, sales, and clock-ins sync automatically every pay period." },
      { q: "How does the FICA tip credit work?", a: "The FICA tip credit (Section 45B) allows employers to claim a tax credit equal to the employer's share of FICA taxes on tips above the federal minimum wage. CircleWorks calculates this automatically and generates Form 8846 for your tax return." },
      { q: "Can I manage tip pooling directly in CircleWorks?", a: "Yes. Configure tip pool rules (by role, by shift, or custom) and CircleWorks will calculate and distribute the pooled amount to each employee automatically, with a full audit trail." },
      { q: "What if an employee works different roles with different pay rates in one shift?", a: "No problem. Our dual-rate engine tracks each employee by role segment within a shift and calculates the correct blended overtime rate as required by the FLSA." },
      { q: "How do you handle tipped minimum wage compliance across states?", a: "We maintain an up-to-date database of tipped minimum wage rates and tip credit caps for all 50 states. The system automatically validates every pay run against the applicable state law." }
    ],
    partners: [
      { name: "Toast", color: "#F05A28" },
      { name: "Square", color: "#000000" },
      { name: "Clover", color: "#45B649" },
      { name: "7shifts", color: "#FF4D4D" }
    ],
    seoTitle: "Restaurant Payroll Software | Tip Credit & POS Sync | CircleWorks",
    seoDesc: "The #1 payroll platform for restaurants. Automate FICA tip credits, POS sync with Toast & Square, and multi-location payroll consolidation."
  },
  smbs: {
    title: "The all-in-one HR & payroll for small business",
    sub: "Finally, a payroll platform that saves you time instead of taking it. Tax filings, 401k, and health insurance — all on autopilot.",
    ctaHero: "Start Free Trial",
    ctaSub: "See SMB Features",
    heroGradient: "from-blue-600 via-indigo-600 to-violet-600",
    painPoints: [
      { icon: "clock", title: "Manual Data Entry", description: "Spending hours on spreadsheets every pay period is a waste of your talent." },
      { icon: "dollar", title: "💸", description: "Legacy providers charge for every filing, every year-end, and every small change." },
      { icon: "ban", title: "Compliance Stress", description: "The fear of getting a letter from the IRS keeps most small owners up at night." }
    ],
    features: [
      { name: "Autopilot Payroll", description: "Set it and forget it. Payroll runs automatically unless you make changes.", icon: "zap" },
      { name: "Integrated Benefits", description: "Sync health and 401k deductions directly with payroll in one click.", icon: "shield" },
      { name: "Employee Self-Service", description: "Let your team download their own paystubs and W-2s from a sleek mobile app.", icon: "smartphone" }
    ],
    testimonial: {
      quote: "CircleWorks is like having an extra person on my team. I don't even think about payroll anymore—it just happens.",
      author: "Alan Wright",
      role: "Owner, Wright Designs",
      avatar: "user"
    },
    faq: [
      { q: "How fast can I run payroll?", a: "With 2rd-day direct deposit, you can run payroll on Tuesday for a Friday payday." }
    ],
    partners: [
      { name: "QuickBooks", color: "#2CA01C" },
      { name: "Slack", color: "#4A154B" },
      { name: "Google", color: "#4285F4" },
      { name: "Stripe", color: "#635BFF" }
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
      { icon: "chart", title: "Reporting Gaps", description: "Standard reports no longer meet the needs of your leadership team." },
      { icon: "users", title: "Handover Friction", description: "Finance and HR are operating in two different worlds with two different datasets." },
      { icon: "activity", title: "Performance Management", description: "Tracking annual reviews in Docs or Spreadsheets is no longer sustainable." }
    ],
    features: [
      { name: "Custom Report Builder", description: "Create, save, and automate any report you need for board meetings or internal audits.", icon: "file" },
      { name: "Performance Reviews", description: "Integrated 360 reviews, goal tracking, and compensation cycle management.", icon: "award" },
      { name: "Advanced GL Sync", description: "Custom mapping to NetSuite, Sage Intacct, or Microsoft Dynamics.", icon: "refresh" }
    ],
    testimonial: {
      quote: "CircleWorks gave us the visibility we needed to grow from 100 to 500 employees without doubling our HR headcount.",
      author: "Karen Smith",
      role: "VP of People, ScaleFlow",
      avatar: "user"
    },
    faq: [
      { q: "Do you support custom general ledger mapping?", a: "Yes, our native accounting integrations support complex, multi-entity mapping." }
    ],
    partners: [
      { name: "NetSuite", color: "#374151" },
      { name: "Sage", color: "#00DC82" },
      { name: "Dynamics", color: "#0078D4" },
      { name: "Workday", color: "#E17000" }
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
      { icon: "globe", title: "Global Silos", description: "Different systems for every country make global reporting impossible." },
      { icon: "shield", title: "Security Risk", description: "Scaling access while maintaining SOC-2 and GDPR compliance is a constant battle." },
      { icon: "zap", title: "Integration Debt", description: "Legacy systems don't talk to your modern ERP or SSO providers." }
    ],
    features: [
      { name: "Unified Global Payroll", description: "One platform for your team in the US, EMEA, and APAC. Local compliance everywhere.", icon: "map" },
      { name: "Identity Management", description: "Deep integrations with Okta, Azure AD, and Ping Identity for automated provisioning.", icon: "users" },
      { name: "Dedicated CSM", description: "A technical account manager who knows your business and your complex configurations.", icon: "phone" }
    ],
    testimonial: {
      quote: "Switching to CircleWorks was the best decision for our digital transformation. Global compliance is no longer a 'risk'—it's a solved problem.",
      author: "Tom H.",
      role: "Director of Global HR Operations, TechCorp",
      avatar: "user"
    },
    faq: [
      { q: "Is the platform SOC-2 Type II compliant?", a: "Yes, CircleWorks maintains SOC-2 Type II, GDPR, CCPA, and HIPAA compliance." }
    ],
    partners: [
      { name: "Okta", color: "#007DC1" },
      { name: "Azure", color: "#0089D6" },
      { name: "Salesforce", color: "#00A1E0" },
      { name: "Workday", color: "#E17000" }
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
      { icon: "building", title: "Multi-Location Chaos", description: "Consolidating hours and taxes for 10+ stores is a manual nightmare." },
      { icon: "refresh", title: "Staff Turnover", description: "The constant cycle of hiring and exiting staff eats up 40% of store manager time." },
      { icon: "clock", title: "Shift Compliance", description: "Managing predictive scheduling laws and overtime across locations is risky." }
    ],
    features: [
      { name: "Mobile Shift Swap", description: "Let staff swap shifts via the app. Managers just approve with a tap.", icon: "smartphone" },
      { name: "Multi-Location Taxing", description: "Automatically calculate taxes based on where the work was performed.", icon: "map" },
      { name: "Paperless Onboarding", description: "Hire in minutes. Employees complete everything on their phone in the store.", icon: "file" }
    ],
    testimonial: {
      quote: "Our store managers finally have their time back. Onboarding is a breeze, and scheduling is handled by the staff themselves.",
      author: "Linda G.",
      role: "Operations Director, Trendset Retail",
      avatar: "user"
    },
    faq: [
      { q: "Can I manage different pay rates for differet roles?", a: "Yes, CircleWorks supports unlimited pay rates per employee based on location or role." }
    ],
    partners: [
      { name: "Shopify", color: "#96BF48" },
      { name: "Square", color: "#000000" },
      { name: "Toast", color: "#F05A28" },
      { name: "Clover", color: "#45B649" }
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
      { icon: "scroll", title: "Grant Allocation", description: "Manually splitting payroll across multiple grants and funds is tedious." },
      { icon: "dollar", title: "Tight Budgets", description: "Every dollar spent on HR admin is a dollar taken from the mission." },
      { icon: "file", title: "Volunteer Risk", description: "Managing workers compensation and insurance for different staff categories." }
    ],
    features: [
      { name: "Labor Distribution Hub", description: "Easily allocate staff time and costs across different grants and programs.", icon: "chart" },
      { name: "Preferential Pricing", description: "Deep discounts for verified 501(c)(3) organizations.", icon: "volume" },
      { name: "Automated Tax Filing", description: "We handle form 941, 940, and all state-specific non-profit filings.", icon: "file" }
    ],
    testimonial: {
      quote: "CircleWorks understands the unique world of non-profits. The grant tracking feature alone is worth the switch.",
      author: "Sarah J.",
      role: "Executive Director, Hope Foundation",
      avatar: "user"
    },
    faq: [
      { q: "Do you offer discounts for non-profits?", a: "Yes, we offer special pricing tiers for 501(c)(3) organizations." }
    ],
    partners: [
      { name: "Google", color: "#4285F4" },
      { name: "Slack", color: "#4A154B" },
      { name: "Gave", color: "#111111" },
      { name: "DonorDrive", color: "#007DC1" }
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
      { icon: "chart", title: "Onboarding Bottlenecks", description: "Manual data entry for 20 new hires a week is a recipe for disaster." },
      { icon: "map", title: "State Nexus Risk", description: "Hiring in new states without proper tax registration leads to massive fines." },
      { icon: "chart", title: "Reporting Drag", description: "Leadership needs headcount and burnout data, but gathering it takes days." }
    ],
    features: [
      { name: "Bulk Onboarding", description: "Onboard entire cohorts in minutes with automated offer letters and I-9 check-ins.", icon: "rocket" },
      { name: "Auto-State Registration", description: "We handle the paperwork for every new state your team expands into.", icon: "map" },
      { name: "Predictive Analytics", description: "Heads-up alerts on burnout risk and turnover trends before they happen.", icon: "trending-down" }
    ],
    testimonial: {
      quote: "We grew from 50 to 200 people in 6 months. CircleWorks was the only system that didn't just 'work'—it accelerated us.",
      author: "Michael R.",
      role: "Head of People, AstroTech",
      avatar: "user"
    },
    faq: [
      { q: "How many states do you support?", a: "All 50 US states, plus DC. We handle registrations, filings, and payments everywhere." }
    ],
    partners: [
      { name: "Slack", color: "#4A154B" },
      { name: "G-Suite", color: "#4285F4" },
      { name: "Jira", color: "#0052CC" },
      { name: "GitHub", color: "#24292F" }
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
      { icon: "shield", title: "Labor Law Changes", description: "Missing a local wage update can cost tens of thousands in penalties." },
      { icon: "file", title: "Document Splrawl", description: "I-9s and sensitive contracts scattered across email and shared drives." },
      { icon: "search", title: "Audit Anxiety", description: "Spending weeks gathering data when the DOL or IRS comes knocking." }
    ],
    features: [
      { name: "Compliance Guard", description: "Real-time alerts for local labor law changes affecting your specific locations.", icon: "shield" },
      { name: "Secure Vault", description: "Encrypted, permission-based storage for all essential employee documents.", icon: "lock" },
      { name: "1-Click Audit Export", description: "Generate comprehensive compliance reports for any period in seconds.", icon: "file" }
    ],
    testimonial: {
      quote: "Our SOC-2 audit was a breeze because CircleWorks had every document organized and every check documented.",
      author: "Rachel K.",
      role: "Compliance Officer, SecureHealth",
      avatar: "user"
    },
    faq: [
      { q: "Is your platform SOC-2 compliant?", a: "Yes, we are SOC-2 Type II compliant and undergo regular security audits." }
    ],
    partners: [
      { name: "Okta", color: "#007DC1" },
      { name: "OneLogin", color: "#000000" },
      { name: "Duo", color: "#00D364" },
      { name: "Checkr", color: "#1B9CFC" }
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
      { icon: "dollar", title: "Wasted Overhead", description: "Legacy payroll fees and manual admin time are eating your margins." },
      { icon: "award", title: "Missed Tax Credits", description: "Companies leave billions in R&D and ERTC credits on the table every year." },
      { icon: "chart", title: "Shadow Labor Costs", description: "Not understanding the fully-loaded cost of each department or project." }
    ],
    features: [
      { name: "R&D Credit Finder", description: "Automatically identify payroll expenses qualifying for high-value tax credits.", icon: "activity" },
      { name: "Benefit Price-Matching", description: "We shop the market to find the best rates for your team's health and 401k.", icon: "building" },
      { name: "Fully-Loaded Costing", description: "See the true cost of every employee, inclusive of taxes, benefits, and overhead.", icon: "dollar" }
    ],
    testimonial: {
      quote: "CircleWorks found $45k in R&D credits we didn't even know we qualified for. The platform paid for itself in day one.",
      author: "David L.",
      role: "Founder, InnovateCo",
      avatar: "user"
    },
    faq: [
      { q: "How much can I save on payroll fees?", a: "Most companies save 30-50% on legacy processing fees by switching to our unified platform." }
    ],
    partners: [
      { name: "Guideline", color: "#00B386" },
      { name: "HSA Bank", color: "#0072CE" },
      { name: "Stripe", color: "#635BFF" },
      { name: "Plaid", color: "#111111" }
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
      { icon: "globe", title: "Global Nexus Chaos", description: "Managing compliance and currencies for a 20-country team is impossible." },
      { icon: "monitor", title: "IT Logistical Hell", description: "Spending hours tracking down laptops and setting up software accounts." },
      { icon: "users", title: "Cultural Isolation", description: "Remote employees feeling disconnected from the company mission and team." }
    ],
    features: [
      { name: "IT Provisioning", description: "Automated hardware shipping and software account creation in one click.", icon: "monitor" },
      { name: "Global EOR Portal", description: "Hire in 150+ countries without setting up local legal entities.", icon: "globe" },
      { name: "Remote Culture Hub", description: "Integrated shout-outs, birthday alerts, and team-building workflows.", icon: "star" }
    ],
    testimonial: {
      quote: "CircleWorks made our 'remote-first' promise actually scalable. We can now hire talent anywhere without the HR overhead.",
      author: "Emma S.",
      role: "COO, Horizon Global",
      avatar: "user"
    },
    faq: [
      { q: "Can I pay international contractors?", a: "Yes, we support contractor payments in 120+ currencies with local compliance built-in." }
    ],
    partners: [
      { name: "Okta", color: "#007DC1" },
      { name: "Slack", color: "#4A154B" },
      { name: "Google", color: "#4285F4" },
      { name: "GitHub", color: "#24292F" }
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
