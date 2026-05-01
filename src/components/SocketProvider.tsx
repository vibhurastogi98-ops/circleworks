"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useSocketStore } from "@/store/useSocketStore";
import { useWebSocketEvents } from "@/hooks/useWebSocketEvents";
import { useAuth } from "@clerk/nextjs";

interface SocketContextType {
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, connect, disconnect } = useSocketStore();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  // Register all WebSocket event handlers
  useWebSocketEvents();

  useEffect(() => {
    const initializeSocket = async () => {
      if (!isLoaded) {
        return;
      }

      if (!isSignedIn) {
        disconnect();
        return;
      }

      if (isSignedIn) {
        try {
          const token = await getToken();
          if (token) {
            connect(token);
          }
        } catch (error) {
          console.error('Failed to get auth token for socket:', error);
        }
      }
    };

    initializeSocket();
  }, [isLoaded, isSignedIn, getToken, connect, disconnect]);

  return (
    <SocketContext.Provider value={{ isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
