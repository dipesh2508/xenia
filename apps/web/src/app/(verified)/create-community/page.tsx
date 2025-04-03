import CreateCommunity from "@/components/createCommunity/CreateCommunity";
import PicGrid from "@/components/createCommunity/PicGrid";

const page = () => {
  return (
    <div className="flex flex-row items-start justify-between md:py-8 py-4 mx-6 md:mx-8 md:mr-10 gap-8">
      <PicGrid />
      <CreateCommunity />
    </div>
  );
};

export default page;
