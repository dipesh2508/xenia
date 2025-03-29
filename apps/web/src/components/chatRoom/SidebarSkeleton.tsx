import { Skeleton } from "@repo/ui/components/ui/skeleton";

export default function SidebarSkeleton() {
  return (
    <div className="flex flex-col h-full border-l rounded-tl-2xl rounded-bl-2xl bg-gray-50 max-h-screen">
      {/* Fixed Header Skeleton */}
      <div className="border-b p-4 bg-gray-100 sticky top-0 z-20">
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-8 w-36 bg-gray-300" />
          <Skeleton className="h-5 w-5 rounded-full bg-gray-300" />
        </div>
        <div className="mt-3">
          <Skeleton className="h-10 w-full rounded-md bg-gray-300" />
        </div>
      </div>

      {/* Scrollable Content Skeleton */}
      <div className="flex-1 overflow-y-auto p-1 bg-gradient-to-b from-gray-50 to-gray-100">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="relative hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center px-3 py-3 w-full">
                <Skeleton className="h-14 w-14 rounded-full flex-shrink-0 bg-gray-300" />
                <div className="flex flex-col gap-2 p-4 pr-0 w-full">
                  <div className="flex w-full items-center gap-2">
                    <Skeleton className="h-5 w-32 bg-gray-300" />
                    <Skeleton className="h-4 w-12 ml-auto bg-gray-200" />
                  </div>
                  <div className="flex w-full items-center justify-between">
                    <Skeleton className="h-4 w-48 bg-gray-200" />
                    <Skeleton className="h-5 w-5 rounded-full bg-gray-300" />
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
