import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/ui/components/ui/sidebar";
import { ArchiveX, Command, File, Inbox, Send, Trash2 } from "lucide-react";
import Logo from "@/assets/logoXeniaShortLightBrown.png";
import { Settings } from "lucide-react";
import Image from "next/image";

const data = {
  navMain: [
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
      isActive: true,
    },
    {
      title: "Drafts",
      url: "#",
      icon: File,
      isActive: false,
    },
    {
      title: "Sent",
      url: "#",
      icon: Send,
      isActive: false,
    },
    {
      title: "Junk",
      url: "#",
      icon: ArchiveX,
      isActive: false,
    },
    {
      title: "Trash",
      url: "#",
      icon: Trash2,
      isActive: false,
    },
  ],

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

const SidebarChat = () => {
  return (
    <Sidebar
      collapsible="none"
      className="flex flex-row overflow-hidden  max-h-screen"
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="w-12 border-r bg-secondary text-secondary-3"
      >
        {/* <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader> */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <Image src={Logo} alt="Xenia Logo" />
              {/* <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      // onClick={() => {
                      //   setActiveItem(item)
                      //   const mail = data.mails.sort(() => Math.random() - 0.5)
                      //   setMails(mail.slice(0, Math.max(5, Math.floor(Math.random() * 10) + 1)))
                      // }}
                      // isActive={activeItem.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu> */}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Settings /> {/* <NavUser user={data.user} /> */}
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="flex-1 border-l">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-2xl font-semibold text-foreground">
              Communities
            </div>
            {/* <Label className="flex items-center gap-2 text-sm">
              <span>Unreads</span>
              <Switch className="shadow-none" />
            </Label> */}
          </div>
          <SidebarInput
            placeholder="Type to search..."
            className="bg-[#F7F7FD]"
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {data.communities.map((group, index) => (
                <a
                  href="#"
                  key={index}
                  className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <div className="flex w-full items-center gap-2">
                    <span>{group.groupname}</span>{" "}
                    <span className="ml-auto text-xs">{group.date}</span>
                  </div>
                  {/* <span className="font-medium">{group.subject}</span> */}
                  <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                    {group.teaser}
                  </span>
                </a>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
};

export default SidebarChat;
