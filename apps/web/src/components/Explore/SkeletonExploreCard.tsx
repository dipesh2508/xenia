import React from "react";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";

const SkeletonExploreCard = () => {
  return (
    <Card className="rounded-3xl text-white text-center relative shadow-md shadow-primary-1/50">
      <CardHeader className="p-0 relative">
        {/* Skeleton for image */}
        <div className="w-full h-[200px] bg-gray-200 rounded-tr-xl rounded-tl-xl animate-pulse" />

        {/* Skeleton for add button */}
        <div className="absolute right-4 top-2 w-8 h-8 rounded-full bg-gray-300 animate-pulse" />

        {/* Skeleton for title */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-10 bg-gray-300 rounded animate-pulse" />
        </div>
      </CardHeader>

      {/* Skeleton for member count */}
      <div className="absolute left-4 top-36 flex flex-start gap-1">
        <div className="rounded-full bg-gray-300 flex-shrink-0 size-10 animate-pulse" />
        <div className="h-6 w-24 bg-gray-200 rounded mt-5 animate-pulse" />
      </div>

      <CardContent className="flex justify-center items-start gap-3 mt-10">
        {/* Skeleton for icon */}
        <div className="rounded-full bg-gray-300 size-8 animate-pulse" />

        {/* Skeleton for description */}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SkeletonExploreCard;
