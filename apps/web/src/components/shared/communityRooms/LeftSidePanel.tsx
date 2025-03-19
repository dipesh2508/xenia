"use client";
import React, { useState } from "react";
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
import { MessageCircle, Globe, MessageSquareDiff, LogOut } from "lucide-react";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";

const LeftSidePanelTop = [
  {
    id: "explore",
    href: "/explore",
    icon: Globe,
    ariaLabel: "Explore",
  },
  {
    id: "chatroom",
    href: "/chat-room",
    icon: MessageCircle,
    ariaLabel: "Chat Room",
  },
  {
    id: "createCommunity",
    href: "/create-community",
    icon: MessageSquareDiff,
    ariaLabel: "Create Community",
  },
];

const LeftSidePanel = () => {
  const [isSelected, setIsSelected] = useState<string>("chatting");
  const router = useRouter();

  const { mutate } = useApi("/user/logout", {
    method: "POST",
    onSuccess: () => {
      toast.success("User Logged Out", {
        description: `You have been successfully logged out`,
      });
      router.push("/");
    },
    onError: (error) => {
      toast.error("Community not created", {
        description: error.message,
      });
    },
  });

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
              <Image src={Logo} alt="Xenia Logo" />
              <div className="text-center text-sm leading-tight mt-2">
                <span className="truncate font-semibold">Xenia</span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0 pt-3 flex flex-col justify-center items-center gap-2.5">
              {LeftSidePanelTop.map((item) => (
                <Link href={item.href} key={item.id}>
                  <SidebarMenuButton
                    size="lg"
                    className={cn(
                      "cursor-pointer flex aspect-square size-11 items-center justify-center rounded-lg hover:bg-primary-6/80 bg-primary-5/20 p-2.5 hover:text-secondary-2 data-[state=active]:",
                      isSelected === item.id &&
                        "bg-primary-6/80 text-secondary-2",
                      "active:bg-primary-7 active:text-secondary-3"
                    )}
                    asChild
                  >
                    <item.icon
                      onClick={() => setIsSelected(item.id)}
                      className="text-2xl"
                    />
                  </SidebarMenuButton>
                </Link>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <Separator className="w-8 bg-primary-6 z-20 rounded-lg" />
        <SidebarFooter>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0 flex flex-col justify-center items-center gap-2.5">
              <Link href={"/profile"}>
                <SidebarMenuButton size="lg" className="p-0" asChild>
                  <Avatar
                    className="h-9 w-9 rounded-lg"
                    onClick={() => setIsSelected("profile")}
                  >
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="user image"
                    />
                    <AvatarFallback className="rounded-lg">IA</AvatarFallback>
                  </Avatar>
                </SidebarMenuButton>
              </Link>

              <Dialog>
                <DialogTrigger>
                  {" "}
                  <SidebarMenuButton
                    size="lg"
                    className={cn(
                      "cursor-pointer flex aspect-square size-10 items-center justify-center rounded-lg hover:bg-primary-6/80 bg-primary-5/20 p-2.5 hover:text-secondary-2 data-[state=active]:",
                      isSelected === "logout" &&
                        "bg-primary-6/80 text-secondary-2",
                      "active:bg-primary-7 active:text-secondary-3"
                    )}
                    asChild
                  >
                    <LogOut
                      onClick={() => setIsSelected("logout")}
                      className="text-xl"
                    />
                  </SidebarMenuButton>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription className="pt-2">
                      This action cannot be undone. You will be logged out of
                      your account.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      type="submit"
                      variant={"destructive"}
                      onClick={() => mutate()}
                    >
                      Logout
                    </Button>
                    <DialogClose asChild>
                      <Button
                        type="button"
                        className="bg-white border-2 border-primary-5 hover:bg-gray-200 text-primary-6 hover:border-gray-300 hover:text-black"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
};

export default LeftSidePanel;
