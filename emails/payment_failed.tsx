import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface PaymentFailedEmailProps extends TemplateProps<"payment_failed"> {}

export default function PaymentFailedEmail(
  props: PaymentFailedEmailProps = getSampleTemplateProps("payment_failed"),
) {
  return renderTemplateComponent("payment_failed", props);
}
