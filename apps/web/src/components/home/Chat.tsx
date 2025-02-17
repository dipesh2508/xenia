import Image from "next/image";
import React from "react";
import seamlessChat from "@/assets/Chat.png";

const Chat = () => {
  return (
    <div className="flex justify-between items-center lg:gap-20 gap-10 bg-[#F8F8FA] py-24 lg:px-36 md:px-14 lg:flex-row flex-col px-6 lg:text-left text-center">
      <Image
        src={seamlessChat}
        alt="Chat Seamlessly"
        loading="lazy"
        height={410}
        className="rounded-lg"
      />

      <div className="space-y-8">
        <h2 className={`font-bold text-4xl md:text-5xl leading-tight`}>
          Build Stronger Coummnities with{" "}
          <span className="text-accent">Seamless Chats</span>
        </h2>
        <p className="text-[##383A47] md:text-xl text-lg">
          Create and join communities tailored to your passions. Experience
          seamless communication with real-time messaging, enabling dynamic
          discussions and organize conversations using dedicated channels.
          Discover a vibrant ecosystem of communities and connect with people
          who share your interests.
        </p>
      </div>
    </div>
  );
};

export default Chat;
