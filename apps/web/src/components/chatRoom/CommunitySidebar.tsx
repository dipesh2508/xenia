"use client";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { useApi } from "@/hooks/useApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FaUserPlus } from "react-icons/fa6";
import SidebarSkeleton from "./SidebarSkeleton";

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

interface Owner {
  id: string;
  image: string | null;
  name: string;
}

interface CountInfo {
  members: number;
}

interface Community {
  createdAt: string;
  description: string;
  id: string;
  image: string | null;
  name: string;
  owner: Owner;
  ownerId: string;
  updatedAt: string;
  _count: CountInfo;
}

type Communities = Community[];
const CommunitySidebar = () => {
  const router = useRouter();
  const {
    data: communities,
    error: getError,
    isLoading: getLoading,
  } = useApi<Communities>(`/communities/user`, {
    method: "GET",
    // enabled: !!,
    // dependencies: [],
    onSuccess: (data) => {
      console.log(data);
      toast.success("Communities", {
        description: `Communities fetched successfully`,
      });
    },
    onError: (error) => {
      toast.error("Community not fetched successfully", {
        description: error.message,
      });
    },
  });

  if (getLoading) return <SidebarSkeleton />;
  if (getError) return <p>Error: {getError.message}</p>;
  if (communities === undefined || communities?.length === 0)
    return (
      <div className="flex flex-col items-center justify-center gap-4 mt-36">
        <FaUserPlus className="text-3xl text-primary-6/60" />
        <p className="text-center text-primary-6/60 text-base font-medium">
          No communities joined yet
        </p>
      </div>
    );
  return (
    <Sidebar
      collapsible="none"
      className=" border-l rounded-tl-2xl rounded-bl-2xl overflow-y-auto flex-shrink-0 h-full max-h-[calc(100vh-32px)] bg-white"
    >
      <SidebarHeader className="gap-3.5 border-b p-4 pt-5">
        <div className="flex w-full items-center justify-between">
          <div className="text-2xl font-semibold text-primary-8/80">
            Communities
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <FaEllipsisVertical className="text-secondary-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="hover:bg-white">
              <Link href={"/create-community"}>
                <DropdownMenuItem className="focus:bg-chatroom-accent/10 focus:text-zinc-700">
                  Create Community
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent className="rounded-bl-xl">
        <SidebarGroup className="px-1 rounded-bl-xl">
          <SidebarGroupContent>
            {communities?.map((group, index) => (
              <div key={index}>
                <Link
                  href={`/chat-room/chats/${group.id}`}
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
                        {group.name}
                      </span>
                      <span className="ml-auto text-xs">time - last msg</span>
                    </div>
                    <div className="flex w-full items-center justify-between">
                      <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                        {group.description}
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
