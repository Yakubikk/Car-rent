import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  // Event subscription helpers
  subscribeToClass: (classId: string) => void;
  unsubscribeFromClass: (classId: string) => void;
  subscribeToAssignment: (assignmentId: string) => void;
  unsubscribeFromAssignment: (assignmentId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const newSocket = io('http://localhost:3000', {
      auth: {
        token: localStorage.getItem('token')
      },
      autoConnect: true,
      reconnection: true
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user]);

  // Class subscription
  const subscribeToClass = useCallback((classId: string) => {
    if (socket && isConnected) {
      socket.emit('subscribe:class', { classId });
      console.log(`Subscribed to class: ${classId}`);
    }
  }, [socket, isConnected]);

  const unsubscribeFromClass = useCallback((classId: string) => {
    if (socket && isConnected) {
      socket.emit('unsubscribe:class', { classId });
      console.log(`Unsubscribed from class: ${classId}`);
    }
  }, [socket, isConnected]);

  // Assignment subscription
  const subscribeToAssignment = useCallback((assignmentId: string) => {
    if (socket && isConnected) {
      socket.emit('subscribe:assignment', { assignmentId });
      console.log(`Subscribed to assignment: ${assignmentId}`);
    }
  }, [socket, isConnected]);

  const unsubscribeFromAssignment = useCallback((assignmentId: string) => {
    if (socket && isConnected) {
      socket.emit('unsubscribe:assignment', { assignmentId });
      console.log(`Unsubscribed from assignment: ${assignmentId}`);
    }
  }, [socket, isConnected]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        subscribeToClass,
        unsubscribeFromClass,
        subscribeToAssignment,
        unsubscribeFromAssignment
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
};
