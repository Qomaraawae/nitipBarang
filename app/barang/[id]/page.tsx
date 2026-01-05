"use client";

import { useEffect, useState } from "react";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";
import { notFound } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  User,
  Phone,
  Calendar,
  Hash,
  Copy,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MessageCircle,
} from "lucide-react";
import { logger } from "@/lib/logger";

interface PageProps {
  params: Promise<{ id: string }>;
}

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

export default function DetailBarang({ params }: PageProps) {
  const [barang, setBarang] = useState<Barang | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const { user, role } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const { id } = await params;

        const q = query(
          collection(db, "barang"),
          where("kode_ambil", "==", id)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          notFound();
          return;
        }

        const doc = querySnapshot.docs[0];
        const data = { id: doc.id, ...doc.data() } as Barang;
        setBarang(data);
      } catch (error) {
        logger.error("Error fetching barang detail:", {
          params: await params,
          error: error,
        });
        notFound();
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params]);

  const handleCopyKode = async () => {
    if (!barang) return;

    try {
      await navigator.clipboard.writeText(barang.kode_ambil);

      toast.success("Kode berhasil disalin!", {
        description: `Kode ${barang.kode_ambil} telah disalin ke clipboard`,
        duration: 3000,
        position: "bottom-right",
      });

      logger.log("Kode copied to clipboard:", {
        kode: barang.kode_ambil,
        user: user?.email,
      });
    } catch (err) {
      logger.error("Failed to copy code to clipboard:", {
        kode: barang?.kode_ambil,
        error: err,
      });

      toast.error("Gagal menyalin kode", {
        duration: 3000,
        position: "bottom-right",
      });
    }
  };

  const openImageModal = () => {
    setShowImageModal(true);
    setZoomLevel(1);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showImageModal) {
        closeImageModal();
      }
    };

    const handleKeyZoom = (e: KeyboardEvent) => {
      if (!showImageModal) return;

      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        handleResetZoom();
      }
    };

    if (showImageModal) {
      document.addEventListener("keydown", handleEscapeKey);
      document.addEventListener("keydown", handleKeyZoom);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("keydown", handleKeyZoom);
      document.body.style.overflow = "auto";
    };
  }, [showImageModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!barang || !user) return null;

  const isAdmin = role === "admin";
  const isActive = barang.status === "dititipkan";

  return (
    <>
      <div className="min-h-screen bg-background text-foreground py-8 px-4">
        <div className="max-w-4xl mx-auto">
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
                  Detail Barang
                </h1>
                <p className="text-muted-foreground mt-1">
                  Informasi lengkap barang titipan
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Status
                    </p>
                    <p className="text-2xl font-bold">{barang.nama_pemilik}</p>
                  </div>
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={
                      isActive
                        ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300"
                        : ""
                    }
                  >
                    {isActive ? "✓ AKTIF" : "DIAMBIL"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Info */}
              <div className="space-y-6">
                {/* Kode Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Hash className="h-5 w-5" />
                        Kode Pengambilan
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyKode}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-blue-600 font-mono tracking-wider">
                        {barang.kode_ambil}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Kode ini diperlukan untuk mengambil barang
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Barang</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          Nama Pemilik
                        </span>
                      </div>
                      <p className="text-lg font-medium">
                        {barang.nama_pemilik}
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">
                          Nomor WhatsApp
                        </span>
                      </div>
                      <p className="text-lg font-medium">{barang.no_hp}</p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Nomor Slot</span>
                      </div>
                      <p className="text-lg font-medium">Slot {barang.slot}</p>
                    </div>

                    {barang.waktu_masuk && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-indigo-600" />
                            <span className="text-sm font-medium">
                              Waktu Masuk
                            </span>
                          </div>
                          <p className="text-sm font-medium">
                            {barang.waktu_masuk
                              .toDate()
                              .toLocaleString("id-ID", {
                                dateStyle: "full",
                                timeStyle: "short",
                              })}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Foto */}
              <Card>
                <CardHeader>
                  <CardTitle>Foto Barang</CardTitle>
                </CardHeader>
                <CardContent>
                  {barang.foto_url ? (
                    <div className="relative">
                      <div
                        className="relative rounded-lg overflow-hidden border cursor-zoom-in aspect-square"
                        onClick={openImageModal}
                      >
                        <Image
                          src={barang.foto_url}
                          alt="Foto barang"
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                      </div>
                      <Button
                        variant="outline"
                        className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm"
                        onClick={openImageModal}
                      >
                        <ZoomIn className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                      <Package className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground font-medium">
                        Tidak ada foto
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Foto barang tidak tersedia
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* WhatsApp Button (Admin only) */}
            {isAdmin && isActive && (
              <Button
                className="w-full gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                onClick={() => {
                  let phone = barang.no_hp.replace(/\D/g, "");
                  if (phone.startsWith("0")) phone = "62" + phone.substring(1);
                  if (!phone.startsWith("62")) phone = "62" + phone;

                  const message = encodeURIComponent(
                    `Halo ${
                      barang.nama_pemilik
                    }!\n\nBarang kamu sudah aman tersimpan nih!\n\nLokasi: Slot *${
                      barang.slot
                    }*\nKode Ambil: *${
                      barang.kode_ambil
                    }*\n\nJangan lupa simpan kode ini ya! Kamu butuh kode ini untuk ambil barang nanti.\n\nCek detail: ${
                      typeof window !== "undefined" ? window.location.href : ""
                    }`
                  );

                  window.open(
                    `https://wa.me/${phone}?text=${message}`,
                    "_blank"
                  );
                }}
              >
                <MessageCircle className="h-5 w-5" />
                Hubungi via WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Preview Foto Barang</DialogTitle>
            <DialogDescription>
              {barang.nama_pemilik} • Slot {barang.slot} • Kode{" "}
              {barang.kode_ambil}
            </DialogDescription>
          </DialogHeader>

          <div className="relative flex-1 min-h-[60vh] bg-black">
            {barang.foto_url && (
              <div className="relative w-full h-full flex items-center justify-center p-6">
                <img
                  src={barang.foto_url}
                  alt="Preview foto barang"
                  className="max-w-full max-h-full object-contain"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transition: "transform 0.2s ease",
                  }}
                />
              </div>
            )}

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>

              <span className="px-2 text-white text-sm font-medium min-w-[60px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              {zoomLevel > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleResetZoom}
                  className="h-8 w-8 text-white hover:bg-white/20 ml-2"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
