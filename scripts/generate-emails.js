const fs = require('fs');
const path = require('path');

// Ensure output directory exists
const outputDir = path.join(__dirname, '../src/emails/templates');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Custom MJML Base Layout mapping standard Postmark Variable Syntax
const getBaseTemplate = (title, bodyHtml, ctaText, ctaUrl) => {
  // If there's a CTA requested, add the MJML button snippet
  const buttonSnippet = ctaText && ctaUrl 
    ? `<mj-button href="{{${ctaUrl}}}" background-color="{{brand_color}}" border-radius="6px" font-size="14px" font-weight="bold" padding="24px 0">${ctaText}</mj-button>`
    : '';

  return `<mjml>
  <mj-head>
    <mj-title>${title}</mj-title>
    <mj-attributes>
      <mj-all font-family="Inter, Helvetica, Arial, sans-serif" />
      <mj-text font-size="15px" color="#334155" line-height="24px" />
    </mj-attributes>
    <mj-style>
      .body-section { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-radius: 8px; overflow: hidden; }
      .footer-text { font-size: 13px !important; color: #94a3b8 !important; }
    </mj-style>
  </mj-head>
  <mj-body background-color="#f8fafc">
    <!-- Header -->
    <mj-section padding-bottom="0px" padding-top="40px">
      <mj-column width="100%">
        <mj-image src="{{company_logo_url}}" alt="{{company_name}}" align="center" width="120px" padding-bottom="20px" />
      </mj-column>
    </mj-section>
    
    <!-- Main Content Envelope -->
    <mj-wrapper padding-top="0px" padding-bottom="40px">
      <mj-section background-color="#ffffff" padding="30px" css-class="body-section">
        <mj-column width="100%">
          <mj-text font-size="20px" font-weight="bold" color="#0f172a" padding-bottom="16px">
            ${title}
          </mj-text>
          
          <mj-text>
            ${bodyHtml}
          </mj-text>

          ${buttonSnippet}

          <mj-text padding-top="32px" color="#64748b" font-size="14px">
            Best,<br/>
            The {{company_name}} Team
          </mj-text>
        </mj-column>
      </mj-section>
      
      <!-- Footer -->
      <mj-section padding-top="20px">
        <mj-column width="100%">
          <mj-text align="center" css-class="footer-text">
            © {{current_year}} {{company_name}}. All rights reserved.
          </mj-text>
          <mj-text align="center" css-class="footer-text" padding-top="0px">
            You are receiving this email because you are a registered user of {{company_name}}. 
            <a href="{{unsubscribe_url}}" style="color: #64748b; text-decoration: underline;">Manage {{company_name}} account settings</a>.
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-wrapper>
  </mj-body>
</mjml>`;
};

// 45 transactional emails configuration derived directly from user request
const emails = [
  // Authentication & Onboarding (System)
  { id: 1, name: "01-welcome-to-circleworks", title: "Welcome to {{company_name}}!", body: "We're thrilled to have you here. To get started, please follow these 3 quick steps: <br/><br/>1. Set up your profile<br/>2. Invite your team<br/>3. Connect your payroll<br/><br/>You have {{trial_days_remaining}} remaining on your trial.", cta: "Go to Dashboard", url: "dashboard_url" },
  { id: 2, name: "02-verify-email", title: "Verify your email address", body: "Please use the code below to verify your email address. It will expire in 10 minutes.<br/><br/><strong style='font-size:24px; letter-spacing:4px'>{{verification_code}}</strong><br/><br/>Alternatively, click the button below to log in directly using your magic link.", cta: "Log in with Magic Link", url: "magic_link_url" },
  { id: 3, name: "03-password-reset", title: "Reset your password", body: "Someone recently requested a password reset for your account. If this was you, you can set a new password here:<br/><br/>This link will expire in 1 hour.<br/><br/>If you didn't request a password reset, you can safely ignore this email or contact support if you have security concerns.", cta: "Reset Password", url: "reset_url" },
  { id: 4, name: "04-new-admin-invited", title: "You've been invited to join {{company_name}}", body: "{{inviter_name}} has invited you to join the team at {{company_name}} as a(n) {{role_name}}.", cta: "Accept Invitation", url: "invite_url" },
  { id: 5, name: "05-mfa-code", title: "Your MFA Code", body: "Your one-time authentication code is:<br/><br/><strong style='font-size:24px; letter-spacing:4px'>{{mfa_code}}</strong><br/><br/>This code will expire in 5 minutes. If you did not trigger this request, please secure your account immediately.", cta: "Secure your account", url: "security_url" },
  { id: 6, name: "06-login-alert", title: "New login to your account", body: "We noticed a first-time login to your account from a new device.<br/><br/><strong>Device:</strong> {{device_name}}<br/><strong>Location:</strong> {{location}}<br/><strong>Time:</strong> {{login_time}}<br/><br/>If this wasn't you, please secure your account immediately.", cta: "Secure your account", url: "security_url" },
  
  // Billing
  { id: 7, name: "07-plan-upgraded", title: "Your plan has been upgraded!", body: "Great news! Your account has been upgraded to the <strong>{{plan_name}}</strong> plan.<br/><br/>You now have access to unlocked features including {{new_features_list}}.", cta: "Explore Now", url: "explore_url" },
  { id: 8, name: "08-invoice-receipt", title: "Invoice for {{billing_period}}", body: "Here is your receipt for the {{billing_period}} billing cycle.<br/><br/><strong>Invoice Number:</strong> {{invoice_number}}<br/><strong>Amount Paid:</strong> {{amount_paid}}<br/><br/>You will find an itemized breakdown attached to this email.", cta: "View Dashboard Receipts", url: "receipt_url" },
  { id: 9, name: "09-trial-expiring", title: "Your trial expires in 7 days", body: "Your free trial of the premium features is ending in 7 days. Add a payment method to ensure uninterrupted access to everything {{company_name}} has to offer.", cta: "Add Payment Method", url: "billing_url" },
  { id: 10, name: "10-trial-expired", title: "Your trial has expired", body: "Your trial has concluded. Your account will automatically downgrade, and you will lose access to premium features.<br/><br/>Upgrade now to restore full access.", cta: "Upgrade to Keep Access", url: "billing_url" },
  
  // HR & Employee Lifecycle
  { id: 11, name: "11-new-employee-welcome", title: "Welcome to the team!", body: "Welcome to {{company_name}}! We are extremely excited to have you onboard.<br/><br/>Please log into your new employee portal to complete your profile.", cta: "Complete your profile", url: "portal_url" },
  { id: 12, name: "12-pre-boarding-invitation", title: "Start your pre-boarding!", body: "Your first day is officially <strong>{{start_date}}</strong>!<br/><br/>We want to make sure you have everything you need on day one. Please start your pre-boarding checklist using your secure magic link below.", cta: "Start pre-boarding checklist", url: "checklist_url" },
  { id: 13, name: "13-pre-boarding-reminder", title: "Action Required: Pre-boarding tasks", body: "You have 3 days left until your start date! We noticed you still have a few remaining tasks to complete:<br/><br/>{{remaining_tasks_list}}", cta: "Complete tasks now", url: "checklist_url" },
  { id: 14, name: "14-day-1-welcome", title: "Happy First Day!", body: "It's finally here! Welcome to your first day. <br/><br/>Here is everything you need to know today to get started with your IT resources, pay stub portal, and benefits enrollment.", cta: "View your launchpad", url: "dashboard_url" },
  { id: 15, name: "15-day-3-check-in", title: "How's it going so far?", body: "You've been here for a few days now! We'd love to know how your first week is going and if you need any additional resources.<br/><br/>Please fill out this quick survey to let us know.", cta: "Take Survey", url: "survey_url" },
  { id: 16, name: "16-day-30-check-in", title: "Happy 30 Day Anniversary!", body: "Congratulations on completing your first 30 days! <br/><br/>Log into the portal to review your performance expectations and see what's coming next.", cta: "View Expectations", url: "portal_url" },
  { id: 17, name: "17-w4-reminder", title: "Reminder: Submit your W-4", body: "We haven't received your W-4 form yet. This form is legally required to ensure we withhold the correct amount of federal income tax from your pay.", cta: "Complete W-4 now", url: "w4_url" },
  { id: 18, name: "18-i9-reminder", title: "Action Required: I-9 Section 1", body: "Federal law requires that you complete Section 1 of the Form I-9 prior to your start date. Please complete this immediately.", cta: "Complete Section 1", url: "i9_url" },
  { id: 19, name: "19-background-check-complete", title: "Background Check Status", body: "The background check for {{candidate_name}} has completed via Checkr.<br/><br/><strong>Status:</strong> {{check_status}}<br/><br/>Please log in to review the report and action next steps.", cta: "View Report", url: "report_url" },
  
  // Payroll
  { id: 20, name: "20-payday-notification", title: "Your pay is on the way!", body: "Your latest paycheck has been processed and is on the way.<br/><br/><strong>Net Amount:</strong> {{net_amount}}<br/><strong>Expected Deposit Date:</strong> {{deposit_date}}", cta: "View pay stub", url: "paystub_url" },
  { id: 21, name: "21-payroll-run-approval", title: "Approval needed: Payroll Run", body: "The payroll run for period {{pay_period}} requires your approval.<br/><br/><strong>Employees:</strong> {{employee_count}}<br/><strong>Total Amount:</strong> {{total_amount}}", cta: "Approve Now", url: "approval_url" },
  { id: 22, name: "22-payroll-approved", title: "Payroll Approved", body: "Your payroll has been officially approved by {{approver_name}}. It will process on {{processing_date}}.", cta: "Run now", url: "payroll_url" },
  { id: 23, name: "23-payroll-failed", title: "Action Required: Payroll Processing Failed", body: "We encountered an issue while processing ACH transfers for your recent payroll run.<br/><br/><strong>Error:</strong> {{error_description}}<br/><br/>Please review the issues and immediately resubmit.", cta: "Fix and Re-run", url: "payroll_url" },
  { id: 24, name: "24-w2-available", title: "Your W-2 is ready!", body: "Your W-2 tax document for the year {{tax_year}} is now officially ready and available for download.", cta: "Download W-2", url: "tax_url" },
  { id: 25, name: "25-1099-available", title: "Your 1099-NEC is ready", body: "Your 1099-NEC tax document for the year {{tax_year}} is now ready.<br/><br/><strong>Reported Amount:</strong> {{reported_amount}}", cta: "Download 1099-NEC", url: "tax_url" },
  
  // Time & Approvals
  { id: 26, name: "26-pto-request-confirmation", title: "PTO Request Submitted", body: "We have successfully received your time off request.<br/><br/><strong>Dates:</strong> {{pto_dates}}<br/><strong>Type:</strong> {{pto_type}}<br/><strong>Hours:</strong> {{pto_hours}}<br/><br/>Your request is currently pending manager approval.", null: null },
  { id: 27, name: "27-pto-approved", title: "Time Off Approved", body: "Your request for time off on {{pto_dates}} has been approved by {{approver_name}}.<br/><br/>Your remaining balance is now {{remaining_balance}} hours.", null: null },
  { id: 28, name: "28-pto-denied", title: "Time Off Denied", body: "Your request for time off on {{pto_dates}} has been denied.<br/><br/><strong>Reason:</strong> {{denial_reason}}", cta: "Submit new request", url: "pto_url" },
  { id: 29, name: "29-pto-balance-warning", title: "PTO Balance Expiry Warning", body: "You have {{balance_amount}} hours of unused PTO that will expire in 30 days due to the carryover cutoff policy. Use it before you lose it!", cta: "Request time off", url: "pto_url" },
  { id: 30, name: "30-timesheet-due-reminder", title: "Reminder: Submit your timesheet", body: "Please remember to submit your timesheet for the week of {{week_dates}}. You have logged {{hours_logged}} hours so far.", cta: "Submit timesheet", url: "timesheet_url" },
  { id: 31, name: "31-timesheet-approved", title: "Timesheet Approved", body: "Your timesheet for the period {{pay_period}} ({{approved_hours}} hours) has been officially approved.", null: null },
  { id: 32, name: "32-expense-report-approved", title: "Expense Report Approved", body: "Your expense report '{{report_name}}' for {{report_amount}} has been approved by finance! It will appear on your next scheduled paycheck.", null: null },
  { id: 33, name: "33-expense-report-rejected", title: "Expense Report Rejected", body: "Your expense report '{{report_name}}' has been rejected by finance.<br/><br/><strong>Reason:</strong> {{rejection_reason}}", cta: "Resubmit", url: "expense_url" },
  
  // Benefits & COBRA
  { id: 34, name: "34-benefits-enrollment-open", title: "Open Enrollment is here!", body: "Benefits open enrollment starts today! Please log in between {{enrollment_start}} and {{enrollment_end}} to review available plans and select your benefits for the upcoming year.", cta: "Enroll Now", url: "benefits_url" },
  { id: 35, name: "35-benefits-enrollment-reminder", title: "Action Required: Open enrollment ends in 5 days", body: "You only have 5 days left to enroll in or modify your benefits! If you do not act, you will lose the opportunity to enroll until the next qualifying life event.", cta: "Enroll Now", url: "benefits_url" },
  { id: 36, name: "36-benefits-enrollment-closed", title: "Open Enrollment has closed", body: "The open enrollment period has officially concluded. Here is a brief summary of the plans you are now actively enrolled in.", cta: "View my benefits", url: "benefits_url" },
  { id: 37, name: "37-cobra-notice", title: "COBRA Continuation Coverage Notice", body: "Following your recent qualifying event, you have the right to elect COBRA continuation coverage for your health plans.<br/><br/>You have a strict 60-day window to elect coverage. Details and estimated premium amounts are listed in the portal.", cta: "View COBRA instructions", url: "cobra_url" },
  { id: 38, name: "38-qle-submitted", title: "Qualifying Life Event Submitted", body: "We have received your QLE submission ({{qle_type}}). The change window dates have been updated. Ensure you submit all required documentation.", cta: "Next steps", url: "benefits_url" },
  
  // Reviews & Compliance & System
  { id: 39, name: "39-performance-review-due", title: "Performance Review Due", body: "Your performance review period ({{review_period}}) deadline is approaching in 7 days! Please make sure to finish your self-assessments.", cta: "Start your review", url: "review_url" },
  { id: 40, name: "40-feedback-request", title: "360 Feedback Request", body: "{{requester_name}} has requested 360 feedback from you!<br/><br/>Please submit your confidential feedback prior to {{feedback_deadline}}.", cta: "Submit feedback", url: "feedback_url" },
  { id: 41, name: "41-compliance-alert", title: "Critical Compliance Alert", body: "<strong>Alert Type:</strong> {{alert_type}}<br/><strong>Due Date:</strong> {{due_date}}<br/><strong>Consequence:</strong> {{consequence}}<br/><br/>Failure to act will result in penalties. Please respond immediately.", cta: "Take action", url: "compliance_url" },
  { id: 42, name: "42-new-hire-report-due", title: "New Hire State Report Due", body: "A new hire report for {{employee_name}} is due for state reporting by {{due_date}}.", cta: "Go to Agency Link", url: "agency_url" },
  { id: 43, name: "43-integration-error", title: "Integration sync failed", body: "Your integration sync with <strong>{{integration_name}}</strong> has failed.<br/><strong>Error:</strong> {{error_description}}<br/><br/>Please review your connection settings to re-authenticate.", cta: "Fix in settings", url: "integration_settings_url" },
  { id: 44, name: "44-ewa-request-confirmation", title: "Early Wage Access Requested", body: "You have requested early access to your earned wages.<br/><br/><strong>Amount:</strong> {{ewa_amount}}<br/><strong>Deduction Date:</strong> {{next_pay_date}}", cta: "View my account", url: "ewa_url" },
  { id: 45, name: "45-termination-confirmation", title: "Offboarding Complete", body: "Your offboarding has been officially processed.<br/><br/><strong>Final Pay Date:</strong> {{final_pay_date}}<br/><strong>Benefits End Date:</strong> {{benefits_end_date}}<br/><br/>You can continue to access your tax documents and COBRA materials via the alumni portal.", cta: "Access Alumni Portal", url: "alumni_url" },
];

console.log(`Generating ${emails.length} MJML email templates...`);

emails.forEach(email => {
  const mjmlSchema = getBaseTemplate(email.title, email.body, email.cta, email.url);
  const filePath = path.join(outputDir, `${email.name}.mjml`);
  fs.writeFileSync(filePath, mjmlSchema, 'utf8');
});

console.log(`Successfully generated ${emails.length} MJML templates in ${outputDir}`);
