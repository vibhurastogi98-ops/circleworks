"use client";

import React from "react";
import SettingsSidebarLayout from "@/components/settings/SettingsSidebarLayout";
import { CREATOR_SETTINGS_NAV_ITEMS } from "@/config/settingsNavigation";

export default function CreatorSettingsLayout({ children }: { children: React.ReactNode }) {
  return <SettingsSidebarLayout items={CREATOR_SETTINGS_NAV_ITEMS}>{children}</SettingsSidebarLayout>;
}
