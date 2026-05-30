import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface OffCycleProcessedEmailProps extends TemplateProps<"off_cycle_processed"> {}

export default function OffCycleProcessedEmail(
  props: OffCycleProcessedEmailProps = getSampleTemplateProps("off_cycle_processed"),
) {
  return renderTemplateComponent("off_cycle_processed", props);
}
