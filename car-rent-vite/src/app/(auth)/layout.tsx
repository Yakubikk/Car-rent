import { Link } from "react-router-dom";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex gap-2 items-center justify-center bg-pink-bg">
      <Link to="/" className="fixed flex top-4 left-4 text-pink-text hover:text-pink-primary transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Назад
      </Link>
      <div>{children}</div>
    </div>
  );
}
