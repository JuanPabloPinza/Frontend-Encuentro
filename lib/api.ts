import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  TicketCategory,
  Order,
  CreateOrderRequest,
  CreateOrderWithLockRequest,
  ReserveTicketsRequest,
  ReserveTicketsResponse,
  ReleaseTicketsRequest,
  User,
  APIError
} from './types';

// Function to get token from Zustand store
const getTokenFromStore = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const authStore = localStorage.getItem('auth-store');
    if (!authStore) return null;
    
    const parsed = JSON.parse(authStore);
    return parsed.state?.token || null;
  } catch {
    return null;
  }
};

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = getTokenFromStore();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        const apiError: APIError = {
          statusCode: error.response?.status || 500,
          message: error.response?.data?.message || 'An unexpected error occurred',
          error: error.response?.data?.error || error.message,
        };

        // Handle token expiration
        if (error.response?.status === 401) {
          this.clearAllTokens();
          // Redirect to login or emit auth error event
          if (typeof window !== 'undefined') {
            window.location.href = '/user/login';
          }
        }

        return Promise.reject(apiError);
      }
    );
  }

  // Clean up all token storage
  private clearAllTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('auth-store');
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post<{ token: string }>('/auth/login', credentials);
    
    // Get user profile with the token
    const userResponse = await this.api.get<User>('/user', {
      headers: {
        Authorization: `Bearer ${response.data.token}`
      }
    });
    
    return {
      token: response.data.token,
      user: userResponse.data
    };
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    // First register the user
    await this.api.post('/auth/register', userData);
    
    // Then login with the same credentials to get the token
    const loginResponse = await this.api.post<{ token: string }>('/auth/login', {
      username: userData.username,
      password: userData.password
    });
    
    // Get user profile
    const userResponse = await this.api.get<User>('/user', {
      headers: {
        Authorization: `Bearer ${loginResponse.data.token}`
      }
    });
    
    return {
      token: loginResponse.data.token,
      user: userResponse.data
    };
  }

  async logout(): Promise<void> {
    this.clearAllTokens();
    // If your backend has a logout endpoint, call it here
    // await this.api.post('/auth/logout');
  }

  // User endpoints
  async getProfile(): Promise<User> {
    const response = await this.api.get<User>('/user');
    return response.data;
  }

  // Events endpoints
  async getEvents(): Promise<Event[]> {
    const response = await this.api.get<Event[]>('/events');
    return response.data;
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const response = await this.api.get<Event[]>('/events/upcoming');
    return response.data;
  }

  async getEventsByCategory(category: string): Promise<Event[]> {
    const response = await this.api.get<Event[]>(`/events/category/${category}`);
    return response.data;
  }

  async getEventById(id: number): Promise<Event> {
    const response = await this.api.get<Event>(`/events/${id}`);
    return response.data;
  }

  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    const response = await this.api.post<Event>('/events', eventData);
    return response.data;
  }

  async updateEvent(id: number, eventData: UpdateEventRequest): Promise<Event> {
    const response = await this.api.put<Event>(`/events/${id}`, eventData);
    return response.data;
  }

  async deleteEvent(id: number): Promise<void> {
    await this.api.delete(`/events/${id}`);
  }

  async getEventTicketCategories(eventId: number): Promise<TicketCategory[]> {
    const response = await this.api.get<TicketCategory[]>(`/events/${eventId}/tickets`);
    return response.data;
  }

  // Ticket reservation endpoints
  async reserveTickets(reservationData: ReserveTicketsRequest): Promise<ReserveTicketsResponse> {
    const response = await this.api.post<ReserveTicketsResponse>('/events/tickets/reserve', reservationData);
    return response.data;
  }

  async releaseTickets(releaseData: ReleaseTicketsRequest): Promise<void> {
    await this.api.post('/events/tickets/release', releaseData);
  }

  // Orders endpoints
  async getMyOrders(): Promise<Order[]> {
    const response = await this.api.get<Order[]>('/orders');
    return response.data;
  }

  async getAllOrders(): Promise<Order[]> {
    const response = await this.api.get<Order[]>('/orders/all');
    return response.data;
  }

  async getOrdersByEvent(eventId: number): Promise<Order[]> {
    const response = await this.api.get<Order[]>(`/orders/event/${eventId}`);
    return response.data;
  }

  async getOrderById(id: number): Promise<Order> {
    const response = await this.api.get<Order>(`/orders/${id}`);
    return response.data;
  }

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const response = await this.api.post<Order>('/orders', orderData);
    return response.data;
  }

  async createOrderWithLock(orderData: CreateOrderWithLockRequest): Promise<Order> {
    const response = await this.api.post<Order>('/orders/with-lock', orderData);
    return response.data;
  }

  async cancelOrder(id: number): Promise<void> {
    await this.api.post(`/orders/${id}/cancel`);
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!getTokenFromStore();
  }

  getCurrentToken(): string | null {
    return getTokenFromStore();
  }

  setBaseURL(newBaseURL: string): void {
    this.baseURL = newBaseURL;
    this.api.defaults.baseURL = newBaseURL;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export the class for testing or custom instances
export { ApiService };