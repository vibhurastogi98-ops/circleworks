import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface I9ExpiringWarningEmailProps extends TemplateProps<"i9_expiring_warning"> {}

export default function I9ExpiringWarningEmail(
  props: I9ExpiringWarningEmailProps = getSampleTemplateProps("i9_expiring_warning"),
) {
  return renderTemplateComponent("i9_expiring_warning", props);
}
