import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@repo/ui/components/ui/sidebar";
import { MessageCircle, Globe } from "lucide-react";
import Image from "next/image";
import Logo from "@/assets/logoXeniaShortLightBrown.png";
import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { Separator } from "@repo/ui/components/ui/separator";
import LeftPanelGrad from "@/assets/leftPanel.png";
import { cn } from "@repo/ui/lib/utils";

const LeftSidePanel = ({
  setSelectedPage,
  selectedPage,
}: {
  setSelectedPage: (val: string) => void;
  selectedPage: string;
}) => {
  return (
    <div>
      <Sidebar
        variant="inset"
        collapsible="none"
        className="w-16 bg-secondary text-secondary-3 py-4 flex flex-col items-center justify-center relative bg-cover bg-center"
      >
        <Image
          src={LeftPanelGrad}
          alt="LeftPanelGradient"
          className="absolute inset-0 z-0 w-full"
          fill
        />
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="px-0.5">
              {/* <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-secondary-8 p-1"> */}
              <Image src={Logo} alt="Xenia Logo" />
              {/* </div> */}
              <div className="text-center text-sm leading-tight mt-2">
                <span className="truncate font-semibold">Xenia</span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0 pt-3 flex flex-col justify-center items-center gap-2.5">
              <SidebarMenuButton
                size="lg"
                className={cn(
                  "cursor-pointer flex aspect-square size-11 items-center justify-center rounded-lg hover:bg-primary-6/80 bg-primary-5/20 p-2.5 hover:text-secondary-2 data-[state=active]:",
                  selectedPage === "explore" &&
                    "bg-primary-6/80 text-secondary-2",
                  "active:bg-primary-7 active:text-secondary-3"
                )}
                asChild
              >
                <Globe
                  onClick={() => setSelectedPage("explore")}
                  className="text-2xl"
                />
              </SidebarMenuButton>
              <SidebarMenuButton
                size="lg"
                className={cn(
                  "cursor-pointer flex aspect-square size-11 items-center justify-center rounded-lg hover:bg-primary-6/80 bg-primary-5/20 p-2.5 hover:text-secondary-2 data-[state=active]:",
                  selectedPage === "chatting" &&
                    "bg-primary-6/80 text-secondary-2",
                  "active:bg-primary-7 active:text-secondary-3"
                )}
                asChild
              >
                <MessageCircle
                  onClick={() => setSelectedPage("chatting")}
                  className="text-2xl"
                />
              </SidebarMenuButton>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <Separator className="w-8 bg-secondary-4 mb-2" />
        <SidebarFooter>
          <SidebarMenuButton
            size="lg"
            // className="flex aspect-square size-11 items-center justify-center rounded-lg hover:bg-secondary-6 p-2.5 hover:text-secondary-3"
            className="p-0"
            asChild
          >
            <Avatar
              className="h-8 w-8 rounded-lg"
              onClick={() => setSelectedPage("profile")}
            >
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="user image"
              />
              <AvatarFallback className="rounded-lg">IA</AvatarFallback>
            </Avatar>
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
};

export default LeftSidePanel;
