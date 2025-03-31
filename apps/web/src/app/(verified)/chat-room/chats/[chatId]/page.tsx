"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import MeChatBubble from "@/components/chatRoom/MeChatBubble";
import RecieverChatBubble from "@/components/chatRoom/RecieverChatBubble";
import SendMessage from "@/components/chatRoom/SendMessage";
import { useApi } from "@/hooks/useApi";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import { useUserDetails } from "@/hooks/useUserDetails";
import { Button } from "@repo/ui/components/ui/button";

// Helper function to get the proper socket base URL
const getSocketBaseUrl = () => {
  // For socket connections, we need to strip the /api path
  // The NEXT_PUBLIC_BASE_URL is configured with /api for regular API calls
  const apiBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000/api";
  
  // For development, extract the host without the /api path
  if (process.env.NODE_ENV === 'development') {
    // Match something like http://localhost:8000/api and extract the base part
    const match = apiBaseUrl.match(/(https?:\/\/[^\/]+)/);
    if (match && match[1]) {
      return match[1]; // Return just the host portion (e.g., http://localhost:8000)
    }
    return "http://localhost:8000"; // Fallback
  } else {
    // In production, use the origin for sockets (the rewrite rule handles routing)
    return window.location.origin;
  }
};

interface Message {
  id: string;
  content: string;
  senderId: string;
  chatId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface MessageResponse {
  messages: Message[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface Chat {
  id: string;
  name: string;
  communityId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  _count: {
    messages: number;
  };
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
  chats: Chat[];
}

const Page = ({ params }: { params: { chatId: string } }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUserDetails();
  const { chatId } = params;
  const [isNewMessage, setIsNewMessage] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Add a separate useApi hook for fetching older messages
  const { mutate: fetchOlderMessagesApi } = useApi(
    `/chats/${chatId}/messages`,
    {
      method: "GET",
      enabled: false,
    }
  );

  const loadOlderMessages = async () => {
    if (isLoadingMore || !community?.chats?.[0]?.id) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = (await fetchOlderMessagesApi({
        url: `/chats/${community.chats[0].id}/messages?page=${nextPage}&limit=20`,
      })) as MessageResponse;

      setIsNewMessage(false); // Indicate these are old messages
      setMessages((prev) => [...response.messages.reverse(), ...prev]);
      setHasMore(response.hasMore);
      setCurrentPage(response.page);
    } catch (error: any) {
      toast.error("Failed to load older messages", {
        description: error.message,
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const { data: community, isLoading: getLoading } = useApi<Community>(
    `/communities/${chatId}`,
    {
      method: "GET",
      onSuccess: (data) => {
        console.log(data);
        toast.success("Community loaded", {
          description: `Let's chat in ${data.name}`,
        });

        // Use the messages already included in the community response
        if (data.chats && data.chats.length > 0 && data.chats[0]?.messages) {
          // Set the messages from the community response - sort to show oldest first
          const sortedMessages = [...(data.chats[0].messages || [])].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setMessages(sortedMessages);
          // Set hasMore if there are more than 20 initial messages
          setHasMore(data.chats[0]._count.messages > 20);
          // Set initial load to true when first messages are set
          setIsInitialLoad(true);
        }
      },
      onError: (error) => {
        toast.error("Community not fetched successfully", {
          description: error.message,
        });
      },
    }
  );

  const { mutate: sendMessageMutation, isLoading: isSendingMessage } = useApi(
    "/chats/messages",
    {
      method: "POST",
      onError: (error) => {
        toast.error("Failed to send message", {
          description: error.message,
        });
      },
    }
  );

  // Connect to socket when component mounts and community data is available
  useEffect(() => {
    if (community?.chats && community.chats.length > 0) {
      const chatId = community.chats[0]?.id;
      let socketInstance: Socket | null = null;
      let retryCount = 0;
      const MAX_RETRIES = 3;

      const connectSocket = () => {
        console.log("Attempting to connect to socket server...", retryCount);

        // Get the base URL for the socket connection
        const socketBaseUrl = getSocketBaseUrl();

        // Initialize socket connection with proper configuration
        socketInstance = io(socketBaseUrl, {
          withCredentials: true,
          transports: ["websocket", "polling"], // Try WebSocket first, fallback to polling
          reconnectionAttempts: 5, // Try to reconnect 5 times
          reconnectionDelay: 1000, // Start with 1 second delay
          reconnectionDelayMax: 5000, // Maximum 5 seconds delay
          timeout: 20000, // Connection timeout
          path: '/socket.io/', // Ensure path matches server and rewrite rule in next.config.js
          forceNew: true, // Force a new connection
        });

        socketInstance.on("connect", () => {
          console.log("Socket connected with ID:", socketInstance?.id);
          setIsConnected(true);
          retryCount = 0;

          // Join the chat room once connected
          socketInstance?.emit("joinRoom", chatId);
        });

        socketInstance.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          console.log("Socket connection state:", socketInstance?.connected);
          
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retry attempt ${retryCount}/${MAX_RETRIES}...`);
            
            // Disconnect the old socket before creating a new one
            if (socketInstance) {
              socketInstance.disconnect();
            }
            
            // Retry with a delay
            setTimeout(connectSocket, 2000 * retryCount);
          } else {
            toast.error("Socket connection failed after multiple attempts", {
              description: `Error: ${error.message}. Please refresh the page or try again later.`,
            });
          }
        });

        socketInstance.on("error", (error) => {
          console.error("Socket error event:", error);
        });

        socketInstance.on("disconnect", (reason) => {
          console.log("Socket disconnected. Reason:", reason);
          setIsConnected(false);
          
          // Handle disconnect reasons that require reconnection
          if (reason === "io server disconnect" || reason === "transport close") {
            console.log("Server disconnected the socket. Attempting to reconnect...");
            setTimeout(connectSocket, 2000);
          }
        });

        socketInstance.on("newMessage", (message: Message) => {
          setIsNewMessage(true); // Indicate this is a new message
          setMessages((prev) => [...prev, message]);
        });

        socketInstance.on("messageUpdated", (updatedMessage: Message) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        });

        socketInstance.on("messageDeleted", ({ id }: { id: string }) => {
          setMessages((prev) => prev.filter((msg) => msg.id !== id));
        });
      };

      // Start the socket connection process
      connectSocket();

      // Set socket in state
      setSocket(socketInstance);

      // Cleanup function
      return () => {
        if (socketInstance?.connected) {
          socketInstance.emit("leaveRoom", chatId);
          socketInstance.disconnect();
        }
        if (socketInstance) {
          socketInstance.off();
        }
      };
    }
  }, [community]);

  // Update scroll behavior to handle both initial load and new messages
  useEffect(() => {
    if (isNewMessage || isInitialLoad) {
      messagesEndRef.current?.scrollIntoView({
        behavior: isInitialLoad ? "auto" : "smooth",
      });
      setIsInitialLoad(false);
    }
  }, [messages, isNewMessage, isInitialLoad]);

  // Send message function
  const sendMessage = async (content: string) => {
    if (!content.trim() || !community?.chats?.[0]?.id) return;

    const chatId = community.chats[0].id;

    try {
      await sendMessageMutation({
        body: {
          content,
          chatId,
        },
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Error is already handled by the useApi hook
    }
  };

  return (
    <div className="h-full">
      <div className="bg-chatroom-background rounded-tr-xl rounded-br-xl flex-1 h-full flex flex-col">
        <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background px-3.5 py-2 justify-between z-10">
          <div className="flex items-center justify-between">
            <Avatar className="h-11 w-11 rounded-full">
              <AvatarImage src={community?.image as string} alt="user image" />
              <AvatarFallback className="rounded-lg">
                {community?.name.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-start gap-2 whitespace-nowrap p-4 pr-0 text-sm leading-tight">
              <span className="text-foreground/90 font-semibold">
                {community?.name}
              </span>{" "}
              <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                {community?.description}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tabs defaultValue="message">
              <TabsList className="bg-chatroom-accent/10">
                <TabsTrigger value="message">Message</TabsTrigger>
                <TabsTrigger value="canvas">Canvas</TabsTrigger>
                <TabsTrigger value="Docs">Doc Room</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        {/* Chat area with flex-grow to take available space */}
        <div className="flex-1 overflow-hidden pt-8">
          {/* Scrollable container */}
          <div className="h-full overflow-y-auto">
            {/* Message container */}
            <div className="flex flex-col justify-end min-h-full px-4">
              {hasMore && (
                <Button
                  onClick={loadOlderMessages}
                  className="self-center mb-4 px-4 py-2 text-sm transition-colors"
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? "Loading..." : "Load older messages"}
                </Button>
              )}
              <div className="flex flex-col gap-2 py-4">
                {getLoading && (
                  <div className="text-center py-2">Loading messages...</div>
                )}
                {!getLoading && messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages yet. Start the conversation!
                  </div>
                )}
                {messages.map((message) =>
                  message.senderId === user?.id ? (
                    <MeChatBubble key={message.id} content={message.content} />
                  ) : (
                    <RecieverChatBubble
                      key={message.id}
                      content={message.content}
                      sender={message.sender.name}
                      avatar={message.sender.image}
                    />
                  )
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        <SendMessage
          onSendMessage={sendMessage}
          isConnected={isConnected}
          disabled={!community?.chats?.[0]?.id || isSendingMessage}
        />
      </div>
    </div>
  );
};

export default Page;


