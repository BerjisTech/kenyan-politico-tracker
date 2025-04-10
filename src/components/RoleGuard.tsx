
import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

interface RoleGuardProps {
  allowedRoles: ('superadmin' | 'admin' | 'staff' | 'user')[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleGuard = ({ allowedRoles, children, fallback }: RoleGuardProps) => {
  const { userRole, isAuthenticated, isLoading } = useAuth();

  // While loading, show nothing (or could add a loading spinner here)
  if (isLoading) {
    return null;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If user has required role, render children
  if (userRole && allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

  // If fallback is provided, render it instead
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default: redirect to home page
  return <Navigate to="/" replace />;
};
