"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  LogIn,
  User,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();

  const stats = {
    totalSlots: 50,
    occupiedSlots: 15,
    availableSlots: 35,
    rusakSlots: 2,
    maintenanceSlots: 1,
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
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
            </div>

            <div className="flex items-center gap-3">
              <ModeToggle />
              {user ? (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login"></Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-6 py-12">
        {/* Hero Section */}
        <div className="text-center py-12 md:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Package className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              Sistem Penitipan Barang <br />
              <span className="text-blue-600 dark:text-blue-400">
                Aman & Terpercaya
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Titipkan barang Anda dengan aman dan terpercaya. Sistem kami
              memastikan setiap barang terjamin keamanannya dengan teknologi
              real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    <ArrowRight className="h-5 w-5" />
                    Buka Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button size="lg" className="gap-2">
                      <LogIn className="h-5 w-5" />
                      Login untuk Memulai
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="gap-2">
                      <User className="h-5 w-5" />
                      Daftar Akun
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* Slot Kosong */}
          <Card className="border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-linear-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-white" />
                </div>
                <Badge
                  variant="outline"
                  className="border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold text-sm px-3 py-1.5"
                >
                  {stats.availableSlots}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold mb-2 text-foreground">
                Slot Kosong
              </CardTitle>
              <CardDescription className="text-base mb-4 text-muted-foreground">
                Tersedia untuk penitipan barang baru.
              </CardDescription>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  <span className="text-muted-foreground">
                    {stats.availableSlots > 10
                      ? "Banyak tersedia"
                      : "Hampir penuh"}
                  </span>
                </div>
                <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-linear-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                    style={{
                      width: `${(stats.availableSlots / stats.totalSlots) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">
                    Kapasitas tersisa
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {((stats.availableSlots / stats.totalSlots) * 100).toFixed(
                      0,
                    )}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slot Perawatan */}
          <Card className="border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-linear-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                  <XCircle className="h-7 w-7 text-white" />
                </div>
                <Badge
                  variant="outline"
                  className="border-amber-500 text-amber-700 dark:text-amber-400 font-semibold text-sm px-3 py-1.5"
                >
                  {stats.rusakSlots + stats.maintenanceSlots}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold mb-2 text-foreground">
                Slot Perawatan
              </CardTitle>
              <CardDescription className="text-base mb-4 text-muted-foreground">
                Sedang dalam perbaikan atau maintenance.
              </CardDescription>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-foreground">
                      Berfungsi normal
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold text-sm px-3 py-1.5"
                  >
                    {stats.totalSlots -
                      stats.rusakSlots -
                      stats.maintenanceSlots}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-foreground">Rusak</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-red-300 text-red-700 dark:text-red-400"
                  >
                    {stats.rusakSlots}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-sm text-foreground">
                      Dalam perbaikan
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-amber-300 text-amber-700 dark:text-amber-400"
                  >
                    {stats.maintenanceSlots}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2024 NitipBarang. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
