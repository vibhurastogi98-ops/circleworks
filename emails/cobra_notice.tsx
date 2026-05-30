import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface CobraNoticeEmailProps extends TemplateProps<"cobra_notice"> {}

export default function CobraNoticeEmail(
  props: CobraNoticeEmailProps = getSampleTemplateProps("cobra_notice"),
) {
  return renderTemplateComponent("cobra_notice", props);
}
