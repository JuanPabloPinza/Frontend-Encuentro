'use client';

import { Event } from '@/lib/types';
import { EventCard } from './event-card';
import { useAuth } from '@/lib/hooks/use-auth';

interface EventsGridProps {
  events: Event[];
  isLoading?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: number) => void;
}

export function EventsGrid({ events, isLoading = false, onEdit, onDelete }: EventsGridProps) {
  const { isOrganizer } = useAuth();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No events found</div>
        <p className="text-gray-400">Check back later for new events or adjust your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.idEvent}
          event={event}
          showActions={true}
          onEdit={isOrganizer ? onEdit : undefined}
          onDelete={isOrganizer ? onDelete : undefined}
        />
      ))}
    </div>
  );
}