'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { EventForm } from '@/components/events/event-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreateEventPage() {
  const router = useRouter();
  const { isAuthenticated, isOrganizer } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/user/login');
    } else if (!isOrganizer) {
      router.push('/eventos');
    }
  }, [isAuthenticated, isOrganizer, router]);

  if (!isAuthenticated || !isOrganizer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">
            {!isAuthenticated 
              ? 'Please log in to create events.' 
              : 'Only organizers can create events.'
            }
          </p>
          <Button onClick={() => router.push('/eventos')}>
            Back to Events
          </Button>
        </div>
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
        
        <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
        <p className="text-gray-600">
          Fill in the details to create a new event with ticket categories
        </p>
      </div>

      <EventForm />
    </div>
  );
}