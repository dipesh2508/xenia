"use client"

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { useEffect, useState } from "react";
import NavigationTabs from "@/components/navigation/NavigationTabs";

const ExcalidrawWrapper = dynamic(
  () => import("./components/ExcalidrawWrapper"),
  { ssr: false }
);

interface Community {
  id: string;
  name: string;
  description?: string;
  image?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export default function CanvasPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.communityId as string;
  
  const { data: membershipData, error: membershipError, isLoading: membershipLoading } = useApi<{ isMember: boolean }>(
    `/communities/${communityId}/membership`,
    {
      method: 'GET',
      onError: (error) => {
        console.error("Error checking membership:", error);
        toast.error("Failed to check community membership");
      },
      dependencies: [communityId]
    }
  );

  const { data: communityData, error: communityError, isLoading: communityLoading } = useApi<Community>(
    `/communities/${communityId}`,
    {
      method: 'GET',
      onError: (error) => {
        console.error("Error fetching community details:", error);
        toast.error("Failed to fetch community details");
      },
      dependencies: [communityId]
    }
  );

  const isLoading = membershipLoading || communityLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg">Loading canvas...</div>
        </div>
      </div>
    );
  }

  if (membershipError || !membershipData?.isMember) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You must be a member of this community to access the canvas.</p>
        </div>
      </div>
    );
  }

  if (communityError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Community Not Found</h1>
          <p>The community you are looking for could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col h-screen">
      <header className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{communityData?.name || 'Community'} Canvas</h1>
          {communityData?.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 hidden md:block">
              {communityData.description}
            </p>
          )}
        </div>
        
        <NavigationTabs 
          id={communityId}
          defaultValue="canvas" 
        />
      </header>
      
      <div className="flex-grow overflow-hidden">
        <ExcalidrawWrapper communityId={communityId} />
      </div>
    </main>
  );
}
