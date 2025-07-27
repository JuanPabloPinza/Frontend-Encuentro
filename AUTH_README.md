# JWT Authentication Setup

This project now includes a complete JWT authentication system that integrates with your backend running on `localhost:3000`.

## Features

- JWT token authentication with your backend
- Client-side and server-side authentication utilities
- Protected routes with automatic redirects
- Secure token storage (localStorage + httpOnly cookies)
- React Context for authentication state management
- Middleware for route protection

## How it works

### Backend Integration

The system expects your backend to:
- Accept POST requests to `http://localhost:3000/api/auth/login`
- Return JWT tokens in the format: `{"token": "your-jwt-token"}`
- Accept Bearer tokens for authentication

### Client-side Usage

```tsx
// Use the authentication hook
import { useAuth } from '@/components/auth/AuthProvider'

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth()
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    return <div>Please login</div>
  }
  
  // Access user data
  return <div>Welcome, {user.email}!</div>
}
```

### Making Authenticated API Calls

```tsx
import { authUtils } from '@/lib/auth'

// Automatically includes Bearer token and handles 401 responses
const response = await authUtils.authenticatedFetch('/api/some-endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
})
```

### Server-side Protection

```tsx
// In API routes
import { serverAuthUtils } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  const auth = await serverAuthUtils.requireAuth(request)
  
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Access authenticated user
  const user = auth.user
  // ... rest of your logic
}
```

## File Structure

- `lib/auth.ts` - Client-side authentication utilities
- `lib/server-auth.ts` - Server-side authentication utilities
- `components/auth/AuthProvider.tsx` - React context for auth state
- `app/api/auth/set-token/route.ts` - API route for secure token storage
- `app/user/login/page.tsx` - Login page
- `app/profile/page.tsx` - Example protected page
- `middleware.ts` - Route protection middleware

## Protected Routes

The middleware automatically protects these routes:
- `/profile`
- `/eventos/create`
- `/eventos/edit`
- `/api/protected`

And redirects authenticated users away from:
- `/user/login`
- `/user/register`

## Customization

You can modify the protected routes in `middleware.ts` and update the backend URL in the authentication files as needed.

## Security Notes

- Tokens are stored in both localStorage (for client-side access) and httpOnly cookies (for server-side security)
- The middleware validates tokens on protected routes
- Expired tokens are automatically removed
- 401 responses trigger automatic logout
