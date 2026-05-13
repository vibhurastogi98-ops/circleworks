import { create } from "zustand";
import { io, Socket } from "socket.io-client";

/** Sec. 02 — WS reconnection backoff (max 6 attempts before pause banner). */
const RECONNECT_BACKOFF_MS = [1000, 2000, 4000, 8000, 16000, 32000] as const;
const MAX_RECONNECT_ATTEMPTS = 6;

let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  realtimeSyncPaused: boolean;
  /** ISO time when WS last dropped (for GET /api/events?since=) */
  lastDisconnectIso: string | null;
  /** Wall clock when disconnect began (for >30s stale UI) */
  disconnectAtMs: number | null;
  connect: (token?: string) => void;
  disconnect: () => void;
  manualReconnect: () => void;
  clearLastDisconnectIso: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;
const ENABLE_WEBSOCKETS = process.env.NEXT_PUBLIC_ENABLE_WEBSOCKETS === "true";
const isLocalWebSocketUrl = WS_URL ? /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(WS_URL) : false;
const shouldConnectWebSocket = Boolean(WS_URL && (ENABLE_WEBSOCKETS || !isLocalWebSocketUrl));

function scheduleReconnect(socket: Socket, get: () => SocketState, set: (p: Partial<SocketState>) => void) {
  const { reconnectAttempts, realtimeSyncPaused } = get();
  if (realtimeSyncPaused) return;
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    set({ realtimeSyncPaused: true });
    return;
  }
  const delay = RECONNECT_BACKOFF_MS[Math.min(reconnectAttempts, RECONNECT_BACKOFF_MS.length - 1)];
  clearReconnectTimer();
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    if (socket.disconnected) {
      socket.connect();
    }
  }, delay);
  set({ reconnectAttempts: reconnectAttempts + 1 });
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  reconnectAttempts: 0,
  maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
  realtimeSyncPaused: false,
  lastDisconnectIso: null,
  disconnectAtMs: null,

  clearLastDisconnectIso: () => set({ lastDisconnectIso: null }),

  connect: (token?: string) => {
    const { socket: existingSocket, disconnect } = get();

    if (!shouldConnectWebSocket || !WS_URL) {
      return;
    }

    clearReconnectTimer();

    if (existingSocket) {
      disconnect();
    }

    const socket = io(WS_URL, {
      auth: token ? { token } : undefined,
      transports: ["websocket", "polling"],
      reconnection: false,
      withCredentials: true,
    });

    socket.on("connect", () => {
      set({
        socket,
        isConnected: true,
        reconnectAttempts: 0,
        realtimeSyncPaused: false,
        disconnectAtMs: null,
      });
    });

    socket.on("disconnect", (reason) => {
      if (process.env.NODE_ENV === "development") {
        console.info("WebSocket disconnected:", reason);
      }
      set({ isConnected: false });

      if (reason === "io client disconnect") {
        set({ disconnectAtMs: null, lastDisconnectIso: null });
        return;
      }

      set({
        disconnectAtMs: Date.now(),
        lastDisconnectIso: new Date().toISOString(),
      });

      const { realtimeSyncPaused } = get();
      if (realtimeSyncPaused) return;

      scheduleReconnect(socket, get, set);
    });

    socket.on("connect_error", (err) => {
      set({ isConnected: false, disconnectAtMs: get().disconnectAtMs ?? Date.now() });
      if (process.env.NODE_ENV === "development") {
        console.info("Realtime socket connect_error:", err?.message);
      }
    });

    socket.on("reconnect", () => {
      if (process.env.NODE_ENV === "development") {
        console.log("WebSocket reconnected");
      }
    });

    set({ socket });
  },

  manualReconnect: () => {
    clearReconnectTimer();
    const { socket } = get();
    set({
      reconnectAttempts: 0,
      realtimeSyncPaused: false,
      disconnectAtMs: null,
    });
    if (socket && socket.disconnected) {
      socket.connect();
    } else if (socket) {
      socket.disconnect();
      socket.connect();
    }
  },

  disconnect: () => {
    clearReconnectTimer();
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({
        socket: null,
        isConnected: false,
        reconnectAttempts: 0,
        realtimeSyncPaused: false,
        lastDisconnectIso: null,
        disconnectAtMs: null,
      });
    }
  },

  emit: (event: string, data: any) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit(event, data);
    } else {
      console.warn("Socket not connected, cannot emit:", event);
    }
  },

  on: (event: string, callback: (data: any) => void) => {
    const { socket } = get();
    if (socket) {
      socket.on(event, callback);
    }
  },

  off: (event: string, callback?: (data: any) => void) => {
    const { socket } = get();
    if (socket) {
      if (callback) {
        socket.off(event, callback);
      } else {
        socket.off(event);
      }
    }
  },
}));
