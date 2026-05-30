import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface TrialExpiringEmailProps extends TemplateProps<"trial_expiring"> {}

export default function TrialExpiringEmail(
  props: TrialExpiringEmailProps = getSampleTemplateProps("trial_expiring"),
) {
  return renderTemplateComponent("trial_expiring", props);
}
