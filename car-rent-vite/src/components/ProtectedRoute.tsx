import { useAuthStore } from "@/stores/auth";
import { useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const navigate = useNavigate();
  const { user, isLoading, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!user && !isLoading) {
      fetchUser().catch(() => navigate("/login"));
    }
  }, [user, isLoading, fetchUser, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user ? children : null;
};
