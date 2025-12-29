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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner"; // Menggunakan sonner karena tidak ada use-toast
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
  ChevronRight,
  Info,
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
      }, 2000);
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

            {/* Guide Card */}
            <Card>
              <CardHeader>
                <CardTitle>Panduan Pengambilan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {[
                    {
                      icon: Search,
                      title: "Masukkan Kode",
                      description: "6 digit kode pengambilan",
                      color: "text-blue-600",
                      bg: "bg-blue-100",
                    },
                    {
                      icon: PackageCheck,
                      title: "Verifikasi Data",
                      description: "Pastikan data pemilik sesuai",
                      color: "text-green-600",
                      bg: "bg-green-100",
                    },
                    {
                      icon: CheckCircle,
                      title: "Konfirmasi",
                      description: "Klik ambil barang untuk menyelesaikan",
                      color: "text-purple-600",
                      bg: "bg-purple-100",
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`rounded-lg p-2 ${item.bg}`}>
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {item.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      {index < 2 && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
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
                    {/* Kode Display */}
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Konfirmasi Pengambilan
            </DialogTitle>
            <DialogDescription>
              Pastikan data barang sudah sesuai sebelum konfirmasi
            </DialogDescription>
          </DialogHeader>

          {barang && (
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Konfirmasi pengambilan barang milik{" "}
                  <strong>{barang.nama_pemilik}</strong>
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Image Section */}
                <div className="space-y-3">
                  <Label>Foto Barang</Label>
                  <div className="relative rounded-lg overflow-hidden border bg-muted aspect-square">
                    {barang.foto_url ? (
                      <img
                        src={barang.foto_url}
                        alt={`Barang ${barang.nama_pemilik}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Package className="h-16 w-16 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Tidak ada foto
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="space-y-4">
                  <div>
                    <Label className="mb-4 block">Informasi Barang</Label>

                    {/* Kode & Slot Cards */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold tracking-wider font-mono">
                            {barang.kode_ambil}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Kode Ambil
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold">{barang.slot}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Nomor Slot
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Details List */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                        <div className="rounded-lg bg-muted p-2">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            Nama Pemilik
                          </p>
                          <p className="font-semibold">{barang.nama_pemilik}</p>
                        </div>
                      </div>

                      {barang.no_hp && (
                        <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                          <div className="rounded-lg bg-muted p-2">
                            <Phone className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">
                              Nomor HP
                            </p>
                            <p className="font-semibold">{barang.no_hp}</p>
                          </div>
                        </div>
                      )}

                      {barang.waktu_masuk && (
                        <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                          <div className="rounded-lg bg-muted p-2">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">
                              Waktu Masuk
                            </p>
                            <p className="font-semibold">
                              {formatTanggal(barang.waktu_masuk.toDate())}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Alert */}
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Perhatian:</strong> Pastikan barang sesuai dengan foto
                  dan data di atas sebelum mengkonfirmasi pengambilan.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Batal
            </Button>
            <Button onClick={handleKonfirmasiAmbil} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Konfirmasi Ambil
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
