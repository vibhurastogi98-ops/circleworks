import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface InvitationToCompanyEmailProps extends TemplateProps<"invitation_to_company"> {}

export default function InvitationToCompanyEmail(
  props: InvitationToCompanyEmailProps = getSampleTemplateProps("invitation_to_company"),
) {
  return renderTemplateComponent("invitation_to_company", props);
}
