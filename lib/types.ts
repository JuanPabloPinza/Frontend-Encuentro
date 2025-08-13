// User and Authentication Types
export interface User {
  id: number;
  username: string;
  role: 'assistant' | 'organizer';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: 'assistant' | 'organizer';
}

// Event and Ticket Types
export interface TicketCategory {
  id: number;
  categoryName: string;
  price: number;
  totalSeats: number;
  reservedSeats: number;
  availableSeats: number;
  description?: string;
  isActive: boolean;
  eventId: number;
}

export interface Event {
  idEvent: number;
  eventName: string;
  eventCategory: string;
  description?: string;
  eventDate: Date;
  location?: string;
  isActive: boolean;
  createdBy: number;
  ticketCategories: TicketCategory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventRequest {
  eventName: string;
  eventCategory: string;
  description?: string;
  eventDate: string;
  location?: string;
  ticketCategories: {
    categoryName: string;
    price: number;
    totalSeats: number;
    description?: string;
  }[];
}

export interface UpdateEventRequest {
  eventName?: string;
  eventCategory?: string;
  description?: string;
  eventDate?: string;
  location?: string;
  isActive?: boolean;
  ticketCategories?: {
    categoryName?: string;
    price?: number;
    totalSeats?: number;
    description?: string;
    isActive?: boolean;
  }[];
}

// Order Types
export interface Order {
  id: number;
  userId: number;
  eventId: number;
  categoryId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  eventName: string;
  categoryName: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  eventId: number;
  categoryId: number;
  quantity: number;
  notes?: string;
}

export interface CreateOrderWithLockRequest extends CreateOrderRequest {
  lockId: string;
}

// Ticket Reservation Types
export interface ReserveTicketsRequest {
  eventId: number;
  categoryId: number;
  quantity: number;
}

export interface ReserveTicketsResponse {
  success: boolean;
  availableSeats: number;
  message: string;
}

export interface ReleaseTicketsRequest {
  categoryId: number;
  quantity: number;
}

// WebSocket Types
export interface WebSocketUser {
  userId: number;
  token?: string;
}

export interface JoinEventRoomRequest {
  eventId: number;
  userId: number;
}

export interface LockTicketsRequest {
  eventId: number;
  categoryId: number;
  quantity: number;
  userId: number;
}

export interface LockTicketsResponse {
  success: boolean;
  lockId?: string;
  expiresAt?: string;
  availableTickets?: number;
  message?: string;
  quantity?: number;
}

export interface UnlockTicketsRequest {
  eventId: number;
  categoryId: number;
  quantity: number;
  userId: number;
}

export interface UnlockTicketsResponse {
  success: boolean;
  message?: string;
}

export interface AvailabilityUpdate {
  eventId: number;
  categoryId: number;
  availableTickets: number;
  lockedTickets: number;
  totalTickets: number;
  timestamp: string;
}

export interface OrderCompletedNotification {
  orderId: number;
  eventId: number;
  categoryId: number;
  quantity: number;
  message: string;
}

export interface OrderCancelledNotification {
  orderId: number;
  eventId: number;
  categoryId: number;
  quantity: number;
  message: string;
}

export interface MyLocksResponse {
  locks: {
    lockId: string;
    eventId: number;
    categoryId: number;
    quantity: number;
    expiresAt: string;
  }[];
}

// API Error Types
export interface APIError {
  statusCode: number;
  message: string;
  error: string;
}

// App State Types
export interface AppState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface EventState {
  events: Event[];
  currentEvent: Event | null;
  loading: boolean;
  error: string | null;
}

export interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

export interface WebSocketState {
  socket: any | null;
  isConnected: boolean;
  currentLocks: MyLocksResponse['locks'];
  availabilityUpdates: AvailabilityUpdate[];
}