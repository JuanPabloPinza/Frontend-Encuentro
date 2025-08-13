'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEvents } from '@/lib/hooks/use-events';
import { useAuth } from '@/lib/hooks/use-auth';
import { useWebSocket } from '@/lib/hooks/use-websocket';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { TicketPurchaseSection } from '@/components/tickets/ticket-purchase-section';
import { Calendar, MapPin, Tag, User, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = parseInt(params.id as string);
  
  const { isAuthenticated } = useAuth();
  const {
    currentEvent,
    ticketCategories,
    isLoading,
    error,
    fetchEventById,
    fetchEventTicketCategories,
    clearError
  } = useEvents();

  const {
    isConnected,
    connect,
    joinRoom,
    isInEventRoom,
    error: wsError,
    clearError: clearWsError
  } = useWebSocket();

  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const isJoiningRoomRef = useRef(false);

  // Fetch event details
  useEffect(() => {
    if (eventId) {
      fetchEventById(eventId);
      fetchEventTicketCategories(eventId);
    }
  }, [eventId, fetchEventById, fetchEventTicketCategories]);

  // Auto-connect to WebSocket and join event room
  useEffect(() => {
    if (isAuthenticated && eventId && isConnected && !isInEventRoom(eventId) && !isJoiningRoomRef.current) {
      isJoiningRoomRef.current = true;
      setIsJoiningRoom(true);
      try {
        joinRoom(eventId);
        toast.success('Connected to real-time updates');
      } catch (error) {
        console.error('Failed to join event room:', error);
        toast.error('Failed to connect to real-time updates');
      } finally {
        setIsJoiningRoom(false);
        isJoiningRoomRef.current = false;
      }
    }
  }, [isAuthenticated, eventId, isConnected, isInEventRoom, joinRoom]);

  // Connect to WebSocket if not connected
  useEffect(() => {
    if (isAuthenticated && !isConnected) {
      connect().catch(console.error);
    }
  }, [isAuthenticated, isConnected, connect]);

  const handleBack = () => {
    router.push('/eventos');
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Event Details</h1>
          <p className="text-gray-600 mb-8">Please log in to view event details and purchase tickets.</p>
          <Button onClick={() => router.push('/user/login')}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentEvent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            {error || 'Event not found'}
            <Button
              variant="link"
              className="ml-2 p-0 h-auto"
              onClick={() => {
                clearError();
                if (eventId) {
                  fetchEventById(eventId);
                  fetchEventTicketCategories(eventId);
                }
              }}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  const isUpcoming = new Date(currentEvent.eventDate) > new Date();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={handleBack} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
        
        {/* WebSocket Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center text-green-600">
                <Wifi className="h-4 w-4 mr-1" />
                <span className="text-sm">Real-time updates active</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <WifiOff className="h-4 w-4 mr-1" />
                <span className="text-sm">Real-time updates unavailable</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isUpcoming 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isUpcoming ? 'Upcoming' : 'Past Event'}
            </span>
            {!currentEvent.isActive && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Inactive
              </span>
            )}
          </div>
        </div>
      </div>

      {/* WebSocket Error */}
      {wsError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            WebSocket error: {wsError}
            <Button
              variant="link"
              className="ml-2 p-0 h-auto"
              onClick={clearWsError}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Event Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{currentEvent.eventName}</CardTitle>
              <CardDescription className="text-lg">
                {currentEvent.description || 'No description available'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-sm">{formatDateTime(currentEvent.eventDate)}</p>
                  </div>
                </div>

                {currentEvent.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm">{currentEvent.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center text-gray-600">
                  <Tag className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">Category</p>
                    <p className="text-sm">{currentEvent.eventCategory}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <User className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">Organizer</p>
                    <p className="text-sm">ID: {currentEvent.createdBy}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Categories Overview */}
          {ticketCategories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Tickets</CardTitle>
                <CardDescription>
                  Choose from the following ticket categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {ticketCategories.map((category) => (
                    <div 
                      key={category.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{category.categoryName}</h4>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {category.description}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                          {category.availableSeats} of {category.totalSeats} seats available
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(category.price)}
                        </p>
                        <p className="text-sm text-gray-500">per ticket</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ticket Purchase Section */}
        <div className="space-y-6">
          {currentEvent.isActive && isUpcoming && ticketCategories.length > 0 ? (
            <TicketPurchaseSection
              event={currentEvent}
              ticketCategories={ticketCategories}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Ticket Purchase</CardTitle>
              </CardHeader>
              <CardContent>
                {!currentEvent.isActive ? (
                  <p className="text-gray-600">This event is currently inactive.</p>
                ) : !isUpcoming ? (
                  <p className="text-gray-600">This event has already passed.</p>
                ) : (
                  <p className="text-gray-600">No tickets are currently available for this event.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}