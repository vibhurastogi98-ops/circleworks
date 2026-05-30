import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface WelcomeNewUserEmailProps extends TemplateProps<"welcome_new_user"> {}

export default function WelcomeNewUserEmail(
  props: WelcomeNewUserEmailProps = getSampleTemplateProps("welcome_new_user"),
) {
  return renderTemplateComponent("welcome_new_user", props);
}
