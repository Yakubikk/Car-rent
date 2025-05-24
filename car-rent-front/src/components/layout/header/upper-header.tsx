import React from "react";
import { Link } from "react-router-dom";
import {
  IconBrandFacebookFilled,
  IconBrandInstagram,
  IconBrandTelegram,
  IconMail,
  IconPhoneCall,
} from "@tabler/icons-react";

const contactItems = [
  {
    href: "tel:+375 29 123 45 67",
    icon: <IconPhoneCall />,
    text: "+375 29 123 45 67",
  },
  {
    href: "mailto:mail@example.com",
    icon: <IconMail />,
    text: "mail@example.com",
  },
];

const navItems = [
  { href: "/help", text: "Помощь" },
  { href: "/support", text: "Поддержка" },
  { href: "/contact", text: "Контакты" },
];

const socialItems = [
  { icon: <IconBrandFacebookFilled width={20} height={20} />, href: "/" },
  { icon: <IconBrandInstagram width={20} height={20} />, href: "/" },
  { icon: <IconBrandTelegram width={20} height={20} />, href: "/" },
];

const UpperHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between py-3 pl-10 pr-5">
      <div className="flex flex-row divide-x divide-black gap-2">
        {contactItems.map((item, index) => (
          <Link to={item.href} key={index} className={index > 0 ? "pl-2" : ""}>
            <div className="flex flex-row items-center gap-1 group">
              {item.icon}
              <span className="group-hover:text-blue-600 transition-colors">{item.text}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex flex-row gap-4 items-center">
        <div className="flex flex-row divide-x divide-black gap-2">
          {navItems.map((item, index) => (
            <Link to={item.href} key={index} className={index > 0 ? "pl-2" : ""}>
              <span className="hover:text-blue-600 transition-colors">{item.text}</span>
            </Link>
          ))}
        </div>

        <div className="flex flex-row gap-1 items-center">
          {socialItems.map((item, index) => (
            <Link
              to={item.href}
              key={index}
              className="text-white bg-black hover:bg-blue-600 transition-colors rounded-full p-1.5"
            >
              {item.icon}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export { UpperHeader };
export default UpperHeader;
