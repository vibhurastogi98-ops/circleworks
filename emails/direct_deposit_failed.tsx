import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface DirectDepositFailedEmailProps extends TemplateProps<"direct_deposit_failed"> {}

export default function DirectDepositFailedEmail(
  props: DirectDepositFailedEmailProps = getSampleTemplateProps("direct_deposit_failed"),
) {
  return renderTemplateComponent("direct_deposit_failed", props);
}
