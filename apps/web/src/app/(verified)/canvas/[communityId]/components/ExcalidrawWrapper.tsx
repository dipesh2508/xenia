// components/ExcalidrawWrapper.js
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI, AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";
import { useSocket } from "@/hooks/useSocket";

interface ExcalidrawWrapperProps {
  communityId: string;
}

interface User {
  id?: string;
  name: string;
  cursor?: { x: number; y: number };
}

const CURSOR_UPDATE_THROTTLE = 50; // ms

// Generate a random color for each user
const getRandomColor = () => {
  const colors = [
    '#D32F2F', '#C2185B', '#7B1FA2', '#512DA8', 
    '#1976D2', '#0097A7', '#00796B', '#388E3C',
    '#689F38', '#AFB42B', '#FBC02D', '#FFA000',
    '#F57C00', '#E64A19', '#5D4037', '#455A64'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// User colors cache
const userColors: Record<string, string> = {};

const ExcalidrawWrapper: React.FC<ExcalidrawWrapperProps> = ({ communityId }) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const { socket, isConnected } = useSocket();
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastCursorPosition = useRef<{ x: number; y: number } | null>(null);
  const lastCursorUpdateTime = useRef<number>(0);
  const [currentSocketId, setCurrentSocketId] = useState<string | null>(null);
  
  // Track if we're currently receiving updates to prevent sending our own
  const receivingUpdates = useRef<boolean>(false);
  // Track the last time we received an update
  const lastUpdateTime = useRef<number>(0);

  // Helper function to get a user ID safely
  const safeGetUserId = (id: string | null | undefined): string => {
    return id ?? 'unknown';
  };

  // Setup socket connection and event handlers
  useEffect(() => {
    if (socket && isConnected) {
      // Store our own socket ID for later comparison
      if (socket.id) {
        setCurrentSocketId(socket.id);
        console.log("Current socket ID:", socket.id);
      }
      
      // Join the canvas room
      socket.emit("join:canvas", communityId);

      // Handle receiving updated user list
      socket.on("canvas:users", (users: User[]) => {
        console.log("Received active users:", users);
        // Assign colors to users that don't have one yet
        users.forEach(user => {
          if (!userColors[safeGetUserId(user.id)]) {
            
            // @ts-expect-error the user object might not have an id property
            userColors[safeGetUserId(user.id)] = getRandomColor();
          }
        });
        setActiveUsers(users);
      });

      // Handle when a new user joins
      socket.on("canvas:user-joined", (user: User) => {
        console.log("User joined:", user);
        // Assign a color to the new user
        if (user.id && !userColors[safeGetUserId(user.id)]) {
          // @ts-expect-error the user object might not have an id property
          userColors[safeGetUserId(user.id)] = getRandomColor();
        }
        
        setActiveUsers(prev => {
          // Avoid duplicates
          if (prev.some(u => u.id === user.id)) {
            return prev;
          }
          return [...prev, user];
        });
      });

      // Handle when a user leaves
      socket.on("canvas:user-left", (data: { id: string }) => {
        console.log("User left:", data);
        setActiveUsers(prev => prev.filter(user => user.id !== data.id));
      });

      // Handle cursor updates from other users
      socket.on("canvas:cursor-update", (data: User) => {
        console.log("Cursor update received:", data);
        
        // Assign a color if this user doesn't have one
        if (data.id && !userColors[safeGetUserId(data.id)]) {
          // @ts-expect-error the user object might not have an id property
          userColors[safeGetUserId(data.id)] = getRandomColor();
        }
        
        setActiveUsers(prev => 
          prev.map(user => 
            user.id === data.id 
              ? { ...user, cursor: data.cursor } 
              : user
          )
        );
      });

      // Listen for canvas updates from other users
      socket.on("canvas:update", (elements: any[]) => {
        if (excalidrawAPI) {
          // Mark that we're receiving updates
          receivingUpdates.current = true;
          lastUpdateTime.current = Date.now();
          
          excalidrawAPI.updateScene({ elements });
          
          // Add a small delay to prevent update loops
          setTimeout(() => {
            receivingUpdates.current = false;
          }, 100);
        }
      });

      // Listen for initial canvas data
      socket.on("canvas:data", (elements: any[]) => {
        console.log("Received initial canvas data");
        if (excalidrawAPI) {
          // Mark that we're receiving updates
          receivingUpdates.current = true;
          lastUpdateTime.current = Date.now();
          
          excalidrawAPI.updateScene({ elements });
          
          // Add a small delay to prevent update loops
          setTimeout(() => {
            receivingUpdates.current = false;
          }, 100);
        }
      });

      // Set flag to show we're collaborating
      setIsCollaborating(true);

      return () => {
        socket.emit("leave:canvas", communityId);
        socket.off("canvas:users");
        socket.off("canvas:user-joined");
        socket.off("canvas:user-left");
        socket.off("canvas:cursor-update");
        socket.off("canvas:update");
        socket.off("canvas:data");
        setIsCollaborating(false);
      };
    }
  }, [socket, isConnected, communityId, excalidrawAPI]);

  // Handle mouse movement to track cursor
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!socket || !isConnected || !containerRef.current) return;
    
    const now = Date.now();
    // Throttle cursor updates to prevent overwhelming the network
    if (now - lastCursorUpdateTime.current < CURSOR_UPDATE_THROTTLE) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Only send update if the cursor has moved
    if (
      !lastCursorPosition.current ||
      Math.abs(lastCursorPosition.current.x - x) > 5 ||
      Math.abs(lastCursorPosition.current.y - y) > 5
    ) {
      lastCursorPosition.current = { x, y };
      lastCursorUpdateTime.current = now;
      
      console.log("Sending cursor position:", { x, y });
      socket.emit("canvas:cursor-position", {
        communityId,
        x,
        y
      });
    }
  }, [socket, isConnected, communityId]);

  // Add mouse move listener
  useEffect(() => {
    console.log("Setting up mouse move listener on container ref");
    const container = containerRef.current;
    if (container) {
      console.log("Container element found, adding mouse move listener");
      container.addEventListener("mousemove", handleMouseMove);
      return () => {
        console.log("Removing mouse move listener");
        container.removeEventListener("mousemove", handleMouseMove);
      };
    } else {
      console.log("Container element not found");
    }
  }, [handleMouseMove]);

  const handleChange = (
    elements: readonly any[],
    appState: AppState,
    files: BinaryFiles
  ) => {
    if (socket && isConnected && !receivingUpdates.current) {
      // Only send updates if we haven't received an update in the last 100ms
      if (Date.now() - lastUpdateTime.current > 100) {
        // Send canvas updates to other users
        socket.emit("canvas:update", { communityId, elements });
      }
    }
  };

  // Render cursors for other users
  const renderCursors = () => {
    return activeUsers.map(user => {
      // Don't render cursor for current user
      if (!currentSocketId || !user.id) return null;
      
      // Skip rendering the current user's cursor
      if (user.id === currentSocketId) {
        console.log("Skipping cursor for current user:", user.id);
        return null;
      }
      
      // Only render if user has a cursor position
      if (!user.cursor) {
        console.log("User has no cursor position:", user.name);
        return null;
      }
      
      console.log("Rendering cursor for user:", user.name, user.cursor);
      
      // Get the color for this user
      const color = userColors[safeGetUserId(user.id)] || '#000000';
      
      return (
        <div
          key={user.id}
          className="absolute pointer-events-none z-[9999] flex flex-col items-center"
          style={{
            left: `${user.cursor.x}px`,
            top: `${user.cursor.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <svg
            className="pointer-events-none"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 0L12 24L16 16L24 12L0 0Z"
              fill={color}
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </svg>
          <div 
            className="text-white text-xs py-1 px-2 rounded mt-1 whitespace-nowrap shadow-md"
            style={{ backgroundColor: color }}
          >
            {user.name}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="relative flex flex-col h-[90vh] w-full">
      {/* Active users display */}
      <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="text-sm font-medium">Active Users ({activeUsers.length}):</div>
        <div className="flex flex-wrap gap-2">
          {activeUsers.map(user => {
            if (!user.id) return null;
            const color = userColors[safeGetUserId(user.id)] || '#000000';
            return (
              <div
                key={user.id}
                className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                style={{ 
                  backgroundColor: `${color}20`, // 20% opacity
                  color: color,
                  border: `1px solid ${color}`
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                {user.name} {user.id === currentSocketId ? '(You)' : ''}
              </div>
            );
          })}
          {activeUsers.length === 0 && (
            <div className="text-xs text-gray-500">No active users</div>
          )}
        </div>
      </div>
      
      {/* Excalidraw container */}
      <div ref={containerRef} className="relative flex-grow">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          onChange={handleChange}
          viewModeEnabled={false}
          zenModeEnabled={false}
          gridModeEnabled={false}
          theme="light"
          name="Community Canvas"
        >
          <MainMenu>
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.DefaultItems.Export />
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.ToggleTheme />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
          </MainMenu>
          <WelcomeScreen>
            <WelcomeScreen.Hints.MenuHint />
            <WelcomeScreen.Hints.ToolbarHint />
            <WelcomeScreen.Center>
              <WelcomeScreen.Center.Heading>
                Welcome to Collaborative Canvas
              </WelcomeScreen.Center.Heading>
              <WelcomeScreen.Center.Menu>
                <WelcomeScreen.Center.MenuItemLoadScene />
                <WelcomeScreen.Center.MenuItemHelp />
              </WelcomeScreen.Center.Menu>
            </WelcomeScreen.Center>
          </WelcomeScreen>
        </Excalidraw>
        
        {/* Render cursors for other users */}
        {renderCursors()}
      </div>
    </div>
  );
};

export default ExcalidrawWrapper;
