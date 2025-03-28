import Image from "next/image";
import LogoFull from "@/assets/logo-full-xenia-slate.svg";

const page = () => {
  return (
    <div className="flex items-center justify-center flex-col gap-4 h-full">
      <Image
        src={LogoFull}
        alt="No Communities Found"
        className="mx-auto col-span-3 mt-20 opacity-80"
        height={100}
      />
      <p className="text-center col-span-full my-4 text-primary-6/60 text-lg text-medium">
        Select a chat to start messaging else
        <br />
        <span>go to canvas to draw and have fun</span>
      </p>
    </div>
  );
};

export default page;
