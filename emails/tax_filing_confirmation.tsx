import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface TaxFilingConfirmationEmailProps extends TemplateProps<"tax_filing_confirmation"> {}

export default function TaxFilingConfirmationEmail(
  props: TaxFilingConfirmationEmailProps = getSampleTemplateProps("tax_filing_confirmation"),
) {
  return renderTemplateComponent("tax_filing_confirmation", props);
}
