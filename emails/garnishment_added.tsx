import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface GarnishmentAddedEmailProps extends TemplateProps<"garnishment_added"> {}

export default function GarnishmentAddedEmail(
  props: GarnishmentAddedEmailProps = getSampleTemplateProps("garnishment_added"),
) {
  return renderTemplateComponent("garnishment_added", props);
}
