import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import config from '../config/environment';

interface WebSocketMessage {
  type: string;
  data: unknown;
  token?: string;
  userId?: string;
}

interface WebSocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  subscribe: (event: string, callback: (data: unknown) => void) => void;
  unsubscribe: (event: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [subscribers, setSubscribers] = useState<Map<string, (data: unknown) => void>>(new Map());
  const { user, isAuthenticated } = useAuth();

  const handleMessage = useCallback((message: WebSocketMessage) => {
    const { type, data } = message;
    
    // Handle different message types
    switch (type) {
      case 'alert': {
        // Handle emergency alerts
        console.log('Emergency alert received:', data);
        break;
      }
      case 'iot_update': {
        // Handle IoT device updates
        console.log('IoT update received:', data);
        break;
      }
      case 'tourist_update': {
        // Handle tourist status updates
        console.log('Tourist update received:', data);
        break;
      }
      case 'system_notification': {
        // Handle system notifications
        console.log('System notification received:', data);
        break;
      }
      default: {
        // Handle custom events
        const callback = subscribers.get(type);
        if (callback) {
          callback(data);
        }
        break;
      }
    }
  }, [subscribers]);

  const connectWebSocket = useCallback(() => {
    try {
      const wsUrl = config.isProduction 
        ? config.wsUrl.replace('ws://', 'wss://')
        : config.wsUrl;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setSocket(ws);
        
        // Send authentication message
        ws.send(JSON.stringify({
          type: 'auth',
          token: localStorage.getItem('token'),
          userId: user?.id,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setSocket(null);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (isAuthenticated) {
            connectWebSocket();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [isAuthenticated, user?.id, handleMessage]);

  const disconnectWebSocket = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  useEffect(() => {
    if (isAuthenticated && user) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, user, connectWebSocket, disconnectWebSocket]);


  const sendMessage = (message: WebSocketMessage) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected. Cannot send message:', message);
    }
  };

  const subscribe = (event: string, callback: (data: unknown) => void) => {
    setSubscribers(prev => new Map(prev.set(event, callback)));
  };

  const unsubscribe = (event: string) => {
    setSubscribers(prev => {
      const newMap = new Map(prev);
      newMap.delete(event);
      return newMap;
    });
  };

  const value: WebSocketContextType = {
    socket,
    isConnected,
    sendMessage,
    subscribe,
    unsubscribe,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
