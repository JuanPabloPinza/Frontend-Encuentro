# Frontend Integration Guide - NestJS Event Platform Backend

## 🏗️ Architecture Overview

This NestJS backend implements a **microservices architecture** for an event management platform with the following services:

### Microservices Structure
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │────│   Auth Service  │────│   User Service  │
│   Port: 3000    │    │   Port: 8877    │    │   Port: 8878    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ├─────────────────┬─────────────────┬─────────────────┐
         │                 │                 │                 │
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Events Service  │ │ Orders Service  │ │Realtime Service │ │   PostgreSQL    │
│   Port: 8879    │ │ RabbitMQ Queue  │ │ WebSocket:3001  │ │   Database      │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Communication Patterns
- **HTTP REST API**: Client ↔ API Gateway ↔ Microservices
- **TCP Microservices**: Auth, User, Events services
- **RabbitMQ**: Orders service (message queue)
- **WebSocket**: Real-time features (ticket locking, availability updates)

---

## 🔐 Authentication & Authorization

### JWT Token System
All protected endpoints require a JWT token in the Authorization header:

```typescript
// Request Headers
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

### User Roles
```typescript
enum Role {
  ASSISTANT = 'assistant',    // Default role, limited permissions
  ORGANIZER = 'organizer'     // Can create/edit events
}
```

### Authentication Flow
```typescript
// Login Request
POST /api/auth/login
{
  "username": "user@example.com",
  "password": "password123"
}

// Login Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "user@example.com",
    "role": "assistant"
  }
}

// Register Request
POST /api/auth/register
{
  "username": "newuser@example.com",
  "password": "password123",
  "role": "assistant" // or "organizer"
}
```

---

## 📊 API Endpoints Reference

### Base URL
```
http://localhost:3000/api
```

### CORS Configuration
```typescript
// Allowed origins for development
origins: [
  'http://localhost:3000',  // Next.js default
  'http://localhost:4200',  // Angular
  'http://localhost:8080'   // Vue.js
]
```

---

## 👤 User Management

### Get User Profile
```typescript
// Endpoint
GET /api/user

// Headers
Authorization: Bearer <token>

// Response
{
  "id": 1,
  "username": "user@example.com",
  "role": "assistant"
}
```

---

## 🎉 Events Management

### Data Models

#### Event Entity
```typescript
interface Event {
  idEvent: number;
  eventName: string;
  eventCategory: string;
  description?: string;
  eventDate: Date;
  location?: string;
  isActive: boolean;
  createdBy: number;          // User ID who created the event
  ticketCategories: TicketCategory[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Ticket Category Entity
```typescript
interface TicketCategory {
  id: number;
  categoryName: string;       // e.g., 'VIP', 'General', 'Student'
  price: number;
  totalSeats: number;
  reservedSeats: number;
  availableSeats: number;     // Calculated: totalSeats - reservedSeats
  description?: string;
  isActive: boolean;
  eventId: number;
}
```

### API Endpoints

#### Create Event (ORGANIZER only)
```typescript
POST /api/events
Authorization: Bearer <token>

// Request Body
{
  "eventName": "Summer Music Festival",
  "eventCategory": "Music",
  "description": "Annual summer music festival",
  "eventDate": "2024-07-15T18:00:00Z",
  "location": "Central Park",
  "ticketCategories": [
    {
      "categoryName": "VIP",
      "price": 150.00,
      "totalSeats": 100,
      "description": "VIP access with backstage pass"
    },
    {
      "categoryName": "General",
      "price": 75.00,
      "totalSeats": 500,
      "description": "General admission"
    }
  ]
}

// Response
{
  "idEvent": 1,
  "eventName": "Summer Music Festival",
  "eventCategory": "Music",
  // ... other event properties
  "ticketCategories": [...]
}
```

#### Get All Events
```typescript
GET /api/events

// Response
[
  {
    "idEvent": 1,
    "eventName": "Summer Music Festival",
    "eventCategory": "Music",
    "eventDate": "2024-07-15T18:00:00Z",
    "location": "Central Park",
    "isActive": true,
    "createdBy": 1,
    "ticketCategories": [...]
  }
]
```

#### Get Upcoming Events
```typescript
GET /api/events/upcoming

// Returns events with eventDate > current date
```

#### Get Events by Category
```typescript
GET /api/events/category/{category}

// Example: GET /api/events/category/Music
```

#### Get Event by ID
```typescript
GET /api/events/{id}

// Response includes full event details with ticket categories
```

#### Update Event (ORGANIZER only, creator only)
```typescript
PUT /api/events/{id}
Authorization: Bearer <token>

// Request Body (all fields optional)
{
  "eventName": "Updated Event Name",
  "eventCategory": "Updated Category",
  "description": "Updated description",
  "eventDate": "2024-08-15T18:00:00Z",
  "location": "Updated Location",
  "isActive": false
}
```

#### Delete Event (ORGANIZER only, creator only)
```typescript
DELETE /api/events/{id}
Authorization: Bearer <token>
```

#### Get Ticket Categories for Event
```typescript
GET /api/events/{id}/tickets

// Response
[
  {
    "id": 1,
    "categoryName": "VIP",
    "price": 150.00,
    "totalSeats": 100,
    "reservedSeats": 25,
    "availableSeats": 75,
    "description": "VIP access",
    "isActive": true,
    "eventId": 1
  }
]
```

---

## 🎫 Ticket Reservation System

### Reserve Tickets (Before Purchase)
```typescript
POST /api/events/tickets/reserve
Authorization: Bearer <token>

// Request Body
{
  "eventId": 1,
  "categoryId": 1,
  "quantity": 2
}

// Response
{
  "success": true,
  "availableSeats": 73,  // Updated available seats
  "message": "Tickets reserved successfully"
}
```

### Release Tickets (Cancel Reservation)
```typescript
POST /api/events/tickets/release
Authorization: Bearer <token>

// Request Body
{
  "categoryId": 1,
  "quantity": 2
}
```

---

## 🛒 Orders Management

### Data Models

#### Order Entity
```typescript
interface Order {
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
```

### API Endpoints

#### Create Order
```typescript
POST /api/orders
Authorization: Bearer <token>

// Request Body
{
  "eventId": 1,
  "categoryId": 1,
  "quantity": 2,
  "notes": "Special seating request"
}

// Response
{
  "id": 1,
  "userId": 1,
  "eventId": 1,
  "categoryId": 1,
  "quantity": 2,
  "unitPrice": 150.00,
  "totalPrice": 300.00,
  "status": "pending",
  "eventName": "Summer Music Festival",
  "categoryName": "VIP",
  "notes": "Special seating request",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### Create Order with Lock (WebSocket Integration)
```typescript
POST /api/orders/with-lock
Authorization: Bearer <token>

// Request Body
{
  "eventId": 1,
  "categoryId": 1,
  "quantity": 2,
  "lockId": "lock_12345_user1_session1", // From WebSocket lock
  "notes": "Special request"
}
```

#### Get My Orders
```typescript
GET /api/orders
Authorization: Bearer <token>

// Response: Array of user's orders
```

#### Get All Orders (Admin)
```typescript
GET /api/orders/all
Authorization: Bearer <token>
```

#### Get Orders by Event
```typescript
GET /api/orders/event/{eventId}
Authorization: Bearer <token>
```

#### Get Order by ID
```typescript
GET /api/orders/{id}
Authorization: Bearer <token>
```

#### Cancel Order
```typescript
POST /api/orders/{id}/cancel
Authorization: Bearer <token>
```

---

## 🔄 Real-time Features (WebSocket)

### Connection Details
```typescript
// WebSocket URL
ws://localhost:3001/realtime

// Connection with authentication
const socket = io('http://localhost:3001/realtime', {
  query: {
    userId: user.id,
    token: jwt_token  // Optional for future JWT validation
  }
});
```

### WebSocket Events

#### Connection Events
```typescript
// Connection established
socket.on('connected', (data) => {
  console.log('Connected:', data);
  // { success: true, sessionId: "socket_id", message: "Connected to realtime service" }
});

// Join event room to receive updates
socket.emit('join-event-room', {
  eventId: 1,
  userId: user.id
});

socket.on('joined-event-room', (data) => {
  console.log('Joined event room:', data);
});
```

#### Ticket Locking System
```typescript
// Lock tickets for a limited time (prevents double booking)
socket.emit('lock-tickets', {
  eventId: 1,
  categoryId: 1,
  quantity: 2,
  userId: user.id
});

socket.on('lock-tickets-response', (response) => {
  if (response.success) {
    console.log('Tickets locked:', response.lockId);
    console.log('Expires at:', response.expiresAt);
    console.log('Available tickets:', response.availableTickets);
    
    // Use lockId for order creation
    createOrderWithLock({
      eventId: 1,
      categoryId: 1,
      quantity: 2,
      lockId: response.lockId
    });
  }
});

// Unlock tickets (cancel reservation)
socket.emit('unlock-tickets', {
  eventId: 1,
  categoryId: 1,
  quantity: 2,
  userId: user.id
});

socket.on('unlock-tickets-response', (response) => {
  console.log('Unlock result:', response.success);
});
```

#### Real-time Availability Updates
```typescript
// Listen for ticket availability changes
socket.on('availability-update', (update) => {
  console.log('Availability update:', update);
  /*
  {
    eventId: 1,
    categoryId: 1,
    availableTickets: 48,
    lockedTickets: 5,
    totalTickets: 53,
    timestamp: "2024-01-15T10:30:00Z"
  }
  */
  
  // Update UI with new availability
  updateTicketAvailability(update);
});
```

#### Order Status Updates
```typescript
// Order completion notification
socket.on('order-completed', (data) => {
  console.log('Order completed:', data);
  /*
  {
    orderId: 1,
    eventId: 1,
    categoryId: 1,
    quantity: 2,
    message: "Your order has been completed successfully!"
  }
  */
  
  // Show success notification
  showNotification('Order completed successfully!');
});

// Order cancellation notification
socket.on('order-cancelled', (data) => {
  console.log('Order cancelled:', data);
  // Show cancellation notification
});
```

#### User Session Management
```typescript
// Get current user's locks
socket.emit('get-my-locks');

socket.on('my-locks-response', (data) => {
  console.log('My current locks:', data.locks);
});

// Heartbeat to maintain connection
setInterval(() => {
  socket.emit('heartbeat');
}, 30000);

socket.on('heartbeat-response', (data) => {
  console.log('Heartbeat:', data.timestamp);
});
```

---

## 🚦 Error Handling

### HTTP Error Responses
```typescript
// Unauthorized (401)
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid Token!"
}

// Forbidden (403)
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "Insufficient permissions"
}

// Not Found (404)
{
  "statusCode": 404,
  "message": "Not Found",
  "error": "Event not found"
}

// Validation Error (400)
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "eventName is required"
}
```

### WebSocket Error Handling
```typescript
socket.on('error', (error) => {
  console.error('WebSocket error:', error);
  // { message: "Unauthorized" }
  // { message: "Failed to join event room" }
  // { message: "Internal server error" }
});
```

---

## 🔧 Development Setup

### Environment Variables
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=event_platform

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin@127.0.0.1:5672

# Ports
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=8877
USER_SERVICE_PORT=8878
EVENTS_SERVICE_PORT=8879
REALTIME_SERVICE_PORT=3001
```

### Starting the Backend
```bash
# Install dependencies
npm install

# Start all services
npm run start:all

# Or start individual services
npm run serve:api-gateway
npm run serve:auth-service
npm run serve:user-service
npm run serve:events-service
npm run serve:orders-service
npm run serve:realtime-service
```

---

## 📝 Frontend Implementation Examples

### React/Next.js Example

#### Authentication Hook
```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  role: 'assistant' | 'organizer';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      setUser(data.user);
      setToken(data.access_token);
      localStorage.setItem('token', data.access_token);
      return { success: true };
    } else {
      return { success: false, error: data.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return { user, token, login, logout };
};
```

#### API Service
```typescript
// services/api.ts
class ApiService {
  private baseURL = 'http://localhost:3000/api';
  
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // Events
  async getEvents() {
    return this.request('/events');
  }
  
  async createEvent(eventData: CreateEventDto) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }
  
  // Orders
  async getMyOrders() {
    return this.request('/orders');
  }
  
  async createOrder(orderData: CreateOrderDto) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
}

export const apiService = new ApiService();
```

#### WebSocket Hook
```typescript
// hooks/useWebSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebSocket = (userId: number, token: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const newSocket = io('http://localhost:3001/realtime', {
      query: { userId, token }
    });
    
    newSocket.on('connected', () => {
      setIsConnected(true);
      console.log('Connected to WebSocket');
    });
    
    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket');
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, [userId, token]);
  
  const joinEventRoom = (eventId: number) => {
    socket?.emit('join-event-room', { eventId, userId });
  };
  
  const lockTickets = (eventId: number, categoryId: number, quantity: number) => {
    return new Promise((resolve) => {
      socket?.emit('lock-tickets', { eventId, categoryId, quantity, userId });
      socket?.once('lock-tickets-response', resolve);
    });
  };
  
  return { socket, isConnected, joinEventRoom, lockTickets };
};
```

### Vue.js Example

#### Event Store (Pinia)
```typescript
// stores/events.ts
import { defineStore } from 'pinia';

export const useEventsStore = defineStore('events', {
  state: () => ({
    events: [],
    currentEvent: null,
    loading: false,
  }),
  
  actions: {
    async fetchEvents() {
      this.loading = true;
      try {
        const response = await fetch('/api/events');
        this.events = await response.json();
      } finally {
        this.loading = false;
      }
    },
    
    async createEvent(eventData) {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });
      
      if (response.ok) {
        const newEvent = await response.json();
        this.events.push(newEvent);
        return newEvent;
      }
    },
  },
});
```

---

## 🔐 Security Best Practices

### Authentication
- Always include JWT token in protected requests
- Handle token expiration gracefully
- Store tokens securely (httpOnly cookies recommended for production)

### Authorization
- Check user roles before allowing sensitive operations
- Only organizers can create/edit events
- Users can only access their own orders
- Validate user permissions on both frontend and backend

### WebSocket Security
- Validate user authentication on WebSocket connection
- Implement session management for disconnections
- Use rate limiting for WebSocket events

### Data Validation
- Validate all user inputs on both frontend and backend
- Sanitize data before displaying
- Use TypeScript interfaces for type safety

---

## 🚀 Production Considerations

### Environment Configuration
- Use environment variables for configuration
- Implement proper logging
- Set up monitoring and health checks
- Configure CORS properly for production domains

### Performance
- Implement caching for frequently accessed data
- Use connection pooling for database
- Consider implementing pagination for large datasets
- Optimize WebSocket connections

### Scalability
- Consider load balancing for API Gateway
- Implement Redis for session management
- Use horizontal scaling for microservices
- Monitor database performance

This documentation provides everything needed to integrate your NestJS backend with a Next.js 15 frontend, including authentication, real-time features, and comprehensive API usage examples.