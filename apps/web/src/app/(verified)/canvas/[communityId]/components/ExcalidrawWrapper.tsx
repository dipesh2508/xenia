// components/ExcalidrawWrapper.js
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI, AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";
import { useSocket } from "@/hooks/useSocket";
import { useParams } from "next/navigation";

interface ExcalidrawWrapperProps {
  communityId: string;
}

interface User {
  id: string;
  name: string;
  cursor?: { x: number; y: number };
}

const CURSOR_UPDATE_THROTTLE = 50; // ms

const ExcalidrawWrapper: React.FC<ExcalidrawWrapperProps> = ({ communityId }) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const { socket, isConnected } = useSocket();
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastCursorPosition = useRef<{ x: number; y: number } | null>(null);
  const lastCursorUpdateTime = useRef<number>(0);
  
  // Track if we're currently receiving updates to prevent sending our own
  const receivingUpdates = useRef<boolean>(false);
  // Track the last time we received an update
  const lastUpdateTime = useRef<number>(0);

  // Setup socket connection and event handlers
  useEffect(() => {
    if (socket && isConnected) {
      // Join the canvas room
      socket.emit("join:canvas", communityId);

      // Handle receiving updated user list
      socket.on("canvas:users", (users: User[]) => {
        setActiveUsers(users);
      });

      // Handle when a new user joins
      socket.on("canvas:user-joined", (user: User) => {
        setActiveUsers(prev => [...prev, user]);
      });

      // Handle when a user leaves
      socket.on("canvas:user-left", (data: { id: string }) => {
        setActiveUsers(prev => prev.filter(user => user.id !== data.id));
      });

      // Handle cursor updates from other users
      socket.on("canvas:cursor-update", (data: User) => {
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
      
      socket.emit("canvas:cursor-position", {
        communityId,
        x,
        y
      });
    }
  }, [socket, isConnected, communityId]);

  // Add mouse move listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      return () => {
        container.removeEventListener("mousemove", handleMouseMove);
      };
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
      // Don't render cursor for current user - we'll use the socket ID to check since we don't have user.id
      if (user.id === socket?.id) return null;
      
      // Only render if user has a cursor position
      if (!user.cursor) return null;
      
      return (
        <div
          key={user.id}
          className="absolute pointer-events-none z-50 flex flex-col items-center"
          style={{
            left: user.cursor.x,
            top: user.cursor.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <svg
            className="pointer-events-none"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 0L8 16L10.5 10.5L16 8L0 0Z"
              fill="rgba(255, 255, 255, 0.8)"
              stroke="#000"
              strokeWidth="1"
            />
          </svg>
          <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded mt-1 whitespace-nowrap">
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
        <div className="text-sm font-medium">Active Users:</div>
        <div className="flex flex-wrap gap-2">
          {activeUsers.map(user => (
            <div
              key={user.id}
              className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-full"
            >
              {user.name}
            </div>
          ))}
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
