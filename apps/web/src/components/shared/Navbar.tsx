"use client";

import Image from "next/image";
import logo from "@/assets/XeniaLogoFull.svg";
import { navLinks } from "../../constants";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { FaBars } from "react-icons/fa6";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import MotionDiv from "@/components/animations/MotionDiv";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="md:max-h-24 max-h-12">
      <div className="flex justify-between items-center lg:mx-36 md:mx-10 mx-6 my-5 relative">
        <Link href="">
          <Image
            src={logo}
            className="m-0 md:h-auto h-10"
            alt="Xenia"
            loading="lazy"
          />
        </Link>

        <ul className="lg:flex justify-center space-x-5 hidden">
          {navLinks.map((link) => (
            <li key={link.id}>
              <Link href={`${link.id}`} className="text-black">
                {link.title}
              </Link>
            </li>
          ))}
        </ul>

        <div className="lg:flex space-x-3 hidden">
          <Link href="/login">
            <Button className="bg-background hover:border hover:border-primary hover:bg-background text-foreground">
              Login
            </Button>
          </Link>
          <Link href="/signin">
            <Button variant={"gradient"}>Sign Up</Button>
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 30 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div className="bg-background pb-20">
                <ul className="bg-background p-8 text-center space-y-5">
                  {navLinks.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={`${link.id}`}
                        className="text-black text-lg font-normal"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>

                <hr className="w-1/2 h-1 mx-auto bg-primary-2 border-0 rounded-sm mb-2"></hr>
                <div className="space-x-3 bg-background text-center py-5">
                  <Link href="/login">
                    <Button className="bg-background hover:border hover:border-primary hover:bg-background text-foreground">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signin">
                    <Button variant={"gradient"}>Sign Up</Button>
                  </Link>
                </div>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Navbar;
