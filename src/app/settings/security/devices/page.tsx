"use client";

import React, { useMemo, useState } from "react";
import { Laptop, Monitor, MoreHorizontal, ShieldCheck, Smartphone, Trash2 } from "lucide-react";

type SessionDevice = {
  id: string;
  type: "Desktop" | "Mobile";
  browser: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  current?: boolean;
};

const devices: SessionDevice[] = [
  {
    id: "sess_current",
    type: "Desktop",
    browser: "Chrome",
    os: "macOS",
    location: "San Francisco, CA",
    ip: "192.168.1.45",
    lastActive: "2026-05-23T10:42:00Z",
    current: true,
  },
  {
    id: "sess_mobile",
    type: "Mobile",
    browser: "Safari",
    os: "iOS",
    location: "San Francisco, CA",
    ip: "172.16.254.10",
    lastActive: "2026-05-22T18:12:00Z",
  },
  {
    id: "sess_windows",
    type: "Desktop",
    browser: "Edge",
    os: "Windows",
    location: "Austin, TX",
    ip: "10.0.0.52",
    lastActive: "2026-05-20T14:08:00Z",
  },
];

function DeviceIcon({ type }: { type: SessionDevice["type"] }) {
  if (type === "Mobile") return <Smartphone size={18} className="text-slate-500" />;
  if (type === "Desktop") return <Monitor size={18} className="text-slate-500" />;
  return <Laptop size={18} className="text-slate-500" />;
}

export default function SecurityDevicesPage() {
  const [activeDevices, setActiveDevices] = useState(devices);
  const otherDeviceCount = useMemo(() => activeDevices.filter((device) => !device.current).length, [activeDevices]);

  const signOutDevice = (id: string) => {
    setActiveDevices((current) => current.filter((device) => device.id !== id || device.current));
  };

  const signOutOthers = () => {
    setActiveDevices((current) => current.filter((device) => device.current));
  };

  return (
    <div className="flex max-w-5xl flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <ShieldCheck size={14} />
            Session security
          </div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Devices & Sessions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Review active refresh-token sessions and sign out devices you no longer recognize.
          </p>
        </div>
        <button
          type="button"
          onClick={signOutOthers}
          disabled={otherDeviceCount === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-slate-900 dark:hover:bg-red-950/30"
        >
          <Trash2 size={16} />
          Sign out all other sessions
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active sessions</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{activeDevices.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Max sessions</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">5</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Refresh token storage</p>
          <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">httpOnly cookie + Redis</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Signed-in devices</h2>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {activeDevices.map((device) => (
            <div key={device.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_180px] lg:items-center">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  <DeviceIcon type={device.type} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {device.type} · {device.browser}
                    </p>
                    {device.current && (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {device.os} · {device.location}
                  </p>
                </div>
              </div>

              <div className="text-sm text-slate-500 dark:text-slate-400">
                <p className="font-mono text-xs">{device.ip}</p>
                <p className="mt-1">Last active {new Date(device.lastActive).toLocaleString("en-US", { hour12: false })}</p>
              </div>

              <div className="flex items-center justify-start gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={() => signOutDevice(device.id)}
                  disabled={device.current}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Trash2 size={14} />
                  Sign out
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="More device actions"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-100">
        New sign-ins trigger the email alert: <span className="font-bold">New sign-in from [device] in [location]</span>.
      </div>
    </div>
  );
}
