"use client";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import BrownArea from "@/components/shared/communityRooms/BrownArea";
import { html } from "motion/react-client";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Xenia",
  description: "Connect & Create with Friends Online",
  keywords: [
    "Xenia",
    "Chat",
    "whiteboard",
    "Friends",
    "Canvas",
    "Draw",
    "Hangout",
    "Community",
  ],
};

export default function ChatRoomLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.className} h-screen w-screen flex flex-col`}
      >
        <body
          className={`${montserrat.className} h-screen w-screen flex flex-col`}
        >
          <div className="h-3 w-full">
            <BrownArea />
          </div>

          <div className="overflow-hidden">{children}</div>

          <div className="h-3 w-full">
            <BrownArea />
          </div>
        </body>
      </body>
    </html>
  );
}
