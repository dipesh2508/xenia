import Image from "next/image";
import React from "react";
import StickyNote from "@/assets/stickynoteWhiteboardUpsacle.png";
import WhiteboardImg from "@/assets/WhiteboardUpscaled.png";
import LeftSquiggle from "@/assets/WhiteboardLeftVector.svg";
import RightSquiggle from "@/assets/whiteboardRightVector.svg";

const Whiteboard = () => {
  return (
    <div className="flex justify-between items-center gap-20 bg-primary lg:pt-32 py-28 lg:pb-36 lg:px-36 md:px-10 px-5 relative overflow-hidden lg:flex-row flex-col">
      <Image
        src={LeftSquiggle}
        alt="left squiggle"
        loading="lazy"
        className="absolute left-0 top-0"
      />
      <Image
        src={RightSquiggle}
        alt="right squiggle"
        loading="lazy"
        className="absolute right-0 bottom-0"
      />

      <div className="relative w-fit">
        <Image
          src={WhiteboardImg}
          alt="Whiteboard and Fun"
          height={400}
          loading="lazy"
          className="rounded-lg z-10 relative"
        />

        <Image
          src={StickyNote}
          alt="Sticky Note"
          loading="lazy"
          height={350}
          className="lg:h-72 lg:w-80  h-48 w-56 z-20 absolute lg:bottom-1 left-0 bottom-2 translate-x-[-20%] translate-y-[20%]"
        />
      </div>

      <div className="space-y-8 text-primary-foreground lg:w-1/2 z-10 lg:text-left text-center">
        <h2 className={`font-bold lg:text-5xl text-4xl leading-tight `}>
          Let Your Imagination Run Wild and Get Creative Together!
        </h2>
        <p className="lg:text-xl text-lg">
          Bring ideas to life with real-time visual collaboration. Sketch, draw,
          and annotate seamlessly with your community members. Perfect for team
          planning, design discussions, and creative problem-solving.
        </p>
      </div>
    </div>
  );
};

export default Whiteboard;
