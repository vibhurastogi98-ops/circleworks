import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface SubscriptionCancelledEmailProps extends TemplateProps<"subscription_cancelled"> {}

export default function SubscriptionCancelledEmail(
  props: SubscriptionCancelledEmailProps = getSampleTemplateProps("subscription_cancelled"),
) {
  return renderTemplateComponent("subscription_cancelled", props);
}
