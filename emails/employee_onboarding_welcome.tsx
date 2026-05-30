import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface EmployeeOnboardingWelcomeEmailProps extends TemplateProps<"employee_onboarding_welcome"> {}

export default function EmployeeOnboardingWelcomeEmail(
  props: EmployeeOnboardingWelcomeEmailProps = getSampleTemplateProps("employee_onboarding_welcome"),
) {
  return renderTemplateComponent("employee_onboarding_welcome", props);
}
