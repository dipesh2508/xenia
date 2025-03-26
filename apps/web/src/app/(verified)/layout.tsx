"use client";
import { SidebarProvider, SidebarInset } from "@repo/ui/components/ui/sidebar";
import LeftSidePanel from "@/components/shared/communityRooms/LeftSidePanel";
import { useApi } from "@/hooks/useApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function VerifiedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { data, error, isLoading } = useApi(`/user/checkAuth`, {
    method: "GET",
    onError: (error) => {
      toast.error("User Not Logged In", {
        description: error.message,
      });
      router.push("/sign-in");
    },
  });
  return (
    <div className="flex bg-secondary max-h-[calc(100vh-1px)]">
      <SidebarProvider>
        <LeftSidePanel />

        <SidebarInset className="flex bg-background m-4 ml-0 rounded-xl flex-1 overflow-hidden">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
