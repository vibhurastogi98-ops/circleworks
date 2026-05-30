import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface PasswordResetEmailProps extends TemplateProps<"password_reset"> {}

export default function PasswordResetEmail(
  props: PasswordResetEmailProps = getSampleTemplateProps("password_reset"),
) {
  return renderTemplateComponent("password_reset", props);
}
