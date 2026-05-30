import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface W2AvailableEmailProps extends TemplateProps<"w2_available"> {}

export default function W2AvailableEmail(
  props: W2AvailableEmailProps = getSampleTemplateProps("w2_available"),
) {
  return renderTemplateComponent("w2_available", props);
}
