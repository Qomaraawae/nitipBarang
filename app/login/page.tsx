"use client";
import { useState, useEffect } from "react";
import { login } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Package,
  Target,
  ArrowLeft,
  ChevronRight,
  Mail,
  Lock,
  AlertCircle,
} from "lucide-react";
import { useBarangRealTime } from "@/hooks/useBarang";
import { useSlotConditions } from "@/hooks/useSlotConditions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Data real-time dari Firebase
  const { barang, loading: dataLoading } = useBarangRealTime();
  const { rusakSlots, maintenanceSlots } = useSlotConditions();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
      router.push("/dashboard");
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

  // Hitung statistik dari data real-time
  const totalSlots = 50;
  const occupiedSlots = barang?.length || 0;
  const rusakSlotNumbers = rusakSlots || [];
  const maintenanceSlotNumbers = maintenanceSlots || [];
  const problemSlotNumbers = new Set([
    ...rusakSlotNumbers,
    ...maintenanceSlotNumbers,
  ]);
  const availableSlots = totalSlots - occupiedSlots - problemSlotNumbers.size;

  // Tentukan status sistem
  const getSystemStatus = () => {
    if (problemSlotNumbers.size > 0) {
      return "⚠️ Maintenance";
    }
    if (availableSlots <= 5) {
      return "🟡 Hampir Penuh";
    }
    return "✅ Aktif";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300 py-8">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header dengan Logo dan Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg transition-colors duration-300">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg transition-colors duration-300">
              NitipBarang
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>

        {/* Main Card - Grid Layout 3:2 */}
        <div className="grid lg:grid-cols-5 gap-0 rounded-2xl overflow-hidden shadow-2xl">
          {/* Left Side - Info Panel (3 kolom) */}
          <div
            className="lg:col-span-3 p-8 md:p-10 text-white flex flex-col justify-between"
            style={{ backgroundColor: "#4F46E5" }}
          >
            <div>
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 bg-white/20 rounded-lg shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                    Sistem Penitipan Barang yang Aman & Terpercaya
                  </h1>
                  <p className="text-blue-100 mt-2 text-sm md:text-base leading-relaxed">
                    Titipkan barang Anda dengan aman menggunakan sistem{" "}
                    <span className="font-semibold text-white">real-time</span>{" "}
                    dan dapatkan notifikasi status penitipan secara langsung.
                  </p>
                </div>
              </div>

              <div className="border-t border-white/20 my-6"></div>

              <div>
                <h3 className="text-sm font-semibold text-blue-200 uppercase tracking-wider mb-4">
                  Status Loker
                </h3>
                {dataLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white"></div>
                    <span className="ml-3 text-blue-200 text-sm">
                      Memuat data...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Slot Kosong */}
                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                          ✓
                        </span>
                        <span className="font-medium text-white">
                          Slot Kosong
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-blue-200">
                        {availableSlots} Tersedia
                      </span>
                    </div>

                    {/* Slot Terisi */}
                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-orange-400 flex items-center justify-center text-xs font-bold text-white">
                          📦
                        </span>
                        <span className="font-medium text-white">
                          Slot Terisi
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-blue-200">
                        {occupiedSlots} Digunakan
                      </span>
                    </div>

                    {/* Slot Rusak */}
                    {rusakSlotNumbers.length > 0 && (
                      <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white">
                            ✕
                          </span>
                          <span className="font-medium text-white">
                            Slot Rusak
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-red-200">
                          {rusakSlotNumbers.length} Slot
                        </span>
                      </div>
                    )}

                    {/* Slot Maintenance */}
                    {maintenanceSlotNumbers.length > 0 && (
                      <div className="flex items-center justify-between p-3 bg-amber-500/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-white">
                            🔧
                          </span>
                          <span className="font-medium text-white">
                            Maintenance
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-amber-200">
                          {maintenanceSlotNumbers.length} Slot
                        </span>
                      </div>
                    )}

                    {/* Status Sistem */}
                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold text-white">
                          ℹ️
                        </span>
                        <span className="font-medium text-white">
                          Status Sistem
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-emerald-300">
                        {getSystemStatus()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-blue-200 text-xs">
                © 2024 NitipBarang • Sistem Penitipan Real-Time
              </p>
            </div>
          </div>

          {/* Right Side - Login Form (2 kolom) */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 md:p-10 flex flex-col justify-center transition-colors duration-300">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Selamat Datang
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                Masuk untuk melanjutkan ke dashboard
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2 transition-colors duration-300">
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <span className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-11"
                    placeholder="contoh@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-11"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-300"
                >
                  Lupa password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2.5 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-11"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700 transition-colors duration-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  atau lanjut dengan
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium h-11"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Masuk dengan Google
            </Button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 transition-colors duration-300">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-300"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
