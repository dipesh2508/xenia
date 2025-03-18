"use client";

import React, { useState } from "react";
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

interface msg {
  sender: string;
  content: string;
}

interface chat {
  chats: msg[];
}

interface PageParams {
  params: {
    chatId: string;
  };
}

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

const Page = ({ params }: PageParams) => {
  const [msgs, setMsgs] = useState<chat>({ chats: [] });
  const { chatId } = params;

  const {
    data: community,
    error: getError,
    isLoading: getLoading,
  } = useApi<Community>(`/communities/${chatId}`, {
    method: "GET",
    // enabled: !!,
    // dependencies: [],
    onSuccess: (data) => {
      console.log(data);
      toast.success("Your Communities", {
        description: `Let's chat`,
      });
    },
    onError: (error) => {
      toast.error("Community not fetched successfully", {
        description: error.message,
      });
    },
  });

  return (
    <div>
      <div className="bg-chatroom-background rounded-tr-xl rounded-br-xl flex-1 h-screen max-h-[calc(100vh-32px)] flex flex-col">
        <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background px-3.5 py-2 justify-between">
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
        <div className="flex-grow overflow-hidden flex flex-col">
          {/* This div handles scrolling */}
          <div className="h-full w-full overflow-y-auto">
            {/* Reversed column layout to start from bottom */}
            <div className="min-h-full flex flex-col-reverse px-4">
              <div className="flex flex-col gap-2 pb-2 mb-1">
                {msgs.chats.map((item, index) =>
                  item.sender == "Ana" ? (
                    <MeChatBubble
                      key={`${item.content}-${index}`}
                      content={item.content}
                    />
                  ) : (
                    <RecieverChatBubble
                      key={`${item.content}-${index}`}
                      content={item.content}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <SendMessage msgs={msgs} setMsgs={setMsgs} />
      </div>
    </div>
  );
};

export default Page;
