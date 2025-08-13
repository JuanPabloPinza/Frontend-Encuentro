'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrders } from '@/lib/hooks/use-orders';
import { useAuth } from '@/lib/hooks/use-auth';
import { OrderCard } from '@/components/orders/order-card';
import { OrderStats } from '@/components/orders/order-stats';
import { Order } from '@/lib/types';
import { ShoppingCart, AlertCircle, Filter, X } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isOrganizer } = useAuth();
  const {
    orders,
    isLoading,
    error,
    fetchMyOrders,
    fetchAllOrders,
    clearError,
    getOrdersByStatus,
    getOrderStats
  } = useOrders();

  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAllOrders, setShowAllOrders] = useState(false);

  // Fetch orders on component mount
  useEffect(() => {
    if (isAuthenticated) {
      if (showAllOrders && isOrganizer) {
        fetchAllOrders();
      } else {
        fetchMyOrders();
      }
    }
  }, [isAuthenticated, showAllOrders, isOrganizer, fetchAllOrders, fetchMyOrders]);

  // Filter orders based on status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(getOrdersByStatus(statusFilter));
    }
  }, [orders, statusFilter, getOrdersByStatus]);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  const clearFilters = () => {
    setStatusFilter('all');
  };

  const toggleOrderView = () => {
    setShowAllOrders(!showAllOrders);
    setStatusFilter('all');
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Orders</h1>
          <p className="text-gray-600 mb-8">Please log in to view your orders.</p>
          <Button onClick={() => router.push('/user/login')}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <ShoppingCart className="h-8 w-8 mr-3" />
            {showAllOrders ? 'All Orders' : 'My Orders'}
          </h1>
          <p className="text-gray-600">
            {showAllOrders 
              ? 'Manage all orders in the system' 
              : 'View and manage your ticket orders'
            }
          </p>
        </div>

        {isOrganizer && (
          <Button onClick={toggleOrderView} variant="outline">
            {showAllOrders ? 'View My Orders' : 'View All Orders'}
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="link"
              className="ml-2 p-0 h-auto"
              onClick={() => {
                clearError();
                if (showAllOrders && isOrganizer) {
                  fetchAllOrders();
                } else {
                  fetchMyOrders();
                }
              }}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      {!showAllOrders && !isLoading && orders.length > 0 && (() => {
        const stats = getOrderStats();
        return (
          <OrderStats
            totalOrders={stats.total}
            totalSpent={stats.totalSpent}
            totalTickets={stats.totalTickets}
            pendingOrders={stats.pending}
            confirmedOrders={stats.confirmed}
            completedOrders={stats.completed}
            cancelledOrders={stats.cancelled}
          />
        );
      })()}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filter by status:</span>
              </div>
              
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {statusFilter !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Clear filters</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-48"></div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {statusFilter === 'all' ? 'No orders found' : `No ${statusFilter} orders`}
            </h3>
            <p className="text-gray-600 mb-6">
              {orders.length === 0 
                ? "You haven't placed any orders yet."
                : `No orders match the current filter.`
              }
            </p>
            {orders.length === 0 && (
              <Button onClick={() => router.push('/eventos')}>
                Browse Events
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order}
              showUserInfo={showAllOrders}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {!isLoading && filteredOrders.length > 0 && (
        <div className="mt-8 text-center text-gray-600">
          <p>
            Showing {filteredOrders.length} of {orders.length} orders
            {statusFilter !== 'all' && ` (${statusFilter})`}
          </p>
        </div>
      )}
    </div>
  );
}