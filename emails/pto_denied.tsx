import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface PtoDeniedEmailProps extends TemplateProps<"pto_denied"> {}

export default function PtoDeniedEmail(
  props: PtoDeniedEmailProps = getSampleTemplateProps("pto_denied"),
) {
  return renderTemplateComponent("pto_denied", props);
}
