"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSocketStore } from "@/store/useSocketStore";
import { useWebSocketEvents } from "@/hooks/useWebSocketEvents";
import { useAuth } from "@/context/AuthContext";

interface SocketContextType {
  isConnected: boolean;
  realtimeSyncPaused: boolean;
  realtimeDataStale: boolean;
  manualReconnect: () => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  realtimeSyncPaused: false,
  realtimeDataStale: false,
  manualReconnect: () => {},
});

export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const isConnected = useSocketStore((s) => s.isConnected);
  const realtimeSyncPaused = useSocketStore((s) => s.realtimeSyncPaused);
  const disconnectAtMs = useSocketStore((s) => s.disconnectAtMs);
  const { connect, disconnect, manualReconnect } = useSocketStore();
  const { isLoaded, isSignedIn } = useAuth();
  const [now, setNow] = useState(() => Date.now());

  useWebSocketEvents();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      disconnect();
      return;
    }

    connect("");
  }, [isLoaded, isSignedIn, connect, disconnect]);

  useEffect(() => {
    if (isConnected || !disconnectAtMs) return;
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, [isConnected, disconnectAtMs]);

  const realtimeDataStale = useMemo(() => {
    if (isConnected) return false;
    if (realtimeSyncPaused) return true;
    if (disconnectAtMs == null) return false;
    return now - disconnectAtMs > 30_000;
  }, [isConnected, realtimeSyncPaused, disconnectAtMs, now]);

  const ctx = useMemo(
    () => ({
      isConnected,
      realtimeSyncPaused,
      realtimeDataStale,
      manualReconnect,
    }),
    [isConnected, realtimeSyncPaused, realtimeDataStale, manualReconnect]
  );

  return (
    <SocketContext.Provider value={ctx}>
      {realtimeSyncPaused && (
        <div
          className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-3 border-b border-amber-700/40 bg-amber-950/95 px-4 py-2 text-sm text-amber-50 shadow-lg"
          role="status"
        >
          <span>Real-time sync paused — click to reconnect</span>
          <button
            type="button"
            onClick={() => manualReconnect()}
            className="rounded-md bg-amber-400 px-3 py-1 text-xs font-semibold text-amber-950 hover:bg-amber-300"
          >
            Reconnect
          </button>
        </div>
      )}
      {realtimeDataStale && !realtimeSyncPaused && (
        <div
          className="pointer-events-none fixed right-3 top-14 z-[199] rounded-full border border-slate-600/60 bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-300 shadow-md"
          title="WebSocket disconnected for more than 30 seconds"
        >
          Data may be outdated
        </div>
      )}
      {children}
    </SocketContext.Provider>
  );
}
