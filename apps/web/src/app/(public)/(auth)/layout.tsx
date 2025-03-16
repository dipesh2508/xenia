import Image from "next/image";
import RegisterImg from "@/assets/RegisterUser.png";
import { Toaster } from "@repo/ui/components/ui/sonner";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex justify-between items-center lg:flex-row flex-col-reverse">
      <Image src={RegisterImg} alt="register image" height={700} />

      <div className="lg:w-1/2 pt-10 ">
        <h2 className="font-semibold text-5xl text-primary  text-center">
          Welcome to Xenia!
        </h2>
        <p className="text-primary-8  text-center mt-5 lg:px-0 px-2">
          Get ready to connect with your circle and dive into fun!
        </p>
        {children}
      </div>
      <Toaster richColors />
    </div>
  );
}
