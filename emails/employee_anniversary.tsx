import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface EmployeeAnniversaryEmailProps extends TemplateProps<"employee_anniversary"> {}

export default function EmployeeAnniversaryEmail(
  props: EmployeeAnniversaryEmailProps = getSampleTemplateProps("employee_anniversary"),
) {
  return renderTemplateComponent("employee_anniversary", props);
}
