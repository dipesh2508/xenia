"use client";

import { SidebarProvider, SidebarInset } from "@repo/ui/components/ui/sidebar";
import React, { useState } from "react";
import LeftSidePanel from "@/components/shared/communityRooms/LeftSidePanel";
import Explore from "@/components/Explore";
import Profile from "../Profile";
import RoomSidebar from "../shared/communityRooms/RoomSidebar";

const pages: Record<string, JSX.Element> = {
  explore: <Explore />,
  chatting: <RoomSidebar />,
  profile: <Profile />,
};
const InsetLeftPanel = () => {
  const [selectedPage, setSelectedPage] =
    useState<keyof typeof pages>("chatting");
  return (
    <SidebarProvider>
      <LeftSidePanel
        setSelectedPage={setSelectedPage}
        selectedPage={selectedPage}
      />

      <SidebarInset className="flex bg-[#FBFAF6] m-4 ml-0 rounded-xl flex-1 overflow-hidden">
        {pages[selectedPage] ?? <RoomSidebar />}
      </SidebarInset>
    </SidebarProvider>

    // {/* <div className="flex items-center justify-center bg-[#FBFAF6]">room</div> */}
  );
};

export default InsetLeftPanel;
