export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex gap-2 items-center justify-center bg-pink-bg">
      <div>{children}</div>
    </div>
  );
}
