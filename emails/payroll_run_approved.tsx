import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface PayrollRunApprovedEmailProps extends TemplateProps<"payroll_run_approved"> {}

export default function PayrollRunApprovedEmail(
  props: PayrollRunApprovedEmailProps = getSampleTemplateProps("payroll_run_approved"),
) {
  return renderTemplateComponent("payroll_run_approved", props);
}
