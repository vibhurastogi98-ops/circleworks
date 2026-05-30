import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface TerminationConfirmationEmailProps extends TemplateProps<"termination_confirmation"> {}

export default function TerminationConfirmationEmail(
  props: TerminationConfirmationEmailProps = getSampleTemplateProps("termination_confirmation"),
) {
  return renderTemplateComponent("termination_confirmation", props);
}
