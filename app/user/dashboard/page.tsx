"use client";
import { useAuth } from "@/context/AuthContext";
import { useBarangRealTime } from "@/hooks/useBarang";
import Link from "next/link";
import { logout } from "@/lib/firebase/auth";
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
import {
  Package,
  PackageCheck,
  User,
  Clock,
  LogOut,
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
} from "lucide-react";
import { logger, maskEmail, maskUid } from "@/lib/logger";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Dashboard() {
  const { user, role, userData, loading: authLoading } = useAuth();
  const { barang, loading: dataLoading } = useBarangRealTime();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

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

  const handleLogout = async () => {
    try {
      await logout();
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

  if (!user) {
    return null;
  }

  const isAdmin = role === "admin";
  const userBarang = barang.filter((b: Barang) => b.user_id === user.uid);

  const totalSlots = 50;
  const occupiedSlots = barang.length;
  const availableSlots = totalSlots - occupiedSlots;
  const slotUsagePercentage = Math.round((occupiedSlots / totalSlots) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground">
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

              {/* Profile Dropdown untuk desktop */}
              <div className="hidden md:block relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
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
                      {/* MODIFIED: Changed from bg-background/80 to bg-white for non-transparent */}
                      <div className="bg-white border border-border/50 rounded-lg shadow-xl shadow-black/10 animate-in slide-in-from-top-2">
                        <div className="p-4 border-b border-border/50">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 ring-2 ring-background/50">
                              <AvatarImage src={user.photoURL || ""} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20">
                                <User className="h-6 w-6 text-blue-500" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">
                                {user.email}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {/* MODIFIED: Changed badge background to solid */}
                                <Badge
                                  variant={isAdmin ? "default" : "secondary"}
                                  className="text-xs bg-blue-100 text-blue-800 border-none"
                                >
                                  {isAdmin ? "Admin" : "User"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {getUserName()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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

              {/* Profile Dropdown untuk mobile */}
              <div className="md:hidden relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100">
                      <User className="h-4 w-4 text-blue-600" />
                    </AvatarFallback>
                  </Avatar>
                </Button>

                {/* Dropdown Menu Mobile */}
                {showProfileDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileDropdown(false)}
                    />
                    <div className="absolute right-4 top-12 w-64 z-50">
                      {/* MODIFIED: Changed from bg-background/80 to bg-white for non-transparent */}
                      <div className="bg-white border border-border/50 rounded-lg shadow-xl shadow-black/10 animate-in slide-in-from-top-2">
                        <div className="p-4 border-b border-border/50">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 ring-2 ring-background/50">
                              <AvatarImage src={user.photoURL || ""} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20">
                                <User className="h-6 w-6 text-blue-500" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">
                                {user.email}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {/* MODIFIED: Changed badge background to solid */}
                                <Badge
                                  variant={isAdmin ? "default" : "secondary"}
                                  className="text-xs bg-blue-100 text-blue-800 border-none"
                                >
                                  {isAdmin ? "Admin" : "User"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {getUserName()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
            </div>
          </div>

          {/* Mobile Navigation - Hanya untuk admin */}
          {isAdmin && <div className="lg:hidden py-3 border-t"></div>}
        </div>
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="container mx-auto px-4 lg:px-6 py-6">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {isAdmin ? (
            <>
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
            </>
          ) : null}
        </div>

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
                              onClick={(e) => e.stopPropagation()} // Mencegah klik badge membuka link
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
                              onClick={(e) => e.stopPropagation()} // Mencegah klik icon membuka link
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
      </div>
    </div>
  );
}
