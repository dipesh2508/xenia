import Image from "next/image";
import React from "react";
import EasyShare from "@/assets/PdfShare.png";
import { Button } from "@repo/ui/components/ui/button";

const Chat = () => {
  return (
    <div className="flex justify-between items-center gap-20 py-24 px-36">
      <div className="space-y-8 w-1/2">
        <h2 className={`font-bold text-5xl leading-tight`}>
          Your Ideas, <span className="text-accent">Shared</span> & Amplified
        </h2>
        <p className="text-[##383A47] text-xl">
          Easily upload, share, and organize files with your community members,
          ensuring seamless access anytime, anywhere.
        </p>
        <Button size={"lg"} className="px-5 py-6" variant={"gradient"}>
          Start Chatting Now
        </Button>
      </div>
      <Image
        src={EasyShare}
        alt="Easily upload and share documents"
        loading="lazy"
        height={550}
        className="rounded-lg"
      />
    </div>
  );
};

export default Chat;
