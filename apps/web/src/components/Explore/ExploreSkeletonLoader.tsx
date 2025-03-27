import React from "react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import SkeletonExploreCard from "./SkeletonExploreCard";

const ExploreSkeletonLoader = () => {
  return (
    <>
      {/* Search Skeleton */}
      <div className="lg:mx-24 md:mx-10 mx-6 my-12">
        <div className="mb-2">
          <div className="relative">
            <Skeleton className="w-full h-14 rounded-xl pl-11 border-2 border-primary-1/20" />
            {/* Search icon skeleton */}
            <div className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 select-none">
              <Skeleton className="h-5 w-5 rounded-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="lg:mx-24 mx-2 grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-6 h-full overflow-y-auto mb-8 pb-4">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <SkeletonExploreCard key={index} />
          ))}
      </div>
    </>
  );
};

export default ExploreSkeletonLoader;
