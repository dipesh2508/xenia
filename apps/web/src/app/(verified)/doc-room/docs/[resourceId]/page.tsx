"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import ConnectionStatus from "@/components/chatRoom/ConnectionStatus";
import { useApi } from "@/hooks/useApi";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";
import { useUserDetails } from "@/hooks/useUserDetails";
import { Button } from "@repo/ui/components/ui/button";
import ResourceBubble from "@/components/chatRoom/ResourceBubble";
import SendDocs from "@/components/chatRoom/SendDoc";

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

interface Owner {
  id: string;
  name: string;
  image: string | null;
}

interface Resource {
  id: string;
  communityId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner: Owner;
  title: string | null;
}
interface PaginationResponse {
  hasMore: boolean;
  limit: number;
  page: number;
  resources: Resource[];
  total: number;
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
  resources: Resource[];
}

const Page = ({ params }: { params: { resourceId: string } }) => {
  const [messages, setMessages] = useState<Resource[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { resourceId } = params;
  const [isNewMessage, setIsNewMessage] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [resource, setResource] = useState<Resource | null>(null);

  const { data, error, isLoading } = useApi<Community>(
    `/communities/${resourceId}`,
    {
      method: "GET",
      // enabled: !!,
      // dependencies: [],
      onSuccess: (data) => {
        console.log(data);
        toast.success("Community", {
          description: `Community info fetched successfully`,
        });
      },
      onError: (error) => {
        toast.error("Community info not fetched successfully", {
          description: error.message,
        });
      },
    }
  );

  // Add a separate useApi hook for fetching older resources
  const { mutate: fetchOlderResourcesApi } = useApi(
    `/resources/community/${resourceId}`,
    {
      method: "GET",
      enabled: false,
    }
  );

  const loadOlderMessages = async () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = (await fetchOlderResourcesApi({
        url: `/resources/community/${resourceId}?page=${nextPage}&limit=20`,
      })) as PaginationResponse;

      setIsNewMessage(false); // Indicate these are old resources

      if (response.resources && response.resources.length > 0) {
        // Sort the new resources to show oldest first
        const sortedResources = [...response.resources].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // Add the new resources to the beginning of the current list
        setMessages((prev) => [...sortedResources, ...prev]);
        setHasMore(response.hasMore);
        setCurrentPage(response.page);
      }
    } catch (error: any) {
      toast.error("Failed to load older resources", {
        description: error.message,
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const { data: community, isLoading: getLoading } = useApi<PaginationResponse>(
    `resources/community/${resourceId}`,
    {
      method: "GET",
      onSuccess: (data) => {
        console.log("resources/community/id", data);
        toast.success("Resources loaded", {
          description: `${data.total} resources available`,
        });

        // Check if we have resources in the response
        if (data.resources && data.resources.length > 0) {
          // Sort the resources array to show oldest first
          const sortedResources = [...data.resources].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          // Use the sorted resources
          setMessages(sortedResources);

          // Set hasMore if there are more resources than the current limit
          setHasMore(data.total > data.limit);

          // Set initial load to true when first resources are set
          setIsInitialLoad(true);
        }
      },
      onError: (error) => {
        toast.error("Resources not fetched successfully", {
          description: error.message,
        });
      },
    }
  );

  // Handle new resource event - update to use the correct event name from backend
  const handleNewResource = (resource: Resource) => {
    console.log("New resource received:", resource);
    setIsNewMessage(true);
    setMessages((prev) => [...prev, resource]);
  };

  // Handle updated resource event
  const handleResourceUpdated = (updatedResource: Resource) => {
    console.log("Resource updated:", updatedResource);
    setMessages((prev) =>
      prev.map((res) => (res.id === updatedResource.id ? updatedResource : res))
    );
  };

  // Handle deleted resource event
  const handleResourceDeleted = ({ id }: { id: string }) => {
    console.log("Resource deleted:", id);
    setMessages((prev) => prev.filter((res) => res.id !== id));
  };

  // Use the custom useSocket hook with the proper room ID and event handlers
  // Update to use the correct event names from backend
  const { isConnected, connectionStatus, retryCount, maxRetries, connect } =
    useSocket({
      roomId: `community:${resourceId}`,
      onNewResource: handleNewResource,
      onResourceUpdated: handleResourceUpdated,
      onResourceDeleted: handleResourceDeleted,
      maxRetries: 3,
    });

  const { mutate: sendMessageMutation, isLoading: isSendingMessage } = useApi(
    "/resources",
    {
      method: "POST",
      onSuccess: (data) => {
        toast.success("File sent successfully", {
          description: "Your file has been uploaded and shared.",
        });
      },
      onError: (error) => {
        toast.error("Failed to send file", {
          description: error.message,
        });
      },
    }
  );

  const handleSend = async (
    message: string,
    selectedFile: File,
    communityId: string
  ) => {
    try {
      const formData = new FormData();
      formData.append("title", message || "");
      formData.append("communityId", communityId || "");
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      await sendMessageMutation({
        body: formData,
      });
    } catch (error) {
      console.error("Error sending file:", error);
    }
  };

  // Enhanced scroll behavior to ensure complete visibility of new messages including images
  useEffect(() => {
    if (isNewMessage || isInitialLoad) {
      // For initial load, scroll to bottom immediately
      if (isInitialLoad) {
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        }, 100);
      } else {
        // For new messages, scroll with animation and additional padding to ensure full visibility
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
              behavior: "smooth",
              block: "end",
            });
            
            // Add extra scroll to account for potential image height
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
          }
        }, 100); // Small delay to allow image to load
      }
      setIsInitialLoad(false);
    }
  }, [messages, isNewMessage, isInitialLoad]);

  // Update when community data is loaded to reconnect socket with the proper ID
  useEffect(() => {
    if (data?.id && data.id !== resourceId) {
      // If the loaded community ID is different from the resourceId, reconnect
      connect();
    }
  }, [data?.id, resourceId, connect]);

  return (
    <div className="h-full">
      <div className="bg-chatroom-background rounded-tr-xl rounded-br-xl flex-1 h-full flex flex-col">
        <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background px-3.5 py-2 justify-between z-10">
          <div className="flex items-center justify-between">
            <Avatar className="h-11 w-11 rounded-full">
              <AvatarImage src={data?.image as string} alt="user image" />
              <AvatarFallback className="rounded-lg">
                {data?.name.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-start gap-2 whitespace-nowrap p-4 pr-0 text-sm leading-tight">
              <span className="text-foreground/90 font-semibold">
                {data?.name}
              </span>{" "}
              <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                {data?.description}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Add connection status indicator in header */}
            <ConnectionStatus
              status={connectionStatus}
              retryCount={retryCount}
              maxRetries={maxRetries}
              onRetry={connect}
            />

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
          {/* Scrollable container - add ref here */}
          <div className="h-full overflow-y-auto" ref={messagesContainerRef}>
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
                {messages.map((message) => (
                  <ResourceBubble
                    key={message.id}
                    content={message.content}
                    sender={message.owner.name}
                    avatar={message.owner.image}
                    title={message.title || ""}
                  />
                ))}
              </div>
              <div ref={messagesEndRef} className="h-[10px]" />
            </div>
          </div>
        </div>

        <SendDocs
          isConnected={isConnected}
          disabled={!community?.resources?.[0]?.id || isSendingMessage}
          communityId={resourceId}
          handleSend={handleSend}
        />
      </div>
    </div>
  );
};

export default Page;
