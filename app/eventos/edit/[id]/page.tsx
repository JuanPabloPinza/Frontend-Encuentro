'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { useEvents } from '@/lib/hooks/use-events';
import { EventForm } from '@/components/events/event-form';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = parseInt(params.id as string);
  
  const { isAuthenticated, isOrganizer, user } = useAuth();
  const {
    currentEvent,
    isLoading,
    error,
    fetchEventById,
    clearError
  } = useEvents();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/user/login');
    } else if (!isOrganizer) {
      router.push('/eventos');
    } else if (eventId) {
      fetchEventById(eventId);
    }
  }, [isAuthenticated, isOrganizer, eventId, router, fetchEventById]);

  // Check if user can edit this event (only the creator)
  const canEditEvent = currentEvent && user && currentEvent.createdBy === user.id;

  if (!isAuthenticated || !isOrganizer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">
            {!isAuthenticated 
              ? 'Please log in to edit events.' 
              : 'Only organizers can edit events.'
            }
          </p>
          <Button onClick={() => router.push('/eventos')}>
            Back to Events
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
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !currentEvent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Event not found'}
            <Button
              variant="link"
              className="ml-2 p-0 h-auto"
              onClick={() => {
                clearError();
                if (eventId) {
                  fetchEventById(eventId);
                }
              }}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/eventos')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  if (!canEditEvent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You can only edit events that you created.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/eventos')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button onClick={() => router.push('/eventos')} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
        <p className="text-gray-600">
          Update the details for "{currentEvent.eventName}"
        </p>
      </div>

      <EventForm event={currentEvent} />
    </div>
  );
}