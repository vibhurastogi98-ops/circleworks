import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface SecurityAlertEmailProps extends TemplateProps<"security_alert"> {}

export default function SecurityAlertEmail(
  props: SecurityAlertEmailProps = getSampleTemplateProps("security_alert"),
) {
  return renderTemplateComponent("security_alert", props);
}
