import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const templates = [
  ["pay_stub_ready", "PayStubReadyEmail"],
  ["payroll_run_submitted", "PayrollRunSubmittedEmail"],
  ["payroll_run_approved", "PayrollRunApprovedEmail"],
  ["payroll_run_failed", "PayrollRunFailedEmail"],
  ["tax_filing_confirmation", "TaxFilingConfirmationEmail"],
  ["w2_available", "W2AvailableEmail"],
  ["direct_deposit_failed", "DirectDepositFailedEmail"],
  ["garnishment_added", "GarnishmentAddedEmail"],
  ["off_cycle_processed", "OffCycleProcessedEmail"],
  ["payroll_reminder", "PayrollReminderEmail"],
  ["welcome_new_user", "WelcomeNewUserEmail"],
  ["email_verification", "EmailVerificationEmail"],
  ["password_reset", "PasswordResetEmail"],
  ["invitation_to_company", "InvitationToCompanyEmail"],
  ["mfa_setup_reminder", "MfaSetupReminderEmail"],
  ["employee_onboarding_welcome", "EmployeeOnboardingWelcomeEmail"],
  ["onboarding_task_assigned", "OnboardingTaskAssignedEmail"],
  ["document_expiry_warning", "DocumentExpiryWarningEmail"],
  ["pto_request_submitted", "PtoRequestSubmittedEmail"],
  ["pto_approved", "PtoApprovedEmail"],
  ["pto_denied", "PtoDeniedEmail"],
  ["employee_anniversary", "EmployeeAnniversaryEmail"],
  ["termination_confirmation", "TerminationConfirmationEmail"],
  ["open_enrollment_started", "OpenEnrollmentStartedEmail"],
  ["enrollment_closing_soon", "EnrollmentClosingSoonEmail"],
  ["enrollment_confirmation", "EnrollmentConfirmationEmail"],
  ["qle_approved", "QleApprovedEmail"],
  ["cobra_notice", "CobraNoticeEmail"],
  ["candidate_application_received", "CandidateApplicationReceivedEmail"],
  ["interview_scheduled", "InterviewScheduledEmail"],
  ["offer_letter_sent", "OfferLetterSentEmail"],
  ["offer_accepted_hr_notify", "OfferAcceptedHrNotifyEmail"],
  ["offer_declined_hr_notify", "OfferDeclinedHrNotifyEmail"],
  ["candidate_rejected", "CandidateRejectedEmail"],
  ["background_check_initiated", "BackgroundCheckInitiatedEmail"],
  ["compliance_alert_critical", "ComplianceAlertCriticalEmail"],
  ["i9_expiring_warning", "I9ExpiringWarningEmail"],
  ["filing_deadline_reminder", "FilingDeadlineReminderEmail"],
  ["invoice_created", "InvoiceCreatedEmail"],
  ["payment_failed", "PaymentFailedEmail"],
  ["trial_expiring", "TrialExpiringEmail"],
  ["subscription_upgraded", "SubscriptionUpgradedEmail"],
  ["subscription_cancelled", "SubscriptionCancelledEmail"],
  ["data_export_ready", "DataExportReadyEmail"],
  ["security_alert", "SecurityAlertEmail"],
];

const outputDir = path.join(process.cwd(), "emails");
await mkdir(outputDir, { recursive: true });

await Promise.all(
  templates.map(async ([slug, componentName]) => {
    const interfaceName = `${componentName}Props`;
    const source = `import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface ${interfaceName} extends TemplateProps<"${slug}"> {}

export default function ${componentName}(
  props: ${interfaceName} = getSampleTemplateProps("${slug}"),
) {
  return renderTemplateComponent("${slug}", props);
}
`;

    await writeFile(path.join(outputDir, `${slug}.tsx`), source);
  }),
);

console.log(`Generated ${templates.length} React Email wrapper templates in ${outputDir}`);
