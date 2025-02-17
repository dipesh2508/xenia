import React from "react";
import { Card, CardContent, CardTitle } from "@repo/ui/components/ui/card";
import { FaRocket } from "react-icons/fa6";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { FaCircleCheck } from "react-icons/fa6";

const featArray = [
  {
    title: "Boost Productivity",
    content:
      "Stay organized and efficient with all collaboration tools in one platform.",
    icon: <FaRocket className="text-[#5B1A1C] text-xl" />,
  },
  {
    title: "Easy to Use",
    content: "A simple and intuitive interface designed for seamless teamwork.",
    icon: <FaArrowRightArrowLeft className="text-[#5B1A1C] text-xl" />,
  },
  {
    title: "Enhance Collaboration",
    content: "Connect, share, and brainstorm easily with your community.",
    icon: <FaCircleCheck className="text-[#5B1A1C] text-xl" />,
  },
];

const Features = () => {
  return (
    <div className="my-20 lg:mx-36 mx-6 md:mx-10" id="features">
      <h2 className="text-4xl text-center font-bold mb-14">
        Features for better experience
      </h2>

      <div className="grid lg:grid-cols-3 grid-cols-1 md:grid-cols-2 gap-10 ">
        {featArray.map((feat, idx) => (
          <Card
            key={idx}
            className="flex items-center pl-5 border-none gap-4 shadow-none lg:flex-row md:flex-col flex-row md:text-center lg:text-left text-left"
          >
            <div className="rounded-full bg-[#913B3E]/20 p-4">{feat.icon}</div>
            <div className="flex flex-col gap-2">
              <CardTitle className="">{feat.title}</CardTitle>
              <CardContent className="p-0">
                <p>{feat.content}</p>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Features;
