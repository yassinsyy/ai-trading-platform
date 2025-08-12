import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface PriceUpdateEvent {
  offerId: string;
  newPrice: number;
  oldPrice: number;
  reason?: string;
  timestamp: string;
}

interface UsePricingSocketOptions {
  merchantId: string;
  onPriceUpdate?: (event: PriceUpdateEvent) => void;
}

export function usePricingSocket({ merchantId, onPriceUpdate }: UsePricingSocketOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  // Создание WebSocket соединения
  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 5000,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setConnectionStatus('connected');
      newSocket.emit('subscribe', { merchantId });
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
      setConnectionStatus('error');
    });

    newSocket.on('price.updated', (event: PriceUpdateEvent) => {
      console.log('Price updated via WebSocket:', event);
      onPriceUpdate?.(event);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [merchantId, onPriceUpdate]);

  // Функция для ручного переподключения
  const reconnect = useCallback(() => {
    if (socket) {
      setConnectionStatus('connecting');
      socket.connect();
    }
  }, [socket]);

  return {
    isConnected,
    connectionStatus,
    reconnect,
    socket,
  };
}
