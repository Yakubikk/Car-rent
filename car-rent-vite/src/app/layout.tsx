import {Toaster} from "react-hot-toast";
import {RoleBasedMenu} from "@/components/navigation/RoleBasedMenu.tsx";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [menuHeight, setMenuHeight] = React.useState(64); // Значение по умолчанию

  React.useEffect(() => {
    if (menuRef.current) {
      setMenuHeight(menuRef.current.offsetHeight);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Toaster />
      <div ref={menuRef} className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <RoleBasedMenu />
      </div>
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingTop: `${menuHeight}px` }}
      >
        {children}
      </main>
    </div>
  );
}