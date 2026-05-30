import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface OpenEnrollmentStartedEmailProps extends TemplateProps<"open_enrollment_started"> {}

export default function OpenEnrollmentStartedEmail(
  props: OpenEnrollmentStartedEmailProps = getSampleTemplateProps("open_enrollment_started"),
) {
  return renderTemplateComponent("open_enrollment_started", props);
}
