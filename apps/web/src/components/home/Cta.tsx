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
        className="absolute left-10 bottom-10"
      />
      <Image
        src={HeartSmilie}
        alt="heart smilie"
        loading="lazy"
        className="absolute right-0 top-4"
      />
      <h2
        className={`${V2.className} font-semibold text-6xl tracking-wide mx-96 text-center leading-tight`}
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
