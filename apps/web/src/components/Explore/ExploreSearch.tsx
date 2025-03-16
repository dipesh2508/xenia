import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import React, { useState } from "react";
import { Search } from "lucide-react";

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

const ExploreSearch = ({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (val: string) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  function submitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("explore search", searchQuery);
    if (searchQuery.trim() === "") {
      setQuery("");
    } else {
      setQuery(searchQuery);
    }
  }

  return (
    <div className="lg:mx-24 md:mx-10 mx-6 my-12">
      <div className="mb-10">
        <form onSubmit={submitHandler}>
          <div className="relative">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search community..."
              className="pl-11 bg-primary-1/50 focus:bg-primary-2/50 placeholder:text-primary-6 rounded-xl box-border py-6 placeholder:text-base text-primary-6 text-base border-primary-2/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 select-none opacity-50 text-primary-6" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExploreSearch;
