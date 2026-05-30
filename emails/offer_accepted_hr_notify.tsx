import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface OfferAcceptedHrNotifyEmailProps extends TemplateProps<"offer_accepted_hr_notify"> {}

export default function OfferAcceptedHrNotifyEmail(
  props: OfferAcceptedHrNotifyEmailProps = getSampleTemplateProps("offer_accepted_hr_notify"),
) {
  return renderTemplateComponent("offer_accepted_hr_notify", props);
}
