"use client";
import { useAuth, UserRole } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[]; // Jika tidak diisi, semua role bisa akses
  requireAuth?: boolean; // Default true
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Check if authentication is required
    if (requireAuth && !user) {
      router.replace("/login");
      return;
    }

    // Check if role is allowed
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      // Redirect to unauthorized page or dashboard
      alert("Anda tidak memiliki akses ke halaman ini!");
      router.replace("/");
      return;
    }
  }, [user, role, loading, allowedRoles, requireAuth, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !user) {
    return null;
  }

  // Check role access
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}