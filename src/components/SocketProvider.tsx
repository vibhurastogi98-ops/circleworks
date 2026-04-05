"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@clerk/nextjs";
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

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Configuration
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    
    const socketInstance = io(socketUrl, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      auth: {
        token: "clerk-auth-token-placeholder", // In production, pass Clerk JWT
        userId: user.id,
      }
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("🟢 WebSocket Connected");

      // Join standard rooms
      const companyId = user.publicMetadata?.companyId as string || "default-company";
      socketInstance.emit("join-room", `company:${companyId}`);
      socketInstance.emit("join-room", `user:${user.id}`);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("🔴 WebSocket Disconnected");
    });

    socketInstance.on("connect_error", (err) => {
      console.error("❌ WebSocket Connection Error:", err.message);
      // Don't toast on every retry to avoid spamming
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user, isLoaded]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
