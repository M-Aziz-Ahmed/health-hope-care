'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

// SocketProvider: only creates a socket when NEXT_PUBLIC_SOCKET_URL is configured.
// This avoids creating socket connections by default on Vercel. If you want
// real-time features, set NEXT_PUBLIC_SOCKET_URL to your external socket server.
export const SocketProvider = ({ children, userId }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!userId || !socketUrl) return;

    // Dynamically import socket.io-client to avoid loading it when not used
    let socketInstance;
    (async () => {
      try {
        const { io } = await import('socket.io-client');
        socketInstance = io(socketUrl, { path: '/socket.io' });

        socketInstance.on('connect', () => {
          console.log('Socket connected:', socketInstance.id);
          setIsConnected(true);
          socketInstance.emit('join', userId);
        });

        socketInstance.on('disconnect', () => {
          console.log('Socket disconnected');
          setIsConnected(false);
        });

        setSocket(socketInstance);
      } catch (err) {
        console.warn('Socket.IO client not initialized:', err);
      }
    })();

    return () => {
      try { socketInstance?.disconnect(); } catch (e) {}
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
