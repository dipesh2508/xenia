import BrownArea from "@/components/shared/communityRooms/BrownArea";

export default function ChatRoomLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* <div className="h-3 w-full">
        <BrownArea />
      </div> */}

      <div className="flex bg-secondary h-screen">{children}</div>
      {/* {children} */}

      {/* <div className="h-3 w-full">
        <BrownArea />
      </div> */}
    </>
  );
}
