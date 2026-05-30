import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface CandidateRejectedEmailProps extends TemplateProps<"candidate_rejected"> {}

export default function CandidateRejectedEmail(
  props: CandidateRejectedEmailProps = getSampleTemplateProps("candidate_rejected"),
) {
  return renderTemplateComponent("candidate_rejected", props);
}
