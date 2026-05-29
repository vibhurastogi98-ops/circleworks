"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Bell, Mail, MonitorCheck, Save, Smartphone } from "lucide-react";
import { toast } from "sonner";

import {
  getNotificationPreferencesDefaults,
  notificationCategories,
  type NotificationDigestPreference,
  type NotificationPreference,
} from "@/lib/notifications/registry";
import { Button } from "@/components/ui/button";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={checked}
      onClick={onChange}
      className={cx(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950",
        checked ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700",
      )}
    >
      <span
        className={cx(
          "inline-flex h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

export default function NotificationsSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>(() => getNotificationPreferencesDefaults());
  const [digest, setDigest] = useState<NotificationDigestPreference>({
    enabled: false,
    frequency: "realtime",
    time: "08:00",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadPreferences = async () => {
      try {
        const response = await fetch("/api/notifications/preferences", { credentials: "include" });
        if (!response.ok) throw new Error("Failed to load notification preferences");
        const data = await response.json();
        if (!mounted) return;
        setPreferences(data.preferences ?? getNotificationPreferencesDefaults());
        setDigest(data.digest ?? { enabled: false, frequency: "realtime", time: "08:00" });
      } catch {
        if (!mounted) return;
        setPreferences(getNotificationPreferencesDefaults());
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadPreferences();
    return () => {
      mounted = false;
    };
  }, []);

  const grouped = useMemo(() => {
    return notificationCategories
      .map((category) => ({
        ...category,
        items: preferences.filter((preference) => preference.category === category.value),
      }))
      .filter((category) => category.items.length > 0);
  }, [preferences]);

  const togglePreference = (type: string, channel: "inApp" | "email" | "sms") => {
    setPreferences((current) =>
      current.map((preference) =>
        preference.type === type
          ? { ...preference, [channel]: !preference[channel] }
          : preference,
      ),
    );
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ preferences, digest }),
      });

      if (!response.ok) throw new Error("Failed to save notification preferences");
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Unable to save notification preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white">Notification Preferences</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {preferences.length} notification types across product modules.
          </p>
        </div>
        <Button onClick={savePreferences} disabled={saving} className="gap-2">
          <Save size={16} />
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
              <Mail size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-950 dark:text-white">Daily summary email at 8am</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Bundle non-critical email notifications into one daily digest.
              </p>
            </div>
          </div>
          <Toggle
            checked={digest.enabled}
            label="Toggle daily summary email"
            onChange={() =>
              setDigest((current) => ({
                enabled: !current.enabled,
                frequency: !current.enabled ? "daily" : "realtime",
                time: "08:00",
              }))
            }
          />
        </div>
      </section>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="overflow-x-auto">
        <div className="grid min-w-[620px] grid-cols-[minmax(260px,1fr)_88px_88px_88px] items-center border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/70">
          <span>Notification Type</span>
          <span className="flex items-center justify-center gap-1" title="In-App"><MonitorCheck size={16} /> In-App</span>
          <span className="flex items-center justify-center gap-1" title="Email"><Mail size={16} /> Email</span>
          <span className="flex items-center justify-center gap-1" title="SMS"><Smartphone size={16} /> SMS</span>
        </div>

        {loading ? (
          <div className="p-6 text-sm font-semibold text-slate-500">Loading preferences...</div>
        ) : (
          <div className="min-w-[620px] divide-y divide-slate-200 dark:divide-slate-800">
            {grouped.map((category) => (
              <section key={category.value}>
                <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
                  {category.label}
                </div>
                {category.items.map((preference) => (
                  <div
                    key={preference.type}
                    className="grid grid-cols-[minmax(260px,1fr)_88px_88px_88px] items-center px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-900/70"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <Bell size={15} className="shrink-0 text-slate-400" />
                        <p className="truncate text-sm font-black text-slate-950 dark:text-white">{preference.label}</p>
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{preference.description}</p>
                      <code className="mt-1 block truncate text-[11px] font-bold text-slate-400">{preference.type}</code>
                    </div>
                    <div className="flex justify-center">
                      <Toggle checked={preference.inApp} label={`${preference.label} in-app`} onChange={() => togglePreference(preference.type, "inApp")} />
                    </div>
                    <div className="flex justify-center">
                      <Toggle checked={preference.email} label={`${preference.label} email`} onChange={() => togglePreference(preference.type, "email")} />
                    </div>
                    <div className="flex justify-center">
                      <Toggle checked={preference.sms} label={`${preference.label} SMS`} onChange={() => togglePreference(preference.type, "sms")} />
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
