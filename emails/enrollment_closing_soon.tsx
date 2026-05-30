import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface EnrollmentClosingSoonEmailProps extends TemplateProps<"enrollment_closing_soon"> {}

export default function EnrollmentClosingSoonEmail(
  props: EnrollmentClosingSoonEmailProps = getSampleTemplateProps("enrollment_closing_soon"),
) {
  return renderTemplateComponent("enrollment_closing_soon", props);
}
