"use client";

import React from "react";
import SettingsSidebarLayout from "@/components/settings/SettingsSidebarLayout";
import { AGENCY_SETTINGS_NAV_ITEMS } from "@/config/settingsNavigation";

export default function AgencySettingsLayout({ children }: { children: React.ReactNode }) {
  return <SettingsSidebarLayout items={AGENCY_SETTINGS_NAV_ITEMS}>{children}</SettingsSidebarLayout>;
}
