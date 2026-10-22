import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState(false);

  useEffect(() => {
    if (token && user) {
      const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : window.location.origin;
      const socketInstance = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      socketInstance.on('connect', () => {
        setOnlineStatus(true);
      });

      socketInstance.on('disconnect', () => {
        setOnlineStatus(false);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setOnlineStatus(false);
      }
    }
  }, [token, user?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineStatus }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
