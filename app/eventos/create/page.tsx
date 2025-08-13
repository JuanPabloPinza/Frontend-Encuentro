'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { EventForm } from '@/components/events/event-form';
import { ArrowLeft, Loader2  } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMounted } from '@/lib/hooks/use-mounted';



export default function CreateEventPage() {
  console.log('🚀 CreateEventPage component loaded!');
  
  const router = useRouter();
  const mounted = useMounted();
  const { isAuthenticated, isOrganizer, isLoading, user } = useAuth();

  // Debug logs
  console.log('CreateEventPage render:', { mounted, isAuthenticated, isOrganizer, isLoading, user: !!user });

  useEffect(() => {
    console.log('CreateEventPage useEffect:', { mounted, isAuthenticated, isOrganizer, isLoading, user: !!user });
    // Solo tomamos decisiones cuando la carga de autenticación ha terminado y el usuario ya está definido
    if (mounted && !isLoading) {
      if (!isAuthenticated) {
        console.log('Redirecting to login: not authenticated');
        router.push('/user/login?callbackUrl=/eventos/create');
      } else if (!user) {
        console.log('Waiting for user to load...');
        // Si el usuario aún no está cargado, esperamos
        return;
      } else if (user && !isOrganizer) {
        console.log('Redirecting to eventos: user is not organizer');
        router.push('/eventos');
      }
    }
  }, [isAuthenticated, isOrganizer, isLoading, mounted, router, user]);


  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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