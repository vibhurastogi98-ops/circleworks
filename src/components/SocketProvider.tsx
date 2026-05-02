"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useSocketStore } from "@/store/useSocketStore";
import { useWebSocketEvents } from "@/hooks/useWebSocketEvents";
import { useAuth } from "@/context/AuthContext";

interface SocketContextType {
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, connect, disconnect } = useSocketStore();
  const { isLoaded, isSignedIn } = useAuth();

  // Register all WebSocket event handlers
  useWebSocketEvents();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      disconnect();
      return;
    }

    connect("");
  }, [isLoaded, isSignedIn, connect, disconnect]);

  return (
    <SocketContext.Provider value={{ isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
