import React from "react";
import bgImg from "@/assets/exploreAlternateImg.png";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import Image from "next/image";
import { Button } from "@repo/ui/components/ui/button";

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

const ExploreCards = ({ data }: { data: Community }) => {
  const joinCommunity = () => {
    console.log("Joining community");
    //add joining logic here send data to community endpt will join as member
  };
  return (
    <Card className="rounded-rounded-3xl relative bg-cover bg-center text-white text-center pt-20 pb-10 flex justify-between flex-col">
      <div className="absolute inset-0 z-0 rounded-3xl">
        <Image
          src={data?.image || bgImg}
          alt="Explore community"
          className="w-full h-full object-cover rounded-3xl"
          fill
        />
      </div>
      <div className="absolute inset-0 bg-black/35 z-10 rounded-3xl"></div>
      <CardHeader className="z-20 relative mx-2">
        <Button
          className="border-chatroom-secondary border-2 hover:bg-white/10 bg-transparent rounded-xl"
          onClick={() => joinCommunity}
        >
          Join
        </Button>
        <p className="my-2 text-sm">{`${data._count.members} member(s)`}</p>
      </CardHeader>
      <div className="relative z-20">
        <CardFooter className="flex flex-col gap-2 text-white z-30">
          <CardDescription className="text-chatroom-secondary">
            {/* <p className="my-2 text-sm">{`${data._count.members} member(s)`}</p> */}
            {data?.description}
          </CardDescription>
          <CardTitle className="text-2xl">{data.name}</CardTitle>
        </CardFooter>
      </div>
    </Card>
  );
};

export default ExploreCards;
