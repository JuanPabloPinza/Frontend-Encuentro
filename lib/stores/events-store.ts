import { create } from 'zustand';
import { Event, CreateEventRequest, UpdateEventRequest, TicketCategory } from '../types';
import { apiService } from '../api';

interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  ticketCategories: TicketCategory[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchEvents: () => Promise<void>;
  fetchUpcomingEvents: () => Promise<void>;
  fetchEventsByCategory: (category: string) => Promise<void>;
  fetchEventById: (id: number) => Promise<void>;
  fetchEventTicketCategories: (eventId: number) => Promise<void>;
  createEvent: (eventData: CreateEventRequest) => Promise<{ success: boolean; event?: Event; error?: string }>;
  updateEvent: (id: number, eventData: UpdateEventRequest) => Promise<{ success: boolean; event?: Event; error?: string }>;
  deleteEvent: (id: number) => Promise<{ success: boolean; error?: string }>;
  setCurrentEvent: (event: Event | null) => void;
  clearError: () => void;
  clearEvents: () => void;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  currentEvent: null,
  ticketCategories: [],
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const events = await apiService.getEvents();
      set({
        events,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        events: [],
        isLoading: false,
        error: error.message || 'Failed to fetch events'
      });
    }
  },

  fetchUpcomingEvents: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const events = await apiService.getUpcomingEvents();
      set({
        events,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        events: [],
        isLoading: false,
        error: error.message || 'Failed to fetch upcoming events'
      });
    }
  },

  fetchEventsByCategory: async (category: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const events = await apiService.getEventsByCategory(category);
      set({
        events,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        events: [],
        isLoading: false,
        error: error.message || `Failed to fetch events for category: ${category}`
      });
    }
  },

  fetchEventById: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const event = await apiService.getEventById(id);
      set({
        currentEvent: event,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        currentEvent: null,
        isLoading: false,
        error: error.message || 'Failed to fetch event details'
      });
    }
  },

  fetchEventTicketCategories: async (eventId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const ticketCategories = await apiService.getEventTicketCategories(eventId);
      set({
        ticketCategories,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        ticketCategories: [],
        isLoading: false,
        error: error.message || 'Failed to fetch ticket categories'
      });
    }
  },

  createEvent: async (eventData: CreateEventRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const event = await apiService.createEvent(eventData);
      
      // Add the new event to the events list
      const currentEvents = get().events;
      set({
        events: [...currentEvents, event],
        isLoading: false,
        error: null
      });

      return { success: true, event };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create event';
      set({
        isLoading: false,
        error: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  },

  updateEvent: async (id: number, eventData: UpdateEventRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedEvent = await apiService.updateEvent(id, eventData);
      
      // Update the event in the events list
      const currentEvents = get().events;
      const updatedEvents = currentEvents.map(event => 
        event.idEvent === id ? updatedEvent : event
      );
      
      set({
        events: updatedEvents,
        currentEvent: get().currentEvent?.idEvent === id ? updatedEvent : get().currentEvent,
        isLoading: false,
        error: null
      });

      return { success: true, event: updatedEvent };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update event';
      set({
        isLoading: false,
        error: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  },

  deleteEvent: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      await apiService.deleteEvent(id);
      
      // Remove the event from the events list
      const currentEvents = get().events;
      const filteredEvents = currentEvents.filter(event => event.idEvent !== id);
      
      set({
        events: filteredEvents,
        currentEvent: get().currentEvent?.idEvent === id ? null : get().currentEvent,
        isLoading: false,
        error: null
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete event';
      set({
        isLoading: false,
        error: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  },

  setCurrentEvent: (event: Event | null) => {
    set({ currentEvent: event });
  },

  clearError: () => {
    set({ error: null });
  },

  clearEvents: () => {
    set({
      events: [],
      currentEvent: null,
      ticketCategories: [],
      error: null
    });
  }
}));