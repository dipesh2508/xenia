import Image from "next/image";
import logo from "@/assets/XeniaLogoFull.svg";
import { navLinks } from "@/constants";
import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa6";
import { FaFacebookF } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa6";

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

const Footer = () => {
  return (
    <div className="mx-36">
      <div className="flex justify-between items-center my-8">
        <a href="">
          <Image
            src={logo}
            className="m-0"
            alt="Xenia"
            loading="lazy"
            height={50}
          />
        </a>

        <div>
          <ul className="flex justify-center space-x-8">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} className="text-foreground">
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex space-x-7">
          {footerSocials.map((social, idx) => (
            <a key={idx} href="" className="text-primary-7">
              {social.icons}
            </a>
          ))}
        </div>
      </div>

      <hr />

      <div className="flex justify-between items-center text-gray-400 my-8">
        <p>© 2025 Xenia. All Rights Reserved.</p>
        <div className="flex space-x-6">
          <a href="">Privacy Policy</a>
          <a href="">Terms and Conditions</a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
