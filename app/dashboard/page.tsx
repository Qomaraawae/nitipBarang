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
import { Progress } from "@/components/ui/progress";
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
  LogOut,
  LogIn,
  Home,
  Plus,
  Search,
  History,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Wrench,
} from "lucide-react";
import { logger, maskEmail, maskUid } from "@/lib/logger";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import AdminSlotManager from "@/components/AdminSlotManager";
import { useSlotConditions } from "@/hooks/useSlotConditions";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, role, loading: authLoading } = useAuth();
  const { barang, loading: dataLoading } = useBarangRealTime();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSlotManager, setShowSlotManager] = useState(false);
  const router = useRouter();

  // Redirect jika tidak login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // ambil data kondisi slot untuk statistik publik
  const { rusakSlots, maintenanceSlots } = useSlotConditions();

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
      router.push("/");
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
  const userBarang = barang.filter((b: Barang) =>
    user?.uid ? b.user_id === user.uid : false,
  );

  const totalSlots = 50;
  const occupiedSlots = barang.length;

  const rusakSlotNumbers = rusakSlots || [];
  const maintenanceSlotNumbers = maintenanceSlots || [];
  const problemSlotNumbers = new Set([
    ...rusakSlotNumbers,
    ...maintenanceSlotNumbers,
  ]);

  const availableSlots = totalSlots - occupiedSlots - problemSlotNumbers.size;
  const slotUsagePercentage = Math.min(
    Math.round((occupiedSlots / totalSlots) * 100),
    100,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin Slot Manager Dialog */}
      <Dialog open={showSlotManager} onOpenChange={setShowSlotManager}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            <div
              className="absolute inset-0 bg-linear-to-br from-blue-600"
              style={{
                filter: "blur(40px)",
                transform: "scale(1.2)",
                opacity: 0.6,
              }}
            />
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/70 backdrop-blur-sm" />
          </div>

          <div className="relative z-10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                Kelola Kondisi Slot Loker
              </DialogTitle>
              <DialogDescription>
                Tandai slot yang rusak atau sedang maintenance agar tidak bisa
                dipilih pengguna.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2">
              <AdminSlotManager />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== HEADER ==================== */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
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
            </Link>

            <div className="flex items-center gap-3">
              <ModeToggle />
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ""} />
                    <AvatarFallback className="bg-linear-to-br from-blue-100 to-indigo-100">
                      <User className="h-4 w-4 text-blue-600" />
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3 w-3" />
                </Button>

                {showProfileDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileDropdown(false)}
                    />
                    <div className="absolute right-0 top-12 w-64 z-50">
                      <div className="bg-linear-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl shadow-black/10 dark:shadow-black/20 animate-in slide-in-from-top-2">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-900 shadow-sm">
                              <AvatarImage src={user.photoURL || ""} />
                              <AvatarFallback className="bg-linear-to-br from-blue-500 to-indigo-600 text-white">
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
                                      ? "bg-linear-to-r from-blue-500 to-indigo-600 text-white border-0"
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
            </div>
          </div>
        </div>
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="container mx-auto px-4 lg:px-6 py-6">
        {/* Welcome Section */}
        <Card className="mb-6 border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-foreground">
                  Hai {getUserName()}, selamat datang! 👋
                </h2>
                <p className="text-muted-foreground">
                  {isAdmin
                    ? "Kelola semua penitipan barang di sistem ini."
                    : "Anda bisa menitipkan barang dengan menekan tombol 'Titip Barang' di bawah ini."}
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
                {(rusakSlotNumbers.length > 0 ||
                  maintenanceSlotNumbers.length > 0) && (
                  <div className="mt-2 space-y-1">
                    {rusakSlotNumbers.length > 0 && (
                      <Badge variant="destructive" className="text-xs gap-1">
                        {rusakSlotNumbers.length} slot rusak
                      </Badge>
                    )}
                    {maintenanceSlotNumbers.length > 0 && (
                      <Badge className="text-xs gap-1 bg-amber-500">
                        {maintenanceSlotNumbers.length} maintenance
                      </Badge>
                    )}
                  </div>
                )}
                {availableSlots <= 10 &&
                  rusakSlotNumbers.length === 0 &&
                  maintenanceSlotNumbers.length === 0 && (
                    <Badge variant="outline" className="mt-2">
                      ⚠️ Kapasitas hampir penuh
                    </Badge>
                  )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons untuk Admin */}
        {isAdmin && (
          <div className="mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

              <Button
                variant="outline"
                className="w-full h-auto py-6 flex-col gap-3 border-orange-200 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 relative"
                onClick={() => setShowSlotManager(true)}
              >
                {rusakSlotNumbers.length + maintenanceSlotNumbers.length >
                  0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {rusakSlotNumbers.length + maintenanceSlotNumbers.length}
                  </span>
                )}
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <Wrench className="h-8 w-8 text-orange-600" />
                </div>
                <span className="font-bold text-lg">Kelola Slot</span>
                <span className="text-sm text-muted-foreground">
                  Rusak / Maintenance
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons untuk User */}
        {!isAdmin && (
          <div className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  ? `${barang.length} item${barang.length !== 1 ? "s" : ""} ditemukan`
                  : `${userBarang.length} barang Anda`}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (isAdmin ? barang : userBarang).length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isAdmin ? "Belum ada barang dititipkan" : "Belum ada barang"}
                </h3>
                <p className="text-muted-foreground">
                  {isAdmin
                    ? "Tunggu hingga ada pengguna yang menitipkan barang."
                    : "Mulai titipkan barang Anda sekarang!"}
                </p>
                {!isAdmin && (
                  <Link href="/titip">
                    <Button className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Titip Barang
                    </Button>
                  </Link>
                )}
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
                            <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">
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
                          <div className="flex items-center gap-2 ml-4 shrink-0">
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
      </div>
    </div>
  );
}
