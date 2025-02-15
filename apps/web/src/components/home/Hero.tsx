import { Button } from "@repo/ui/components/ui/button";
import Image from "next/image";
import hero from "@/assets/HeroImg.png";
import { V2 } from "@/lib/fonts";

const Hero = () => {
  return (
    <section className="overflow-hidden flex justify-between items-center mx-36 gap-20">
      <div className="space-y-11 w-1/2">
        <h2 className={`${V2.className} font-semibold text-6xl tracking-wide`}>
          Connect, Create, & Get{" "}
          <span className="text-accent">Crazy with Friends!</span>
        </h2>
        <p className="font-normal text-xl">
          The fun way to hang out with friends online. Chat, brainstorm, and
          draw together on a shared canvas. Let your creativity flow!
        </p>
        <Button size={"lg"} className="px-5 py-6" variant={"gradient"}>
          Start Chatting Now
        </Button>
      </div>
      <div>
        <Image src={hero} alt="Hero" height={650} loading="lazy" />
      </div>
    </section>
  );
};

export default Hero;
