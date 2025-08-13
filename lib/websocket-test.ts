import { io, Socket } from 'socket.io-client';

// Test WebSocket connection using the EXACT same configuration as the working HTML client
export class WebSocketTest {
  private socket: Socket | null = null;

  async connect() {
    console.log('🧪 [WEBSOCKET TEST] Connecting using HTML client configuration...');
    
    // Use EXACT same configuration as working HTML client
    this.socket = io('ws://localhost:8880/realtime', {
      auth: {
        token: 'fake_jwt_token_for_testing'
      },
      query: {
        userId: '11'
      }
    });

    this.socket.on('connect', () => {
      console.log('🧪 [WEBSOCKET TEST] ✅ Connected to realtime service');
      console.log('🧪 [WEBSOCKET TEST] Socket ID:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('🧪 [WEBSOCKET TEST] ❌ Disconnected from realtime service');
    });

    this.socket.on('connected', (data) => {
      console.log('🧪 [WEBSOCKET TEST] ✅ Server confirmed connection:', data);
    });

    this.socket.on('joined-event-room', (data) => {
      console.log('🧪 [WEBSOCKET TEST] ✅ Joined event room:', data);
    });

    this.socket.on('lock-tickets-response', (response) => {
      console.log('🧪 [WEBSOCKET TEST] ✅ Lock tickets response:', response);
    });

    this.socket.on('error', (error) => {
      console.log('🧪 [WEBSOCKET TEST] ❌ Error:', error);
    });
  }

  async joinEventRoom() {
    if (!this.socket?.connected) {
      console.log('🧪 [WEBSOCKET TEST] ❌ Socket not connected');
      return;
    }

    console.log('🧪 [WEBSOCKET TEST] 🏠 Joining event room...');
    this.socket.emit('join-event-room', {
      eventId: 4,
      userId: 11
    });
  }

  async lockTickets() {
    if (!this.socket?.connected) {
      console.log('🧪 [WEBSOCKET TEST] ❌ Socket not connected');
      return;
    }

    console.log('🧪 [WEBSOCKET TEST] 🔒 Attempting to lock tickets...');
    console.log('🧪 [WEBSOCKET TEST] Socket state:', {
      connected: this.socket.connected,
      id: this.socket.id,
      disconnected: this.socket.disconnected
    });

    this.socket.emit('lock-tickets', {
      eventId: 4,
      categoryId: 10,  // Using existing categoryId that works in HTML
      quantity: 2,
      userId: 11
    });

    console.log('🧪 [WEBSOCKET TEST] 📤 Lock tickets event emitted');
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🧪 [WEBSOCKET TEST] Disconnected');
    }
  }
}

// Global test function
declare global {
  interface Window {
    websocketTest: WebSocketTest;
    testWebSocket: () => Promise<void>;
  }
}

// Export a global test function
export const initWebSocketTest = () => {
  const test = new WebSocketTest();
  
  if (typeof window !== 'undefined') {
    window.websocketTest = test;
    window.testWebSocket = async () => {
      console.log('🧪 [WEBSOCKET TEST] Starting WebSocket test...');
      await test.connect();
      
      // Wait a bit then join room
      setTimeout(() => {
        test.joinEventRoom();
      }, 1000);
      
      // Wait a bit more then try to lock tickets
      setTimeout(() => {
        test.lockTickets();
      }, 2000);
    };
    
    console.log('🧪 [WEBSOCKET TEST] Test functions available:');
    console.log('🧪 - window.testWebSocket() // Run complete test');
    console.log('🧪 - window.websocketTest.connect() // Connect only');
    console.log('🧪 - window.websocketTest.lockTickets() // Lock tickets');
  }
  
  return test;
};
