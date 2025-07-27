'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/use-auth';
import { useWebSocket } from '@/lib/hooks/use-websocket';

export default function WebSocketTestPage() {
  const { user, isAuthenticated } = useAuth();
  const { 
    isConnected, 
    isConnecting, 
    error,
    connect,
    joinRoom,
    lockTickets,
    getMyLocks
  } = useWebSocket();
  
  const [testEventId] = useState(1); // Use first event from your backend
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      addTestResult(`Authenticated as ${user.username} (${user.role})`);
    }
  }, [isAuthenticated, user]);

  const handleJoinRoom = () => {
    try {
      addTestResult(`🏠 Joining event room ${testEventId}...`);
      joinRoom(testEventId);
      addTestResult(`✅ Joined event room ${testEventId}`);
    } catch (err: any) {
      addTestResult(`❌ Failed to join room: ${err.message}`);
    }
  };

  useEffect(() => {
    if (isConnected && !error) {
      addTestResult('✅ WebSocket connected successfully');
      // Automatically join event room when connected
      setTimeout(() => {
        try {
          addTestResult(`🏠 Auto-joining event room ${testEventId}...`);
          joinRoom(testEventId);
          addTestResult(`✅ Auto-joined event room ${testEventId}`);
        } catch (err: any) {
          addTestResult(`❌ Failed to auto-join room: ${err.message}`);
        }
      }, 1000);
    } else if (error) {
      addTestResult(`❌ WebSocket error: ${error}`);
    }
  }, [isConnected, error, testEventId, joinRoom]);

  const handleConnect = async () => {
    try {
      addTestResult('🔌 Attempting to connect to WebSocket...');
      await connect();
    } catch (err: any) {
      addTestResult(`❌ Connection failed: ${err.message}`);
    }
  };

  const handleLockTickets = async () => {
    try {
      addTestResult('🔒 Attempting to lock tickets...');
      const result = await lockTickets(testEventId, 1, 2); // eventId=1, categoryId=1, quantity=2
      if (result.success) {
        addTestResult(`✅ Tickets locked: ${result.lockId} (expires: ${result.expiresAt})`);
      } else {
        addTestResult(`❌ Failed to lock tickets: ${result.error}`);
      }
    } catch (err: any) {
      addTestResult(`❌ Lock error: ${err.message}`);
    }
  };

  const handleGetLocks = () => {
    try {
      addTestResult('📋 Getting my locks...');
      getMyLocks();
    } catch (err: any) {
      addTestResult(`❌ Failed to get locks: ${err.message}`);
    }
  };

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
          <CardTitle>WebSocket Connection Test</CardTitle>
          <CardDescription>
            Test the realtime service WebSocket connection and features
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
          </div>

          {/* Service Info */}
          <div className="p-4 border rounded-lg bg-blue-50">
            <h3 className="font-semibold mb-2">Service Information</h3>
            <ul className="text-sm space-y-1">
              <li><strong>WebSocket URL:</strong> ws://localhost:8880/realtime</li>
              <li><strong>Authentication:</strong> JWT Token in auth object</li>
              <li><strong>User ID:</strong> {user?.id}</li>
              <li><strong>Username:</strong> {user?.username}</li>
              <li><strong>Role:</strong> {user?.role}</li>
            </ul>
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
