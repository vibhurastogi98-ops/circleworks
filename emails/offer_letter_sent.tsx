import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface OfferLetterSentEmailProps extends TemplateProps<"offer_letter_sent"> {}

export default function OfferLetterSentEmail(
  props: OfferLetterSentEmailProps = getSampleTemplateProps("offer_letter_sent"),
) {
  return renderTemplateComponent("offer_letter_sent", props);
}
