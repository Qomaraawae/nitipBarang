"use client";
import { useAuth } from "@/context/AuthContext";
import { useHistoriBarang } from "@/hooks/useHistoriBarang";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";

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
      color:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
      activeColor: "bg-purple-600 text-white",
    },
    {
      id: "hari-ini" as PeriodFilter,
      label: "Hari Ini",
      color:
        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
      activeColor: "bg-green-600 text-white",
    },
    {
      id: "minggu-ini" as PeriodFilter,
      label: "Minggu Ini",
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      activeColor: "bg-blue-600 text-white",
    },
    {
      id: "bulan-ini" as PeriodFilter,
      label: "Bulan Ini",
      color:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
      activeColor: "bg-orange-600 text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground group transition-colors"
            >
              <svg
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium">Kembali ke Dashboard</span>
            </Link>
            <ModeToggle />
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Histori Aktivitas
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                Riwayat barang yang sudah diambil
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md border border-border hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  Total Histori
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  {dataLoading ? "..." : barang.length}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md border border-border hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  Hari Ini
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  {dataLoading ? "..." : hariIniCount}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md border border-border hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  Minggu Ini
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  {dataLoading ? "..." : mingguIniCount}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Filter Periode */}
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-md border border-border p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="mb-3 sm:mb-0">
              <h3 className="text-lg font-bold text-foreground mb-1">
                Filter Periode
              </h3>
              <p className="text-sm text-muted-foreground">
                Pilih rentang waktu histori
              </p>
            </div>

            {/* Minimal Tab Filter */}
            <div className="inline-flex bg-secondary rounded-lg p-1 w-fit">
              {periodButtons.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    selectedPeriod === period.id
                      ? `${period.activeColor} shadow-sm`
                      : `${period.color} hover:bg-card`
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Histori List */}
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-md border border-border overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-border bg-gradient-to-r from-secondary/50 to-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Daftar Riwayat
              </h2>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                {filteredBarang.length} Items
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {dataLoading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mb-3 sm:mb-4"></div>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Memuat histori...
                </p>
              </div>
            ) : filteredBarang.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-muted-foreground text-base sm:text-lg font-medium text-center">
                  {selectedPeriod === "semua"
                    ? "Belum ada histori"
                    : "Tidak ada data untuk periode ini"}
                </p>
                <p className="text-muted-foreground/70 text-xs sm:text-sm mt-1 text-center">
                  {selectedPeriod === "semua"
                    ? "Riwayat pengambilan barang akan muncul di sini"
                    : "Coba pilih periode lain untuk melihat data"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBarang.map((b) => (
                  <div
                    key={b.id}
                    className="group bg-gradient-to-r from-secondary/50 to-card hover:from-primary/5 hover:to-primary/10 border border-border hover:border-primary/50 rounded-xl p-4 sm:p-6 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Foto */}
                      <div className="flex-shrink-0">
                        {b.foto_url ? (
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 border-border">
                            <Image
                              src={b.foto_url}
                              alt="Foto barang"
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 80px, 96px"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-secondary rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                            <svg
                              className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Pemilik
                          </p>
                          <p className="text-base sm:text-lg font-bold text-foreground truncate">
                            {b.nama_pemilik}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Slot & Kode
                          </p>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md">
                              {b.slot}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              Kode:{" "}
                              <strong className="text-foreground font-mono">
                                {b.kode_ambil}
                              </strong>
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Waktu Masuk
                          </p>
                          <p className="text-sm font-medium text-foreground truncate">
                            {b.waktu_masuk?.toDate().toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }) || "-"}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Waktu Keluar
                          </p>
                          <p className="text-sm font-medium text-green-600 dark:text-green-400 truncate">
                            {b.waktu_keluar?.toDate().toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }) || "-"}
                          </p>
                        </div>

                        <div className="sm:col-span-2">
                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <div className="flex items-center space-x-2">
                              <svg
                                className="w-4 h-4 text-purple-600 dark:text-purple-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="text-xs text-muted-foreground">
                                Durasi
                              </span>
                            </div>
                            <span className="text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded">
                              {hitungDurasi(b.waktu_masuk, b.waktu_keluar)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
