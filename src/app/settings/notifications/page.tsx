"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { mockNotifications } from "@/data/mockSettings";

export default function NotificationsSettingsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const toggleStatus = (id: string, channel: 'email' | 'inApp' | 'slack' | 'sms') => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, [channel]: !n[channel] } : n
    ));
  };

  const categories = Array.from(new Set(notifications.map(n => n.category)));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure global event alerts and delivery channels.</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {categories.map((category) => (
          <div key={category} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{category} Events</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3 w-1/2">Event Trigger</th>
                    <th className="px-6 py-3 text-center">In-App</th>
                    <th className="px-6 py-3 text-center">Email</th>
                    <th className="px-6 py-3 text-center">Slack</th>
                    <th className="px-6 py-3 text-center">SMS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.filter(n => n.category === category).map((notif) => (
                    <tr key={notif.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{notif.event}</td>
                      
                      {/* Toggles */}
                      {(['inApp', 'email', 'slack', 'sms'] as const).map((channel) => (
                        <td key={channel} className="px-6 py-4 text-center">
                          <button 
                            onClick={() => toggleStatus(notif.id, channel)}
                            className={`w-10 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${notif[channel] ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                          >
                            <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform flex items-center justify-center ${notif[channel] ? 'translate-x-4' : 'translate-x-0'}`}>
                              {notif[channel] ? <Check size={10} className="text-blue-600" /> : <X size={10} className="text-slate-400" />}
                            </span>
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
