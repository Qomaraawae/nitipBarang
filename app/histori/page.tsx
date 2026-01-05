"use client";
import { useAuth } from "@/context/AuthContext";
import { useHistoriBarang } from "@/hooks/useHistoriBarang";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  Package,
  User,
  Hash,
  CheckCircle,
} from "lucide-react";

type PeriodFilter = "semua" | "hari-ini" | "minggu-ini" | "bulan-ini";

export default function HistoriPage() {
  const { user, loading: authLoading } = useAuth();
  const { barang, loading: dataLoading } = useHistoriBarang();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("semua");

  // Show loading while checking auth
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

  if (!user) return null;

  const hitungDurasi = (masuk: any, keluar: any) => {
    if (!masuk || !keluar) return "-";

    try {
      const durasiMs = keluar.toMillis() - masuk.toMillis();
      const durasiJam = Math.floor(durasiMs / (1000 * 60 * 60));
      const durasiMenit = Math.floor(
        (durasiMs % (1000 * 60 * 60)) / (1000 * 60)
      );

      if (durasiJam > 0) {
        return `${durasiJam}j ${durasiMenit}m`;
      }
      return `${durasiMenit}m`;
    } catch (error) {
      return "-";
    }
  };

  // Filter barang berdasarkan periode
  const filterBarangByPeriod = () => {
    if (selectedPeriod === "semua") return barang;

    return barang.filter((b) => {
      if (!b.waktu_keluar) return false;

      const tanggalKeluar = b.waktu_keluar.toDate();
      const sekarang = new Date();

      switch (selectedPeriod) {
        case "hari-ini":
          return tanggalKeluar.toDateString() === sekarang.toDateString();

        case "minggu-ini":
          const mingguLalu = new Date();
          mingguLalu.setDate(mingguLalu.getDate() - 7);
          return tanggalKeluar >= mingguLalu;

        case "bulan-ini":
          return (
            tanggalKeluar.getMonth() === sekarang.getMonth() &&
            tanggalKeluar.getFullYear() === sekarang.getFullYear()
          );

        default:
          return true;
      }
    });
  };

  const filteredBarang = filterBarangByPeriod();

  // Hitung statistik
  const hariIniCount = barang.filter((b) => {
    if (!b.waktu_keluar) return false;
    const today = new Date().toDateString();
    return b.waktu_keluar.toDate().toDateString() === today;
  }).length;

  const mingguIniCount = barang.filter((b) => {
    if (!b.waktu_keluar) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return b.waktu_keluar.toDate() >= weekAgo;
  }).length;

  const periodButtons = [
    {
      id: "semua" as PeriodFilter,
      label: "Semua",
      color: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      id: "hari-ini" as PeriodFilter,
      label: "Hari Ini",
      color: "bg-green-100 dark:bg-green-900/30",
    },
    {
      id: "minggu-ini" as PeriodFilter,
      label: "Minggu Ini",
      color: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      id: "bulan-ini" as PeriodFilter,
      label: "Bulan Ini",
      color: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <Calendar className="h-4 w-4" />
                Kembali ke Dashboard
              </Button>
            </Link>
            <ModeToggle />
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Histori Aktivitas
              </h1>
              <p className="text-muted-foreground mt-1">
                Riwayat barang yang sudah diambil
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Histori
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dataLoading ? "..." : barang.length}
              </div>
              <p className="text-xs text-muted-foreground">Semua riwayat</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hari Ini</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {dataLoading ? "..." : hariIniCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Pengambilan hari ini
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Minggu Ini</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {dataLoading ? "..." : mingguIniCount}
              </div>
              <p className="text-xs text-muted-foreground">7 hari terakhir</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Periode */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Periode</CardTitle>
            <CardDescription>Pilih rentang waktu histori</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {periodButtons.map((period) => (
                <Button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  variant={selectedPeriod === period.id ? "default" : "outline"}
                  className={selectedPeriod === period.id ? "" : period.color}
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Histori List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daftar Riwayat</CardTitle>
                <CardDescription>
                  {filteredBarang.length} items ditemukan
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                {filteredBarang.length} Items
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Memuat histori...</p>
              </div>
            ) : filteredBarang.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {selectedPeriod === "semua"
                    ? "Belum ada histori"
                    : "Tidak ada data untuk periode ini"}
                </h3>
                <p className="text-muted-foreground text-sm text-center">
                  {selectedPeriod === "semua"
                    ? "Riwayat pengambilan barang akan muncul di sini"
                    : "Coba pilih periode lain untuk melihat data"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBarang.map((b) => (
                  <Card key={b.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Foto */}
                        <div className="flex-shrink-0">
                          {b.foto_url ? (
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                              <Image
                                src={b.foto_url}
                                alt="Foto barang"
                                fill
                                className="object-cover"
                                sizes="96px"
                              />
                            </div>
                          ) : (
                            <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border">
                              <Package className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Pemilik */}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">
                                  Pemilik
                                </span>
                              </div>
                              <p className="text-lg font-bold">
                                {b.nama_pemilik}
                              </p>
                            </div>

                            {/* Slot & Kode */}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">
                                  Slot & Kode
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-base">
                                  {b.slot || "S"}
                                </Badge>
                                <code className="text-sm font-mono bg-secondary px-2 py-1 rounded">
                                  {b.kode_ambil || "N/A"}
                                </code>
                              </div>
                            </div>

                            {/* Status */}
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">
                                Status
                              </div>
                              <Badge
                                variant={b.waktu_keluar ? "default" : "outline"}
                                className={
                                  b.waktu_keluar
                                    ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-300"
                                    : ""
                                }
                              >
                                {b.waktu_keluar ? (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Sudah Diambil
                                  </span>
                                ) : (
                                  "Masih Dititipkan"
                                )}
                              </Badge>
                            </div>

                            {/* Waktu */}
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">
                                Waktu
                              </div>
                              <p className="text-sm font-medium">
                                {b.waktu_keluar
                                  ?.toDate()
                                  .toLocaleString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }) ||
                                  b.waktu_masuk
                                    ?.toDate()
                                    .toLocaleString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }) ||
                                  "-"}
                              </p>
                            </div>
                          </div>

                          {/* Durasi */}
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-medium text-muted-foreground">
                                Durasi
                              </span>
                            </div>
                            <Badge variant="outline" className="font-medium">
                              {hitungDurasi(b.waktu_masuk, b.waktu_keluar)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>

          {filteredBarang.length > 0 && (
            <CardFooter className="border-t px-6 py-4">
              <p className="text-sm text-muted-foreground">
                Menampilkan {filteredBarang.length} dari {barang.length} riwayat
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
