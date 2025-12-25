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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { logger, maskEmail, maskUid } from "@/lib/logger";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, role, userData, loading: authLoading } = useAuth();
  const { barang, loading: dataLoading } = useBarangRealTime();

  // LOG USER LOGIN SECURELY
  useEffect(() => {
    if (user && !authLoading) {
      // Gunakan logger.auth.login yang sudah aman
      logger.auth.login(user.email || "", role || "user");

      // Untuk debugging terbatas, gunakan logger.log dengan data yang dimask
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

  // Get user name from email (before @)
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

  // Calculate stats
  const totalSlots = 50;
  const occupiedSlots = barang.length;
  const availableSlots = totalSlots - occupiedSlots;
  const slotUsagePercentage = Math.round((occupiedSlots / totalSlots) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Nitip Barang</h1>
                <p className="text-xs text-muted-foreground">
                  Sistem Penitipan Barang
                </p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              <ModeToggle />

              {/* User Info (Desktop) */}
              <div className="hidden md:flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || ""} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-medium truncate max-w-[180px]">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isAdmin ? "destructive" : "outline"}
                      className="text-xs"
                    >
                      {isAdmin ? "Admin" : "User"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* User Info (Mobile) */}
          <div className="md:hidden mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL || ""} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <Badge
                    variant={isAdmin ? "destructive" : "outline"}
                    className="text-xs"
                  >
                    {isAdmin ? "Admin" : "User"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        {!isAdmin && (
          <Card className="mb-6 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  Hai {getUserName()}, selamat datang! 👋
                </h2>
                <p className="text-muted-foreground">
                  Anda bisa menitipkan barang dengan menekan tombol "Titip
                  Barang" di bawah ini.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {isAdmin ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Barang
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dataLoading ? "..." : barang.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Barang terdaftar
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Slot Terisi
                  </CardTitle>
                  <PackageCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{occupiedSlots}</div>
                  <Progress value={slotUsagePercentage} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Slot Kosong
                  </CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{availableSlots}</div>
                  <p className="text-xs text-muted-foreground">
                    Dari 50 slot total
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="md:col-span-3">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">
                    Mulai Titip Barang Anda
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Klik tombol di bawah untuk menitipkan barang
                  </p>
                  <Link href="/titip">
                    <Button size="lg" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Titip Barang
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons - CENTERED dengan ukuran lebih lebar */}
        {isAdmin && (
          <div className="flex justify-center mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-5xl">
              <Link href="/titip" className="flex justify-center">
                <Button className="w-full h-auto py-8 flex-col gap-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[140px]">
                  <Plus className="h-10 w-10 mb-2" />
                  <span className="font-bold text-xl">Titip Barang</span>
                  <span className="text-sm opacity-90">Tambah barang baru</span>
                </Button>
              </Link>

              <Link href="/ambil" className="flex justify-center">
                <Button className="w-full h-auto py-8 flex-col gap-3 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[140px]">
                  <Search className="h-10 w-10 mb-2" />
                  <span className="font-bold text-xl">Ambil Barang</span>
                  <span className="text-sm opacity-90">Proses pengambilan</span>
                </Button>
              </Link>

              <Link href="/histori" className="flex justify-center">
                <Button className="w-full h-auto py-8 flex-col gap-3 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[140px]">
                  <History className="h-10 w-10 mb-2" />
                  <span className="font-bold text-xl">Histori</span>
                  <span className="text-sm opacity-90">Riwayat aktivitas</span>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Barang List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isAdmin ? "Semua Barang Dititipkan" : "Barang Saya"}
            </CardTitle>
            <CardDescription>
              {isAdmin
                ? `${barang.length} items`
                : `${userBarang.length} items`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsContent value="all" className="mt-4">
                {dataLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(isAdmin ? barang : userBarang).map((b: Barang) => (
                      <Card key={b.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                                {b.slot}
                              </div>
                              <div>
                                <p className="font-medium">{b.nama_pemilik}</p>
                                <p className="text-sm text-muted-foreground">
                                  Kode: {b.kode_ambil}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  b.status === "dititipkan"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {b.status === "dititipkan"
                                  ? "Aktif"
                                  : "Diambil"}
                              </Badge>
                              <Link href={`/barang/${b.kode_ambil}`}>
                                <Button variant="ghost" size="sm">
                                  Detail
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="active">
                {dataLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(isAdmin ? barang : userBarang)
                      .filter((b: Barang) => b.status === "dititipkan")
                      .map((b: Barang) => (
                        <Card key={b.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                                  {b.slot}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {b.nama_pemilik}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Kode: {b.kode_ambil}
                                  </p>
                                </div>
                              </div>
                              <Link href={`/barang/${b.kode_ambil}`}>
                                <Button variant="ghost" size="sm">
                                  Detail
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
