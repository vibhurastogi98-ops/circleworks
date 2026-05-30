import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface ComplianceAlertCriticalEmailProps extends TemplateProps<"compliance_alert_critical"> {}

export default function ComplianceAlertCriticalEmail(
  props: ComplianceAlertCriticalEmailProps = getSampleTemplateProps("compliance_alert_critical"),
) {
  return renderTemplateComponent("compliance_alert_critical", props);
}
