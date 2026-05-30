import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface CandidateApplicationReceivedEmailProps extends TemplateProps<"candidate_application_received"> {}

export default function CandidateApplicationReceivedEmail(
  props: CandidateApplicationReceivedEmailProps = getSampleTemplateProps("candidate_application_received"),
) {
  return renderTemplateComponent("candidate_application_received", props);
}
