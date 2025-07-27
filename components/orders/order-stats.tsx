'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { 
  ShoppingCart, 
  DollarSign, 
  Ticket, 
  Clock, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';

interface OrderStatsProps {
  totalOrders: number;
  totalSpent: number;
  totalTickets: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export function OrderStats({
  totalOrders,
  totalSpent,
  totalTickets,
  pendingOrders,
  completedOrders,
  cancelledOrders
}: OrderStatsProps) {
  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Spent',
      value: formatCurrency(totalSpent),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Tickets',
      value: totalTickets.toString(),
      icon: Ticket,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Pending',
      value: pendingOrders.toString(),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Completed',
      value: completedOrders.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Cancelled',
      value: cancelledOrders.toString(),
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}