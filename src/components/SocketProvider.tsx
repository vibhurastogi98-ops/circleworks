"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useSocketStore } from "@/store/useSocketStore";
import { useWebSocketEvents } from "@/hooks/useWebSocketEvents";

interface SocketContextType {
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

const getAuthToken = () => {
  if (typeof document === 'undefined') {
    return '';
  }

  const tokenMatch = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  if (tokenMatch) {
    const token = tokenMatch[1];
    return token.includes('.') ? token : '';
  }

  return '';
};

const hasSessionCookie = () => {
  if (typeof document === 'undefined') {
    return false;
  }

  return /(?:^|;\s*)cw_session=([^;]+)/.test(document.cookie);
};

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, connect } = useSocketStore();

  // Register all WebSocket event handlers
  useWebSocketEvents();

  useEffect(() => {
    const token = getAuthToken();
    const sessionActive = hasSessionCookie();

    if (token || sessionActive) {
      connect(token || undefined);
    }

    // Cleanup will be handled by the store's disconnect method
  }, [connect]);

  return (
    <SocketContext.Provider value={{ isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
