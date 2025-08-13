import { useAuth } from '@/lib/hooks/use-auth';
import { useWebSocket } from '@/lib/hooks/use-websocket';
import { webSocketService } from '@/lib/websocket';
import { useEffect, useState } from 'react';

export function WebSocketDebug() {
  const { user, token, isAuthenticated } = useAuth();
  const { isConnected, connect, lockTickets } = useWebSocket();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    setDebugInfo({
      user,
      token: token ? `${token.substring(0, 20)}...` : null,
      isAuthenticated,
      isConnected,
      localStorage: typeof window !== 'undefined' ? {
        authStore: localStorage.getItem('auth-store'),
        token: localStorage.getItem('token')
      } : null
    });
  }, [user, token, isAuthenticated, isConnected]);

  const testConnection = async () => {
    try {
      console.log('Testing WebSocket connection...');
      await connect();
      console.log('WebSocket connected successfully');
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  };

  const testLockTicketsDirectly = async () => {
    if (!isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    try {
      console.log('🧪 Testing direct lock-tickets emission (like HTML client)...');
      
      // Get the raw socket from the webSocketService 
      const socket = (webSocketService as any).socket;
      
      if (!socket || !socket.connected) {
        console.error('Raw socket not available');
        return;
      }

      // Emit exactly like the HTML client
      socket.emit('lock-tickets', {
        eventId: 4,
        categoryId: 11, 
        quantity: 1,
        userId: user?.id || 11
      });
      
      console.log('🧪 Direct lock-tickets event emitted!');
    } catch (error) {
      console.error('🧪 Direct lock tickets failed:', error);
    }
  };

  const testLockTickets = async () => {
    try {
      console.log('Testing lock tickets...');
      const result = await lockTickets(4, 11, 1);
      console.log('Lock tickets result:', result);
    } catch (error) {
      console.error('Lock tickets failed:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-4">WebSocket Debug Info</h3>
      <pre className="text-xs bg-white p-2 rounded mb-4">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      <div className="space-x-2">
        <button 
          onClick={testConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Test Connection
        </button>
        <button 
          onClick={testLockTickets}
          className="px-4 py-2 bg-green-500 text-white rounded"
          disabled={!isConnected}
        >
          Test Lock Tickets
        </button>
        <button 
          onClick={testLockTicketsDirectly}
          className="px-4 py-2 bg-red-500 text-white rounded"
          disabled={!isConnected}
        >
          Test Direct Emit
        </button>
      </div>
    </div>
  );
}
