"use client";
import { useState, FormEvent, useEffect } from "react";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import { logger } from "@/lib/logger";
import confetti from "canvas-confetti";

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

  // Function untuk trigger confetti
  const triggerConfetti = () => {
    // Reset any existing confetti
    confetti.reset();

    // Multiple confetti effects
    const end = Date.now() + 3 * 1000; // 3 seconds
    const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

    (function frame() {
      // Launch from the left edge
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });

      // Launch from the right edge
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Burst effects
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors,
      });
    }, 500);

    // More bursts
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 90,
        spread: 70,
        origin: { x: 0.5, y: 0.8 },
        colors: colors,
      });
    }, 1000);
  };

  useEffect(() => {
    if (showSuccessDialog) {
      const timer = setTimeout(() => {
        triggerConfetti();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [showSuccessDialog]);

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
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <CardTitle>Pilih Slot</CardTitle>
                  <CardDescription className="text-blue-100">
                    Klik slot yang tersedia untuk memilih
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {/* Legend */}
                  <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-green-500 bg-white rounded-lg shadow-sm"></div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        Tersedia
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm"></div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        Dipilih
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-500 bg-gray-400 rounded-lg shadow-sm"></div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        Terisi
                      </span>
                    </div>
                  </div>

                  {/* Selected Slot Info */}
                  {slot && (
                    <Alert className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                      <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <AlertDescription className="text-blue-700 text-sm sm:text-base">
                        Slot terpilih:{" "}
                        <strong className="text-xl sm:text-2xl ml-2 text-blue-800">
                          {slot}
                        </strong>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Slot Grid */}
                  {slotsLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                      <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-sm sm:text-base text-gray-600">
                        Memuat slot...
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Layout (grid) */}
                      <div className="hidden sm:block space-y-3">
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

                                const occupied = isSlotOccupied(slotNumber);
                                const isSelected = slot === slotNumber;

                                return (
                                  <button
                                    key={slotNumber}
                                    type="button"
                                    onClick={() =>
                                      !occupied && setSlot(slotNumber)
                                    }
                                    disabled={occupied}
                                    className={`
                          w-12 h-12 rounded-lg font-medium transition-all duration-200
                          flex items-center justify-center text-sm border-2
                          ${
                            occupied
                              ? "bg-gray-400 border-gray-500 text-gray-700 cursor-not-allowed"
                              : isSelected
                              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-105 border-blue-500"
                              : "bg-white border-green-400 text-gray-800 hover:border-green-500 hover:bg-green-50 hover:shadow-md active:scale-95"
                          }
                        `}
                                  >
                                    {slotNumber}
                                  </button>
                                );
                              }
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Mobile Layout (scrollable) */}
                      <div className="sm:hidden">
                        <div className="mb-3 text-xs text-gray-600">
                          <p>Geser ke kanan/kiri untuk melihat semua slot</p>
                        </div>
                        <div className="overflow-x-auto pb-2">
                          <div className="inline-flex flex-col gap-2 min-w-full">
                            {Array.from({ length: rows }, (_, rowIndex) => (
                              <div key={rowIndex} className="flex gap-2">
                                {Array.from(
                                  { length: slotsPerRow },
                                  (_, colIndex) => {
                                    const slotNumber =
                                      rowIndex * slotsPerRow + colIndex + 1;
                                    if (slotNumber > totalSlots) return null;

                                    const occupied = isSlotOccupied(slotNumber);
                                    const isSelected = slot === slotNumber;

                                    return (
                                      <button
                                        key={slotNumber}
                                        type="button"
                                        onClick={() =>
                                          !occupied && setSlot(slotNumber)
                                        }
                                        disabled={occupied}
                                        className={`
                              w-10 h-10 rounded-lg font-medium transition-all duration-200
                              flex items-center justify-center text-xs border-2 flex-shrink-0
                              ${
                                occupied
                                  ? "bg-gray-400 border-gray-500 text-gray-700 cursor-not-allowed"
                                  : isSelected
                                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-105 border-blue-500"
                                  : "bg-white border-green-400 text-gray-800 hover:border-green-500 hover:bg-green-50"
                              }
                            `}
                                      >
                                        {slotNumber}
                                      </button>
                                    );
                                  }
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Slot Summary */}
                  <Separator className="my-4 sm:my-6" />
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 text-center">
                    <Card className="border-2 border-green-300 bg-gradient-to-b from-green-50 to-white shadow-sm">
                      <CardContent className="pt-4 sm:pt-6 px-2 sm:px-6">
                        <p className="text-lg sm:text-2xl font-bold text-green-700">
                          {totalSlots - occupiedSlots.length}
                        </p>
                        <p className="text-xs sm:text-sm font-medium text-green-800">
                          Slot Tersedia
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-gray-400 bg-gradient-to-b from-gray-100 to-white shadow-sm">
                      <CardContent className="pt-4 sm:pt-6 px-2 sm:px-6">
                        <p className="text-lg sm:text-2xl font-bold text-gray-800">
                          {occupiedSlots.length}
                        </p>
                        <p className="text-xs sm:text-sm font-medium text-gray-800">
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
                      <div className="flex items-center gap-3">
                        <Label className="flex items-center gap-2">
                          <Camera className="h-4 w-4" />
                          Foto Barang
                        </Label>
                        {/* Tombol plus compact */}
                        <ImageUploader onUpload={setFotoUrl} compact={true} />
                      </div>

                      {/* Preview gambar */}
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
        <DialogContent className="max-w-xs sm:max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-lg sm:text-xl text-gray-900 dark:text-gray-100">
              Berhasil Disimpan!
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Barang berhasil dititipkan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 mt-4">
            {/* Success Message */}
            <div className="text-center px-2">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Barang{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {successData.nama}
                </span>{" "}
                berhasil dititipkan
              </p>
            </div>

            {/* Slot and Code Cards */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {successData.slot}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Slot
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400 font-mono tracking-tight">
                  {successData.kode}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Kode Ambil
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Pemilik:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate ml-2">
                  {successData.nama}
                </span>
              </div>
              <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Tanggal:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {new Date().toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <DialogFooter className="mt-4 sm:mt-6 flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowSuccessDialog(false);
                setNama("");
                setHp("");
                setSlot(null);
                setFotoUrl(undefined);
              }}
              className="w-full sm:w-auto text-xs sm:text-sm border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              Titip Lagi
            </Button>
            <Button
              size="sm"
              onClick={handleCloseSuccess}
              className="w-full sm:w-auto text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
            >
              Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}