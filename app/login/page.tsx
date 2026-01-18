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
import { logger } from "@/lib/logger";

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
    
    console.clear();
    console.log("🧪 === LOGIN PROCESS STARTED ===");
    console.log("📧 Email entered:", email);

    try {
      // Login dan dapatkan user data dengan role
      console.log("🔄 Calling login function...");
      const userData = await login(email, password);

      console.log("✅ Login function returned:", {
        uid: userData.uid.substring(0, 8) + '...',
        email: userData.email,
        role: userData.role
      });

      // Gunakan logger.auth yang aman
      logger.auth.login(userData.email || "", userData.role);

      toast.success("Login berhasil!", {
        description: `Selamat datang ${userData.email}`,
      });

      console.log("🎉 Login successful, redirecting to dashboard");
      
      // Redirect ke dashboard
      router.push("/");
    } catch (err: any) {
      console.error("❌ Login error details:");
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      console.error("Full error:", err);
      
      // GANTI console.error DENGAN LOGGER
      logger.error("Login failed", {
        errorCode: err.code,
        errorMessage: err.message,
        email: email,
      });

      // Handle specific error codes
      if (err.code === "auth/user-not-found") {
        console.log("📋 Diagnosis: User tidak ditemukan di Firebase Auth");
        setError("Email tidak terdaftar!");
        toast.error("Email tidak terdaftar!");
      } else if (err.code === "auth/wrong-password") {
        console.log("📋 Diagnosis: Password salah");
        setError("Password salah!");
        toast.error("Password salah!");
      } else if (err.code === "auth/invalid-credential") {
        console.log("📋 Diagnosis: Kredensial tidak valid");
        setError("Email atau password salah!");
        toast.error("Email atau password salah!");
      } else if (err.code === "auth/invalid-email") {
        console.log("📋 Diagnosis: Format email salah");
        setError("Format email tidak valid!");
        toast.error("Format email tidak valid!");
      } else if (err.code === "auth/too-many-requests") {
        console.log("📋 Diagnosis: Terlalu banyak percobaan login");
        setError("Terlalu banyak percobaan login. Coba lagi nanti.");
        toast.error("Terlalu banyak percobaan login");
      } else if (err.code === "auth/network-request-failed") {
        console.log("📋 Diagnosis: Masalah jaringan");
        setError("Gagal terhubung. Periksa koneksi internet Anda.");
        toast.error("Gagal terhubung ke server");
      } else if (err.message === "User data not found in database") {
        console.log("📋 Diagnosis: User document tidak ditemukan di Firestore");
        setError("Data user tidak ditemukan. Silakan hubungi admin.");
        toast.error("Data user tidak ditemukan");
      } else {
        console.log("📋 Diagnosis: Error tidak dikenal");
        setError(`Login gagal: ${err.message}`);
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
                <AlertDescription className="font-medium">
                  {error}
                </AlertDescription>
                <p className="text-xs mt-2">
                  Buka browser console (F12) untuk detail error
                </p>
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
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-12 text-base"
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
              <p>Untuk testing: buka console browser (F12) untuk debug</p>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              © 2024 Penitipan Barang. All rights reserved.
            </p>
          </CardFooter>
        </Card>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm text-blue-800">
              <div className="font-medium mb-1">Debug Mode:</div>
              <ol className="list-decimal pl-4 space-y-1 text-xs">
                <li>Buka Console (F12)</li>
                <li>Lihat log untuk detail error</li>
                <li>Cek error code & message</li>
                <li>Share error details jika perlu bantuan</li>
              </ol>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}