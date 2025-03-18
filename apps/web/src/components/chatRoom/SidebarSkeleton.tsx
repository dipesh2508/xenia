import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
} from "@repo/ui/components/ui/sidebar";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

export default function SidebarSkeleton() {
  return (
    <Sidebar className=" border-l rounded-tl-2xl rounded-bl-2xl flex-shrink-0 h-full max-h-[calc(100vh-32px)] bg-white ml-16 mt-4 px-2">
      {/* Header Skeleton */}
      <SidebarHeader className="flex flex-row items-center justify-between pb-4">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </SidebarHeader>

      {/* Search Bar Skeleton */}
      <Skeleton className="h-10 w-full my-4" />

      {/* List Items Skeleton */}
      <SidebarContent className="flex flex-col gap-2 px-2">
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
