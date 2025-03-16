import { Input } from "@repo/ui/components/ui/input";
import React from "react";
import { Send, Smile } from "lucide-react";
import CommunitySidebar from "@/components/chatRoom/CommunitySidebar";
import { SidebarProvider, SidebarInset } from "@repo/ui/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { RiSendPlaneFill } from "react-icons/ri";

export default function MessageRoomLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  <SidebarProvider
    style={
      {
        "--sidebar-width": "calc(400px)",
      } as React.CSSProperties
    }
  >
    <CommunitySidebar />
    <SidebarInset className="bg-[#FBFAF6] rounded-tr-xl rounded-br-xl overflow-y-auto flex-1 h-full max-h-[calc(100vh-32px)]">
      <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4 justify-between">
        <div className="flex items-center justify-between">
          <Avatar className="h-11 w-11 rounded-full">
            <AvatarImage src="https://github.com/shadcn.png" alt="user image" />
            <AvatarFallback className="rounded-lg">IA</AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-start gap-2 whitespace-nowrap p-4 pr-0 text-sm leading-tight">
            <span className="text-foreground/90 font-semibold">Community</span>{" "}
            <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
              Info
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4">
          <Tabs defaultValue="chat">
            <TabsList className="bg-chatroom-accent/10">
              <TabsTrigger value="Message">Message</TabsTrigger>
              <TabsTrigger value="canvas">Canvas</TabsTrigger>
              <TabsTrigger value="Docs">Doc Room</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <div className="h-full">Chat</div>

      <div className="flex w-full px-6 py-4 bg-white gap-2 items-center">
        <Smile className="text-indigo-950" />

        <Input
          placeholder="Type your message"
          className="bg-chatroom-accent/10 rounded-xl"
        />
        <div className="bg-chatroom-accent p-2 rounded-xl text-white">
          <RiSendPlaneFill />
        </div>
      </div>
      {children}
      {/* <div className="flex flex-1 flex-col gap-4 p-4">
                      {Array.from({ length: 24 }).map((_, index) => (
                        <div
                          key={index}
                          className="aspect-video h-12 w-full rounded-lg bg-muted/50"
                        />
                      ))}
                    </div> */}
    </SidebarInset>
  </SidebarProvider>;
}
