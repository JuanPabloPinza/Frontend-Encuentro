import { useMemo } from 'react';
import { useOrdersStore } from '../stores/orders-store';

export const useOrders = () => {
  const {
    orders,
    currentOrder,
    isLoading,
    error,
    fetchMyOrders,
    fetchAllOrders,
    fetchOrdersByEvent,
    fetchOrderById,
    createOrder,
    createOrderWithLock,
    cancelOrder,
    setCurrentOrder,
    clearError,
    clearOrders,
    updateOrderStatus
  } = useOrdersStore();

  // Memoize helper methods to prevent infinite re-renders
  const helperMethods = useMemo(() => ({
    getOrderById: (id: number) => orders.find(order => order.id === id),
    getOrdersByEvent: (eventId: number) => orders.filter(order => order.eventId === eventId),
    getOrdersByStatus: (status: string) => orders.filter(order => order.status === status),
    getPendingOrders: () => orders.filter(order => order.status === 'pending'),
    getCompletedOrders: () => orders.filter(order => order.status === 'completed'),
    getCancelledOrders: () => orders.filter(order => order.status === 'cancelled'),
    getConfirmedOrders: () => orders.filter(order => order.status === 'confirmed'),
    
    // Total spent calculation (all orders except cancelled)
    getTotalSpent: () => orders
      .filter(order => order.status !== 'cancelled')
      .reduce((total, order) => {
        const price = parseFloat(order.totalPrice?.toString() || '0');
        return total + (isNaN(price) ? 0 : price);
      }, 0),
    
    // Total tickets calculation (all orders except cancelled)
    getTotalTickets: () => orders
      .filter(order => order.status !== 'cancelled')
      .reduce((total, order) => {
        const quantity = parseInt(order.quantity?.toString() || '0');
        return total + (isNaN(quantity) ? 0 : quantity);
      }, 0),
    
    // Alternative calculation for completed orders only
    getCompletedSpent: () => orders
      .filter(order => order.status === 'completed')
      .reduce((total, order) => {
        const price = parseFloat(order.totalPrice?.toString() || '0');
        return total + (isNaN(price) ? 0 : price);
      }, 0),
    
    getCompletedTickets: () => orders
      .filter(order => order.status === 'completed')
      .reduce((total, order) => {
        const quantity = parseInt(order.quantity?.toString() || '0');
        return total + (isNaN(quantity) ? 0 : quantity);
      }, 0),
    
    // Statistics by status
    getOrderStats: () => {
      const stats = {
        total: orders.length,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        totalSpent: 0,
        totalTickets: 0,
        completedSpent: 0,
        completedTickets: 0
      };
      
      orders.forEach(order => {
        // Count by status
        if (order.status === 'pending') stats.pending++;
        else if (order.status === 'confirmed') stats.confirmed++;
        else if (order.status === 'completed') stats.completed++;
        else if (order.status === 'cancelled') stats.cancelled++;
        
        // Calculate totals (excluding cancelled)
        if (order.status !== 'cancelled') {
          const price = parseFloat(order.totalPrice?.toString() || '0');
          const quantity = parseInt(order.quantity?.toString() || '0');
          
          if (!isNaN(price)) stats.totalSpent += price;
          if (!isNaN(quantity)) stats.totalTickets += quantity;
        }
        
        // Calculate completed totals
        if (order.status === 'completed') {
          const price = parseFloat(order.totalPrice?.toString() || '0');
          const quantity = parseInt(order.quantity?.toString() || '0');
          
          if (!isNaN(price)) stats.completedSpent += price;
          if (!isNaN(quantity)) stats.completedTickets += quantity;
        }
      });
      
      return stats;
    }
  }), [orders]);

  return {
    // State
    orders,
    currentOrder,
    isLoading,
    error,
    
    // Actions
    fetchMyOrders,
    fetchAllOrders,
    fetchOrdersByEvent,
    fetchOrderById,
    createOrder,
    createOrderWithLock,
    cancelOrder,
    setCurrentOrder,
    clearError,
    clearOrders,
    updateOrderStatus,
    
    // Helper methods (memoized)
    ...helperMethods
  };
};