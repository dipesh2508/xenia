"use client";

import Image from "next/image";
import logo from "@/assets/XeniaLogoFull.svg";
import { navLinks } from "../../constants";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui/components/ui/drawer";
import { useState } from "react";

const Navbar = () => {
  return (
    <div className="md:max-h-24 max-h-12">
      <div className="flex justify-between items-center lg:mx-36 md:mx-10 mx-6 my-5">
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
      </div>
    </div>
  );
};

export default Navbar;
