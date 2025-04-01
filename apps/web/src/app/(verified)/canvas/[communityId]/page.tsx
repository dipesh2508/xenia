"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { useApi } from "@/hooks/useApi";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";
import { useUserDetails } from "@/hooks/useUserDetails";
import { Button } from "@repo/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { Card } from "@repo/ui/components/ui/card";
import { AlertCircle } from "lucide-react";
import ConnectionStatus from "@/components/chatRoom/ConnectionStatus";
import CanvasToolbar from "@/components/canvas/CanvasToolbar";
import DrawingCanvas from "@/components/canvas/DrawingCanvas";
import ActiveUsers from "@/components/canvas/ActiveUsers";
import { useCanvasApi } from "@/hooks/useCanvasApi";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface Community {
  id: string;
  name: string;
  description: string;
  image: string | null;
  ownerId: string;
  owner: User;
  createdAt: string;
  updatedAt: string;
}

interface CanvasUser {
  id: string;
  name: string;
  image: string | null;
  color: string;
  mousePosition?: { x: number; y: number } | null;
  lastActive: Date;
}

// Maximum number of simultaneous users on the canvas
const MAX_CANVAS_USERS = 10;

const CanvasPage = ({ params }: { params: { communityId: string } }) => {
  const { communityId } = params;
  const { user } = useUserDetails();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeUsers, setActiveUsers] = useState<CanvasUser[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>("pencil");
  const [selectedColor, setSelectedColor] = useState<string>("#000000");
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [canvasReady, setCanvasReady] = useState<boolean>(false);
  const [joinedCanvas, setJoinedCanvas] = useState<boolean>(false);
  const [canvasData, setCanvasData] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const [canvasId, setCanvasId] = useState<string | undefined>(undefined);
  const [shouldSaveCanvas, setShouldSaveCanvas] = useState<boolean>(false);

  // Canvas API hooks
  const {
    getOrCreateCommunityCanvas,
    updateCanvasSnapshot,
    isLoadingCanvas,
  } = useCanvasApi();

  // Fetch community data
  const { data: community, isLoading: getLoading } = useApi<Community>(
    `/communities/${communityId}`,
    {
      method: "GET",
      onSuccess: (data) => {
        toast.success("Community loaded", {
          description: `Welcome to the Canvas for ${data.name}`,
        });
        setRoomId(`canvas:${communityId}`);
      },
      onError: (error) => {
        toast.error("Community not fetched successfully", {
          description: error.message,
        });
      },
    }
  );

  // Socket connection
  const {
    isConnected,
    connectionStatus,
    retryCount,
    maxRetries,
    connect,
    socket
  } = useSocket({
    roomId: roomId,
    maxRetries: 3,
  });

  // Canvas socket event handlers
  const handleUserJoined = (userData: CanvasUser) => {
    console.log("User joined:", userData);
    
    // Also broadcast our user info to the new user
    if (socket && isConnected && user && userData.id !== user.id) {
      // Find our color from activeUsers or generate a new one
      const myUser = activeUsers.find(u => u.id === user.id);
      const myColor = myUser?.color || `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      
      // Emit our presence to ensure everyone has the full user list
      socket.emit("canvas:join", {
        roomId,
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
          color: myColor,
        },
      });
    }

    setActiveUsers((prev) => {
      // Check if user already exists
      const exists = prev.some((u) => u.id === userData.id);
      if (exists) {
        return prev.map((u) =>
          u.id === userData.id ? { ...u, lastActive: new Date() } : u
        );
      }
      // Add new user
      return [...prev, { ...userData, lastActive: new Date() }];
    });
    
    toast.info(`${userData.name} joined the canvas`, {
      duration: 3000,
    });
  };

  const handleUserLeft = (userId: string) => {
    setActiveUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleUserMovement = (data: { userId: string; position: { x: number; y: number } }) => {
    console.log("User movement:", data.userId, data.position);
    
    setActiveUsers((prev) =>
      prev.map((u) =>
        u.id === data.userId
          ? { ...u, mousePosition: data.position, lastActive: new Date() }
          : u
      )
    );
  };

  const handleCanvasSync = (canvasDataUrl: string) => {
    setCanvasData(canvasDataUrl);
  };

  // Get or create a canvas for this community
  useEffect(() => {
    if (communityId && user) {
      getOrCreateCommunityCanvas(communityId)
        .then((canvas) => {
          if (canvas) {
            setCanvasId(canvas.id);
            if (canvas.snapshot) {
              setCanvasData(canvas.snapshot);
            }
          }
        })
        .catch((error) => {
          toast.error("Failed to load canvas", {
            description: error.message,
          });
        });
    }
  }, [communityId, user, getOrCreateCommunityCanvas]);

  // Save canvas periodically or when a significant change occurs
  useEffect(() => {
    if (!canvasId || !canvasRef.current || !canvasReady || !shouldSaveCanvas) return;

    const saveCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        updateCanvasSnapshot(canvasId, dataUrl)
          .then(() => {
            console.log("Canvas saved successfully");
            setShouldSaveCanvas(false);
          })
          .catch((error) => {
            console.error("Failed to save canvas:", error);
          });
      }
    };

    saveCanvas();
  }, [canvasId, canvasReady, shouldSaveCanvas, updateCanvasSnapshot]);

  // Handle drawing event (extended to trigger canvas saving)
  const handleDrawingEvent = (drawingData: any) => {
    console.log("Received drawing event:", drawingData.type);
    
    // Handle incoming drawing events and apply to canvas
    if (canvasRef.current && canvasReady) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        // Apply the drawing event to canvas
        applyDrawingEvent(ctx, drawingData);
        
        // If it's a clear event or we've accumulated enough drawing events, save the canvas
        if (drawingData.type === "clear" || 
            drawingData.type === "circle" || 
            drawingData.type === "rectangle" || 
            drawingData.type === "line") {
          setShouldSaveCanvas(true);
        }
      }
    }
  };

  const applyDrawingEvent = (
    ctx: CanvasRenderingContext2D,
    drawingData: any
  ) => {
    const { type, color, width, ...rest } = drawingData;
    
    // Save current context state
    ctx.save();
    
    // Set drawing styles
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    switch (type) {
      case "pencil":
        const { from, to } = rest;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        break;
      case "line":
        const { start, end } = rest;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        break;
      case "rectangle":
        const { startPoint, width: rectWidth, height } = rest;
        ctx.strokeRect(startPoint.x, startPoint.y, rectWidth, height);
        break;
      case "circle":
        const { center, radius } = rest;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case "clear":
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        break;
    }
    
    // Restore context state
    ctx.restore();
  };

  // Handle receiving active users list
  const handleActiveUsersList = (usersData: any[]) => {
    console.log("Received active users list:", usersData);
    
    setActiveUsers((prev) => {
      // Create a map of existing users for quick lookup
      const existingUsers = new Map(prev.map(u => [u.id, u]));
      
      // Process incoming users and convert them to CanvasUser type
      const updatedUsers: CanvasUser[] = usersData.map(incomingUser => {
        const existingUser = existingUsers.get(incomingUser.id);
        
        return {
          id: incomingUser.id,
          name: incomingUser.name,
          image: incomingUser.image || null,
          color: incomingUser.color,
          mousePosition: existingUser?.mousePosition || incomingUser.mousePosition || undefined,
          lastActive: new Date()
        };
      });
      
      return updatedUsers;
    });
  };

  // Send heartbeat to keep presence active
  useEffect(() => {
    if (!socket || !isConnected || !roomId || !user) return;
    
    // Send a heartbeat every 10 seconds to keep our presence active
    const heartbeatInterval = setInterval(() => {
      // Find our color from activeUsers or generate a new one
      const myUser = activeUsers.find(u => u.id === user.id);
      
      if (myUser) {
        socket.emit("canvas:join", {
          roomId,
          user: {
            id: user.id,
            name: user.name,
            image: user.image,
            color: myUser.color,
          },
        });
      }
    }, 10000);
    
    return () => clearInterval(heartbeatInterval);
  }, [socket, isConnected, roomId, user, activeUsers]);

  // Set up socket event listeners for canvas
  useEffect(() => {
    if (!socket || !isConnected || !user) return;

    // Listen for canvas-specific events
    socket.on("canvas:userJoined", handleUserJoined);
    socket.on("canvas:userLeft", handleUserLeft);
    socket.on("canvas:userMovement", handleUserMovement);
    socket.on("canvas:sync", handleCanvasSync);
    socket.on("canvas:draw", handleDrawingEvent);
    socket.on("canvas:activeUsers", handleActiveUsersList);

    return () => {
      socket.off("canvas:userJoined");
      socket.off("canvas:userLeft");
      socket.off("canvas:userMovement");
      socket.off("canvas:sync");
      socket.off("canvas:draw");
      socket.off("canvas:activeUsers");
    };
  }, [socket, isConnected, user]);

  // Join canvas room when connected
  useEffect(() => {
    if (socket && isConnected && user && roomId && !joinedCanvas) {
      console.log("Joining canvas:", roomId);
      
      // Generate a random color for the user
      const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      
      // Add ourselves to the active users list first
      setActiveUsers(prev => {
        // Check if we're already in the list
        if (prev.some(u => u.id === user.id)) {
          return prev.map(u => 
            u.id === user.id 
              ? { ...u, color: randomColor, lastActive: new Date() } 
              : u
          );
        }
        // Add ourselves
        return [...prev, {
          id: user.id,
          name: user.name,
          image: user.image,
          color: randomColor,
          lastActive: new Date()
        }];
      });
      
      // Join the canvas room
      socket.emit("canvas:join", {
        roomId,
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
          color: randomColor,
        },
      });
      
      setJoinedCanvas(true);
      
      // Request latest canvas state
      socket.emit("canvas:requestSync", { roomId });
      
      // Also request active users list
      socket.emit("canvas:requestActiveUsers", { roomId });
    }
  }, [socket, isConnected, user, roomId, joinedCanvas]);

  // Restore canvas when data is received
  useEffect(() => {
    if (canvasData && canvasRef.current && canvasReady) {
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = canvasData;
    }
  }, [canvasData, canvasReady]);

  // Set up canvas sync function
  useEffect(() => {
    if (!socket || !isConnected || !canvasRef.current || !canvasReady) return;

    // Listen for sync requests from other users
    const handleSyncRequest = (data: { userId: string }) => {
      if (!canvasRef.current) return;
      
      // Send the current canvas state to all users
      const dataUrl = canvasRef.current.toDataURL('image/png');
      socket.emit('canvas:provideSync', {
        roomId,
        canvasData: dataUrl
      });
    };

    socket.on('canvas:requestSync', handleSyncRequest);

    return () => {
      socket.off('canvas:requestSync', handleSyncRequest);
    };
  }, [socket, isConnected, canvasReady, roomId]);

  // Handle disconnection - let others know when we leave
  useEffect(() => {
    return () => {
      if (socket && isConnected && roomId && user) {
        socket.emit('canvas:leave', {
          roomId,
          userId: user.id
        });
      }
    };
  }, [socket, isConnected, roomId, user]);

  // Add debouncing for mouse movement to reduce network traffic
  const lastEmitTimeRef = useRef<number>(0);
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (socket && isConnected && user && roomId && canvasRef.current) {
      const now = Date.now();
      // Limit emission to once every 50ms (20 updates per second)
      if (now - lastEmitTimeRef.current > 20) { // Increase update frequency for smoother tracking
        const rect = canvasRef.current.getBoundingClientRect();
        const position = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        
        socket.emit("canvas:userMovement", {
          roomId,
          userId: user.id,
          position,
        });
        
        lastEmitTimeRef.current = now;
      }
    }
  };

  // Send drawing event to server (extended to trigger canvas saving)
  const sendDrawingEvent = (drawingData: any) => {
    if (socket && isConnected && roomId) {
      socket.emit("canvas:draw", {
        roomId,
        ...drawingData,
      });

      // For certain operations, mark the canvas for saving
      if (drawingData.type === "clear" || drawingData.type === "circle" || 
          drawingData.type === "rectangle" || drawingData.type === "line") {
        setShouldSaveCanvas(true);
      }
    }
  };

  // Check if canvas is full
  const isCanvasFull = activeUsers.length >= MAX_CANVAS_USERS;

  // Set up an interval to save the canvas periodically
  useEffect(() => {
    if (!canvasId || !canvasReady) return;

    const saveInterval = setInterval(() => {
      setShouldSaveCanvas(true);
    }, 30000); // Save every 30 seconds if there are changes

    return () => clearInterval(saveInterval);
  }, [canvasId, canvasReady]);

  // Function to download the canvas as an image
  const handleDownloadCanvas = () => {
    if (!canvasRef.current || !canvasReady) return;
    
    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png');
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${community?.name || 'canvas'}-${new Date().toISOString().slice(0, 10)}.png`;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Canvas downloaded successfully');
    } catch (error) {
      console.error('Error downloading canvas:', error);
      toast.error('Failed to download canvas');
    }
  };

  // Set up listener for canvas cursor events
  useEffect(() => {
    if (!canvasRef.current || !socket || !isConnected || !user || !roomId) return;

    const handleCanvasCursorMove = (e: CustomEvent<{ x: number; y: number }>) => {
      const now = Date.now();
      // Limit emission to once every 50ms (20 updates per second)
      if (now - lastEmitTimeRef.current > 50) {
        socket.emit("canvas:userMovement", {
          roomId,
          userId: user.id,
          position: e.detail,
        });
        lastEmitTimeRef.current = now;
      }
    };

    // Add event listener for custom cursor event
    canvasRef.current.addEventListener(
      'canvasCursorMove', 
      handleCanvasCursorMove as EventListener
    );

    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener(
          'canvasCursorMove', 
          handleCanvasCursorMove as EventListener
        );
      }
    };
  }, [socket, isConnected, roomId, user]);

  return (
    <div className="h-full">
      <div className="bg-chatroom-background rounded-tr-xl rounded-br-xl flex-1 h-full flex flex-col">
        <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background px-3.5 py-2 justify-between z-10">
          <div className="flex items-center justify-between">
            <Avatar className="h-11 w-11 rounded-full">
              <AvatarImage src={community?.image as string} alt="community image" />
              <AvatarFallback className="rounded-lg">
                {community?.name?.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-start gap-2 whitespace-nowrap p-4 pr-0 text-sm leading-tight">
              <span className="text-foreground/90 font-semibold">
                {community?.name} Canvas
              </span>{" "}
              <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                {community?.description}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Add connection status indicator */}
            <ConnectionStatus
              status={connectionStatus}
              retryCount={retryCount}
              maxRetries={maxRetries}
              onRetry={connect}
            />
            
            {/* Active users count */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">
                      {activeUsers.length}/{MAX_CANVAS_USERS} users
                    </span>
                    {isCanvasFull && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {isCanvasFull
                    ? "Canvas is full, wait for someone to leave"
                    : `${MAX_CANVAS_USERS - activeUsers.length} slots available`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Tabs defaultValue="canvas">
              <TabsList className="bg-chatroom-accent/10">
                <TabsTrigger value="message">Message</TabsTrigger>
                <TabsTrigger value="canvas">Canvas</TabsTrigger>
                <TabsTrigger value="Docs">Doc Room</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Display warning if canvas is full */}
          {isCanvasFull && !activeUsers.some(u => u.id === user?.id) && (
            <Card className="m-4 p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <p className="text-sm font-medium text-yellow-800">
                  Canvas is full. Please wait for someone to leave before joining.
                </p>
              </div>
            </Card>
          )}

          {/* Main canvas content */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Canvas toolbar */}
            <CanvasToolbar
              selectedTool={selectedTool}
              onSelectTool={setSelectedTool}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              strokeWidth={strokeWidth}
              onStrokeWidthChange={setStrokeWidth}
              canClear={canvasReady}
              onClear={() => {
                if (canvasRef.current && canvasReady) {
                  const ctx = canvasRef.current.getContext("2d");
                  if (ctx) {
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    sendDrawingEvent({ type: "clear" });
                  }
                }
              }}
              onDownload={handleDownloadCanvas}
            />

            {/* Active users sidebar */}
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-hidden relative">
                {/* DrawingCanvas component */}
                <DrawingCanvas
                  ref={canvasRef}
                  onReady={() => setCanvasReady(true)}
                  selectedTool={selectedTool}
                  selectedColor={selectedColor}
                  strokeWidth={strokeWidth}
                  onDrawingEvent={sendDrawingEvent}
                  activeUsers={activeUsers.filter(u => u.id !== user?.id)}
                  disabled={isCanvasFull && !activeUsers.some(u => u.id === user?.id)}
                />
              </div>
              
              {/* Active users sidebar */}
              <ActiveUsers users={activeUsers} currentUserId={user?.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasPage;
