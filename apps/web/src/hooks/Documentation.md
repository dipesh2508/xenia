# Xenia Custom Hooks Documentation

This document provides comprehensive documentation for all custom React hooks used in the Xenia application.

## Table of Contents

1. [useApi](#useapi)
2. [useSocket](#usesocket)
3. [useUserDetails](#useuserdetails)

## useApi

A customizable hook for making API requests with built-in state management.

### Import

```typescript
import { useApi } from '@/hooks/useApi';
```

### Parameters

- `url` (string): The API endpoint to call
- `options` (UseApiOptions): Configuration options for the API call

### Options Interface

```typescript
interface UseApiOptions<T> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
  dependencies?: any[];
}
```

### Return Value

```typescript
{
  data: T | null; // Response data or null if not loaded
  error: Error | null; // Error object or null if no errors
  isLoading: boolean; // Loading state indicator
  mutate: (options?: MutateOptions) => Promise<T>; // Function to manually trigger the API call
}
```

### Usage Example

```typescript
// Basic GET request
const { data, error, isLoading } = useApi('/products');

// POST request with body
const { data, error, isLoading, mutate } = useApi('/products', {
  method: 'POST',
  body: { name: 'New Product', price: 99.99 },
  onSuccess: (data) => console.log('Product created:', data),
  onError: (error) => console.error('Failed to create product:', error)
});

// Conditional fetching
const { data } = useApi('/api/products', {
  enabled: shouldFetch,
  dependencies: [dependencyValue]
});

// Manual triggering
const { mutate } = useApi('/api/products', { enabled: false });
const handleSubmit = async () => {
  try {
    const result = await mutate({ 
      body: formData,
      headers: { 'X-Custom-Header': 'value' }
    });
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## useSocket

A hook for managing WebSocket connections with automatic room management and reconnection logic.

### Import

```typescript
import { useSocket } from '@/hooks/useSocket';
```

### Parameters

- `options` (UseSocketOptions): Configuration options for the socket connection

### Options Interface

```typescript
interface UseSocketOptions {
  roomId?: string; // ID of the room to join
  onNewMessage?: (message: any) => void; // Handler for new messages
  onMessageUpdated?: (message: any) => void; // Handler for updated messages
  onMessageDeleted?: (data: { id: string }) => void; // Handler for deleted messages
  maxRetries?: number; // Maximum number of reconnection attempts
}
```

### Return Value

```typescript
{
  socket: Socket | null; // The socket.io instance or null if not connected
  isConnected: boolean; // Whether the socket is currently connected
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'failed'; // Current connection status
  retryCount: number; // Number of connection retry attempts
  maxRetries: number; // Maximum number of retries allowed
  connect: () => void; // Function to manually initiate connection
  disconnect: () => void; // Function to manually disconnect
}
```

### Usage Example

```typescript
// Basic usage
const { socket, isConnected, connectionStatus } = useSocket();

// With room and event handlers
const { socket, connectionStatus } = useSocket({
  roomId: 'chat-room-123',
  onNewMessage: (message) => {
    console.log('New message received:', message);
    setMessages(prev => [...prev, message]);
  },
  onMessageUpdated: (updatedMessage) => {
    setMessages(prev => prev.map(msg => 
      msg.id === updatedMessage.id ? updatedMessage : msg
    ));
  },
  onMessageDeleted: ({ id }) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }
});

// Manual connection control
const { connect, disconnect, connectionStatus } = useSocket();

const handleConnect = () => {
  connect();
};

const handleDisconnect = () => {
  disconnect();
};
```

### Implementation Notes

- The hook maintains a global socket instance to prevent multiple connections.
- It automatically handles joining and leaving rooms when component mounts/unmounts.
- Implements reconnection logic with configurable retry limits.
- Provides detailed connection status for UI feedback.

## useUserDetails

A hook for fetching and managing user authentication details.

### Import

```typescript
import { useUserDetails } from '@/hooks/useUserDetails';
```

### Return Value

```typescript
{
  user: UserDetails | null; // User details or null if not authenticated
  error: Error | null; // Error object or null if no errors
  isLoading: boolean; // Loading state indicator
  isAuthenticated: () => boolean; // Function to check if user is authenticated
  refreshUserData: () => Promise<UserDetails | null>; // Function to refresh user data
}
```

### User Details Interface

```typescript
interface UserDetails {
  id: string;
  name: string;
  email: string;
  image?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Usage Example

```typescript
const { user, isLoading, isAuthenticated, refreshUserData } = useUserDetails();

// Check if user is authenticated
if (isAuthenticated()) {
  console.log(`Welcome back, ${user.name}!`);
}

// Access user properties
if (user) {
  console.log(`User email: ${user.email}`);
}

// Handle loading state
if (isLoading) {
  return <LoadingSpinner />;
}

// Refresh user data after profile update
const handleProfileUpdate = async () => {
  await updateUserProfile(formData);
  await refreshUserData();
};
```

### Implementation Notes

- Uses `useApi` hook internally to fetch user data
- Automatically fetches user authentication status on mount
- Provides utility methods for checking authentication status and refreshing data
