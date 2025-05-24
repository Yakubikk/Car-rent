"use client";

import React from "react";
import { useSidebar } from "@/store";
import { Logo } from "@/components";
import { IconBrandFacebookFilled, IconBrandInstagram, IconBrandTelegram, IconX } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import SubscribeForm from "./subscribe-form";

const socialItems = [
  { icon: <IconBrandFacebookFilled width={20} height={20} />, href: "/" },
  { icon: <IconBrandInstagram width={20} height={20} />, href: "/" },
  { icon: <IconBrandTelegram width={20} height={20} />, href: "/" },
  { icon: <IconBrandFacebookFilled width={20} height={20} />, href: "/" },
  { icon: <IconBrandInstagram width={20} height={20} />, href: "/" },
  { icon: <IconBrandTelegram width={20} height={20} />, href: "/" },
];

const contactSections = [
  {
    title: "Контакты",
    items: [
      { text: "Почта:", content: "mail@example.com", href: "mailto:mail@example.com" },
      { text: "Телефон:", content: "+375 (29) 123-45-67", href: "tel:+375 (29) 123-45-67" },
      { text: "Адрес:", content: "г. Минск, ул. Пушкинская, 1" },
    ],
  },
  {
    title: "Карьера",
    items: [
      { text: "Почта:", content: "mail@example.com", href: "mailto:mail@example.com" },
      { text: "Телефон:", content: "+375 (29) 123-45-67", href: "tel:+375 (29) 123-45-67" },
      { text: "Доступные часы:", content: "пн-пт с 9:00 до 18:00" },
    ],
  },
];

const Sidebar: React.FC = () => {
  const { open, setClose } = useSidebar();

  const renderContactSection = (section: (typeof contactSections)[0], index: number) => (
    <React.Fragment key={index}>
      <div className="flex flex-row items-center gap-4">
        <h5 className="text-lg font-bold" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          {section.title}
        </h5>
        <div className="w-[1px] h-full bg-gray-300" />
        <div className="flex flex-col justify-between h-full">
          {section.items.map((item, itemIndex) => (
            <p key={itemIndex}>
              {item.text}{" "}
              {item.href ? (
                <Link to={item.href} className="hover:text-blue-600 transition-colors">
                  {item.content}
                </Link>
              ) : (
                item.content
              )}
            </p>
          ))}
        </div>
      </div>
      {index < contactSections.length - 1 && <div className="w-full h-[1px] bg-gray-300" />}
    </React.Fragment>
  );

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={setClose} 
      />

      {/* Sidebar Drawer */}
      <div 
        className={`fixed top-0 right-0 z-50 w-[500px] h-screen bg-white shadow-xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Sidebar Content */}
        <div className="w-full h-full relative flex flex-col justify-between p-7">
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            onClick={setClose}
          >
            <IconX size={16} />
          </button>
          
          <Logo />
          
          <p className="text-base">
            Quisque imperdiet dignissim enim dictum finibus. Sed consectetutr convallis enim eget laoreet. Aenean vitae
            nisl mollis, porta risus vel Etiam ac suscipit eros.
          </p>
          
          <div className="flex flex-row justify-between items-center w-[95%]">
            <button className="px-4 py-2 bg-blue-600 text-white text-lg font-medium rounded hover:bg-blue-700 transition-colors">
              История
            </button>
            <div className="flex flex-row gap-1">
              <div className="flex flex-row gap-1 items-center">
                {socialItems.map((item, index) => (
                  <Link
                    to={item.href}
                    key={index}
                    className="text-white bg-black hover:bg-blue-500 transition-colors rounded-full p-1.5"
                  >
                    {item.icon}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          <div className="w-full h-[1px] bg-gray-300" />
          {contactSections.map(renderContactSection)}
          <div className="w-full h-[1px] bg-gray-300" />
          <SubscribeForm />
        </div>
      </div>
    </>
  );
};

export { Sidebar };
export default Sidebar;
