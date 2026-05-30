import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface OfferDeclinedHrNotifyEmailProps extends TemplateProps<"offer_declined_hr_notify"> {}

export default function OfferDeclinedHrNotifyEmail(
  props: OfferDeclinedHrNotifyEmailProps = getSampleTemplateProps("offer_declined_hr_notify"),
) {
  return renderTemplateComponent("offer_declined_hr_notify", props);
}
