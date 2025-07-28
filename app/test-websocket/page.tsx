'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/use-auth';
import { useMounted } from '@/lib/hooks/use-mounted';
import { io, Socket } from 'socket.io-client';

export default function WebSocketTestPage() {
  const mounted = useMounted();
  const { user, isAuthenticated, token } = useAuth();
  
  const [testEventId] = useState(1);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLockId, setCurrentLockId] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);

  const addTestResult = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    if (!mounted) return;
    const timestamp = new Date().toLocaleTimeString();
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setTestResults(prev => [...prev, `${timestamp}: ${icon} ${message}`]);
  };

  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      addTestResult(`Authenticated as ${user.username} (${user.role})`);
      addTestResult('💡 Click "Connect WebSocket" to start testing.');
    }
  }, [mounted, isAuthenticated, user]);

  const handleConnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    if (!user) {
      addTestResult('No authenticated user found', 'error');
      return;
    }

    setIsConnecting(true);
    setError(null);
    addTestResult(`Connecting to WebSocket as user ${user.username} (ID: ${user.id})...`);

    const socket = io('ws://localhost:8880/realtime', {
      auth: {
        token: 'fake_jwt_token_for_testing' // Keep using fake token like HTML demo
      },
      query: {
        userId: user.id.toString() // Use real user ID
      }
    });

    socket.on('connect', () => {
      addTestResult('Connected to realtime service', 'success');
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    });

    socket.on('disconnect', () => {
      addTestResult('Disconnected from realtime service', 'error');
      setIsConnected(false);
      setIsConnecting(false);
      setCurrentLockId(null);
    });

    socket.on('connected', (data) => {
      addTestResult(`Server confirmed connection: ${data.sessionId}`, 'success');
    });

    socket.on('joined-event-room', (data) => {
      addTestResult(`Joined event room ${data.eventId}`, 'success');
    });

    socket.on('lock-tickets-response', (response) => {
      if (response.success) {
        addTestResult(`Tickets locked! Lock ID: ${response.lockId}`, 'success');
        addTestResult(`Lock expires at: ${new Date(response.expiresAt).toLocaleTimeString()}`);
        addTestResult(`Available tickets: ${response.availableTickets}`);
        setCurrentLockId(response.lockId);
      } else {
        addTestResult(`Lock failed: ${response.message}`, 'error');
      }
    });

    socket.on('my-locks-response', (data) => {
      addTestResult(`My locks response: ${JSON.stringify(data)}`);
    });

    socket.on('availability-update', (update) => {
      addTestResult(`Availability update: Event ${update.eventId}, Category ${update.categoryId}, Available: ${update.availableTickets}`);
    });

    socket.on('order-completed', (notification) => {
      addTestResult(`Order completed: ${notification.message}`, 'success');
    });

    socket.on('order-cancelled', (notification) => {
      addTestResult(`Order cancelled: ${notification.message}`, 'error');
    });

    socket.on('error', (error) => {
      addTestResult(`WebSocket error: ${error.message}`, 'error');
      setError(error.message);
    });

    socket.on('connect_error', (error) => {
      addTestResult(`Connection error: ${error.message}`, 'error');
      setError(error.message);
      setIsConnecting(false);
    });

    socketRef.current = socket;
  };

  const handleJoinRoom = () => {
    if (!socketRef.current?.connected) {
      addTestResult('WebSocket not connected', 'error');
      return;
    }

    if (!user) {
      addTestResult('No authenticated user found', 'error');
      return;
    }

    addTestResult(`Joining event room ${testEventId}...`);
    socketRef.current.emit('join-event-room', {
      eventId: testEventId,
      userId: user.id // Use real user ID
    });
  };

  const handleLockTickets = () => {
    if (!socketRef.current?.connected) {
      addTestResult('WebSocket not connected', 'error');
      return;
    }

    if (!user) {
      addTestResult('No authenticated user found', 'error');
      return;
    }

    addTestResult('Requesting lock for 2 tickets in category 2...');
    socketRef.current.emit('lock-tickets', {
      eventId: testEventId,
      categoryId: 2,
      quantity: 2,
      userId: user.id // Use real user ID
    });
  };

  const handleGetLocks = () => {
    if (!socketRef.current?.connected) {
      addTestResult('WebSocket not connected', 'error');
      return;
    }

    addTestResult('Getting my locks...');
    socketRef.current.emit('get-my-locks');
  };

  const handlePurchaseTickets = async () => {
    if (!currentLockId) {
      addTestResult('No tickets locked currently!', 'error');
      return;
    }

    if (!user || !token) {
      addTestResult('User not authenticated', 'error');
      return;
    }

    try {
      addTestResult('💳 Creating order with locked tickets...');

      const orderData = {
        eventId: testEventId,
        categoryId: 2,
        quantity: 2,
        lockId: currentLockId,
        notes: 'Purchase from Next.js WebSocket test client'
      };

      const orderResponse = await fetch('http://localhost:3000/api/orders/with-lock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        throw new Error(`Order creation failed: ${orderResponse.status} ${orderResponse.statusText} - ${errorText}`);
      }

      const order = await orderResponse.json();
      addTestResult(`✅ Order created successfully! Order ID: ${order.id}`, 'success');
      addTestResult(`Event: ${order.eventName || 'N/A'}`);
      addTestResult(`Category: ${order.categoryName || 'N/A'}`);
      addTestResult(`Quantity: ${order.quantity} tickets`);
      addTestResult(`Total Price: $${order.totalPrice || 'N/A'}`);
      addTestResult(`Status: ${order.status}`);
      
      // Clear the lock ID since it's been used
      setCurrentLockId(null);

    } catch (error: any) {
      addTestResult(`❌ Purchase failed: ${error.message}`, 'error');
    }
  };

  const handleDisconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    setCurrentLockId(null);
    addTestResult('Manually disconnected');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>WebSocket Test</CardTitle>
            <CardDescription>
              Please log in to test WebSocket functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>You need to be authenticated to test WebSocket features.</p>
            <p>
              <a href="/user/login" className="text-blue-600 hover:underline">
                Go to Login
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>WebSocket Connection Test (Direct Implementation)</CardTitle>
          <CardDescription>
            Simple direct WebSocket test based on working HTML client
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Connection Status</h3>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 
                isConnecting ? 'bg-yellow-500' : 
                error ? 'bg-red-500' : 'bg-gray-400'
              }`} />
              <span>
                {isConnected ? 'Connected' : 
                 isConnecting ? 'Connecting...' : 
                 error ? 'Error' : 'Disconnected'}
              </span>
              {error && <span className="text-red-600 text-sm">({error})</span>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting || isConnected}
              variant="outline"
            >
              {isConnecting ? 'Connecting...' : 'Connect WebSocket'}
            </Button>
            
            <Button 
              onClick={handleJoinRoom} 
              disabled={!isConnected}
              variant="outline"
            >
              Join Event Room {testEventId}
            </Button>
            
            <Button 
              onClick={handleLockTickets} 
              disabled={!isConnected}
              variant="outline"
            >
              Lock 2 Tickets (Event {testEventId})
            </Button>
            
            <Button 
              onClick={handleGetLocks} 
              disabled={!isConnected}
              variant="outline"
            >
              Get My Locks
            </Button>

            <Button 
              onClick={handlePurchaseTickets} 
              disabled={!currentLockId}
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              💳 Purchase Locked Tickets
            </Button>

            <Button 
              onClick={handleDisconnect} 
              disabled={!isConnected}
              variant="outline"
            >
              Disconnect
            </Button>
          </div>

          {/* Service Info */}
          <div className="p-4 border rounded-lg bg-blue-50">
            <h3 className="font-semibold mb-2">Service Information</h3>
            <ul className="text-sm space-y-1">
              <li><strong>WebSocket URL:</strong> ws://localhost:8880/realtime</li>
              <li><strong>Implementation:</strong> Direct Socket.IO client (like HTML demo)</li>
              <li><strong>Real User ID:</strong> {user?.id} (from auth store)</li>
              <li><strong>Auth Token:</strong> {token ? 'Real JWT token' : 'No token'}</li>
              <li><strong>Test Event ID:</strong> {testEventId}</li>
              <li><strong>Test Category ID:</strong> 2</li>
              <li><strong>Current Lock ID:</strong> {currentLockId || 'None'}</li>
              <li><strong>User:</strong> {user?.username} ({user?.role})</li>
            </ul>
          </div>

          {/* Step-by-step instructions */}
          <div className="p-4 border rounded-lg bg-green-50">
            <h3 className="font-semibold mb-2">Test Flow (Like HTML Demo)</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Click "Connect WebSocket" - Should connect and show success</li>
              <li>Click "Join Event Room 1" - Should join the event room</li>
              <li>Click "Lock 2 Tickets" - Should lock tickets and show lock ID</li>
              <li>Click "💳 Purchase Locked Tickets" - Should create order and complete purchase</li>
            </ol>
            <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
              <strong>Note:</strong> Uses real authenticated user data and JWT token for purchase!
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results Log</CardTitle>
          <CardDescription>
            Real-time log of WebSocket operations and events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet...</p>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button 
            onClick={() => setTestResults([])} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Clear Log
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
