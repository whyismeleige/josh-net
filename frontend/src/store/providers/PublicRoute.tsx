"use client"
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { verifyAuth } from "../slices/auth.slice";

export default function PublicRoute({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { isAuthenticated, isLoading, user } = useAppSelector(
    (state) => state.auth
  );
 
  useEffect(() => {
    dispatch(verifyAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
        router.replace(`${user.role}/dashboard`);
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
