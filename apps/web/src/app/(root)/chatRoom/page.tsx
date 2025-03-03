"use client";

import LeftBar from "@/components/shared/communityRooms/LeftBar";
import RightBrownArea from "@/components/shared/communityRooms/RightBrownArea";
import SidebarChat from "@/components/shared/communityRooms/SidebarChat";
import { SidebarProvider } from "@repo/ui/components/ui/sidebar";
import React from "react";

const page = () => {
  return (
    <div className="flex flex-row h-full overflow-hidden bg-red-100">
      {/* <LeftBar /> */}
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(48px + 350px)", // Icons width + Mails width
          } as React.CSSProperties
        }
      >
        <SidebarChat />
      </SidebarProvider>
      <div className="flex items-center justify-center bg-[#FBFAF6]">room</div>
      <RightBrownArea />
    </div>
  );
};

export default page;
