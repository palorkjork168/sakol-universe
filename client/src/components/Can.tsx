import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";

interface CanProps {
  permission?: string;
  role?: string;
  companyId?: string;
  companyRole?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Reusable declarative authorization wrapper for UI visibility.
 * Backend security must still be enforced separately.
 */
export default function Can({
  permission,
  role,
  companyId,
  companyRole,
  children,
  fallback = null,
}: CanProps) {
  const { isAdmin, hasPermission, hasRole, hasCompanyRole } = useAuth();

  if (isAdmin) {
    return <>{children}</>;
  }

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (companyId && companyRole && !hasCompanyRole(companyId, companyRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
