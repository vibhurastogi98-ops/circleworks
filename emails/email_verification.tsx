import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface EmailVerificationEmailProps extends TemplateProps<"email_verification"> {}

export default function EmailVerificationEmail(
  props: EmailVerificationEmailProps = getSampleTemplateProps("email_verification"),
) {
  return renderTemplateComponent("email_verification", props);
}
