import Image from "next/image";
import logo from "@/assets/XeniaLogoFull.svg";
import { navLinks } from "@/constants";
import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa6";
import { FaFacebookF } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa6";
import Link from "next/link";
import MotionDiv from "../animations/MotionDiv";
import MotionLi from "../animations/MotionLi";

const footerSocials = [
  {
    icons: (
      <FaXTwitter className="text-primary-7 hover:text-black transition-all duration-300" />
    ),
  },
  {
    icons: <FaInstagram className="text-primary-7" />,
  },
  {
    icons: (
      <FaFacebookF className="text-primary-7 hover:text-blue-700 transition-all duration-300" />
    ),
  },
  {
    icons: (
      <FaGithub className="text-primary-7 hover:text-black transition-all duration-300" />
    ),
  },
];

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
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      when: "BeforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const Footer = () => {
  return (
    <div className="lg:mx-36 md:mx-10 mx-6">
      <MotionDiv
        variants={containerVariants}
        className="flex lg:justify-between items-center my-8 lg:flex-row flex-col gap-8"
      >
        <Link href="/">
          <Image
            src={logo}
            className="m-0"
            alt="Xenia"
            loading="lazy"
            height={50}
          />
        </Link>

        <div>
          <ul className="flex justify-center space-x-8">
            {navLinks.map((link) => (
              <MotionLi variants={linkVariants} key={link.id}>
                <Link href={`${link.id}`} className="text-foreground">
                  {link.title}
                </Link>
              </MotionLi>
            ))}
          </ul>
        </div>

        <div className="flex space-x-7">
          {footerSocials.map((social, idx) => (
            <MotionDiv variants={linkVariants} key={idx}>
              <Link key={idx} href="" className="text-primary-7">
                {social.icons}
              </Link>
            </MotionDiv>
          ))}
        </div>
      </MotionDiv>

      <hr />

      <div className="flex justify-between items-center text-gray-400 my-8 text-sm lg:flex-row flex-col gap-8">
        <p>© 2025 Xenia. All Rights Reserved.</p>
        <div className="flex space-x-6 text-sm">
          <Link href="">Privacy Policy</Link>
          <Link href="">Terms and Conditions</Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
