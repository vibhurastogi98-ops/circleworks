"use client";

import React from "react";
import SettingsSidebarLayout from "@/components/settings/SettingsSidebarLayout";
import { COMPANY_SETTINGS_NAV_ITEMS } from "@/config/settingsNavigation";

export default function CompanySettingsLayout({ children }: { children: React.ReactNode }) {
  return <SettingsSidebarLayout items={COMPANY_SETTINGS_NAV_ITEMS}>{children}</SettingsSidebarLayout>;
}
