import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface PayrollRunSubmittedEmailProps extends TemplateProps<"payroll_run_submitted"> {}

export default function PayrollRunSubmittedEmail(
  props: PayrollRunSubmittedEmailProps = getSampleTemplateProps("payroll_run_submitted"),
) {
  return renderTemplateComponent("payroll_run_submitted", props);
}
