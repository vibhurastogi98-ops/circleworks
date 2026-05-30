import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface FilingDeadlineReminderEmailProps extends TemplateProps<"filing_deadline_reminder"> {}

export default function FilingDeadlineReminderEmail(
  props: FilingDeadlineReminderEmailProps = getSampleTemplateProps("filing_deadline_reminder"),
) {
  return renderTemplateComponent("filing_deadline_reminder", props);
}
