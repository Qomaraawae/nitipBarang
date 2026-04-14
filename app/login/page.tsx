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
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi client-side
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Email dan password wajib diisi!");
      toast.error("Email dan password wajib diisi!");
      return;
    }

    if (cleanPassword.length < 6) {
      setError("Password minimal 6 karakter!");
      toast.error("Password minimal 6 karakter!");
      return;
    }

    setLoading(true);

    try {
      const userData = await login(cleanEmail, cleanPassword);

      toast.success("Login berhasil!", {
        description: `Selamat datang ${userData.email}`,
      });

      router.push("/");
    } catch (err: any) {
      console.error("Login error:", err);

      let errorMessage = "Login gagal. Silakan coba lagi.";

      if (err.message && err.message.includes("Email atau password salah")) {
        errorMessage = err.message;
      } else if (err.code === "auth/user-not-found") {
        errorMessage = "Email tidak terdaftar. Silakan daftar terlebih dahulu.";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Password salah. Silakan coba lagi.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Format email tidak valid.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Terlalu banyak percobaan. Coba lagi nanti.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-end">
          <ModeToggle />
        </div>

        <Card className="border shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
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
                <AlertDescription className="font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contoh@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-12 text-base"
                />
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
                  className="h-12 text-base"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    MASUK KE SISTEM
                  </>
                )}
              </Button>
            </form>

            <Separator />

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline"
                >
                  Daftar di sini
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                Lupa password? Hubungi administrator sistem
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-xs text-center text-muted-foreground space-y-1">
              <p>Gunakan email dan password yang sudah terdaftar</p>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              © 2024 Penitipan Barang. All rights reserved.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
