import React from "react";
import bgImg from "@/assets/exploreAlternateImg.png";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import Image from "next/image";
import { Button } from "@repo/ui/components/ui/button";
import { FaBars } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa6";
import { useApi } from "@/hooks/useApi";
import { toast } from "sonner";
import SkeletonExploreCard from "./SkeletonExploreCard";

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

const ExploreCard = ({ data }: { data: Community }) => {
  const [randomImage, setRandomImage] = useState(data?.image || bgImg);

  const fetchRandomImage = async () => {
    try {
      const randomId = Math.floor(Math.random() * 200);
      setRandomImage(`https://picsum.photos/id/${randomId}/350/200`);
    } catch (error) {
      console.error("Failed to fetch random image:", error);
      setRandomImage(bgImg);
    }
  };

  useEffect(() => {
    if (!data?.image) {
      fetchRandomImage();
    }
  }, [data?.image]);

  const {
    data: joinData,
    error: joinError,
    isLoading: joinLoading,
    mutate: joinMutate,
  } = useApi(`/communities/${data.id}/join`, {
    method: "POST",
    onSuccess: (data) => {
      console.log(data);
      toast.success("Join Community", {
        description: `Community joined successfully`,
      });
    },
    onError: (error) => {
      toast.error("Unable to join Community", {
        description: error.message,
      });
    },
  });

  const joinCommunity = () => {
    joinMutate();
  };

  if (joinLoading) return <SkeletonExploreCard />;
  return (
    <Card className="rounded-3xl text-white text-center relative shadow-md shadow-primary-1/50 h-96">
      <CardHeader className="p-0 relative">
        <Image
          src={randomImage}
          alt="Community Image"
          className="rounded-tr-xl rounded-tl-xl aspect-[3/2]"
          width={350}
          height={200}
        />

        <Button
          className="border-gray-200 bg-white/30 absolute right-4 top-2 px-2.5 py-0 rounded-3xl z-20 group group-hover:text-white"
          onClick={joinCommunity}
        >
          <FaPlus className="text-lg text-gray-800 group-hover:text-white" />
        </Button>

        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-center text-gray-100 font-semibold text-2xl bg-black/40 px-4 py-2 rounded w-full">
            {data.name}
          </p>
        </div>
        <div className="absolute left-4 top-[85%] flex flex-start gap-1">
          <div className="rounded-full bg-primary-6 font-medium flex-shrink-0 size-10 flex justify-center items-center">
            {data._count.members}
          </div>
          <p className="text-black text-left pt-5">member(s)</p>
        </div>
      </CardHeader>

      <CardContent className="flex justify-center items-start gap-3 mt-10">
        <div className="rounded-full bg-primary-6 p-2">
          <FaBars />
        </div>
        <p className="text-black text-left">{data.description}</p>
      </CardContent>
    </Card>
  );
};

export default ExploreCard;
