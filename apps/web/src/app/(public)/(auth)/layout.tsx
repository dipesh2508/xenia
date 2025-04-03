"use client";
import Image from "next/image";
import RegisterImg from "@/assets/RegisterUser.png";
import { useApi } from "@/hooks/useApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { data } = useApi(`/user/checkAuth`, {
    method: "GET",
    onSuccess: () => {
      toast.success("User Logged In", {
        description: "User is already logged in",
      });
      router.push("/chat-room");
    },
  });
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
    </div>
  );
}
