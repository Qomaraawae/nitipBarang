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
} from "lucide-react";

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
      toast.error("Masukkan kode ambil");
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
          toast.success("Barang ditemukan!");
        }
      } else {
        setError("Kode tidak ditemukan! Periksa kembali kode Anda.");
        setBarang(null);
        toast.error("Kode tidak ditemukan");
      }
    } catch (err) {
      console.error("Error searching:", err);
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

      toast.success("Barang berhasil diambil!", {
        description: `Barang milik ${barang.nama_pemilik} telah dikembalikan`,
      });

      // Reset form
      setKode("");
      setBarang(null);
      setError("");

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/histori");
      }, 2000);
    } catch (err) {
      console.error("Error updating:", err);
      toast.error("Gagal mengambil barang");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      cariBarangByKode(kode);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background text-foreground py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link href="/">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Dashboard
                </Button>
              </Link>
              <ModeToggle />
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <PackageCheck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Ambil Barang
                </h1>
                <p className="text-muted-foreground mt-1">
                  Scan barcode atau masukkan kode manual
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Input Section */}
            <div className="space-y-6">
              {/* Input Card */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Cari Barang
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Masukkan kode 6 digit yang diberikan saat penitipan
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="kode">Kode Pengambilan</Label>
                      <div className="flex gap-2">
                        <Input
                          id="kode"
                          placeholder="Misal: ABC123"
                          value={kode}
                          onChange={(e) =>
                            setKode(e.target.value.toUpperCase())
                          }
                          onKeyPress={handleKeyPress}
                          className="text-center text-lg font-mono tracking-wider"
                          autoFocus
                        />
                        <Button
                          onClick={() => cariBarangByKode(kode)}
                          disabled={!kode.trim() || loading}
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Mencari...
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
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Barang ditemukan! Kode valid untuk pengambilan.
                        </AlertDescription>
                      </Alert>
                    )}
                  </form>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Panduan Pengambilan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Search className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Masukkan Kode</p>
                      <p className="text-xs text-muted-foreground">
                        6 digit kode pengambilan
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <PackageCheck className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Verifikasi Data</p>
                      <p className="text-xs text-muted-foreground">
                        Pastikan data pemilik sesuai
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Konfirmasi</p>
                      <p className="text-xs text-muted-foreground">
                        Klik "Ambil Barang" untuk menyelesaikan
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Admin Saat Ini</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user?.photoURL || ""} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user?.displayName || "Admin"}
                      </p>
                      <p className="text-xs text-muted-foreground">
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
                  <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <PackageCheck className="h-5 w-5" />
                        Barang Ditemukan
                      </CardTitle>
                      <Badge variant="secondary" className="bg-white/20">
                        ✓ Verified
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Kode & Info */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Kode Ambil
                              </p>
                              <p className="text-2xl font-bold text-green-600 tracking-wider">
                                {barang.kode_ambil}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detail Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">
                                Nama Pemilik
                              </span>
                            </div>
                            <p className="text-lg font-bold truncate">
                              {barang.nama_pemilik}
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-medium">
                                Nomor Slot
                              </span>
                            </div>
                            <p className="text-lg font-bold">
                              Slot {barang.slot}
                            </p>
                          </CardContent>
                        </Card>

                        {barang.waktu_masuk && (
                          <Card className="sm:col-span-2">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-indigo-600" />
                                <span className="text-sm font-medium">
                                  Waktu Masuk
                                </span>
                              </div>
                              <p className="text-base font-medium">
                                {barang.waktu_masuk
                                  .toDate()
                                  .toLocaleString("id-ID", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })}
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
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Memproses...
                          </>
                        ) : barang.status === "diambil" ? (
                          "BARANG SUDAH DIAMBIL"
                        ) : (
                          "KONFIRMASI PENGAMBILAN"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Search className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Cari Barang Terlebih Dahulu
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Masukkan kode ambil untuk melihat detail barang
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Konfirmasi Pengambilan
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mengambil barang ini?
            </DialogDescription>
          </DialogHeader>

          {barang && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Konfirmasi pengambilan barang milik{" "}
                  <strong>{barang.nama_pemilik}</strong>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600 tracking-wider">
                      {barang.kode_ambil}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Kode</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {barang.slot}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Slot</p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pemilik:</span>
                  <span className="font-medium">{barang.nama_pemilik}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal:</span>
                  <span className="font-medium">
                    {new Date().toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Batal
            </Button>
            <Button onClick={handleKonfirmasiAmbil}>Konfirmasi Ambil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
