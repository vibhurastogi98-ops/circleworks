import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface QleApprovedEmailProps extends TemplateProps<"qle_approved"> {}

export default function QleApprovedEmail(
  props: QleApprovedEmailProps = getSampleTemplateProps("qle_approved"),
) {
  return renderTemplateComponent("qle_approved", props);
}
