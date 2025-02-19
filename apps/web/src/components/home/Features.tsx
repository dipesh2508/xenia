import React from "react";
import { Card, CardContent, CardTitle } from "@repo/ui/components/ui/card";
import { FaRocket } from "react-icons/fa6";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { FaCircleCheck } from "react-icons/fa6";
import MotionDiv from "../animations/MotionDiv";

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
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ transition: { duration: 0.5 } }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl text-center font-bold mb-14">
          Features for better experience
        </h2>
      </MotionDiv>

      <div className="grid lg:grid-cols-3 grid-cols-1 md:grid-cols-2 gap-10 ">
        {featArray.map((feat, idx) => (
          <MotionDiv
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.2 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            <Card
              key={idx}
              className="flex items-center pl-5 border-none gap-4 shadow-none lg:flex-row md:flex-col flex-row md:text-center lg:text-left text-left"
            >
              <div className="rounded-full bg-[#913B3E]/20 p-4">
                {feat.icon}
              </div>
              <div className="flex flex-col gap-2">
                <CardTitle className="">{feat.title}</CardTitle>
                <CardContent className="p-0">
                  <p>{feat.content}</p>
                </CardContent>
              </div>
            </Card>
          </MotionDiv>
        ))}
      </div>
    </div>
  );
};

export default Features;
