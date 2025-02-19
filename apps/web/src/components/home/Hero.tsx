import { Button } from "@repo/ui/components/ui/button";
import Image from "next/image";
import hero from "@/assets/HeroImg.png";
import { V2 } from "@/lib/fonts";
import MotionDiv from "@/components/animations/MotionDiv";

const Hero = () => {
  return (
    <section className="overflow-hidden flex justify-between items-center lg:mx-36 md:mx-10 mx-6 gap-20 lg:flex-row flex-col mt-10 lg:mt-0">
      <MotionDiv
        initial={{ opacity: 0, y: -80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          damping: 6,
          stiffness: 100,
        }}
        viewport={{ once: true }}
        className="md:space-y-11 space-y-8 lg:w-1/2 text-center lg:text-left"
      >
        <h2
          className={`${V2.className} font-semibold md:text-6xl text-5xl tracking-wide`}
        >
          Connect, Create, & Get{" "}
          <span className="text-accent">Crazy with Friends!</span>
        </h2>
        <p className="font-normal md:text-xl text-lg">
          The fun way to hang out with friends online. Chat, brainstorm, and
          draw together on a shared canvas. Let your creativity flow!
        </p>

        <MotionDiv
          whileHover={{ y: -8 }}
          whileTap={{ y: 2 }}
          transition={{ duration: 0.3 }}
        >
          <Button size={"lg"} className="px-5 py-6" variant={"gradient"}>
            Start Chatting Now
          </Button>
        </MotionDiv>
      </MotionDiv>
      <MotionDiv
        initial={{ opacity: 0, y: -80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          damping: 6,
          stiffness: 100,
        }}
        viewport={{ once: true }}
      >
        <Image src={hero} alt="Hero" height={650} loading="lazy" />
      </MotionDiv>
    </section>
  );
};

export default Hero;
