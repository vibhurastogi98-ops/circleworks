import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface PtoApprovedEmailProps extends TemplateProps<"pto_approved"> {}

export default function PtoApprovedEmail(
  props: PtoApprovedEmailProps = getSampleTemplateProps("pto_approved"),
) {
  return renderTemplateComponent("pto_approved", props);
}
