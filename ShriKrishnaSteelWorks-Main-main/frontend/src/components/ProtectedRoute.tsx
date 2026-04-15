// src/components/ProtectedRoute.tsx
// Route guard for auth and admin-only pages
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  // While Firebase is resolving auth state, render nothing (avoid flash)
  if (loading) return null;

  // Not logged in at all → go to login
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Logged in but not admin, and page requires admin → kick to home
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
