import { SidebarProvider, SidebarInset } from "@repo/ui/components/ui/sidebar";
import LeftSidePanel from "@/components/shared/communityRooms/LeftSidePanel";

export default function ChatRoomLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex bg-secondary h-screen">
      <SidebarProvider>
        <LeftSidePanel />

        <SidebarInset className="flex bg-background m-4 ml-0 rounded-xl flex-1 overflow-hidden">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
