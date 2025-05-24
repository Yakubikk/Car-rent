import React from "react";
import { Logo } from "@/components";
import "./get-buttons.css";
import FooterCarImage from "@/images/Footer-Car-Image-Main-1.jpg";
import { Link } from "react-router-dom";
import { IconBrandFacebookFilled, IconBrandInstagram, IconBrandTelegram } from "@tabler/icons-react";
import SubscribeFormFooter from "./subscribe-form";

interface LinkProps {
  href: string;
  text: string;
}

interface LinksBlock {
  title: string;
  links: LinkProps[];
}

const linksBlocks: LinksBlock[] = [
  {
    title: "Быстрые ссылки",
    links: [
      { href: "/", text: "Главная" },
      { href: "/", text: "О нас" },
      { href: "/", text: "Карьера" },
      { href: "/", text: "Последние новости" },
      { href: "/", text: "Галерея" },
      { href: "/", text: "Свяжитесь с нами" },
    ],
  },
  {
    title: "Информация",
    links: [
      { href: "/", text: "Забронировать авто" },
      { href: "/", text: "Обслуживание" },
      { href: "/", text: "Гарантия" },
      { href: "/", text: "Помощь на дороге" },
      { href: "/", text: "Настройки cookie" },
      { href: "/", text: "Карта сайта" },
    ],
  },
];

const socialItems = [
  { icon: <IconBrandFacebookFilled width={20} height={20} />, href: "/" },
  { icon: <IconBrandInstagram width={20} height={20} />, href: "/" },
  { icon: <IconBrandTelegram width={20} height={20} />, href: "/" },
];

const contactItems = [
  { label: "Директор:", email: "mail@example.com" },
  { label: "Водитель:", email: "mail@example.com" },
  { label: "Арендатор:", email: "mail@example.com" },
  { label: "Приложение:", text: "Нажмите здесь", href: "/" },
];

const FooterComponent: React.FC = () => {
  const renderLink = (link: LinkProps, index: number) => (
    <Link
      key={index}
      to={link.href}
      className="block w-fit hover:translate-x-2 transition-all duration-200 group relative"
    >
      <span className="relative inline-block">
        {link.text}
        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
      </span>
    </Link>
  );

  const renderContactItem = (item: (typeof contactItems)[0], index: number) => (
    <div className="flex flex-row" key={index}>
      <p>{item.label}&nbsp;</p>
      <div>
        {item.email ? (
          <Link
            to={`mailto:${item.email}`}
            className="block w-fit hover:translate-x-2 transition-all duration-200 group relative"
          >
            <span className="relative inline-block">
              {item.email}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
            </span>
          </Link>
        ) : (
          <Link
            to={item.href || "#"}
            className="block w-fit hover:translate-x-2 transition-all duration-200 group relative"
          >
            <span className="relative inline-block">
              {item.text}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
            </span>
          </Link>
        )}
      </div>
    </div>
  );
  return (
    <div className="flex flex-row items-center justify-around bg-black px-8 pt-24 pb-20 text-white">
      <div className="flex flex-col items-center min-w-[520px]">
        <Logo />
        <img src={FooterCarImage} alt="Car" width={520} height={320} style={{ maxWidth: "100%", height: "auto" }} />
      </div>

      <div className="flex flex-col gap-8 w-full max-w-[1000px]">
        <div className="flex flex-row w-full justify-between gap-3">
          {linksBlocks.map((block, index) => (
            <div key={index} className="flex flex-col gap-3 w-[30%]">
              <h5 className="text-xl font-bold">{block.title}</h5>
              <div className="flex flex-col gap-2">{block.links.map(renderLink)}</div>
            </div>
          ))}

          <div className="flex flex-col gap-3 w-[40%]">
            <h5 className="text-xl font-bold">Скачайте наше приложение</h5>
            <p>
              Ut eleifend mattis ligula, porta finibus tincidunt Aenean maecenas vehiculles mattis non mattis Integer.
            </p>
            <div className="flex flex-row gap-2 self-center">
              {["apple", "google"].map((type, index) => (
                <Link key={index} to="/" target="_blank" className={`market-btn ${type}-btn`} role="button">
                  <span className="market-button-subtitle">Скачайте из</span>
                  <span className="market-button-title">{type === "apple" ? "App Store" : "Google Play"}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-row w-full justify-between gap-3">
          <div className="flex flex-col gap-3 w-[30%]">
            <h5 className="text-xl font-bold">Адрес</h5>
            <div className="flex flex-col gap-5">
              <p>г. Минск, ул. Пушкинская, 1</p>
              <div className="flex flex-row gap-1 items-center">
                {socialItems.map((item, index) => (
                  <Link
                    to={item.href}
                    key={index}
                    className="text-white bg-blue-500 hover:bg-blue-600 transition-colors rounded-full p-2"
                  >
                    {item.icon}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-[30%]">
            <h5 className="text-xl font-bold">Справочная</h5>
            <div className="flex flex-col gap-2">{contactItems.map(renderContactItem)}</div>
          </div>

          <div className="flex flex-col gap-3 w-[40%]">
            <h5 className="text-xl font-bold">Подписка на новости</h5>
            <SubscribeFormFooter />
          </div>
        </div>
      </div>
    </div>
  );
};

export { FooterComponent };
export default FooterComponent;
