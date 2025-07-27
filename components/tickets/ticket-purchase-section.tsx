'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Event, TicketCategory } from '@/lib/types';
import { useWebSocket } from '@/lib/hooks/use-websocket';
import { useOrders } from '@/lib/hooks/use-orders';
import { formatCurrency } from '@/lib/utils';
import { 
  ShoppingCart, 
  Lock, 
  Unlock, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

interface TicketPurchaseSectionProps {
  event: Event;
  ticketCategories: TicketCategory[];
}

export function TicketPurchaseSection({ event, ticketCategories }: TicketPurchaseSectionProps) {
  const {
    lockTickets,
    unlockTickets,
    currentLocks,
    availabilityUpdates,
    isConnected
  } = useWebSocket();

  const {
    createOrderWithLock,
    isLoading: orderLoading
  } = useOrders();

  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isLocking, setIsLocking] = useState(false);
  const [currentLock, setCurrentLock] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Find current lock for this event
  useEffect(() => {
    const eventLocks = currentLocks.filter(lock => lock.eventId === event.idEvent);
    if (eventLocks.length > 0) {
      setCurrentLock(eventLocks[0]);
    } else {
      setCurrentLock(null);
    }
  }, [currentLocks, event.idEvent]);

  // Timer for lock expiration
  useEffect(() => {
    if (currentLock?.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expires = new Date(currentLock.expiresAt).getTime();
        const remaining = expires - now;
        
        if (remaining <= 0) {
          setTimeRemaining(null);
          setCurrentLock(null);
          toast.error('Your ticket reservation has expired');
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentLock]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = ticketCategories.find(cat => cat.id === parseInt(categoryId));
    setSelectedCategory(category || null);
    setQuantity(1);
  };

  const handleLockTickets = async () => {
    if (!selectedCategory || !isConnected) return;

    setIsLocking(true);
    try {
      const result = await lockTickets(
        event.idEvent,
        selectedCategory.id,
        quantity
      );

      if (result.success) {
        toast.success(`Reserved ${quantity} ticket(s) for 5 minutes`);
        setCurrentLock({
          lockId: result.lockId,
          eventId: event.idEvent,
          categoryId: selectedCategory.id,
          quantity,
          expiresAt: result.expiresAt
        });
      } else {
        toast.error(result.error || 'Failed to reserve tickets');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reserve tickets');
    } finally {
      setIsLocking(false);
    }
  };

  const handleUnlockTickets = async () => {
    if (!currentLock || !isConnected) return;

    try {
      const result = await unlockTickets(
        currentLock.eventId,
        currentLock.categoryId,
        currentLock.quantity
      );

      if (result.success) {
        setCurrentLock(null);
        setTimeRemaining(null);
        toast.success('Ticket reservation cancelled');
      } else {
        toast.error(result.error || 'Failed to cancel reservation');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel reservation');
    }
  };

  const handlePurchase = async () => {
    if (!currentLock) return;

    try {
      const result = await createOrderWithLock({
        eventId: event.idEvent,
        categoryId: currentLock.categoryId,
        quantity: currentLock.quantity,
        lockId: currentLock.lockId,
        notes: notes || undefined
      });

      if (result.success) {
        toast.success('Tickets purchased successfully!');
        setCurrentLock(null);
        setTimeRemaining(null);
        setNotes('');
        // Optionally redirect to orders page
      } else {
        toast.error(result.error || 'Failed to purchase tickets');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to purchase tickets');
    }
  };

  const getUpdatedAvailability = (categoryId: number) => {
    const latest = availabilityUpdates
      .filter(update => update.eventId === event.idEvent && update.categoryId === categoryId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    return latest?.availableTickets;
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
            Real-time Updates Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Unable to connect to real-time updates. Ticket purchasing is disabled.
          </p>
          <Button disabled className="w-full">
            Connect to Purchase Tickets
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Purchase Tickets
        </CardTitle>
        <CardDescription>
          Select tickets and complete your purchase with real-time availability
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Lock Status */}
        {currentLock && timeRemaining && (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Tickets reserved</span>
                <span className="font-mono text-sm">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {currentLock.quantity} × {ticketCategories.find(cat => cat.id === currentLock.categoryId)?.categoryName}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {!currentLock ? (
          <>
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">Ticket Category</Label>
              <Select onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a ticket category" />
                </SelectTrigger>
                <SelectContent>
                  {ticketCategories.map((category) => {
                    const updatedAvailability = getUpdatedAvailability(category.id);
                    const availableSeats = updatedAvailability ?? category.availableSeats;
                    
                    return (
                      <SelectItem 
                        key={category.id} 
                        value={category.id.toString()}
                        disabled={availableSeats === 0}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{category.categoryName}</span>
                          <div className="text-right ml-4">
                            <div className="font-medium">{formatCurrency(category.price)}</div>
                            <div className="text-sm text-gray-500">
                              {availableSeats} available
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity Selection */}
            {selectedCategory && (
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Select 
                  value={quantity.toString()} 
                  onValueChange={(value) => setQuantity(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: Math.min(10, selectedCategory.availableSeats) }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} ticket{num > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Total Price */}
            {selectedCategory && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total Price:</span>
                  <span className="text-blue-600">
                    {formatCurrency(selectedCategory.price * quantity)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {quantity} × {formatCurrency(selectedCategory.price)}
                </div>
              </div>
            )}

            {/* Reserve Button */}
            <Button
              onClick={handleLockTickets}
              disabled={!selectedCategory || isLocking || selectedCategory.availableSeats === 0}
              className="w-full"
            >
              {isLocking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Reserving Tickets...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Reserve Tickets (5 min)
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            {/* Order Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Any special requests or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Purchase Actions */}
            <div className="space-y-3">
              <Button
                onClick={handlePurchase}
                disabled={orderLoading}
                className="w-full"
              >
                {orderLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Purchase...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Purchase
                  </>
                )}
              </Button>

              <Button
                onClick={handleUnlockTickets}
                variant="outline"
                className="w-full"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Cancel Reservation
              </Button>
            </div>
          </>
        )}

        {/* Real-time Updates Info */}
        <div className="text-xs text-gray-500 text-center">
          <Clock className="h-3 w-3 inline mr-1" />
          Ticket availability updates in real-time
        </div>
      </CardContent>
    </Card>
  );
}