'use client';

import { useEffect } from 'react';
import { initWebSocketTest } from '@/lib/websocket-test';

export default function WebSocketTestPage() {
  useEffect(() => {
    // Initialize WebSocket test functions on the window object
    initWebSocketTest();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">WebSocket Test Page</h1>
      
      <div className="bg-gray-100 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
        <p className="mb-4">
          Open your browser&apos;s Developer Console (F12) and use these commands:
        </p>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm">
          <div className="mb-2"># Run complete test (connect → join room → lock tickets)</div>
          <div className="text-yellow-400">window.testWebSocket()</div>
          
          <div className="mb-2 mt-4"># Individual commands</div>
          <div className="text-yellow-400">window.websocketTest.connect()</div>
          <div className="text-yellow-400">window.websocketTest.joinEventRoom()</div>
          <div className="text-yellow-400">window.websocketTest.lockTickets()</div>
          <div className="text-yellow-400">window.websocketTest.disconnect()</div>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">What This Test Does</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Uses the <strong>EXACT same configuration</strong> as the working HTML client</li>
          <li>Connects to realtime service on ws://localhost:8880/realtime</li>
          <li>Uses hardcoded test values: eventId=4, categoryId=11, userId=11</li>
          <li>Will show detailed logs in console with 🧪 prefix</li>
          <li>Should trigger the new debugging logs we added to the realtime service</li>
        </ul>
      </div>

      <div className="bg-yellow-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Expected Results</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>If socket.io-client is installed:</strong> Should see successful connection and lock-tickets events</li>
          <li><strong>If socket.io-client is missing:</strong> Will show import errors</li>
          <li><strong>Backend logs:</strong> Should see our new 🎯 debugging logs in realtime service</li>
        </ul>
      </div>
    </div>
  );
}
