"use client";
import { useAuth } from "@/context/AuthContext";
import { useBarangRealTime } from "@/hooks/useBarang";
import Link from "next/link";
import { login, logout } from "@/lib/firebase/auth";
import { Barang } from "@/types/barang";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Package,
  PackageCheck,
  User,
  Clock,
  LogOut,
  LogIn,
  Home,
  Plus,
  Search,
  History,
  Shield,
  Calendar,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Mail,
  Lock,
  AlertCircle,
} from "lucide-react";
import { logger, maskEmail, maskUid } from "@/lib/logger";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const {
    user,
    role,
    userData,
    loading: authLoading,
    showLoginModal,
    setShowLoginModal,
  } = useAuth();
  const { barang, loading: dataLoading } = useBarangRealTime();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // State untuk login modal
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // LOG USER LOGIN SECURELY
  useEffect(() => {
    if (user && !authLoading) {
      logger.auth.login(user.email || "", role || "user");

      if (
        process.env.NODE_ENV === "development" &&
        process.env.NEXT_PUBLIC_DEBUG_USER === "true"
      ) {
        logger.log("User logged in details", {
          uid: maskUid(user.uid),
          email: maskEmail(user.email),
          role: role,
          hasEmailVerified: user.emailVerified || false,
        });
      }
    }
  }, [user, authLoading, role]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      // Login dan dapatkan user data dengan role
      const userData = await login(loginEmail, loginPassword);

      logger.auth.login(userData.email || "", userData.role);

      toast.success("Login berhasil!", {
        description: `Selamat datang ${userData.email}`,
      });

      // Reset form dan tutup modal
      setLoginEmail("");
      setLoginPassword("");
      setShowLoginModal(false);
    } catch (err: any) {
      logger.error("Login failed", {
        errorCode: err.code,
        errorMessage: err.message,
        email: loginEmail,
      });

      // Handle specific error codes
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setLoginError("Email atau password salah!");
        toast.error("Email atau password salah!");
      } else if (err.code === "auth/invalid-email") {
        setLoginError("Format email tidak valid!");
        toast.error("Format email tidak valid!");
      } else if (err.message === "User data not found in database") {
        setLoginError("Data user tidak ditemukan. Silakan hubungi admin.");
        toast.error("Data user tidak ditemukan");
      } else {
        setLoginError("Login gagal. Coba lagi.");
        toast.error("Login gagal");
      }

      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileDropdown(false);
    } catch (error) {
      logger.error("Logout error:", error);
    }
  };

  const getUserName = (): string => {
    if (!user?.email) return "User";
    return user.email.split("@")[0];
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  const isAdmin = role === "admin";
  const userBarang = barang.filter((b: Barang) => b.user_id === user?.uid);

  const totalSlots = 50;
  const occupiedSlots = barang.length;
  const availableSlots = totalSlots - occupiedSlots;
  const slotUsagePercentage = Math.round((occupiedSlots / totalSlots) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent
          className="
          w-[90vw] max-w-lg 
          sm:w-[85vw] sm:max-w-md
          md:w-[80vw] md:max-w-lg
          lg:max-w-xl
          xl:max-w-2xl
          2xl:max-w-3xl
          bg-white/40 dark:bg-gray-900/40 
          backdrop-blur-xl 
          border border-white/40 dark:border-white/30 
          shadow-2xl
          p-4 sm:p-6 md:p-8
        "
        >
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-900/20 dark:via-transparent dark:to-purple-900/20 rounded-lg -z-10" />

          <DialogHeader className="px-2 sm:px-4">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full blur-xl opacity-70"></div>
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
                  <LogIn className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
              </div>
            </div>
            <DialogTitle
              className="
              text-xl sm:text-2xl md:text-3xl 
              text-center 
              text-gray-900 dark:text-gray-50 
              font-bold
              mb-2
            "
            >
              Login ke Sistem
            </DialogTitle>
            <DialogDescription
              className="
              text-sm sm:text-base md:text-lg 
              text-center 
              text-gray-700 dark:text-gray-300
              px-2 sm:px-4
            "
            >
              Masukkan email dan password Anda untuk mengakses sistem
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleLogin}
            className="space-y-6 sm:space-y-8 px-2 sm:px-4"
          >
            {loginError && (
              <div
                className="
                bg-red-500/20 backdrop-blur-md 
                border border-red-500/40 
                rounded-xl 
                p-4 sm:p-5
              "
              >
                <div className="flex items-center gap-3 text-red-800 dark:text-red-300">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">
                    {loginError}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-400" />
                <Label
                  htmlFor="modal-email"
                  className="
                  text-gray-800 dark:text-gray-200 
                  font-medium
                  text-base sm:text-lg
                "
                >
                  Email
                </Label>
              </div>
              <Input
                id="modal-email"
                type="email"
                placeholder="contoh: admin@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                autoComplete="email"
                className="
                  bg-white/70 dark:bg-gray-800/70 
                  border-gray-400/50 dark:border-gray-600/60 
                  backdrop-blur-lg 
                  focus:ring-2 focus:ring-blue-500/60 
                  focus:border-blue-500/60 
                  transition-all duration-200
                  h-12 sm:h-14
                  text-base sm:text-lg
                  placeholder:text-gray-500/70 dark:placeholder:text-gray-400/70
                  text-gray-900 dark:text-gray-100
                  px-4
                  rounded-xl
                  shadow-sm
                "
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-400" />
                <Label
                  htmlFor="modal-password"
                  className="
                  text-gray-800 dark:text-gray-200 
                  font-medium
                  text-base sm:text-lg
                "
                >
                  Password
                </Label>
              </div>
              <Input
                id="modal-password"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="
                  bg-white/70 dark:bg-gray-800/70 
                  border-gray-400/50 dark:border-gray-600/60 
                  backdrop-blur-lg 
                  focus:ring-2 focus:ring-blue-500/60 
                  focus:border-blue-500/60 
                  transition-all duration-200
                  h-12 sm:h-14
                  text-base sm:text-lg
                  placeholder:text-gray-500/70 dark:placeholder:text-gray-400/70
                  text-gray-900 dark:text-gray-100
                  px-4
                  rounded-xl
                  shadow-sm
                "
              />
            </div>

            <Button
              type="submit"
              className="
                w-full 
                bg-gradient-to-r from-blue-600 to-indigo-600 
                hover:from-blue-700 hover:to-indigo-700 
                active:from-blue-800 active:to-indigo-800
                text-white 
                shadow-xl 
                backdrop-blur-sm 
                border-0 
                hover:shadow-2xl 
                transition-all duration-300 
                font-bold
                text-base sm:text-lg
                h-14 sm:h-16
                rounded-xl
                mt-2
              "
              disabled={loginLoading}
            >
              {loginLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                  <span className="text-base sm:text-lg">
                    Sedang memproses...
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <LogIn className="h-6 w-6 sm:h-7 sm:w-7" />
                  <span className="text-base sm:text-lg">MASUK KE SISTEM</span>
                </div>
              )}
            </Button>
          </form>

          {/* Footer link */}
          <div
            className="
            pt-6 sm:pt-8 
            border-t border-gray-300/50 dark:border-gray-700/50 
            text-center
            mt-4 sm:mt-6
            px-2 sm:px-4
          "
          >
            <p
              className="
              text-sm sm:text-base md:text-lg
              text-gray-700 dark:text-gray-300
            "
            >
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="
                  text-blue-600 dark:text-blue-400 
                  hover:text-blue-700 dark:hover:text-blue-300 
                  font-semibold 
                  underline-offset-4 
                  hover:underline 
                  transition-colors
                  text-base sm:text-lg
                "
                onClick={() => setShowLoginModal(false)}
              >
                Daftar akun baru
              </Link>
            </p>
            <p
              className="
              text-xs sm:text-sm 
              text-gray-600 dark:text-gray-400 
              mt-3
            "
            >
              Lupa password? Hubungi administrator sistem
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== HEADER ==================== */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  NitipBarang
                </h1>
                <p className="text-xs text-muted-foreground">
                  Sistem Penitipan
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <ModeToggle />

              {/* Account Button - Tampilkan berbeda berdasarkan status login */}
              {user ? (
                // Jika sudah login: Tampilkan profile dropdown
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100">
                        <User className="h-4 w-4 text-blue-600" />
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-3 w-3" />
                  </Button>

                  {/* Dropdown Menu */}
                  {showProfileDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowProfileDropdown(false)}
                      />
                      <div className="absolute right-0 top-12 w-64 z-50">
                        <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl shadow-black/10 dark:shadow-black/20 animate-in slide-in-from-top-2">
                          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-900 shadow-sm">
                                <AvatarImage src={user.photoURL || ""} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                  <User className="h-6 w-6" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">
                                  {user.email}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant={isAdmin ? "default" : "secondary"}
                                    className={`text-xs font-medium ${
                                      isAdmin
                                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-0"
                                    }`}
                                  >
                                    {isAdmin ? "Admin" : "User"}
                                  </Badge>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {getUserName()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-2">
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-3 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                              onClick={handleLogout}
                            >
                              <LogOut className="h-4 w-4" />
                              <span className="font-medium">Keluar</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                // Jika belum login: Tampilkan login button
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
                  onClick={() => setShowLoginModal(true)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100">
                      <LogIn className="h-4 w-4 text-blue-600" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">Login</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="container mx-auto px-4 lg:px-6 py-6">
        {user ? (
          // KONTEN UNTUK USER YANG SUDAH LOGIN
          <>
            {/* Welcome Section */}
            {!isAdmin && (
              <Card className="mb-6 border shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2 text-foreground">
                        Hai {getUserName()}, selamat datang! 👋
                      </h2>
                      <p className="text-muted-foreground">
                        Anda bisa menitipkan barang dengan menekan tombol "Titip
                        Barang" di bawah ini.
                      </p>
                    </div>
                    <Link href="/titip">
                      <Button size="lg" className="gap-2">
                        <Plus className="h-5 w-5" />
                        Titip Barang
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Grid untuk admin */}
            {isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">
                      Total Barang
                    </CardTitle>
                    <div className="p-2 bg-muted rounded-lg">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {dataLoading ? "..." : barang.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Barang terdaftar
                    </p>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">
                      Slot Terisi
                    </CardTitle>
                    <div className="p-2 bg-muted rounded-lg">
                      <PackageCheck className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {occupiedSlots}
                    </div>
                    <div className="mt-3 space-y-2">
                      <Progress value={slotUsagePercentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Kapasitas</span>
                        <span>{slotUsagePercentage}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">
                      Slot Kosong
                    </CardTitle>
                    <div className="p-2 bg-muted rounded-lg">
                      <Home className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {availableSlots}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dari {totalSlots} slot total
                    </p>
                    {availableSlots <= 10 && (
                      <Badge variant="outline" className="mt-2">
                        ⚠️ Kapasitas hampir penuh
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Action Buttons for Admin */}
            {isAdmin && (
              <div className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link href="/titip">
                    <Button
                      variant="outline"
                      className="w-full h-auto py-6 flex-col gap-3"
                    >
                      <div className="p-3 bg-muted rounded-full">
                        <Plus className="h-8 w-8" />
                      </div>
                      <span className="font-bold text-lg">Titip Barang</span>
                      <span className="text-sm text-muted-foreground">
                        Tambah barang baru
                      </span>
                    </Button>
                  </Link>

                  <Link href="/ambil">
                    <Button
                      variant="outline"
                      className="w-full h-auto py-6 flex-col gap-3"
                    >
                      <div className="p-3 bg-muted rounded-full">
                        <Search className="h-8 w-8" />
                      </div>
                      <span className="font-bold text-lg">Ambil Barang</span>
                      <span className="text-sm text-muted-foreground">
                        Proses pengambilan
                      </span>
                    </Button>
                  </Link>

                  <Link href="/histori">
                    <Button
                      variant="outline"
                      className="w-full h-auto py-6 flex-col gap-3"
                    >
                      <div className="p-3 bg-muted rounded-full">
                        <History className="h-8 w-8" />
                      </div>
                      <span className="font-bold text-lg">Histori</span>
                      <span className="text-sm text-muted-foreground">
                        Riwayat aktivitas
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Barang List */}
            <Card className="border">
              <CardHeader>
                <div>
                  <CardTitle className="text-foreground">
                    {isAdmin ? "Semua Barang Dititipkan" : "Barang Saya"}
                  </CardTitle>
                  <CardDescription>
                    {isAdmin
                      ? `${barang.length} item${
                          barang.length !== 1 ? "s" : ""
                        } ditemukan`
                      : `${userBarang.length} barang Anda`}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(isAdmin ? barang : userBarang).map((b: Barang) => (
                      <Link
                        key={b.id}
                        href={`/barang/${b.kode_ambil}`}
                        className="block"
                      >
                        <Card className="border hover:bg-muted/50 transition-colors hover:shadow-md cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4 flex-1 min-w-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                  {b.slot}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground text-base mb-1 truncate">
                                    {b.nama_pemilik}
                                  </p>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-muted-foreground">
                                        Kode:
                                      </span>
                                      <span className="text-xs font-mono font-bold bg-muted px-1.5 py-0.5 rounded">
                                        {b.kode_ambil}
                                      </span>
                                    </div>
                                    <div className="hidden sm:block text-xs text-muted-foreground">
                                      •
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-muted-foreground">
                                        Slot:
                                      </span>
                                      <span className="text-xs font-medium">
                                        {b.slot}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                                <Badge
                                  variant={
                                    b.status === "dititipkan"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="gap-1 whitespace-nowrap"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {b.status === "dititipkan" ? (
                                    <>
                                      <CheckCircle2 className="h-3 w-3" />
                                      Aktif
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-3 w-3" />
                                      Diambil
                                    </>
                                  )}
                                </Badge>
                                <div
                                  className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          // KONTEN UNTUK USER YANG BELUM LOGIN (PUBLIC VIEW)
          <>
            {/* Hero Section untuk guest */}
            <div className="text-center py-12">
              <div className="mx-auto max-w-2xl">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Package className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
                  Sistem Penitipan Barang yang Aman
                </h1>
                <p className="text-lg text-muted-foreground mb-10">
                  Titipkan barang Anda dengan aman dan terpercaya. Sistem kami
                  memastikan setiap barang terjamin keamanannya.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={() => setShowLoginModal(true)}
                  >
                    <LogIn className="h-5 w-5" />
                    Login untuk Memulai
                  </Button>
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="gap-2">
                      <User className="h-5 w-5" />
                      Daftar Akun
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="border">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Aman & Terpercaya</h3>
                  <p className="text-muted-foreground">
                    Sistem keamanan berlapis untuk memastikan barang Anda selalu
                    aman.
                  </p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">24/7 Akses</h3>
                  <p className="text-muted-foreground">
                    Pantau status penitipan kapan saja melalui dashboard online.
                  </p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                    <PackageCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">
                    Pelacakan Real-time
                  </h3>
                  <p className="text-muted-foreground">
                    Lacak status barang Anda secara real-time dengan kode unik.
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
