"use client";

import React, { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    title: "Главная",
    items: [{ label: "Ноутбуки", href: "/" }],
  },
  {
    title: "Продукты",
    items: [
      { label: "Ноутбуки", href: "/laptops" },
      { label: "Смартфоны", href: "/phones" },
      { label: "Аксессуары", href: "/accessories" },
    ],
  },
  {
    title: "Услуги",
    items: [
      { label: "Ремонт", href: "/repair" },
      { label: "Обслуживание", href: "/service" },
      { label: "Консультация", href: "/consultation" },
    ],
  },
  {
    title: "О компании",
    items: [
      { label: "О нас", href: "/about" },
      { label: "Контакты", href: "/contacts" },
      { label: "Вакансии", href: "/careers" },
    ],
  },
];

const DropdownMenu: React.FC = () => {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const location = useLocation();
  const pathname = location.pathname;

  const handleOpen = (menuKey: string) => {
    setOpenMenus({ ...openMenus, [menuKey]: true });
  };

  const handleClose = (menuKey: string) => {
    setOpenMenus({ ...openMenus, [menuKey]: false });
  };

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <div className="w-fit">
      <div className="flex flex-row space-x-4">
        {menuItems.map((menu) => {
          const isMenuOpen = Boolean(openMenus[menu.title]);
          const hasActiveItem = menu.items.some((item) => isActive(item.href));

          return (
            <div 
              key={menu.title} 
              className="relative"
              onMouseEnter={() => handleOpen(menu.title)}
              onMouseLeave={() => handleClose(menu.title)}
            >
              <Link
                to={menu.items[0].href}
                aria-controls={`${menu.title}-menu`}
                aria-haspopup="true"
                className={`transition-colors flex items-center gap-1 ${
                  hasActiveItem ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {menu.title}
                <IconChevronDown width={16} height={16} />
              </Link>
              {isMenuOpen && (
                <div 
                  id={`${menu.title}-menu`}
                  className="absolute left-0 top-full z-10 min-w-[180px] rounded shadow-lg mt-1 bg-white"
                >
                  <ul className="p-0 list-none">
                    {menu.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.href}
                          onClick={() => handleClose(menu.title)}
                          className={`block py-1.5 px-3 ${
                            isActive(item.href) ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-100"
                          }`}
                        >
                          <span
                            className={`text-sm ${
                              isActive(item.href) ? "text-blue-600 font-medium" : "text-gray-800 font-normal"
                            }`}
                          >
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DropdownMenu;
