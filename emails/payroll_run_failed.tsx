import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface PayrollRunFailedEmailProps extends TemplateProps<"payroll_run_failed"> {}

export default function PayrollRunFailedEmail(
  props: PayrollRunFailedEmailProps = getSampleTemplateProps("payroll_run_failed"),
) {
  return renderTemplateComponent("payroll_run_failed", props);
}
