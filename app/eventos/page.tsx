'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EventsGrid } from '@/components/events/events-grid';
import { EventFilters } from '@/components/events/event-filters';
import { useEvents } from '@/lib/hooks/use-events';
import { useAuth } from '@/lib/hooks/use-auth';
import { useMounted } from '@/lib/hooks/use-mounted';
import { Event } from '@/lib/types';
import { Plus, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EventsPage() {
  const router = useRouter();
  const mounted = useMounted();
  const { isAuthenticated, isOrganizer } = useAuth();
  const {
    events,
    isLoading,
    error,
    fetchEvents,
    deleteEvent,
    clearError,
    getAvailableCategories
  } = useEvents();

  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Fetch events on component mount
  useEffect(() => {
    if (isAuthenticated && mounted) {
      fetchEvents();
    }
  }, [isAuthenticated, mounted, fetchEvents]);

  // Filter events based on current filters
  useEffect(() => {
    let filtered = [...events];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.eventName.toLowerCase().includes(query) ||
        event.eventCategory.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(event => event.eventCategory === categoryFilter);
    }

    // Time filter
    const now = new Date();
    if (timeFilter === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.eventDate) > now);
    } else if (timeFilter === 'past') {
      filtered = filtered.filter(event => new Date(event.eventDate) <= now);
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(event => event.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(event => !event.isActive);
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, categoryFilter, timeFilter, statusFilter]);

  const handleCreateEvent = () => {
    router.push('/eventos/create');
  };

  const handleEditEvent = (event: Event) => {
    router.push(`/eventos/edit/${event.idEvent}`);
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      const result = await deleteEvent(eventId);
      if (result.success) {
        // Event will be automatically removed from the list via the store
      } else {
        alert(`Failed to delete event: ${result.error}`);
      }
    }
  };

  const availableCategories = getAvailableCategories();

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Events</h1>
          <p className="text-gray-600 mb-8">Please log in to view events.</p>
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
          <h1 className="text-3xl font-bold mb-2">Events</h1>
          <p className="text-gray-600">
            Discover and manage events on our platform
          </p>
        </div>
        {isOrganizer && (
          <Button onClick={handleCreateEvent} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Event</span>
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
                fetchEvents();
              }}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <EventFilters
        categories={availableCategories}
        onSearch={setSearchQuery}
        onCategoryFilter={setCategoryFilter}
        onTimeFilter={setTimeFilter}
        onStatusFilter={setStatusFilter}
      />

      {/* Events Grid */}
      <EventsGrid
        events={filteredEvents}
        isLoading={isLoading}
        onEdit={isOrganizer ? handleEditEvent : undefined}
        onDelete={isOrganizer ? handleDeleteEvent : undefined}
      />

      {/* Summary */}
      {!isLoading && (
        <div className="mt-8 text-center text-gray-600">
          <p>
            Showing {filteredEvents.length} of {events.length} events
          </p>
        </div>
      )}
    </div>
  );
}