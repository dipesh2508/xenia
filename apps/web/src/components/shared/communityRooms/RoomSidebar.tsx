"use client";

import React, { useState } from "react";
import CommunitySidebar from "@/components/chatRoom/CommunitySidebar";
import { SidebarProvider, SidebarInset } from "@repo/ui/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import MeChatBubble from "@/components/chatRoom/MeChatBubble";
import RecieverChatBubble from "@/components/chatRoom/RecieverChatBubble";
import SendMessage from "@/components/chatRoom/SendMessage";

const Chat = {
  msgs: [
    {
      sender: "Elsa",
      content: "Hey Ana! How's your day going?",
    },
    {
      sender: "Ana",
      content:
        "Hey Elsa! It's going great, just working on some projects. What about you?",
    },
    {
      sender: "Elsa",
      content:
        "Same here! Just taking a short break. Need any help with your project?",
    },
    {
      sender: "Ana",
      content:
        "That's nice of you! I think I'm good for now, but I'll let you know if I need anything.",
    },
    {
      sender: "Elsa",
      content: "Sounds good! Let's catch up later.",
    },
    {
      sender: "Ana",
      content: "Sure! Talk to you soon. 😊",
    },
  ],
};

interface msg {
  sender: string;
  content: string;
}

interface chat {
  chats: msg[];
}

const RoomSidebar = () => {
  const [msgs, setMsgs] = useState<chat>({ chats: [] });

  return (
    <div>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(400px)",
          } as React.CSSProperties
        }
      >
        <CommunitySidebar />
        <SidebarInset className="bg-[#FBFAF6] rounded-tr-xl rounded-br-xl flex-1 h-screen max-h-[calc(100vh-32px)] flex flex-col">
          <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background px-3.5 py-2 justify-between">
            <div className="flex items-center justify-between">
              <Avatar className="h-11 w-11 rounded-full">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="user image"
                />
                <AvatarFallback className="rounded-lg">IA</AvatarFallback>
              </Avatar>

              <div className="flex flex-col items-start gap-2 whitespace-nowrap p-4 pr-0 text-sm leading-tight">
                <span className="text-foreground/90 font-semibold">
                  Community
                </span>{" "}
                <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                  Info
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
                    item.sender == "Elsa" ? (
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
          {/* <div className="flex flex-1 flex-col gap-4 p-4">
                      {Array.from({ length: 24 }).map((_, index) => (
                        <div
                          key={index}
                          className="aspect-video h-12 w-full rounded-lg bg-muted/50"
                        />
                      ))}
                    </div> */}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default RoomSidebar;
