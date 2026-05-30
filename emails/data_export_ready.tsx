import { getSampleTemplateProps, renderTemplateComponent, type TemplateProps } from "../src/emails-react";

export interface DataExportReadyEmailProps extends TemplateProps<"data_export_ready"> {}

export default function DataExportReadyEmail(
  props: DataExportReadyEmailProps = getSampleTemplateProps("data_export_ready"),
) {
  return renderTemplateComponent("data_export_ready", props);
}
