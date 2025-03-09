import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@repo/ui/components/ui/sidebar";
import { SearchForm } from "./SearchForm";
import Link from "next/link";
import { FaEllipsisVertical } from "react-icons/fa6";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";

const data = {
  communities: [
    {
      groupname: "Tech Enthusiasts",
      date: "09:34 AM",
      teaser: "Has anyone tried the new AI model released today?",
    },
    {
      groupname: "Fitness Warriors",
      date: "10:15 AM",
      teaser:
        "Just finished a 5K run! Who's joining me for the next challenge?",
    },
    {
      groupname: "Startup Founders Hub",
      date: "11:45 AM",
      teaser: "Does anyone have experience with early-stage VC funding?",
    },
    {
      groupname: "UI/UX Designers",
      date: "01:30 PM",
      teaser: "Check out this new color palette trend for 2025!",
    },
    {
      groupname: "React Developers",
      date: "02:20 PM",
      teaser: "Anyone facing issues with React 18 hydration errors?",
    },
    {
      groupname: "Healthcare Innovators",
      date: "03:50 PM",
      teaser: "How do you see blockchain improving patient data security?",
    },
    {
      groupname: "Gamers United",
      date: "04:40 PM",
      teaser: "GG! That last match was insane 🔥",
    },
    {
      groupname: "Blockchain Builders",
      date: "06:15 PM",
      teaser: "I just deployed my first smart contract! 🎉",
    },
    {
      groupname: "Photography Club",
      date: "07:25 PM",
      teaser: "Took an amazing sunset shot today! What do you guys think?",
    },
    {
      groupname: "Mental Wellness Space",
      date: "08:55 PM",
      teaser:
        "Remember to take breaks and breathe. Your mental health matters!",
    },
  ],
};
const CommunitySidebar = () => {
  return (
    <Sidebar
      collapsible="none"
      className=" border-l rounded-tl-2xl rounded-bl-2xl overflow-y-auto flex-shrink-0 h-full max-h-[calc(100vh-32px)] bg-white"
    >
      <SidebarHeader className="gap-3.5 border-b p-4 ">
        <div className="flex w-full items-center justify-between">
          <div className="text-2xl font-semibold text-foreground">
            Communities
          </div>
          {/* <Label className="flex items-center gap-2 text-sm">
              <span>Unreads</span>
              <Switch className="shadow-none" />
            </Label> */}
        </div>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent className="rounded-bl-xl">
        <SidebarGroup className="px-1 rounded-bl-xl">
          <SidebarGroupContent>
            {data.communities.map((group, index) => (
              <div key={index}>
                <Link
                  href="#"
                  key={index}
                  className="flex items-center justify-center hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-14 w-14 rounded-full">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="user image"
                    />
                    <AvatarFallback className="rounded-lg">IA</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start gap-2 whitespace-nowrap p-4 pr-0 text-sm leading-tight">
                    <div className="flex w-full items-center gap-2">
                      <span className="text-foreground font-medium">
                        {group.groupname}
                      </span>{" "}
                      <span className="ml-auto text-xs">{group.date}</span>
                    </div>
                    {/* <span className="font-medium">{group.subject}</span> */}
                    <div className="flex w-full items-center justify-between">
                      <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                        {group.teaser}
                      </span>
                      <FaEllipsisVertical className="text-foreground/30" />
                    </div>
                  </div>
                </Link>

                <hr className="w-80 text-center h-0.5 bg-zinc-400 mx-auto" />
              </div>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default CommunitySidebar;
