"use client";
import { useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { barangCollection } from "@/lib/firebase/firestore";
import {
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  PackageCheck,
  Search,
  User,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { logger } from "@/lib/logger";
import confetti from "canvas-confetti";

interface Barang {
  id: string;
  kode_ambil: string;
  nama_pemilik: string;
  no_hp: string;
  slot: string | number;
  foto_url?: string;
  status: string;
  waktu_masuk?: { toDate: () => Date };
}

export default function AmbilPage() {
  const { user } = useAuth();
  const [kode, setKode] = useState("");
  const [barang, setBarang] = useState<Barang | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const router = useRouter();

  const cariBarangByKode = async (kodeAmbil: string) => {
    if (!kodeAmbil.trim()) {
      setError("Masukkan kode ambil terlebih dahulu");
      toast.error("Masukkan kode ambil terlebih dahulu");
      return;
    }

    setLoading(true);
    setError("");
    setBarang(null);

    try {
      const normalizedKode = kodeAmbil.trim().toUpperCase();

      const q = query(
        barangCollection,
        where("kode_ambil", "==", normalizedKode)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = { id: docSnap.id, ...docSnap.data() } as Barang;

        if (data.status === "diambil") {
          setError("Barang dengan kode ini sudah diambil sebelumnya.");
          setBarang(null);
          toast.error("Barang sudah diambil");
        } else {
          setBarang(data);
          setError("");
          toast.success("Barang ditemukan! Kode valid untuk pengambilan.");
        }
      } else {
        setError("Kode tidak ditemukan! Periksa kembali kode Anda.");
        setBarang(null);
        toast.error("Kode tidak ditemukan");
      }
    } catch (err) {
      logger.error("Error searching barang:", {
        kode: kodeAmbil,
        error: err,
      });
      setError("Terjadi kesalahan. Silakan coba lagi.");
      toast.error("Terjadi kesalahan");
    }

    setLoading(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    cariBarangByKode(kode);
  };

  const handleKonfirmasiAmbil = async () => {
    if (!barang) return;

    setShowConfirmDialog(false);
    setLoading(true);

    try {
      await updateDoc(doc(barangCollection, barang.id), {
        status: "diambil",
        waktu_keluar: serverTimestamp(),
      });

      // Confetti animation
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#10b981", "#059669", "#34d399"],
      });

      // Success toast
      toast.success("✅ Barang Berhasil Diambil!", {
        description: `Barang milik ${barang.nama_pemilik} telah dikembalikan`,
      });

      // Reset form
      setKode("");
      setBarang(null);
      setError("");

      // Redirect setelah delay
      setTimeout(() => {
        router.push("/histori");
      }, 0.005);
    } catch (err) {
      logger.error("Error updating barang status:", {
        barangId: barang.id,
        error: err,
      });

      toast.error("❌ Gagal Mengambil Barang", {
        description: "Terjadi kesalahan saat memproses. Silakan coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      cariBarangByKode(kode);
    }
  };

  // Helper function untuk format tanggal
  const formatTanggal = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("id-ID", options);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Dashboard
              </Button>
            </Link>
            <ModeToggle />
          </div>

          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary p-3">
                <PackageCheck className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Ambil Barang
                </h1>
                <p className="text-muted-foreground">
                  Scan barcode atau masukkan kode manual untuk pengambilan
                  barang
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          {/* Left Column - Input Section */}
          <div className="space-y-6">
            {/* Input Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Cari Barang
                </CardTitle>
                <CardDescription>
                  Masukkan kode 6 digit yang diberikan saat penitipan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="kode">Kode Pengambilan</Label>
                    <div className="flex gap-2">
                      <Input
                        id="kode"
                        placeholder="Contoh: ABC123"
                        value={kode}
                        onChange={(e) => setKode(e.target.value.toUpperCase())}
                        onKeyPress={handleKeyPress}
                        className="text-lg font-mono tracking-wider"
                        autoFocus
                      />
                      <Button
                        type="submit"
                        disabled={!kode.trim() || loading}
                        className="min-w-[100px]"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Mencari
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Cari
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {barang && (
                    <Alert className="bg-green-50 border-green-200 text-green-800">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription>
                        Barang ditemukan! Kode valid untuk pengambilan.
                      </AlertDescription>
                    </Alert>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Admin Info */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Saat Ini</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user?.photoURL || ""} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.displayName || "Admin"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Bertugas hari ini
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Result */}
          <div>
            {barang ? (
              <Card>
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <PackageCheck className="h-5 w-5" />
                      Barang Ditemukan
                    </CardTitle>
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Kode Ambil */}
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary p-3">
                            <Package className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Kode Ambil
                            </p>
                            <p className="text-2xl font-bold tracking-wider font-mono">
                              {barang.kode_ambil}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm">Nama Pemilik</Label>
                          </div>
                          <p className="text-lg font-semibold truncate">
                            {barang.nama_pemilik}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm">Nomor Slot</Label>
                          </div>
                          <p className="text-lg font-semibold">
                            Slot {barang.slot}
                          </p>
                        </CardContent>
                      </Card>

                      {barang.no_hp && (
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <Label className="text-sm">Nomor HP</Label>
                            </div>
                            <p className="text-lg font-semibold">
                              {barang.no_hp}
                            </p>
                          </CardContent>
                        </Card>
                      )}

                      {barang.waktu_masuk && (
                        <Card className="md:col-span-2">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <Label className="text-sm">Waktu Masuk</Label>
                            </div>
                            <p className="text-lg font-semibold">
                              {formatTanggal(barang.waktu_masuk.toDate())}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => setShowConfirmDialog(true)}
                      disabled={loading || barang.status === "diambil"}
                      size="lg"
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : barang.status === "diambil" ? (
                        "BARANG SUDAH DIAMBIL"
                      ) : (
                        <>
                          <PackageCheck className="mr-2 h-4 w-4" />
                          KONFIRMASI PENGAMBILAN
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <Search className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Cari Barang Terlebih Dahulu
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Masukkan kode ambil untuk melihat detail barang
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent
          className="
    w-[90vw] max-w-md
    sm:max-w-lg
    bg-white dark:bg-gray-900 
    border border-gray-200 dark:border-gray-800 
    p-4 sm:p-5
    rounded-lg
  "
        >
          {/* Header */}
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <DialogTitle className="text-lg text-gray-900 dark:text-gray-100">
                  Konfirmasi Pengambilan
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Barang milik: {barang?.nama_pemilik}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {barang && (
            <div className="space-y-4">
              {/* Main Info Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Slot Card */}
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {barang.slot}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    Slot
                  </div>
                </div>

                {/* Kode Card */}
                <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-purple-700 dark:text-purple-400 font-mono">
                    {barang.kode_ambil}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                    Kode Ambil
                  </div>
                </div>
              </div>

              {/* Quick Details */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Pemilik
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {barang.nama_pemilik}
                  </span>
                </div>

                {barang.no_hp && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      No. HP
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {barang.no_hp}
                    </span>
                  </div>
                )}

                {barang.waktu_masuk && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Masuk
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatTanggal(barang.waktu_masuk.toDate())}
                    </span>
                  </div>
                )}
              </div>

              {/* Photo Preview (Jika ada) */}
              {barang.foto_url && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-800">
                    Foto Barang
                  </div>
                  <img
                    src={barang.foto_url}
                    alt={`Barang ${barang.nama_pemilik}`}
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}

              {/* Warning Message */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    Pastikan barang sesuai sebelum konfirmasi
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1 border-gray-300 dark:border-gray-700"
            >
              Batal
            </Button>
            <Button
              onClick={handleKonfirmasiAmbil}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Konfirmasi
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
