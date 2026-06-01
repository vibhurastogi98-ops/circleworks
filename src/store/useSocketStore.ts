import { create } from "zustand";
import { io, Socket } from "socket.io-client";

const MAX_RECONNECT_DELAY_MS = 30000;
const MAX_RECONNECT_ATTEMPTS = 10;

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
  companyId: string | null;
  userId: string | null;
  connect: (
    token?: string,
    options?: { companyId?: string; userId?: string },
  ) => void;
  disconnect: () => void;
  manualReconnect: () => void;
  joinRooms: (companyId?: string, userId?: string) => void;
  clearLastDisconnectIso: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;
const websocketsExplicitlyDisabled = process.env.NEXT_PUBLIC_ENABLE_WEBSOCKETS === "false";
const shouldConnectWebSocket = Boolean(WS_URL) && !websocketsExplicitlyDisabled;

function scheduleReconnect(
  socket: Socket,
  get: () => SocketState,
  set: (p: Partial<SocketState>) => void,
) {
  const { reconnectAttempts, realtimeSyncPaused } = get();
  if (realtimeSyncPaused) return;
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    set({ realtimeSyncPaused: true });
    return;
  }
  const delay = Math.min(1000 * 2 ** reconnectAttempts, MAX_RECONNECT_DELAY_MS);
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
  companyId: null,
  userId: null,

  clearLastDisconnectIso: () => set({ lastDisconnectIso: null }),

  connect: (token?: string, options = {}) => {
    const { socket: existingSocket, disconnect } = get();

    if (!shouldConnectWebSocket || !WS_URL) {
      return;
    }

    clearReconnectTimer();

    if (existingSocket) {
      disconnect();
    }

    const socket = io(WS_URL, {
      auth: {
        ...(token ? { token } : {}),
        ...(options.companyId ? { companyId: options.companyId } : {}),
        ...(options.userId ? { userId: options.userId } : {}),
      },
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
        companyId: options.companyId || get().companyId,
        userId: options.userId || get().userId,
      });
      get().joinRooms(options.companyId, options.userId);
    });

    socket.on("connected", (data: { companyId?: string; userId?: string }) => {
      set({
        companyId: data.companyId || options.companyId || get().companyId,
        userId: data.userId || options.userId || get().userId,
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
      set({
        isConnected: false,
        disconnectAtMs: get().disconnectAtMs ?? Date.now(),
      });
      if (process.env.NODE_ENV === "development") {
        console.info("Realtime socket connect_error:", err?.message);
      }
      scheduleReconnect(socket, get, set);
    });

    set({
      socket,
      companyId: options.companyId || null,
      userId: options.userId || null,
    });
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

  joinRooms: (companyId?: string, userId?: string) => {
    const { socket } = get();
    const nextCompanyId = companyId || get().companyId;
    const nextUserId = userId || get().userId;
    const rooms = [
      nextCompanyId ? `company:${nextCompanyId}` : null,
      nextUserId ? `user:${nextUserId}` : null,
    ].filter(Boolean);

    if (nextCompanyId || nextUserId) {
      set({
        companyId: nextCompanyId || null,
        userId: nextUserId || null,
      });
    }

    if (socket?.connected && rooms.length) {
      socket.emit("join", { companyId: nextCompanyId, rooms });
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
        companyId: null,
        userId: null,
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
