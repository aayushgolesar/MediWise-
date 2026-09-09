// src/realtime/RealtimeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Context to provide the Socket instance throughout the app
const RealtimeContext = createContext<Socket | null>(null);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to backend Socket.IO server via env or default
    const apiUrl = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://localhost:4000';
    const s = io(apiUrl, { transports: ['websocket', 'polling'], withCredentials: true });
    s.on('connect', () => console.log('🔌 Socket.io client connected', s.id));
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  return <RealtimeContext.Provider value={socket}>{children}</RealtimeContext.Provider>;
};

export const useRealtime = () => useContext(RealtimeContext);
