import Image from "next/image";
import React from "react";
import Logo from "@/assets/logoXeniaShortLightBrown.png";
import { FaGear } from "react-icons/fa6";
import { FaCircleUser } from "react-icons/fa6";
const LeftBar = () => {
  return (
    <div className="flex flex-col w-1/4 h-screen bg-secondary justify-between items-center py-4 px-2">
      <Image src={Logo} alt="Logo Xenia" />

      <div className="flex flex-col items-center justify-between">
        <hr className="text-secondary-3" />

        <FaGear className="text-secondary-3" />
        <FaCircleUser className="text-secondary-3" />
      </div>
    </div>
  );
};

export default LeftBar;
