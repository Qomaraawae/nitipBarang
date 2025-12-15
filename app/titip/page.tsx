"use client";
import { useState } from "react";
import { barangCollection } from "@/lib/firebase/firestore";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { generateKodeAmbil } from "@/lib/utils";
import ImageUploader from "@/components/ImageUploader";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSlotAvailability } from "@/hooks/useSlotAvailability";

export default function TitipPage() {
  const [nama, setNama] = useState("");
  const [hp, setHp] = useState("");
  const [slot, setSlot] = useState<number | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [showSuccessNotif, setShowSuccessNotif] = useState(false);
  const [successData, setSuccessData] = useState({ nama: "", slot: 0, kode: "" });
  const router = useRouter();
  const { occupiedSlots, loading: slotsLoading } = useSlotAvailability();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !hp || !slot) return alert("Lengkapi data dan pilih slot");

    setLoading(true);
    const kode = generateKodeAmbil();

    try {
      await addDoc(barangCollection, {
        nama_pemilik: nama,
        no_hp: hp,
        slot: slot,
        foto_url: fotoUrl,
        waktu_masuk: serverTimestamp(),
        status: "dititipkan" as const,
        kode_ambil: kode,
        created_at: serverTimestamp(),
      });

      const linkDetail = `${window.location.origin}/barang/${kode}`;
      const pesanWA = encodeURIComponent(
        `Halo ${nama}! \u{1F44B}

Barang kamu sudah aman tersimpan nih! \u{1F389}

\u{1F4E6} Lokasi: Slot *${slot}*
\u{1F510} Kode Ambil: *${kode}*

Jangan lupa simpan kode ini ya! Kamu butuh kode ini untuk ambil barang nanti.

Cek detail: ${linkDetail}`
      );
      window.open(`https://wa.me/${hp.replace(/[^0-9]/g, "")}?text=${pesanWA}`, "_blank");

      // Show success notification
      setSuccessData({ nama, slot, kode });
      setShowSuccessNotif(true);

      // Auto redirect after 5 seconds
      setTimeout(() => {
        router.push("/");
      }, 5000);
    } catch (err) {
      console.error("Error saving:", err);
      alert("Gagal simpan");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setShowSuccessNotif(false);
    router.push("/");
  };

  const isSlotOccupied = (slotNumber: number) => occupiedSlots.includes(slotNumber);

  const getSlotStatus = (slotNumber: number) => {
    if (slot === slotNumber) return "selected";
    if (isSlotOccupied(slotNumber)) return "occupied";
    return "available";
  };

  const getSlotClassName = (slotNumber: number) => {
    const status = getSlotStatus(slotNumber);
    const baseClasses = "w-16 h-16 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center shadow-md";
    
    if (status === "selected") {
      return `${baseClasses} bg-gradient-to-br from-blue-500 to-indigo-600 text-white scale-110 ring-4 ring-blue-300`;
    }
    if (status === "occupied") {
      return `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed`;
    }
    return `${baseClasses} bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:scale-105 cursor-pointer`;
  };

  const totalSlots = 50;
  const slotsPerRow = 10;
  const rows = Math.ceil(totalSlots / slotsPerRow);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 group transition-colors"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Kembali ke Dashboard</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Titip Barang Baru</h1>
              <p className="text-gray-500 mt-1">Isi form dan pilih slot yang tersedia</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Slot Selection */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-8 py-6">
                <h2 className="text-xl font-bold text-white">Pilih Slot</h2>
                <p className="text-purple-100 text-sm mt-1">Klik slot yang tersedia untuk memilih</p>
              </div>

              <div className="p-8">
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-lg"></div>
                    <span className="text-sm text-gray-600 font-medium">Tersedia</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg"></div>
                    <span className="text-sm text-gray-600 font-medium">Dipilih</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                    <span className="text-sm text-gray-600 font-medium">Terisi</span>
                  </div>
                </div>

                {/* Selected Slot Info */}
                {slot && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-700">
                      <strong>Slot terpilih:</strong> <span className="text-2xl font-bold ml-2">{slot}</span>
                    </p>
                  </div>
                )}

                {/* Slot Grid */}
                {slotsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-500">Memuat slot...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.from({ length: rows }, (_, rowIndex) => (
                      <div key={rowIndex} className="flex justify-center gap-2">
                        {Array.from({ length: slotsPerRow }, (_, colIndex) => {
                          const slotNumber = rowIndex * slotsPerRow + colIndex + 1;
                          if (slotNumber > totalSlots) return null;
                          
                          return (
                            <button
                              key={slotNumber}
                              type="button"
                              onClick={() => !isSlotOccupied(slotNumber) && setSlot(slotNumber)}
                              disabled={isSlotOccupied(slotNumber)}
                              className={getSlotClassName(slotNumber)}
                            >
                              {slotNumber}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}

                {/* Slot Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-green-600">{totalSlots - occupiedSlots.length}</p>
                      <p className="text-xs text-green-700 font-medium">Slot Tersedia</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-red-600">{occupiedSlots.length}</p>
                      <p className="text-xs text-red-700 font-medium">Slot Terisi</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
                <h2 className="text-xl font-bold text-white">Informasi Barang</h2>
                <p className="text-blue-100 text-sm mt-1">Pastikan data yang diisi sudah benar</p>
              </div>

              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nama Pemilik */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Nama Pemilik
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
                      required
                    />
                  </div>

                  {/* No HP */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Nomor WhatsApp
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="08123456789"
                        value={hp}
                        onChange={(e) => setHp(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
                        required
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Notifikasi akan dikirim melalui WhatsApp</p>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Foto Barang (Opsional)
                    </label>
                    <ImageUploader onUpload={setFotoUrl} />
                    {fotoUrl && (
                      <div className="mt-4 relative group">
                        <img 
                          src={fotoUrl} 
                          alt="preview" 
                          className="w-full rounded-xl shadow-md border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setFotoUrl(undefined)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading || !slot}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Menyimpan Data...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          <span>SIMPAN</span>
                        </>
                      )}
                    </button>
                    {!slot && (
                      <p className="text-center text-sm text-red-600 mt-2 font-medium">
                        ⚠️ Pilih slot terlebih dahulu
                      </p>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">Informasi Penting</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Pilih slot yang tersedia (berwarna putih)</li>
                    <li>• Kode ambil akan digenerate otomatis</li>
                    <li>• Link detail akan dikirim via WhatsApp</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Modal dengan Tombol Close */}
      {showSuccessNotif && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
            {/* Header dengan tombol close */}
            <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
              <button
                onClick={handleCloseNotification}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors duration-200"
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Berhasil Disimpan!</h3>
              </div>
            </div>

            <div className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-700 text-lg font-medium mb-2">
                  Barang <span className="font-bold text-gray-900">{successData.nama}</span> berhasil dititipkan!
                </p>
                <p className="text-gray-500 text-sm">Notifikasi telah dikirim via WhatsApp</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">Slot:</span>
                  <span className="text-2xl font-bold text-purple-600">{successData.slot}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-sm font-medium text-gray-600">Kode Ambil:</span>
                  <span className="text-xl font-bold text-blue-600 tracking-wider">{successData.kode}</span>
                </div>
              </div>

              <button
                onClick={handleCloseNotification}
                className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Kembali ke Dashboard
              </button>
              
              <p className="text-center text-xs text-gray-500 mt-3">
                Auto redirect dalam 5 detik...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}