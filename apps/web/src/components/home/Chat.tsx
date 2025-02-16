import Image from "next/image";
import React from "react";
import seamlessChat from "@/assets/Chat.png";

const Chat = () => {
  return (
    <div className="flex justify-between items-center gap-20 bg-[#F8F8FA] py-24 px-36">
      <Image
        src={seamlessChat}
        alt="Chat Seamlessly"
        loading="lazy"
        height={450}
        className="rounded-lg"
      />

      <div className="space-y-8">
        <h2 className={`font-bold text-5xl leading-tight`}>
          Build Stronger Coummnities with{" "}
          <span className="text-accent">Seamless Chats</span>
        </h2>
        <p className="text-[##383A47] text-xl">
          Create and join communities tailored to your passions. Experience
          seamless communication with real-time messaging, enabling dynamic
          discussions and and organize conversations with ease using dedicated
          channels. Discover a vibrant ecosystem of communities and connect with
          people who share your interests.
        </p>
      </div>
    </div>
  );
};

export default Chat;
