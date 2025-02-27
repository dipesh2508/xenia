import Image from "next/image";
import React from "react";
import EasyShare from "@/assets/PdfShare.png";
import { Button } from "@repo/ui/components/ui/button";
import MotionDiv from "../animations/MotionDiv";

const PdfShare = () => {
  return (
    <div className="flex justify-between items-center py-24 lg:gap-20 gap-10 lg:px-36 md:px-14 lg:flex-row flex-col px-6 lg:text-left text-center">
      <MotionDiv
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{
          type: "spring",
          damping: 6,
          stiffness: 100,
          duration: 0.5,
        }}
        viewport={{ once: true }}
        className="space-y-8 lg:w-1/2"
      >
        <h2 className={`font-bold text-5xl leading-tight`}>
          Your Ideas, <span className="text-accent">Shared</span> & Amplified
        </h2>
        <p className="text-[##383A47] text-xl">
          Easily upload, share, and organize files with your community members,
          ensuring seamless access anytime, anywhere.
        </p>
        <MotionDiv
          whileHover={{ y: -8 }}
          whileTap={{ y: 2 }}
          transition={{ duration: 0.3 }}
        >
          <Button size={"lg"} className="px-5 py-6" variant={"gradient"}>
            Start Chatting Now
          </Button>
        </MotionDiv>
      </MotionDiv>

      <MotionDiv
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{
          type: "spring",
          damping: 6,
          stiffness: 100,
          duration: 0.5,
        }}
        viewport={{ once: true }}
      >
        <Image
          src={EasyShare}
          alt="Easily upload and share documents"
          loading="lazy"
          height={550}
          className="rounded-lg"
        />
      </MotionDiv>
    </div>
  );
};

export default PdfShare;
