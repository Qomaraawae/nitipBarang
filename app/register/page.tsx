"use client";
import { useState } from "react";
import { register } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { ModeToggle } from "@/components/mode-toggle";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password tidak cocok!");
      toast.error("Password tidak cocok!");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter!");
      toast.error("Password minimal 6 karakter!");
      return;
    }

    setLoading(true);
    try {
      // Selalu register sebagai user
      const userData = await register(email, password, "user");

      // Success toast with custom styling
      toast.success("Akun berhasil dibuat!", {
        duration: 4000,
        icon: "👤",
        style: {
          borderRadius: "10px",
          background: "#10B981",
          color: "#fff",
        },
      });

      // Redirect after short delay
      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (err: any) {
      console.error("Register error:", err);

      let errorMessage = "Registrasi gagal. Coba lagi.";

      if (err.code === "auth/email-already-in-use") {
        errorMessage = "Email sudah terdaftar!";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password terlalu lemah!";
      } else if (err.code === "permission-denied") {
        errorMessage = "Gagal menyimpan data. Periksa Firebase Security Rules.";
      }

      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          borderRadius: "10px",
          background: "#EF4444",
          color: "#fff",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Default options
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          // Success
          success: {
            duration: 3000,
            style: {
              background: "#10B981",
            },
          },
          // Error
          error: {
            duration: 4000,
            style: {
              background: "#EF4444",
            },
          },
        }}
      />

      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="w-full max-w-md px-6">
          {/* Header with Mode Toggle */}
          <div className="flex justify-end mb-4">
            <ModeToggle />
          </div>

          <div className="bg-card rounded-2xl shadow-2xl p-8 space-y-8 transform transition-all hover:scale-[1.01] border border-border">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Daftar Akun Baru
              </h1>
              <p className="text-sm text-muted-foreground">
                Buat akun untuk menggunakan sistem penitipan barang
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start space-x-2">
                <svg
                  className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full pl-10 pr-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-foreground"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  "DAFTAR AKUN"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="pt-4 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Login di sini
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            © 2024 Penitipan Barang. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}
