export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex gap-2 items-center justify-center">
      <h2>Auth Section</h2>
      <div className="auth-content">{children}</div>
    </div>
  );
}
