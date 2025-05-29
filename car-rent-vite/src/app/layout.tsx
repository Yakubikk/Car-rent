import { RoleBasedMenu } from "@/components/navigation/RoleBasedMenu";
import { Toaster } from "react-hot-toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full">
      <Toaster />
      <RoleBasedMenu />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
