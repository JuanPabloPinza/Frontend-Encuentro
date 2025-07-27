import { useEventsStore } from '../stores/events-store';

export const useEvents = () => {
  const {
    events,
    currentEvent,
    ticketCategories,
    isLoading,
    error,
    fetchEvents,
    fetchUpcomingEvents,
    fetchEventsByCategory,
    fetchEventById,
    fetchEventTicketCategories,
    createEvent,
    updateEvent,
    deleteEvent,
    setCurrentEvent,
    clearError,
    clearEvents
  } = useEventsStore();

  return {
    // State
    events,
    currentEvent,
    ticketCategories,
    isLoading,
    error,
    
    // Actions
    fetchEvents,
    fetchUpcomingEvents,
    fetchEventsByCategory,
    fetchEventById,
    fetchEventTicketCategories,
    createEvent,
    updateEvent,
    deleteEvent,
    setCurrentEvent,
    clearError,
    clearEvents,
    
    // Helper methods
    getEventById: (id: number) => events.find(event => event.idEvent === id),
    getEventsByCategory: (category: string) => events.filter(event => event.eventCategory === category),
    getUpcomingEvents: () => events.filter(event => new Date(event.eventDate) > new Date()),
    getPastEvents: () => events.filter(event => new Date(event.eventDate) <= new Date()),
    getActiveEvents: () => events.filter(event => event.isActive),
    getAvailableCategories: () => {
      const categories = new Set(events.map(event => event.eventCategory));
      return Array.from(categories);
    }
  };
};