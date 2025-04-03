import { Card } from "@repo/ui/components/ui/card";
import Image from "next/image";
import bgImg from "@/assets/exploreAlternateImg.png";

const MasonryGrid = () => {
  const getRandomHeight = (index: number) => {
    const heights = [200, 300, 250, 350, 280, 320, 180];
    return heights[index % heights.length];
  };

  const getRandomImage = () => {
    return `https://picsum.photos/200/300?random=${Math.floor(Math.random() * 100)}`;
  };

  return (
    <div className="mx-auto p-4 flex-1 relative -top-32 hidden lg:block">
      <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4 overflow-hidden">
        {Array.from({ length: 14 }, (_, i) => {
          const height = getRandomHeight(i);
          const img = getRandomImage();
          return (
            <Card key={i} className="mb-4 break-inside-avoid overflow-hidden">
              <div
                className="relative w-full"
                style={{ height: `${height}px` }}
              >
                <Image
                  src={img || bgImg}
                  alt={`Community ${i + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-lg"
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MasonryGrid;
