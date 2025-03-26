import CommunitySidebar from "@/components/chatRoom/CommunitySidebar";

export default function ChatRoomLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="grid-cols-12 grid h-screen overflow-hidden">
        <div className="col-span-3 h-full overflow-hidden">
          <CommunitySidebar />
        </div>
        <div className="col-span-9 h-full overflow-hidden">{children}</div>
      </div>
    </>
  );
}
