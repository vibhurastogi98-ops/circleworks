import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface MfaSetupReminderEmailProps extends TemplateProps<"mfa_setup_reminder"> {}

export default function MfaSetupReminderEmail(
  props: MfaSetupReminderEmailProps = getSampleTemplateProps("mfa_setup_reminder"),
) {
  return renderTemplateComponent("mfa_setup_reminder", props);
}
