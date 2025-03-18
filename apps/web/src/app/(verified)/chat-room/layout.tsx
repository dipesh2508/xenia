import CommunitySidebar from "@/components/chatRoom/CommunitySidebar";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/ui/sidebar";

export default function ChatRoomLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(400px)",
          } as React.CSSProperties
        }
      >
        <CommunitySidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
