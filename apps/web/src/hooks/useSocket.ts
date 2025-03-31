import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

/**
 * Gets the proper socket base URL depending on environment
 */
const getSocketBaseUrl = () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000/api";
  
  if (process.env.NODE_ENV === 'development') {
    const match = apiBaseUrl.match(/(https?:\/\/[^\/]+)/);
    if (match && match[1]) {
      return match[1];
    }
    return "http://localhost:8000";
  } else {
    return window.location.origin;
  }
};

// Create a global socket instance to avoid reconnections on component remounts
let globalSocketInstance: Socket | null = null;
let globalConnectionAttempt: boolean = false;
let connectedRooms: Set<string> = new Set();

interface UseSocketOptions {
  roomId?: string;
  onNewMessage?: (message: any) => void;
  onMessageUpdated?: (message: any) => void;
  onMessageDeleted?: (data: { id: string }) => void;
  maxRetries?: number;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'failed';
  retryCount: number;
  maxRetries: number;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Hook for managing socket connections
 */
export const useSocket = ({
  roomId,
  onNewMessage,
  onMessageUpdated,
  onMessageDeleted,
  maxRetries = 3
}: UseSocketOptions = {}): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(globalSocketInstance);
  const [isConnected, setIsConnected] = useState(!!globalSocketInstance?.connected);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'failed'>(
    globalSocketInstance?.connected ? 'connected' : 
    globalConnectionAttempt ? 'connecting' : 'disconnected'
  );
  
  // Use a ref to track if component is mounted
  const isMounted = useRef(true);
  // Use a ref to store the current roomId to avoid stale closures
  const roomIdRef = useRef(roomId);
  // Use a ref to track manual retry attempts
  const manualRetryCount = useRef(0);

  // Update roomId ref when it changes
  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);
  
  const setupSocketListeners = useCallback((socketInstance: Socket) => {
    // Remove existing listeners first to prevent duplicates
    socketInstance.off("connect");
    socketInstance.off("connect_error");
    socketInstance.off("error");
    socketInstance.off("disconnect");
    socketInstance.off("newMessage");
    socketInstance.off("messageUpdated");
    socketInstance.off("messageDeleted");
    
    // Set up new listeners
    socketInstance.on("connect", () => {
      console.log("Socket connected with ID:", socketInstance.id);
      globalConnectionAttempt = false;
      
      if (isMounted.current) {
        setIsConnected(true);
        setConnectionStatus('connected');
        setRetryCount(0);
        manualRetryCount.current = 0;
      }

      // Join any room this component needs
      if (roomIdRef.current && !connectedRooms.has(roomIdRef.current)) {
        console.log("Joining room:", roomIdRef.current);
        socketInstance.emit("joinRoom", roomIdRef.current);
        connectedRooms.add(roomIdRef.current);
      }
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      globalConnectionAttempt = false;
      
      if (isMounted.current) {
        setConnectionStatus('disconnected');
        
        // Increment retry count
        setRetryCount(prev => {
          const newCount = prev + 1;
          
          if (newCount >= maxRetries) {
            setConnectionStatus('failed');
            toast.error("Socket connection failed after multiple attempts", {
              description: `Error: ${error.message}. Please try reconnecting.`,
            });
          }
          
          return newCount;
        });
      }
    });

    socketInstance.on("error", (error) => {
      console.error("Socket error event:", error);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected. Reason:", reason);
      
      // Clear connected rooms on disconnect
      connectedRooms.clear();
      
      if (isMounted.current) {
        setIsConnected(false);
        setConnectionStatus('disconnected');
      }
      
      // Handle global disconnection
      if (reason === "io client disconnect" || reason === "io server disconnect") {
        globalConnectionAttempt = false;
        globalSocketInstance = null;
      }
    });

    // Set up event handlers if provided
    if (onNewMessage) {
      socketInstance.on("newMessage", onNewMessage);
    }

    if (onMessageUpdated) {
      socketInstance.on("messageUpdated", onMessageUpdated);
    }

    if (onMessageDeleted) {
      socketInstance.on("messageDeleted", onMessageDeleted);
    }
    
    return socketInstance;
  }, [maxRetries, onNewMessage, onMessageUpdated, onMessageDeleted]);

  const cleanupRoomConnection = useCallback((socketInstance: Socket | null) => {
    if (!socketInstance || !roomIdRef.current) return;
    
    try {
      // Only leave the room if connected
      if (socketInstance.connected && connectedRooms.has(roomIdRef.current)) {
        console.log("Leaving room:", roomIdRef.current);
        socketInstance.emit("leaveRoom", roomIdRef.current);
        connectedRooms.delete(roomIdRef.current);
      }
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  }, []);

  const connect = useCallback(() => {
    // If already connected, just update the state
    if (globalSocketInstance?.connected) {
      console.log("Already connected, updating state");
      if (isMounted.current) {
        setSocket(globalSocketInstance);
        setIsConnected(true);
        setConnectionStatus('connected');
      }
      
      // Join room if needed
      if (roomIdRef.current && !connectedRooms.has(roomIdRef.current)) {
        console.log("Joining room (already connected):", roomIdRef.current);
        globalSocketInstance.emit("joinRoom", roomIdRef.current);
        connectedRooms.add(roomIdRef.current);
      }
      
      return globalSocketInstance;
    }
    
    // If a connection attempt is in progress globally, just update state
    if (globalConnectionAttempt) {
      console.log("Connection already in progress globally, waiting");
      if (isMounted.current) {
        setConnectionStatus('connecting');
      }
      return globalSocketInstance;
    }
    
    // Start new connection
    console.log("Starting new socket connection");
    globalConnectionAttempt = true;
    
    if (isMounted.current) {
      setConnectionStatus('connecting');
      setRetryCount(manualRetryCount.current);
    }
    
    try {
      // Get the base URL for the socket connection
      const socketBaseUrl = getSocketBaseUrl();
      console.log("Using socket base URL:", socketBaseUrl);

      // Initialize socket connection with proper configuration
      const socketInstance = io(socketBaseUrl, {
        withCredentials: true,
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 2,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 3000,
        timeout: 30000,
        path: '/socket.io/',
        forceNew: true,
        autoConnect: true
      });
      
      // Set up listeners
      setupSocketListeners(socketInstance);
      
      // Store in global and local state
      globalSocketInstance = socketInstance;
      
      if (isMounted.current) {
        setSocket(socketInstance);
      }

      return socketInstance;
    } catch (error) {
      console.error("Error creating socket:", error);
      globalConnectionAttempt = false;
      
      if (isMounted.current) {
        setConnectionStatus('failed');
      }
      
      return null;
    }
  }, [setupSocketListeners]);

  const manuallyDisconnect = useCallback(() => {
    if (!globalSocketInstance) return;
    
    try {
      // Leave rooms
      cleanupRoomConnection(globalSocketInstance);
      
      // Disconnect globally
      globalSocketInstance.disconnect();
      globalSocketInstance = null;
      globalConnectionAttempt = false;
      connectedRooms.clear();
      
      // Update state
      if (isMounted.current) {
        setSocket(null);
        setIsConnected(false);
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error("Error during manual disconnect:", error);
    }
  }, [cleanupRoomConnection]);

  // Use effect for manual retry handling
  const manuallyRetry = useCallback(() => {
    // Increment manual retry counter
    manualRetryCount.current++;
    
    // If there's a global socket but it's disconnected, try to reconnect
    if (globalSocketInstance && !globalSocketInstance.connected && !globalConnectionAttempt) {
      console.log("Manually reconnecting existing socket");
      globalSocketInstance.connect();
      globalConnectionAttempt = true;
      
      if (isMounted.current) {
        setConnectionStatus('connecting');
      }
      
      return globalSocketInstance;
    }
    
    // Otherwise create a new connection
    return connect();
  }, [connect]);

  // Setup socket connection and room handling
  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;
    
    // Use existing connection if available
    if (globalSocketInstance) {
      console.log("Using existing global socket");
      
      // Update component state to match global state
      setSocket(globalSocketInstance);
      setIsConnected(globalSocketInstance.connected);
      setConnectionStatus(globalSocketInstance.connected ? 'connected' : 'connecting');
      
      // Setup listeners for this component
      setupSocketListeners(globalSocketInstance);
      
      // Join room if connected
      if (globalSocketInstance.connected && roomIdRef.current && !connectedRooms.has(roomIdRef.current)) {
        console.log("Joining room (on mount):", roomIdRef.current);
        globalSocketInstance.emit("joinRoom", roomIdRef.current);
        connectedRooms.add(roomIdRef.current);
      }
    } 
    // Start new connection only if no global connection exists and no connection attempt is in progress
    else if (!globalConnectionAttempt) {
      // Small delay to avoid rapid connection attempts during remounts
      const connectionTimer = setTimeout(() => {
        connect();
      }, 100);
      
      return () => {
        clearTimeout(connectionTimer);
      };
    }
    
    // Cleanup function
    return () => {
      console.log("Component unmounting, cleaning up room connection");
      isMounted.current = false;
      
      // Only leave the room, don't disconnect the socket
      if (globalSocketInstance) {
        cleanupRoomConnection(globalSocketInstance);
      }
    };
  }, [connect, setupSocketListeners, cleanupRoomConnection]);

  // Effect to handle room changes
  useEffect(() => {
    // Skip if no socket or no room ID
    if (!globalSocketInstance?.connected || roomId === undefined) return;
    
    console.log("Room changed, updating from", roomIdRef.current, "to", roomId);
    
    // If there was a previous room that's different, leave it
    if (roomIdRef.current && roomIdRef.current !== roomId && connectedRooms.has(roomIdRef.current)) {
      console.log("Leaving previous room:", roomIdRef.current);
      globalSocketInstance.emit("leaveRoom", roomIdRef.current);
      connectedRooms.delete(roomIdRef.current);
    }
    
    // Join the new room if not already in it
    if (roomId && !connectedRooms.has(roomId)) {
      console.log("Joining new room:", roomId);
      globalSocketInstance.emit("joinRoom", roomId);
      connectedRooms.add(roomId);
    }
    
    // Update the roomId ref
    roomIdRef.current = roomId;
  }, [roomId]);

  return {
    socket,
    isConnected,
    connectionStatus,
    retryCount,
    maxRetries,
    connect: manuallyRetry,
    disconnect: manuallyDisconnect
  };
}; 