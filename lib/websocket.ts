import { io, Socket } from 'socket.io-client';
import {
  WebSocketUser,
  JoinEventRoomRequest,
  LockTicketsRequest,
  LockTicketsResponse,
  UnlockTicketsRequest,
  UnlockTicketsResponse,
  AvailabilityUpdate,
  OrderCompletedNotification,
  OrderCancelledNotification,
  MyLocksResponse
} from './types';

export class WebSocketService {
  private socket: Socket | null = null;
  private baseURL: string;
  private isConnecting: boolean = false;
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor(baseURL: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://3.144.72.132:8880/realtime') {
    this.baseURL = baseURL;
  }

  // Connection management
  connect(user: WebSocketUser): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // If already connecting, wait for it to complete
        const checkConnection = () => {
          if (this.socket?.connected) {
            resolve();
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
        return;
      }

      this.isConnecting = true;

      try {
        this.socket = io(this.baseURL, {
          auth: {
            token: user.token || 'fake_jwt_token_for_testing'
          },
          query: {
            userId: user.userId.toString()
          }
        });

        this.socket.on('connect', () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.setupEventListeners();
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('WebSocket disconnected');
          this.emit('disconnect');
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.isConnecting = false;
          reject(error);
        });

        this.socket.on('connected', (data) => {
          console.log('Server confirmed connection:', data);
          this.emit('connected', data);
        });

        // Add a catch-all listener for debugging
        this.socket.onAny((event, ...args) => {
          console.log('📡 WebSocket event received:', event, args);
          if (event === 'lock-tickets-response') {
            console.log('🚨 RECEIVED LOCK-TICKETS-RESPONSE:', args);
          }
          if (event === 'pong') {
            console.log('🏓 RECEIVED PONG RESPONSE:', args);
          }
        });

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    console.log('🔧 Setting up WebSocket event listeners');

    // Event room events
    this.socket.on('joined-event-room', (data) => {
      console.log('🏠 Joined event room:', data);
      this.emit('joined-event-room', data);
    });

    // Ticket locking events - set up immediately like the HTML client
    this.socket.on('lock-tickets-response', (response) => {
      console.log('🔒 Received lock-tickets-response:', response);
      this.emit('lock-tickets-response', response);
    });

    this.socket.on('unlock-tickets-response', (response) => {
      console.log('🔓 Received unlock-tickets-response:', response);
      this.emit('unlock-tickets-response', response);
    });

    // Real-time availability updates
    this.socket.on('availability-update', (update: AvailabilityUpdate) => {
      this.emit('availability-update', update);
    });

    // Order notifications
    this.socket.on('order-completed', (notification: OrderCompletedNotification) => {
      this.emit('order-completed', notification);
    });

    this.socket.on('order-cancelled', (notification: OrderCancelledNotification) => {
      this.emit('order-cancelled', notification);
    });

    // Lock management
    this.socket.on('my-locks-response', (data: MyLocksResponse) => {
      this.emit('my-locks-response', data);
    });

    // Heartbeat
    this.socket.on('heartbeat-response', (data) => {
      this.emit('heartbeat-response', data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });
  }

  // Event room management
  joinEventRoom(request: JoinEventRoomRequest): void {
    if (this.socket?.connected) {
      this.socket.emit('join-event-room', request);
    } else {
      throw new Error('WebSocket not connected');
    }
  }

  // Ticket locking
  lockTickets(request: LockTicketsRequest): Promise<LockTicketsResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      console.log('🔒 Sending lock-tickets request:', request);
      console.log('🔒 Socket state:', {
        connected: this.socket.connected,
        id: this.socket.id,
        transport: this.socket.io.engine?.transport?.name
      });

      const timeout = setTimeout(() => {
        console.error('❌ Lock tickets request timeout');
        this.socket?.off('lock-tickets-response', handleResponse);
        reject(new Error('Lock tickets request timeout'));
      }, 10000);

      const handleResponse = (response: LockTicketsResponse) => {
        console.log('✅ Received lock-tickets-response in handler:', response);
        clearTimeout(timeout);
        this.socket?.off('lock-tickets-response', handleResponse);
        resolve(response);
      };

      // Use direct socket listener like the HTML client
      this.socket.on('lock-tickets-response', handleResponse);
      
      console.log('🚀 About to emit lock-tickets event...');
      console.log('🚀 Socket details:', {
        connected: this.socket.connected,
        id: this.socket.id,
        transport: this.socket.io.engine?.transport?.name
      });
      console.log('🚀 Request details:', JSON.stringify(request, null, 2));
      
      this.socket.emit('lock-tickets', request);
      console.log('🚀 lock-tickets event emitted!');
      
      // Add a test emission to see if ANY events reach the server
      console.log('🧪 Testing ping event...');
      this.socket.emit('ping', { test: 'data', timestamp: Date.now() });
      console.log('🧪 ping event emitted!');
    });
  }

  unlockTickets(request: UnlockTicketsRequest): Promise<UnlockTicketsResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        this.off('unlock-tickets-response', handleResponse);
        reject(new Error('Unlock tickets request timeout'));
      }, 10000);

      const handleResponse = (response: UnlockTicketsResponse) => {
        clearTimeout(timeout);
        this.off('unlock-tickets-response', handleResponse);
        resolve(response);
      };

      this.on('unlock-tickets-response', handleResponse);
      this.socket.emit('unlock-tickets', request);
    });
  }

  // Lock management
  getMyLocks(): void {
    if (this.socket?.connected) {
      this.socket.emit('get-my-locks');
    } else {
      throw new Error('WebSocket not connected');
    }
  }

  // Heartbeat
  sendHeartbeat(): void {
    if (this.socket?.connected) {
      this.socket.emit('heartbeat');
    }
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback?: Function): void {
    if (!this.eventListeners.has(event)) return;

    if (callback) {
      this.eventListeners.get(event)!.delete(callback);
    } else {
      this.eventListeners.delete(event);
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Auto-reconnection with exponential backoff
  private setupAutoReconnect(): void {
    let reconnectDelay = 1000; // Start with 1 second
    const maxDelay = 30000; // Max 30 seconds
    const maxAttempts = 5;
    let attempts = 0;

    const reconnect = () => {
      if (attempts >= maxAttempts) {
        console.error('Max reconnection attempts reached');
        return;
      }

      attempts++;
      console.log(`Attempting to reconnect... (${attempts}/${maxAttempts})`);

      setTimeout(() => {
        if (!this.socket?.connected) {
          this.socket?.connect();
          reconnectDelay = Math.min(reconnectDelay * 2, maxDelay);
          
          this.socket?.once('connect', () => {
            console.log('Reconnected successfully');
            attempts = 0;
            reconnectDelay = 1000;
          });

          this.socket?.once('connect_error', reconnect);
        }
      }, reconnectDelay);
    };

    this.socket?.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        reconnect();
      }
    });
  }

  // Utility methods
  getConnectionState(): {
    connected: boolean;
    connecting: boolean;
    id?: string;
  } {
    return {
      connected: this.isConnected(),
      connecting: this.isConnecting,
      id: this.socket?.id
    };
  }
}

// Create and export a singleton instance
export const webSocketService = new WebSocketService();