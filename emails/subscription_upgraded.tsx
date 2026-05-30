import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface SubscriptionUpgradedEmailProps extends TemplateProps<"subscription_upgraded"> {}

export default function SubscriptionUpgradedEmail(
  props: SubscriptionUpgradedEmailProps = getSampleTemplateProps("subscription_upgraded"),
) {
  return renderTemplateComponent("subscription_upgraded", props);
}
