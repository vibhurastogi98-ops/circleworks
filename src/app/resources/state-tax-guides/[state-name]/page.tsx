import { redirect } from "next/navigation";

import {
  getStateGuideHref,
  getStatePayrollGuide,
  statePayrollGuides,
} from "@/lib/state-payroll-guides";

type Props = {
  params: Promise<{ "state-name": string }>;
};

export function generateStaticParams() {
  return statePayrollGuides.map((state) => ({
    "state-name": state.stateCode,
  }));
}

export default async function LegacyStateTaxGuidePage({ params }: Props) {
  const { "state-name": stateName } = await params;
  const state = getStatePayrollGuide(stateName);

  redirect(state ? getStateGuideHref(state) : "/guides");
}
