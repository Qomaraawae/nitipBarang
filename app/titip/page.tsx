"use client";
import { useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { barangCollection } from "@/lib/firebase/firestore";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { generateKodeAmbil } from "@/lib/utils";
import ImageUploader from "@/components/ImageUploader";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSlotAvailability } from "@/hooks/useSlotAvailability";
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
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  Phone,
  User,
  Camera,
  CheckCircle,
  Info,
  MessageCircle,
} from "lucide-react";
import { logger } from "@/lib/logger";

interface SuccessData {
  nama: string;
  slot: number;
  kode: string;
}

type SlotStatus = "selected" | "occupied" | "available";

export default function TitipPage() {
  const { user } = useAuth();
  const [nama, setNama] = useState<string>("");
  const [hp, setHp] = useState<string>("");
  const [slot, setSlot] = useState<number | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [successData, setSuccessData] = useState<SuccessData>({
    nama: "",
    slot: 0,
    kode: "",
  });

  const router = useRouter();
  const { occupiedSlots, loading: slotsLoading } = useSlotAvailability();

  const validateInput = (): boolean => {
    // Nama validation
    if (!nama || nama.trim().length < 2) {
      toast.error("Nama minimal 2 karakter");
      return false;
    }

    // Phone validation
    const phoneRegex = /^(\+?62|0)[0-9]{9,12}$/;
    if (!hp || !phoneRegex.test(hp.replace(/\s/g, ""))) {
      toast.error("Nomor HP tidak valid (contoh: 081234567890)");
      return false;
    }

    // Slot validation
    if (!slot || slot < 1 || slot > 50) {
      toast.error("Pilih slot yang valid (1-50)");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Validasi login
    if (!user) {
      toast.error("Anda harus login terlebih dahulu!");
      router.push("/login");
      return;
    }

    if (!validateInput()) return;

    // Guard clause: slot harus ada
    if (slot === null) {
      toast.error("Pilih slot terlebih dahulu");
      return;
    }

    setLoading(true);
    const kode = await generateKodeAmbil();

    try {
      // Simpan data ke Firebase
      await addDoc(barangCollection, {
        nama_pemilik: nama,
        no_hp: hp,
        slot: slot,
        foto_url: fotoUrl,
        waktu_masuk: serverTimestamp(),
        status: "dititipkan" as const,
        kode_ambil: kode,
        created_at: serverTimestamp(),
        user_id: user.uid,
        created_by_email: user.email || "",
      });

      // Tampilkan notifikasi sukses
      setSuccessData({ nama, slot, kode });
      setShowSuccessDialog(true);

      toast.success("Barang berhasil dititipkan!", {
        description: `Kode: ${kode}`,
      });
    } catch (err) {
      logger.error("Error saving barang:", {
        nama: nama,
        slot: slot,
        error: err,
      });
      toast.error("Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = (): void => {
    setShowSuccessDialog(false);
    router.push("/");
  };

  const isSlotOccupied = (slotNumber: number): boolean => {
    return occupiedSlots.includes(slotNumber);
  };

  const getSlotStatus = (slotNumber: number): SlotStatus => {
    if (slot === slotNumber) return "selected";
    if (isSlotOccupied(slotNumber)) return "occupied";
    return "available";
  };

  const getSlotClassName = (slotNumber: number): string => {
    const status = getSlotStatus(slotNumber);
    const baseClasses =
      "w-14 h-14 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center";

    switch (status) {
      case "selected":
        return `${baseClasses} bg-gradient-to-br from-blue-500 to-indigo-600 text-white scale-110 ring-4 ring-blue-300 dark:ring-blue-600/50`;
      case "occupied":
        return `${baseClasses} bg-muted text-muted-foreground cursor-not-allowed`;
      default:
        return `${baseClasses} bg-card border-2 border-input text-foreground hover:border-primary hover:scale-105 cursor-pointer`;
    }
  };

  const totalSlots = 50;
  const slotsPerRow = 10;
  const rows = Math.ceil(totalSlots / slotsPerRow);

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
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Titip Barang Baru
                </h1>
                <p className="text-muted-foreground mt-1">
                  Isi form dan pilih slot yang tersedia
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Slot Selection */}
            <div>
              <Card>
                <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                  <CardTitle>Pilih Slot</CardTitle>
                  <CardDescription className="text-purple-100">
                    Klik slot yang tersedia untuk memilih
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 border-2 border-input rounded-lg"></div>
                      <span className="text-sm text-muted-foreground">
                        Tersedia
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg"></div>
                      <span className="text-sm text-muted-foreground">
                        Dipilih
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-muted rounded-lg"></div>
                      <span className="text-sm text-muted-foreground">
                        Terisi
                      </span>
                    </div>
                  </div>

                  {/* Selected Slot Info */}
                  {slot && (
                    <Alert className="mb-6">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Slot terpilih:{" "}
                        <strong className="text-2xl ml-2">{slot}</strong>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Slot Grid */}
                  {slotsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                      <p className="text-muted-foreground">Memuat slot...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Array.from({ length: rows }, (_, rowIndex) => (
                        <div
                          key={rowIndex}
                          className="flex justify-center gap-2"
                        >
                          {Array.from(
                            { length: slotsPerRow },
                            (_, colIndex) => {
                              const slotNumber =
                                rowIndex * slotsPerRow + colIndex + 1;
                              if (slotNumber > totalSlots) return null;

                              return (
                                <button
                                  key={slotNumber}
                                  type="button"
                                  onClick={() =>
                                    !isSlotOccupied(slotNumber) &&
                                    setSlot(slotNumber)
                                  }
                                  disabled={isSlotOccupied(slotNumber)}
                                  className={getSlotClassName(slotNumber)}
                                >
                                  {slotNumber}
                                </button>
                              );
                            }
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Slot Summary */}
                  <Separator className="my-6" />
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-2xl font-bold text-green-600">
                          {totalSlots - occupiedSlots.length}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Slot Tersedia
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-2xl font-bold text-destructive">
                          {occupiedSlots.length}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Slot Terisi
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Form */}
            <div>
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <CardTitle>Informasi Barang</CardTitle>
                  <CardDescription className="text-blue-100">
                    Pastikan data yang diisi sudah benar
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nama Pemilik */}
                    <div className="space-y-2">
                      <Label htmlFor="nama" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nama Pemilik
                      </Label>
                      <Input
                        id="nama"
                        placeholder="Masukkan nama lengkap"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        required
                      />
                    </div>

                    {/* No HP */}
                    <div className="space-y-2">
                      <Label htmlFor="hp" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Nomor WhatsApp
                      </Label>
                      <div className="relative">
                        <Input
                          id="hp"
                          type="tel"
                          placeholder="08123456789"
                          value={hp}
                          onChange={(e) => setHp(e.target.value)}
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Notifikasi akan dikirim melalui WhatsApp
                      </p>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Foto Barang
                      </Label>
                      <ImageUploader onUpload={setFotoUrl} />
                      {fotoUrl && (
                        <div className="mt-4 relative">
                          <img
                            src={fotoUrl}
                            alt="preview"
                            className="w-full rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setFotoUrl(undefined)}
                          >
                            Hapus
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={loading || !slot}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Menyimpan...
                        </>
                      ) : (
                        "SIMPAN BARANG"
                      )}
                    </Button>
                    {!slot && (
                      <p className="text-center text-sm text-destructive">
                        ⚠️ Pilih slot terlebih dahulu
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Informasi Penting</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Pilih slot yang tersedia (berwarna putih)</li>
                        <li>• Kode ambil akan digenerate otomatis</li>
                        <li>• Simpan kode dengan baik</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Berhasil Disimpan!
            </DialogTitle>
            <DialogDescription>Barang berhasil dititipkan</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-100">
              <AlertDescription className="text-green-800">
                Barang <strong>{successData.nama}</strong> berhasil dititipkan!
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border border-gray-200">
                <CardContent className="pt-6">
                  <p className="text-center text-2xl font-bold text-purple-700">
                    {successData.slot}
                  </p>
                  <p className="text-center text-sm text-gray-600">Slot</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200">
                <CardContent className="pt-6">
                  <p className="text-center text-xl font-bold text-blue-700 tracking-wider">
                    {successData.kode}
                  </p>
                  <p className="text-center text-sm text-gray-600">
                    Kode Ambil
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span>Pemilik:</span>
                <span className="font-medium">{successData.nama}</span>
              </div>
              <Separator className="bg-gray-200" />
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false);
                setNama("");
                setHp("");
                setSlot(null);
                setFotoUrl(undefined);
              }}
              className="border-gray-300"
            >
              Titip Lagi
            </Button>
            <Button onClick={handleCloseSuccess}>Kembali ke Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
