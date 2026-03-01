"use client";

import { useAuth } from "@/context/AuthContext";
import { useHistoriBarang } from "@/hooks/useHistoriBarang";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  PackageCheck,
  User,
  Calendar,
  Hash,
  MapPin,
  Info,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function HistoriPage() {
  const { user, role } = useAuth();
  const { histori, loading } = useHistoriBarang();

  const [filteredHistori, setFilteredHistori] = useState<any[]>([]);
  const [filterJenis, setFilterJenis] = useState<string>("semua");
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("terbaru");

  // Apply filters
  useEffect(() => {
    let result = [...histori];

    // Filter by jenis
    if (filterJenis !== "semua") {
      result = result.filter((item) => item.jenis === filterJenis);
    }

    // Filter by status
    if (filterStatus !== "semua") {
      result = result.filter((item) => item.status === filterStatus);
    }

    // Search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.namaBarang?.toLowerCase().includes(query) ||
          item.namaPemilik?.toLowerCase().includes(query) ||
          item.kodeAmbil?.toLowerCase().includes(query) ||
          item.catatan?.toLowerCase().includes(query),
      );
    }

    // Sort
    if (sortBy === "terbaru") {
      result.sort((a, b) => b.tanggal?.seconds - a.tanggal?.seconds);
    } else if (sortBy === "terlama") {
      result.sort((a, b) => a.tanggal?.seconds - b.tanggal?.seconds);
    } else if (sortBy === "nama-az") {
      result.sort((a, b) =>
        (a.namaBarang || "").localeCompare(b.namaBarang || ""),
      );
    } else if (sortBy === "nama-za") {
      result.sort((a, b) =>
        (b.namaBarang || "").localeCompare(a.namaBarang || ""),
      );
    }

    setFilteredHistori(result);
  }, [histori, filterJenis, filterStatus, searchQuery, sortBy]);

  const handleRefresh = () => {
    // Force re-fetch by changing key or using refetch if available
    window.location.reload();
  };

  const handleExport = () => {
    // Simple export to CSV
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Tanggal,Jenis,Status,Nama Barang,Nama Pemilik,Kode Ambil,Slot,Catatan\n" +
      filteredHistori
        .map(
          (item) =>
            `${format(item.tanggal?.toDate(), "dd/MM/yyyy HH:mm", { locale: id })},` +
            `${item.jenis},` +
            `${item.status},` +
            `"${item.namaBarang}",` +
            `"${item.namaPemilik}",` +
            `${item.kodeAmbil},` +
            `${item.slot},` +
            `"${item.catatan || "-"}"`,
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `histori-transaksi-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "berhasil":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "gagal":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getJenisColor = (jenis: string) => {
    switch (jenis) {
      case "titip":
        return "bg-gradient-to-br from-blue-500 to-indigo-600";
      case "ambil":
        return "bg-gradient-to-br from-green-500 to-emerald-600";
      default:
        return "bg-gradient-to-br from-gray-500 to-gray-600";
    }
  };

  const getJenisLabel = (jenis: string) => {
    switch (jenis) {
      case "titip":
        return "Penitipan";
      case "ambil":
        return "Pengambilan";
      default:
        return jenis;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "berhasil":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300";
      case "gagal":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Back Button */}
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Histori</h1>
              <p className="text-muted-foreground">
                {role === "admin"
                  ? "Semua Histori Aktivitas"
                  : "Histori transaksi barang Anda"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Package className="h-3 w-3" />
                {histori.length} transaksi
              </Badge>
              {filteredHistori.length !== histori.length && (
                <Badge variant="secondary" className="gap-1">
                  <Filter className="h-3 w-3" />
                  {filteredHistori.length} hasil filter
                </Badge>
              )}
            </div>
          </div>

          {/* Filter Section */}
          <Card className="mb-6 border">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <Label htmlFor="search" className="mb-2 block">
                    Cari transaksi
                  </Label>
                  <div className="relative">
                    <Input
                      id="search"
                      placeholder="Cari berdasarkan nama, kode, atau catatan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Jenis Filter */}
                <div>
                  <Label htmlFor="filter-jenis" className="mb-2 block">
                    Jenis
                  </Label>
                  <Select value={filterJenis} onValueChange={setFilterJenis}>
                    <SelectTrigger
                      id="filter-jenis"
                      className="w-full md:w-[180px]"
                    >
                      <SelectValue placeholder="Semua jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua Jenis</SelectItem>
                      <SelectItem value="titip">Penitipan</SelectItem>
                      <SelectItem value="ambil">Pengambilan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div>
                  <Label htmlFor="filter-status" className="mb-2 block">
                    Status
                  </Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger
                      id="filter-status"
                      className="w-full md:w-[180px]"
                    >
                      <SelectValue placeholder="Semua status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua Status</SelectItem>
                      <SelectItem value="berhasil">Berhasil</SelectItem>
                      <SelectItem value="gagal">Gagal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Filter */}
                <div>
                  <Label htmlFor="sort-by" className="mb-2 block">
                    Urutkan
                  </Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort-by" className="w-full md:w-[180px]">
                      <SelectValue placeholder="Terbaru" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="terbaru">Terbaru → Terlama</SelectItem>
                      <SelectItem value="terlama">Terlama → Terbaru</SelectItem>
                      <SelectItem value="nama-az">Nama A-Z</SelectItem>
                      <SelectItem value="nama-za">Nama Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="border">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-1/4 mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredHistori.length === 0 ? (
          <Card className="border">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ||
                filterJenis !== "semua" ||
                filterStatus !== "semua"
                  ? "Tidak ada hasil yang cocok"
                  : "Belum ada transaksi"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ||
                filterJenis !== "semua" ||
                filterStatus !== "semua"
                  ? "Coba ubah filter atau kata kunci pencarian"
                  : role === "admin"
                    ? "Belum ada transaksi di sistem"
                    : "Anda belum melakukan transaksi penitipan atau pengambilan"}
              </p>
              {(searchQuery ||
                filterJenis !== "semua" ||
                filterStatus !== "semua") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterJenis("semua");
                    setFilterStatus("semua");
                  }}
                >
                  Reset Filter
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Transaction List */}
            <div className="space-y-4 mb-8">
              {filteredHistori.map((item) => (
                <Card
                  key={item.id}
                  className="border hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* ICON HANYA UNTUK "AMBIL" - GREEN */}
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600">
                          <PackageCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">
                              {item.namaBarang}
                            </h3>
                            {/* BADGE HANYA "SUDAH DIAMBIL" */}
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300"
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="ml-1">Sudah Diambil</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Barang sudah diambil • Kode: {item.kodeAmbil}
                            {role === "admin" && item.userId && (
                              <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">
                                User ID: {item.userId.substring(0, 8)}...
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {item.tanggal
                            ? format(item.tanggal.toDate(), "dd MMM yyyy", {
                                locale: id,
                              })
                            : "Tanggal tidak tersedia"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.tanggal
                            ? format(item.tanggal.toDate(), "HH:mm", {
                                locale: id,
                              })
                            : ""}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-muted rounded-lg">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Kode Ambil
                          </p>
                          <p className="font-mono font-bold text-sm">
                            {item.kodeAmbil}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-muted rounded-lg">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Slot</p>
                          <p className="font-medium text-sm">
                            Slot {item.slot}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-muted rounded-lg">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Tanggal Pengambilan
                          </p>
                          <p className="font-medium text-sm">
                            {item.tanggal
                              ? format(
                                  item.tanggal.toDate(),
                                  "dd/MM/yy HH:mm",
                                  { locale: id },
                                )
                              : "Tidak tersedia"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-muted rounded-lg">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Pemilik
                          </p>
                          <p className="font-medium text-sm">
                            {item.namaPemilik}
                          </p>
                        </div>
                      </div>
                    </div>

                    {item.catatan && (
                      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Info className="h-3 w-3 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            Catatan Pengambilan:
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground pl-5">
                          {item.catatan}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Stats Card */}
            <Card className="border">
              <CardHeader>
                <CardTitle>Statistik Transaksi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold">
                      {filteredHistori.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Transaksi
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold">
                      {
                        filteredHistori.filter((h) => h.jenis === "titip")
                          .length
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">Penitipan</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold">
                      {
                        filteredHistori.filter((h) => h.jenis === "ambil")
                          .length
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">Pengambilan</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold">
                      {
                        filteredHistori.filter((h) => h.status === "berhasil")
                          .length
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">Berhasil</p>
                  </div>
                </div>

                {/* Additional Stats for Admin */}
                {role === "admin" && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-medium mb-3">
                      Distribusi User
                    </h4>
                    <div className="space-y-2">
                      {(() => {
                        const userCounts: Record<string, number> = {};
                        filteredHistori.forEach((item) => {
                          userCounts[item.userId] =
                            (userCounts[item.userId] || 0) + 1;
                        });

                        const sortedUsers = Object.entries(userCounts)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5);

                        return sortedUsers.map(([userId, count]) => (
                          <div
                            key={userId}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {userId.substring(0, 16)}...
                            </span>
                            <Badge variant="outline">{count} transaksi</Badge>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// Search icon component
function Search(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
