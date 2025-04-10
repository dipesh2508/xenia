"use client";

import Image from "next/image";
import logo from "@/assets/XeniaLogoFull.svg";
import { navLinks } from "../../constants";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { FaBars } from "react-icons/fa6";
import { useContext, useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import MotionDiv from "@/components/animations/MotionDiv";
import { AuthContext } from "@/context/AuthContext";
import MotionLi from "../animations/MotionLi";
import { cn } from "@repo/ui/lib/utils";

// Parent container variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const linkVariants = {
  hidden: {
    opacity: 0,
    y: -10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const linkAnimationVariant = {
  hidden: {
    opacity: 0,
    y: 0,
    scale: 1.2,
  },
  hover: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setShowLogin, setShowSignup } = useContext(AuthContext);
  const [isScrolling, setIsScrolling] = useState(false);
  let scrollTimeout: NodeJS.Timeout;
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);

      // Clear previous timeout and set a new one
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => setIsScrolling(false), 500); // Increased to 500ms for slower transition
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div
      className={cn(
        "sticky top-0 z-50 transition-all duration-1000 ease-in-out", // Increased duration to 1000ms
        isScrolling
          ? "bg-gradient-to-b from-background from-10% via-white/80 via-50% to-white/30 to-90%" // Adjusted gradient stops for top-to-bottom flow
          : "bg-white"
      )}
      style={{
        transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)", // Adjusted curve for smoother flow
      }}
    >
      <MotionDiv
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex justify-between items-center lg:mx-36 md:mx-10 mx-6 py-3 relative"
      >
        <Link href="/">
          <Image
            src={logo}
            className="m-0 md:h-auto h-10"
            alt="Xenia"
            loading="lazy"
          />
        </Link>

        <ul className="lg:flex justify-center space-x-5 hidden relative">
          {navLinks.map((link) => (
            <MotionLi key={link.id} variants={linkVariants}>
              <Link href={`${link.id}`} className="text-black">
                {link.title}
              </Link>
            </MotionLi>
          ))}
          {navLinks.map((link, index) => (
            <MotionLi
              key={`${link.id}-hover`}
              variants={linkAnimationVariant}
              initial="hidden"
              whileHover="hover"
              className="absolute"
              style={{
                ...(index === navLinks.length - 1
                  ? { right: "0" }
                  : { left: `${index * 4.36 - 1.25}rem` }),
              }}
            >
              <Link href={`${link.id}`} className="text-primary-4 font-normal">
                {link.title}
              </Link>
            </MotionLi>
          ))}
        </ul>

        <div className="lg:flex space-x-3 hidden">
          <Link href="/sign-in">
            <MotionDiv
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                className="bg-background hover:border hover:border-primary hover:bg-background text-foreground"
                onClick={() => {
                  setShowLogin(true);
                  setShowSignup(false);
                }}
              >
                Login
              </Button>
            </MotionDiv>
          </Link>
          <Link href="/sign-up">
            <MotionDiv
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant={"gradient"}
                onClick={() => {
                  setShowLogin(false);
                  setShowSignup(true);
                }}
              >
                Sign Up
              </Button>
            </MotionDiv>
          </Link>
        </div>

        <Button
          variant={"outline"}
          onClick={() => setIsOpen((prev) => !prev)}
          className="lg:hidden"
        >
          <FaBars />
        </Button>

        <AnimatePresence>
          {isOpen && (
            <MotionDiv
              className="lg:hidden rounded-b-lg absolute z-10 top-14 right-0 bg-background shadow-md inset-0 -m-8"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 30 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div className="bg-background pb-20 text-black">
                <ul className="bg-background p-8 text-center space-y-5 text-black">
                  {navLinks.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={`${link.id}`}
                        className="text-black text-lg font-normal"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>

                <hr className="w-1/2 h-1 mx-auto bg-primary-2 border-0 rounded-sm mb-2"></hr>
                <div className="space-x-3 bg-background text-center py-5">
                  <Link href="/sign-in">
                    <MotionDiv
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        className="bg-background hover:border hover:border-primary hover:bg-background text-foreground"
                        onClick={() => {
                          setShowLogin(true);
                          setShowSignup(false);
                          setIsOpen(false);
                        }}
                      >
                        Login
                      </Button>
                    </MotionDiv>
                  </Link>
                  <Link href="/sign-up">
                    <MotionDiv
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        variant={"gradient"}
                        onClick={() => {
                          setShowLogin(false);
                          setShowSignup(true);
                          setIsOpen(false);
                        }}
                      >
                        Sign Up
                      </Button>
                    </MotionDiv>
                  </Link>
                </div>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </MotionDiv>
    </div>
  );
};

export default Navbar;
