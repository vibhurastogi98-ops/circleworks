import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface BackgroundCheckInitiatedEmailProps extends TemplateProps<"background_check_initiated"> {}

export default function BackgroundCheckInitiatedEmail(
  props: BackgroundCheckInitiatedEmailProps = getSampleTemplateProps("background_check_initiated"),
) {
  return renderTemplateComponent("background_check_initiated", props);
}
