"use client";
import ExploreCards from "@/components/Explore/ExploreCards";
import ExploreSearch from "@/components/Explore/ExploreSearch";
import { useApi } from "@/hooks/useApi";
import { toast } from "sonner";
import React, { useState } from "react";
import LogoFull from "@/assets/logo-full-xenia-slate.svg";
import Image from "next/image";

interface Owner {
  id: string;
  image: string | null;
  name: string;
}

interface CountInfo {
  members: number;
}

interface Community {
  createdAt: string;
  description: string;
  id: string;
  image: string | null;
  name: string;
  owner: Owner;
  ownerId: string;
  updatedAt: string;
  _count: CountInfo;
}

type Communities = Community[];

const NoCommunitiesFound = () => (
  <div className="relative left-96 top-20">
    <p className="text-center col-span-full my-2 text-primary-6 text-lg text-medium">
      No communities found
    </p>
    <Image
      src={LogoFull}
      alt="No Communities Found"
      className="mx-auto col-span-3 mt-20 opacity-80"
      height={100}
    />
  </div>
);

const ExploreComps = () => {
  const [query, setQuery] = useState("");
  const {
    data: getData,
    error: getError,
    isLoading: getLoading,
  } = useApi<Communities>(`/communities`, {
    method: "GET",
    // enabled: !!,
    // dependencies: [],
    onSuccess: (data) => {
      console.log(data);
      toast.success("Explore Communities", {
        description: `Communities fetched successfully`,
      });
    },
    onError: (error) => {
      toast.error("Community not fetched successfully", {
        description: error.message,
      });
    },
  });

  if (getLoading) return <p>Loading...</p>;
  if (getError) return <p>Error: {getError.message}</p>;
  return (
    <>
      <ExploreSearch query={query} setQuery={setQuery} />
      <div className="mx-24 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 h-full overflow-y-auto mb-8">
        {getData && getData.length > 0 ? (
          (() => {
            const filteredData = getData.filter((item) =>
              item.name.toLowerCase().includes(query.toLowerCase())
            );

            return filteredData.length > 0 ? (
              filteredData.map((item) => (
                <ExploreCards key={item.id} data={item} />
              ))
            ) : (
              <NoCommunitiesFound />
            );
          })()
        ) : (
          <NoCommunitiesFound />
        )}
      </div>
    </>
  );
};

export default ExploreComps;
