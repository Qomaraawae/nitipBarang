"use client";
import { useState } from "react";
import { register } from "@/lib/firebase/auth";
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
import { UserPlus, Mail, Lock, AlertCircle } from "lucide-react";

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

      toast.success("Akun berhasil dibuat!", {
        description: "Silakan login dengan akun Anda",
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
      toast.error(errorMessage);
    } finally {
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
                <UserPlus className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              Daftar Akun Baru
            </CardTitle>
            <CardDescription className="text-center">
              Buat akun untuk menggunakan sistem penitipan barang
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Konfirmasi Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  "DAFTAR AKUN"
                )}
              </Button>
            </form>

            <Separator />

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Login di sini
                </Link>
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-xs text-center text-muted-foreground">
              Dengan mendaftar, Anda menyetujui syarat dan ketentuan kami.
            </p>
            <p className="text-xs text-center text-muted-foreground">
              © 2024 Penitipan Barang. All rights reserved.
            </p>
          </CardFooter>
        </Card>

        {/* Info Card */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
            💡 Akun yang dibuat otomatis akan menjadi pengguna biasa (User).
            Hubungi admin untuk mendapatkan akses admin.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
