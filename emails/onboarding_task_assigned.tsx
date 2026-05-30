import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface OnboardingTaskAssignedEmailProps extends TemplateProps<"onboarding_task_assigned"> {}

export default function OnboardingTaskAssignedEmail(
  props: OnboardingTaskAssignedEmailProps = getSampleTemplateProps("onboarding_task_assigned"),
) {
  return renderTemplateComponent("onboarding_task_assigned", props);
}
