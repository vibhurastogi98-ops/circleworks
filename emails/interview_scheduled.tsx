import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface InterviewScheduledEmailProps extends TemplateProps<"interview_scheduled"> {}

export default function InterviewScheduledEmail(
  props: InterviewScheduledEmailProps = getSampleTemplateProps("interview_scheduled"),
) {
  return renderTemplateComponent("interview_scheduled", props);
}
