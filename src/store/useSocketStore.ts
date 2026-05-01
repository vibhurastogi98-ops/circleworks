import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  connect: (token?: string) => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;
const ENABLE_WEBSOCKETS = process.env.NEXT_PUBLIC_ENABLE_WEBSOCKETS === 'true';
const isLocalWebSocketUrl = WS_URL ? /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(WS_URL) : false;
const shouldConnectWebSocket = Boolean(WS_URL && (ENABLE_WEBSOCKETS || !isLocalWebSocketUrl));

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  reconnectAttempts: 0,
  maxReconnectAttempts: 10,
  reconnectDelay: 1000, // Start with 1 second

  connect: (token?: string) => {
    const { socket: existingSocket, disconnect } = get();

    if (!shouldConnectWebSocket || !WS_URL) {
      return;
    }

    // Disconnect existing socket if any
    if (existingSocket) {
      disconnect();
    }

    const socket = io(WS_URL, {
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
      reconnection: false, // We'll handle reconnection manually
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      set({
        socket,
        isConnected: true,
        reconnectAttempts: 0,
        reconnectDelay: 1000,
      });
    });

    socket.on('disconnect', (reason) => {
      if (process.env.NODE_ENV === 'development') {
        console.info('WebSocket disconnected:', reason);
      }
      set({ isConnected: false });

      if (reason === 'io client disconnect') {
        return;
      }

      // Attempt reconnection with exponential backoff
      const { reconnectAttempts, maxReconnectAttempts, reconnectDelay } = get();
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts), 30000); // Max 30 seconds
        set({
          reconnectAttempts: reconnectAttempts + 1,
          reconnectDelay: delay,
        });

        setTimeout(() => {
          if (process.env.NODE_ENV === 'development') {
            console.info(`Attempting reconnection ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
          }
          socket.connect();
        }, delay);
      }
    });

    socket.on('connect_error', (error) => {
      set({ isConnected: false });

      if (process.env.NODE_ENV === 'development') {
        console.info('Realtime socket unavailable:', error.message);
      }
    });

    socket.on('reconnect', () => {
      console.log('WebSocket reconnected');
      // Refetch all queries to sync missed updates
      // This will be handled by the React Query integration
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  emit: (event: string, data: any) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
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
