"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const OFFLINE_TOAST_ID = "network-offline";

export default function OfflineToast() {
  useEffect(() => {
    const showOfflineToast = () => {
      toast.custom(
        () => (
          <div className="rounded-lg bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-xl">
            ⚠️ You&apos;re offline. Changes will sync when reconnected.
          </div>
        ),
        {
          id: OFFLINE_TOAST_ID,
          duration: Infinity,
          position: "bottom-center",
        },
      );
    };

    const dismissOfflineToast = () => toast.dismiss(OFFLINE_TOAST_ID);

    if (!navigator.onLine) showOfflineToast();
    window.addEventListener("offline", showOfflineToast);
    window.addEventListener("online", dismissOfflineToast);
    return () => {
      window.removeEventListener("offline", showOfflineToast);
      window.removeEventListener("online", dismissOfflineToast);
      dismissOfflineToast();
    };
  }, []);

  return null;
}
