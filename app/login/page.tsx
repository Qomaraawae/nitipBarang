"use client";
import { useState } from "react";
import { login } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { LogIn, Mail, Lock, AlertCircle, Shield } from "lucide-react";
import { logger } from "@/lib/logger"; // TAMBAHKAN IMPORT

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Login dan dapatkan user data dengan role
      const userData = await login(email, password);

      // GANTI console.log DENGAN LOGGER
      logger.auth.login(userData.email || "", userData.role);

      toast.success("Login berhasil!", {
        description: `Selamat datang ${userData.email}`,
      });

      // Redirect ke dashboard
      router.push("/");
    } catch (err: any) {
      // GANTI console.error DENGAN LOGGER
      logger.error("Login failed", {
        errorCode: err.code,
        errorMessage: err.message,
        email: email, // Email tidak dimask karena sudah di logger
      });

      // Handle specific error codes
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Email atau password salah!");
        toast.error("Email atau password salah!");
      } else if (err.code === "auth/invalid-email") {
        setError("Format email tidak valid!");
        toast.error("Format email tidak valid!");
      } else if (err.message === "User data not found in database") {
        setError("Data user tidak ditemukan. Silakan hubungi admin.");
        toast.error("Data user tidak ditemukan");
      } else {
        setError("Login gagal. Coba lagi.");
        toast.error("Login gagal");
      }

      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Header with Mode Toggle */}
        <div className="flex justify-end">
          <ModeToggle />
        </div>

        <Card className="border shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <LogIn className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              Selamat Datang
            </CardTitle>
            <CardDescription className="text-center">
              Login ke Sistem Penitipan Barang
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  "MASUK"
                )}
              </Button>
            </form>

            <Separator />

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Daftar di sini
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Lupa password?
                </Link>
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-xs text-center text-muted-foreground">
              Gunakan email dan password yang sudah terdaftar untuk masuk ke
              sistem
            </p>
            <p className="text-xs text-center text-muted-foreground">
              © 2024 Penitipan Barang. All rights reserved.
            </p>
          </CardFooter>
        </Card>

        {/* Info Card */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
            💡 Sistem ini menggunakan autentikasi berbasis role (Admin/User)
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
