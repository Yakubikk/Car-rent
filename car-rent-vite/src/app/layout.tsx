import {Toaster} from "react-hot-toast";
import {RoleBasedMenu} from "@/components/navigation/RoleBasedMenu.tsx";
import React from "react";
import "../theme/pink-theme.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [menuHeight, setMenuHeight] = React.useState(64); // Default value

  React.useEffect(() => {
    const updateMenuHeight = () => {
      if (menuRef.current) {
        setMenuHeight(menuRef.current.offsetHeight);
      }
    };

    updateMenuHeight();

    // Update height on window resize
    window.addEventListener('resize', updateMenuHeight);
    return () => window.removeEventListener('resize', updateMenuHeight);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-white to-pink-light">
      <Toaster />
      <div ref={menuRef} className="fixed top-0 left-0 right-0 z-50 bg-white shadow-pink border-b border-pink">
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
