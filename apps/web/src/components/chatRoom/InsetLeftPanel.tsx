"use client";

import RightBrownArea from "@/components/shared/communityRooms/RightBrownArea";
import SidebarChat from "@/components/shared/communityRooms/SidebarChat";
import { SidebarProvider, SidebarInset } from "@repo/ui/components/ui/sidebar";
import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import LeftSidePanel from "@/components/shared/communityRooms/LeftSidePanel";
import Explore from "@/components/Explore";
import Chatting from "@/components/chatRoom/Chatting";
import Profile from "../Profile";

const pages: Record<string, JSX.Element> = {
  explore: <Explore />,
  chatting: <Chatting />,
  profile: <Profile />,
};
const InsetLeftPanel = () => {
  const [selectedPage, setSelectedPage] =
    useState<keyof typeof pages>("chatting");
  return (
    // <div className="flex flex-row h-full bg-secondary">
    <SidebarProvider
    // style={
    //   {
    //     "--sidebar-width": "calc(48px + 350px)", // Icons width + Mails width
    //   } as React.CSSProperties
    // }
    >
      <LeftSidePanel
        setSelectedPage={setSelectedPage}
        selectedPage={selectedPage}
      />

      {/* <SidebarChat /> */}
      <SidebarInset className="bg-[#FBFAF6] overflow-auto m-4 ml-0 rounded-xl">
        {/* <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4"> */}
        {/* <header className="flex h-16 shrink-0 items-center gap-2 sticky top-0">
          <div className="flex items-center gap-2 px-4">
            <Tabs defaultValue="chat" className="w-[400px]">
              <TabsList>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="canvas">Canvas</TabsTrigger>
                <TabsTrigger value="docs">Docs</TabsTrigger>
              </TabsList>
              <TabsContent value="chat">Change your password here.</TabsContent>
              <TabsContent value="canvas">
                Make changes to your account here.
              </TabsContent>
              <TabsContent value="docs">Change your password here.</TabsContent>
            </Tabs>
          </div>
        </header> */}
        {/* <div className="flex flex-1 flex-col gap-4 p-4">
            {Array.from({ length: 24 }).map((_, index) => (
              <div
                key={index}
                className="aspect-video h-12 w-full rounded-lg bg-muted/50"
              />
            ))}
          </div> */}
        {pages[selectedPage] ?? <Chatting />}
      </SidebarInset>
    </SidebarProvider>

    // {/* <div className="flex items-center justify-center bg-[#FBFAF6]">room</div> */}

    // <RightBrownArea />
    // </div>
  );
};

export default InsetLeftPanel;
