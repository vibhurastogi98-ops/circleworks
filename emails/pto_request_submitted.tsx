import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface PtoRequestSubmittedEmailProps extends TemplateProps<"pto_request_submitted"> {}

export default function PtoRequestSubmittedEmail(
  props: PtoRequestSubmittedEmailProps = getSampleTemplateProps("pto_request_submitted"),
) {
  return renderTemplateComponent("pto_request_submitted", props);
}
