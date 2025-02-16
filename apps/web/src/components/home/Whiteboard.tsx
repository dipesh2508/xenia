import Image from "next/image";
import React from "react";
import StickyNote from "@/assets/stickynoteWhiteboardUpsacle.png";
import WhiteboardImg from "@/assets/WhiteboardUpscaled.png";
import LeftSquiggle from "@/assets/WhiteboardLeftVector.svg";
import RightSquiggle from "@/assets/whiteboardRightVector.svg";

const Whiteboard = () => {
  return (
    <div className="flex justify-between items-center gap-20 bg-primary pt-32 pb-36 px-36 relative overflow-hidden">
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
          className="z-20 absolute bottom-0 left-0 translate-x-[-20%] translate-y-[20%]"
        />
      </div>

      <div className="space-y-8 text-primary-foreground w-1/2 z-10">
        <h2 className={`font-bold text-5xl leading-tight `}>
          Let Your Imagination Run Wild and Get Creative Together!
        </h2>
        <p className="text-xl">
          Bring ideas to life with real-time visual collaboration. Sketch, draw,
          and annotate seamlessly with your community members. Perfect for team
          planning, design discussions, and creative problem-solving.
        </p>
      </div>
    </div>
  );
};

export default Whiteboard;
