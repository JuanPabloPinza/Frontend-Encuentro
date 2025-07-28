import { create } from 'zustand';
import { webSocketService } from '../websocket';
import { AvailabilityUpdate, MyLocksResponse } from '../types';

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  currentLocks: MyLocksResponse['locks'];
  availabilityUpdates: AvailabilityUpdate[];
  error: string | null;
  currentEventRoom: number | null;

  // Actions
  connect: (userId: number, token?: string) => Promise<{ success: boolean; error?: string }>;
  disconnect: () => void;
  joinEventRoom: (eventId: number, userId: number) => void;
  lockTickets: (eventId: number, categoryId: number, quantity: number, userId: number) => Promise<{ success: boolean; lockId?: string; expiresAt?: string; availableTickets?: number; error?: string }>;
  unlockTickets: (eventId: number, categoryId: number, quantity: number, userId: number) => Promise<{ success: boolean; error?: string }>;
  getMyLocks: () => void;
  clearError: () => void;
  clearAvailabilityUpdates: () => void;
  addAvailabilityUpdate: (update: AvailabilityUpdate) => void;
  updateLocks: (locks: MyLocksResponse['locks']) => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  isConnected: false,
  isConnecting: false,
  currentLocks: [],
  availabilityUpdates: [],
  error: null,
  currentEventRoom: null,

  connect: async (userId: number, token?: string) => {
    if (get().isConnected) {
      return { success: true };
    }

    set({ isConnecting: true, error: null });

    try {
      await webSocketService.connect({ userId, token });

      // Set up event listeners
      webSocketService.on('connected', (data: any) => {
        console.log('WebSocket connection confirmed:', data);
      });

      webSocketService.on('disconnect', () => {
        set({ 
          isConnected: false, 
          isConnecting: false,
          currentEventRoom: null,
          currentLocks: [],
          error: 'Connection lost'
        });
      });

      webSocketService.on('joined-event-room', (data: any) => {
        set({ currentEventRoom: data.eventId });
      });

      webSocketService.on('availability-update', (update: AvailabilityUpdate) => {
        get().addAvailabilityUpdate(update);
      });

      webSocketService.on('my-locks-response', (data: MyLocksResponse) => {
        get().updateLocks(data.locks);
      });

      webSocketService.on('order-completed', (notification: any) => {
        console.log('Order completed:', notification);
        // You might want to emit this to other stores or components
      });

      webSocketService.on('order-cancelled', (notification: any) => {
        console.log('Order cancelled:', notification);
        // You might want to emit this to other stores or components
      });

      webSocketService.on('error', (error: any) => {
        set({ error: error.message || 'WebSocket error occurred' });
      });

      set({ 
        isConnected: true, 
        isConnecting: false, 
        error: null 
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect to WebSocket';
      set({ 
        isConnected: false, 
        isConnecting: false, 
        error: errorMessage 
      });

      return { success: false, error: errorMessage };
    }
  },

  disconnect: () => {
    webSocketService.disconnect();
    set({
      isConnected: false,
      isConnecting: false,
      currentLocks: [],
      availabilityUpdates: [],
      currentEventRoom: null,
      error: null
    });
  },

  joinEventRoom: (eventId: number, userId: number) => {
    try {
      // Use hardcoded userId like the working HTML client
      webSocketService.joinEventRoom({ eventId, userId: 1 });
    } catch (error: any) {
      set({ error: error.message || 'Failed to join event room' });
    }
  },

  lockTickets: async (eventId: number, categoryId: number, quantity: number, userId: number) => {
    try {
      const response = await webSocketService.lockTickets({
        eventId,
        categoryId,
        quantity,
        userId: 1 // Use hardcoded userId like the working HTML client
      });

      if (response.success) {
        return {
          success: true,
          lockId: response.lockId,
          expiresAt: response.expiresAt,
          availableTickets: response.availableTickets
        };
      } else {
        const errorMessage = response.message || 'Failed to lock tickets';
        set({ error: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to lock tickets';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  unlockTickets: async (eventId: number, categoryId: number, quantity: number, userId: number) => {
    try {
      const response = await webSocketService.unlockTickets({
        eventId,
        categoryId,
        quantity,
        userId: 1 // Use hardcoded userId like the working HTML client
      });

      if (response.success) {
        return { success: true };
      } else {
        const errorMessage = response.message || 'Failed to unlock tickets';
        set({ error: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to unlock tickets';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  getMyLocks: () => {
    try {
      webSocketService.getMyLocks();
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch current locks' });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearAvailabilityUpdates: () => {
    set({ availabilityUpdates: [] });
  },

  addAvailabilityUpdate: (update: AvailabilityUpdate) => {
    const currentUpdates = get().availabilityUpdates;
    // Keep only the last 50 updates to prevent memory issues
    const newUpdates = [update, ...currentUpdates].slice(0, 50);
    set({ availabilityUpdates: newUpdates });
  },

  updateLocks: (locks: MyLocksResponse['locks']) => {
    set({ currentLocks: locks });
  }
}));