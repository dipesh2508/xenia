"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";

interface TabsNavigationProps {
  defaultValue: string;
  communityId: string;
}

const TabsNavigation = ({ defaultValue, communityId }: TabsNavigationProps) => {
  const router = useRouter();

  const handleTabChange = (value: string) => {
    switch (value) {
      case "message":
        router.push(`/chat-room/chats/${communityId}`);
        break;
      case "canvas":
        router.push(`/canvas/${communityId}`);
        break;
      case "docs":
        router.push(`/doc-room/docs/${communityId}`);
        break;
      default:
        break;
    }
  };

  return (
    <Tabs defaultValue={defaultValue} onValueChange={handleTabChange}>
      <TabsList className="bg-chatroom-accent/10">
        <TabsTrigger value="message">Message</TabsTrigger>
        <TabsTrigger value="canvas">Canvas</TabsTrigger>
        <TabsTrigger value="docs">Doc Room</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default TabsNavigation;
