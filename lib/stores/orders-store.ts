import { create } from 'zustand';
import { Order, CreateOrderRequest, CreateOrderWithLockRequest } from '../types';
import { apiService } from '../api';

interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMyOrders: () => Promise<void>;
  fetchAllOrders: () => Promise<void>;
  fetchOrdersByEvent: (eventId: number) => Promise<void>;
  fetchOrderById: (id: number) => Promise<void>;
  createOrder: (orderData: CreateOrderRequest) => Promise<{ success: boolean; order?: Order; error?: string }>;
  createOrderWithLock: (orderData: CreateOrderWithLockRequest) => Promise<{ success: boolean; order?: Order; error?: string }>;
  cancelOrder: (id: number) => Promise<{ success: boolean; error?: string }>;
  setCurrentOrder: (order: Order | null) => void;
  clearError: () => void;
  clearOrders: () => void;
  updateOrderStatus: (orderId: number, status: Order['status']) => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  fetchMyOrders: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const rawOrders = await apiService.getMyOrders();
      
      // Transform orders to ensure numeric values
      const orders = rawOrders.map(order => ({
        ...order,
        totalPrice: typeof order.totalPrice === 'string' 
          ? parseFloat(order.totalPrice) 
          : order.totalPrice,
        unitPrice: typeof order.unitPrice === 'string' 
          ? parseFloat(order.unitPrice) 
          : order.unitPrice,
        quantity: typeof order.quantity === 'string' 
          ? parseInt(order.quantity) 
          : order.quantity,
        eventId: typeof order.eventId === 'string' 
          ? parseInt(order.eventId) 
          : order.eventId,
        categoryId: typeof order.categoryId === 'string' 
          ? parseInt(order.categoryId) 
          : order.categoryId,
        userId: typeof order.userId === 'string' 
          ? parseInt(order.userId) 
          : order.userId,
        id: typeof order.id === 'string' 
          ? parseInt(order.id) 
          : order.id
      }));
      
      set({
        orders,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      set({
        orders: [],
        isLoading: false,
        error: error.message || 'Failed to fetch orders'
      });
    }
  },

  fetchAllOrders: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const rawOrders = await apiService.getAllOrders();
      
      // Transform orders to ensure numeric values
      const orders = rawOrders.map(order => ({
        ...order,
        totalPrice: typeof order.totalPrice === 'string' 
          ? parseFloat(order.totalPrice) 
          : order.totalPrice,
        unitPrice: typeof order.unitPrice === 'string' 
          ? parseFloat(order.unitPrice) 
          : order.unitPrice,
        quantity: typeof order.quantity === 'string' 
          ? parseInt(order.quantity) 
          : order.quantity,
        eventId: typeof order.eventId === 'string' 
          ? parseInt(order.eventId) 
          : order.eventId,
        categoryId: typeof order.categoryId === 'string' 
          ? parseInt(order.categoryId) 
          : order.categoryId,
        userId: typeof order.userId === 'string' 
          ? parseInt(order.userId) 
          : order.userId,
        id: typeof order.id === 'string' 
          ? parseInt(order.id) 
          : order.id
      }));
      
      set({
        orders,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        orders: [],
        isLoading: false,
        error: error.message || 'Failed to fetch all orders'
      });
    }
  },

  fetchOrdersByEvent: async (eventId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const orders = await apiService.getOrdersByEvent(eventId);
      set({
        orders,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        orders: [],
        isLoading: false,
        error: error.message || `Failed to fetch orders for event ${eventId}`
      });
    }
  },

  fetchOrderById: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const order = await apiService.getOrderById(id);
      set({
        currentOrder: order,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        currentOrder: null,
        isLoading: false,
        error: error.message || 'Failed to fetch order details'
      });
    }
  },

  createOrder: async (orderData: CreateOrderRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const order = await apiService.createOrder(orderData);
      
      // Add the new order to the orders list
      const currentOrders = get().orders;
      set({
        orders: [order, ...currentOrders],
        isLoading: false,
        error: null
      });

      return { success: true, order };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create order';
      set({
        isLoading: false,
        error: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  },

  createOrderWithLock: async (orderData: CreateOrderWithLockRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const order = await apiService.createOrderWithLock(orderData);
      
      // Add the new order to the orders list
      const currentOrders = get().orders;
      set({
        orders: [order, ...currentOrders],
        isLoading: false,
        error: null
      });

      return { success: true, order };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create order with lock';
      set({
        isLoading: false,
        error: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  },

  cancelOrder: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      await apiService.cancelOrder(id);
      
      // Update the order status in the orders list
      const currentOrders = get().orders;
      const updatedOrders = currentOrders.map(order => 
        order.id === id ? { ...order, status: 'cancelled' as const } : order
      );
      
      set({
        orders: updatedOrders,
        currentOrder: get().currentOrder?.id === id 
          ? { ...get().currentOrder!, status: 'cancelled' } 
          : get().currentOrder,
        isLoading: false,
        error: null
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to cancel order';
      set({
        isLoading: false,
        error: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  },

  setCurrentOrder: (order: Order | null) => {
    set({ currentOrder: order });
  },

  clearError: () => {
    set({ error: null });
  },

  clearOrders: () => {
    set({
      orders: [],
      currentOrder: null,
      error: null
    });
  },

  updateOrderStatus: (orderId: number, status: Order['status']) => {
    const currentOrders = get().orders;
    const updatedOrders = currentOrders.map(order => 
      order.id === orderId ? { ...order, status } : order
    );
    
    set({
      orders: updatedOrders,
      currentOrder: get().currentOrder?.id === orderId 
        ? { ...get().currentOrder!, status }
        : get().currentOrder
    });
  }
}));