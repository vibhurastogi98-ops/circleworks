import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface PayStubReadyEmailProps extends TemplateProps<"pay_stub_ready"> {}

export default function PayStubReadyEmail(
  props: PayStubReadyEmailProps = getSampleTemplateProps("pay_stub_ready"),
) {
  return renderTemplateComponent("pay_stub_ready", props);
}
