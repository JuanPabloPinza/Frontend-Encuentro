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
    
    // Helper methods
    getOrderById: (id: number) => orders.find(order => order.id === id),
    getOrdersByEvent: (eventId: number) => orders.filter(order => order.eventId === eventId),
    getOrdersByStatus: (status: string) => orders.filter(order => order.status === status),
    getPendingOrders: () => orders.filter(order => order.status === 'pending'),
    getCompletedOrders: () => orders.filter(order => order.status === 'completed'),
    getCancelledOrders: () => orders.filter(order => order.status === 'cancelled'),
    getTotalSpent: () => orders
      .filter(order => order.status === 'completed')
      .reduce((total, order) => total + order.totalPrice, 0),
    getTotalTickets: () => orders
      .filter(order => order.status === 'completed')
      .reduce((total, order) => total + order.quantity, 0)
  };
};