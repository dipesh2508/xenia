import { Skeleton } from "@repo/ui/components/ui/skeleton";

export default function SidebarSkeleton() {
  return (
    <div className="flex flex-col h-full border-l rounded-tl-2xl rounded-bl-2xl bg-white max-h-screen">
      {/* Fixed Header Skeleton */}
      <div className="border-b p-4 bg-white sticky top-0 z-20">
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <div className="mt-3">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>

      {/* Scrollable Content Skeleton */}
      <div className="flex-1 overflow-y-auto p-1">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="relative">
              <div className="flex items-center px-3 py-3 w-full">
                <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
                <div className="flex flex-col gap-2 p-4 pr-0 w-full">
                  <div className="flex w-full items-center gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-12 ml-auto" />
                  </div>
                  <div className="flex w-full items-center justify-between">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                </div>
              </div>
              {index !== 5 && (
                <div className="border-b border-gray-200 mx-auto w-11/12"></div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
