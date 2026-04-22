"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

import { toast } from "sonner";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

// Guest Mode: Hardcoded user for socket connection
const GUEST_USER = { id: "user_2lI7hKq2Xy4Z6mN8sO1A3ZDRQRD", publicMetadata: { companyId: "comp_123" } };
const GUEST_IS_LOADED = true;

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!GUEST_IS_LOADED) return;

    // Configuration
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";
    
    const socketInstance = io(socketUrl, {
      transports: ["websocket", "polling"], // Try websocket first to avoid XHR polling errors
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
      autoConnect: true,
      auth: {
        token: "clerk-auth-token-placeholder", // In production, pass Clerk JWT
        userId: GUEST_USER.id,
      }
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("🟢 WebSocket Connected");

      // Join standard rooms
      const companyId = GUEST_USER.publicMetadata?.companyId as string || "default-company";
      socketInstance.emit("join-room", `company:${companyId}`);
      socketInstance.emit("join-room", `user:${GUEST_USER.id}`);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("🔴 WebSocket Disconnected");
    });

    socketInstance.on("connect_error", (err) => {
      // Rule: Silent log during development if backend isn't running
      console.debug("WebSocket connection attempt failed:", err.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
