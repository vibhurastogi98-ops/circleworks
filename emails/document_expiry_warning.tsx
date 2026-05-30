import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface DocumentExpiryWarningEmailProps extends TemplateProps<"document_expiry_warning"> {}

export default function DocumentExpiryWarningEmail(
  props: DocumentExpiryWarningEmailProps = getSampleTemplateProps("document_expiry_warning"),
) {
  return renderTemplateComponent("document_expiry_warning", props);
}
