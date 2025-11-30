"use client";

import { useAppDispatch, useAppSelector } from "@/src/hooks/redux";
import { Role } from "@/src/types/auth.types";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { verifyAuth } from "../slices/auth.slice";

interface AuthProviderProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: Role[] | null;
  redirectTo?: string;
  loadingComponent?: ReactNode | null;
}

export default function AuthProvider({
  children,
  requireAuth = true,
  allowedRoles = null,
  redirectTo = "/auth",
  loadingComponent = null,
}: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { isAuthenticated, isLoading, user } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(verifyAuth());
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(`${redirectTo}`);
      } else if (
        allowedRoles &&
        user?.role &&
        !allowedRoles.includes(user.role)
      ) {
        router.replace("/unauthorized");
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    user?.role,
    allowedRoles,
    redirectTo,
    router,
  ]);

  if (!requireAuth) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <>
        {loadingComponent || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        )}
      </>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
