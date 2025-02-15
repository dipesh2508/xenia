"use client";

import Image from "next/image";
import logo from "@/assets/XeniaLogoFull.svg";
import { navLinks } from "../../constants";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";

const Navbar = () => {
  return (
    <div className="max-h-24">
      <div className="flex justify-between items-center mx-36 my-5">
        <a href="">
          <Image src={logo} className="m-0" alt="Xenia" loading="lazy" />
        </a>

        <div>
          <ul className="flex justify-center space-x-5">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} className="text-black">
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex space-x-3">
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
