import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface EnrollmentConfirmationEmailProps extends TemplateProps<"enrollment_confirmation"> {}

export default function EnrollmentConfirmationEmail(
  props: EnrollmentConfirmationEmailProps = getSampleTemplateProps("enrollment_confirmation"),
) {
  return renderTemplateComponent("enrollment_confirmation", props);
}
