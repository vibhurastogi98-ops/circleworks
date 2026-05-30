import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface PayrollReminderEmailProps extends TemplateProps<"payroll_reminder"> {}

export default function PayrollReminderEmail(
  props: PayrollReminderEmailProps = getSampleTemplateProps("payroll_reminder"),
) {
  return renderTemplateComponent("payroll_reminder", props);
}
