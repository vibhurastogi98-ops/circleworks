import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface InvoiceCreatedEmailProps extends TemplateProps<"invoice_created"> {}

export default function InvoiceCreatedEmail(
  props: InvoiceCreatedEmailProps = getSampleTemplateProps("invoice_created"),
) {
  return renderTemplateComponent("invoice_created", props);
}
