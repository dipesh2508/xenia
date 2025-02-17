import { V2 } from "@/lib/fonts";
import { Button } from "@repo/ui/components/ui/button";
import Image from "next/image";
import HeartSmilie from "@/assets/heartSmilie.png";
import Smilie from "@/assets/smilie.png";

const Cta = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-10 relative my-20">
      <Image
        src={Smilie}
        alt="smilie"
        loading="lazy"
        className="absolute lg:left-10 lg:bottom-10 -left-10 bottom-2 lg:w-96 w-48 lg:opacity-100 opacity-90"
      />
      <Image
        src={HeartSmilie}
        alt="heart smilie"
        loading="lazy"
        className="absolute lg:right-0 lg:top-4 right-0 -top-16 lg:w-48 w-24 lg:opacity-100 opacity-80"
      />
      <h2
        className={`${V2.className} font-semibold lg:text-6xl text-4xl tracking-wide lg:mx-96 mx-8 text-center leading-tight z-10`}
      >
        Ready to connect with friends and colleagues the{" "}
        <span className="text-accent">fun way?</span>{" "}
      </h2>
      <Button size={"lg"} className="px-5 py-6" variant={"gradient"}>
        Let&apos;s Get Started!
      </Button>
    </div>
  );
};

export default Cta;
