"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";

interface NavigationTabsProps {
  id: string; // ID of the chat or document room
  defaultValue?: string; // Initially selected tab
  className?: string; // Optional class name for styling
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({
  defaultValue = "message",
  id,
  className,
}) => {
  const router = useRouter();

  const handleTabChange = (value: string) => {
    // Construct the appropriate URL based on the selected tab
    let targetUrl: string;
    
    switch (value) {
      case "message":
        targetUrl = `/chat-room/chats/${id}`;
        break;
      case "canvas":
        targetUrl = `/canvas/${id}`;
        break;
      case "docs":
        targetUrl = `/doc-room/docs/${id}`;
        break;
      default:
        targetUrl = `/chat-room/chats/${id}`;
    }
    
    // Navigate to the constructed URL
    router.push(targetUrl);
  };

  return (
    <Tabs
      defaultValue={defaultValue}
      onValueChange={handleTabChange}
      className={className}
    >
      <TabsList className="bg-chatroom-accent/10">
        <TabsTrigger value="message">Message</TabsTrigger>
        <TabsTrigger value="canvas">Canvas</TabsTrigger>
        <TabsTrigger value="docs">Doc Room</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default NavigationTabs;
