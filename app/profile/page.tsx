'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/use-auth';
import { useOrders } from '@/lib/hooks/use-orders';
import { useWebSocket } from '@/lib/hooks/use-websocket';
import { formatCurrency } from '@/lib/utils';
import { 
  User, 
  Mail, 
  Shield, 
  Wifi, 
  WifiOff, 
  ShoppingCart, 
  Ticket, 
  DollarSign,
  Calendar,
  Settings
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { 
    orders, 
    fetchMyOrders, 
    getOrderStats
  } = useOrders();
  const { isConnected } = useWebSocket();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/user/login');
    } else {
      fetchMyOrders();
    }
  }, [isAuthenticated, router, fetchMyOrders]);

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Profile</h1>
          <p className="text-gray-600 mb-8">Please log in to view your profile.</p>
          <Button onClick={() => router.push('/user/login')}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  const stats = getOrderStats();
  const totalSpent = stats.totalSpent;
  const totalTickets = stats.totalTickets;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-gray-600">
          Manage your account and view your activity
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{user.username}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Role:</span>
                <Badge variant={user.role === 'organizer' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">User ID:</span>
                <span className="text-sm font-mono">{user.id}</span>
              </div>

              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm font-medium">Real-time Status:</span>
                <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/orders')}
                className="w-full justify-start"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                View My Orders
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/eventos')}
                className="w-full justify-start"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Browse Events
              </Button>

              {user.role === 'organizer' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/eventos/create')}
                  className="w-full justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              )}

              <Button
                variant="destructive"
                size="sm"
                onClick={logout}
                className="w-full justify-start"
              >
                <User className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Activity Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-lg font-bold text-blue-600">{orders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-green-100">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(totalSpent)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Ticket className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                    <p className="text-lg font-bold text-purple-600">{totalTickets}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Your latest ticket purchases and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-4">
                    You haven&#39;t placed any orders yet.
                  </p>
                  <Button onClick={() => router.push('/eventos')}>
                    Browse Events
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{order.eventName}</h4>
                        <p className="text-sm text-gray-600">
                          {order.quantity} × {order.categoryName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Order #{order.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(order.totalPrice)}</p>
                        <Badge 
                          variant={order.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {orders.length > 5 && (
                    <div className="text-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => router.push('/orders')}
                      >
                        View All Orders ({orders.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role-specific Information */}
          {user.role === 'organizer' && (
            <Card>
              <CardHeader>
                <CardTitle>Organizer Tools</CardTitle>
                <CardDescription>
                  Manage your events and view analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/eventos/create')}
                    className="justify-start"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Create New Event
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => router.push('/eventos')}
                    className="justify-start"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Events
                  </Button>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Organizer Benefits</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Create and manage unlimited events</li>
                    <li>• Real-time ticket sales monitoring</li>
                    <li>• Access to detailed analytics</li>
                    <li>• Customer order management</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
