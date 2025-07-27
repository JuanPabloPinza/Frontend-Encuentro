'use client';

import { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { useOrders } from '@/lib/hooks/use-orders';
import { 
  Calendar, 
  MapPin, 
  Tag, 
  Hash, 
  DollarSign, 
  Ticket,
  User,
  MessageSquare,
  X,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderCardProps {
  order: Order;
  showUserInfo?: boolean;
}

export function OrderCard({ order, showUserInfo = false }: OrderCardProps) {
  const { cancelOrder } = useOrders();

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
      case 'completed':
        return <Ticket className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const handleCancelOrder = async () => {
    if (order.status !== 'pending') {
      toast.error('Only pending orders can be cancelled');
      return;
    }

    if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      const result = await cancelOrder(order.id);
      if (result.success) {
        toast.success('Order cancelled successfully');
      } else {
        toast.error(result.error || 'Failed to cancel order');
      }
    }
  };

  const canCancelOrder = order.status === 'pending';

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 flex items-center">
              <Hash className="h-5 w-5 mr-2 text-gray-400" />
              Order #{order.id}
            </CardTitle>
            <CardDescription className="text-lg font-medium">
              {order.eventName}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
              {getStatusIcon(order.status)}
              <span className="capitalize">{order.status}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Tag className="h-4 w-4 mr-2" />
              <span className="font-medium">Category:</span>
              <span className="ml-1">{order.categoryName}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Ticket className="h-4 w-4 mr-2" />
              <span className="font-medium">Quantity:</span>
              <span className="ml-1">{order.quantity} ticket{order.quantity > 1 ? 's' : ''}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-2" />
              <span className="font-medium">Unit Price:</span>
              <span className="ml-1">{formatCurrency(order.unitPrice)}</span>
            </div>

            {showUserInfo && (
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span className="font-medium">User ID:</span>
                <span className="ml-1">{order.userId}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <div>
                <span className="font-medium">Ordered:</span>
                <div className="text-xs">{formatDateTime(order.createdAt)}</div>
              </div>
            </div>

            {order.updatedAt !== order.createdAt && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <div>
                  <span className="font-medium">Updated:</span>
                  <div className="text-xs">{formatDateTime(order.updatedAt)}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-start">
              <MessageSquare className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-700">Notes:</span>
                <p className="text-sm text-gray-600 mt-1">{order.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Total Price */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-900">Total Price:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(order.totalPrice)}
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {order.quantity} × {formatCurrency(order.unitPrice)}
          </div>
        </div>

        {/* Actions */}
        {canCancelOrder && (
          <div className="flex justify-end pt-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancelOrder}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel Order</span>
            </Button>
          </div>
        )}

        {/* Status Information */}
        <div className="text-xs text-gray-500">
          {order.status === 'pending' && (
            <p>⏳ Your order is pending confirmation. You can still cancel it.</p>
          )}
          {order.status === 'confirmed' && (
            <p>✅ Your order has been confirmed and is being processed.</p>
          )}
          {order.status === 'completed' && (
            <p>🎉 Your order is complete! Check your email for ticket details.</p>
          )}
          {order.status === 'cancelled' && (
            <p>❌ This order has been cancelled.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}