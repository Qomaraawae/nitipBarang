"use client";
import { useState, FormEvent } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import BarcodeScanner from "@/components/BarcodeScanner";
import SuccessNotification from "@/components/SuccessNotification";
import { barangCollection } from "@/lib/firebase/firestore";
import { query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Barang {
  id: string;
  kode_ambil: string;
  nama_pemilik: string;
  slot: string | number;
  foto_url?: string;
  status: string;
  waktu_masuk?: { toDate: () => Date };
}

function AmbilPageContent() {
  const [kode, setKode] = useState("");
  const [barang, setBarang] = useState<Barang | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessNotif, setShowSuccessNotif] = useState(false);
  const [successData, setSuccessData] = useState({ nama: "", kode: "" });
  const router = useRouter();

  const cariBarangByKode = async (kodeAmbil: string) => {
    if (!kodeAmbil.trim()) {
      setError("Masukkan kode ambil terlebih dahulu");
      return;
    }
    
    setLoading(true);
    setError("");
    setBarang(null);
    
    try {
      const normalizedKode = kodeAmbil.trim().toUpperCase();
      
      const q = query(barangCollection, where("kode_ambil", "==", normalizedKode));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = { id: docSnap.id, ...docSnap.data() } as Barang;
        
        if (data.status === 'diambil') {
          setError("Barang dengan kode ini sudah diambil sebelumnya.");
          setBarang(null);
        } else {
          setBarang(data);
          setError("");
        }
      } else {
        setError("Kode tidak ditemukan! Periksa kembali kode Anda.");
        setBarang(null);
      }
      
    } catch (err) {
      console.error("Error searching:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    }
    
    setLoading(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    cariBarangByKode(kode);
  };

  const handleKonfirmasiClick = () => {
    setShowConfirmModal(true);
  };

  const konfirmasiAmbil = async () => {
    if (!barang) return;
    
    setShowConfirmModal(false);
    setLoading(true);
    
    try {
      await updateDoc(doc(barangCollection, barang.id), {
        status: "diambil",
        waktu_keluar: serverTimestamp(),
      });
      
      setSuccessData({
        nama: barang.nama_pemilik,
        kode: barang.kode_ambil
      });
      setShowSuccessNotif(true);
      
      setTimeout(() => {
        router.push("/");
      }, 5000);
    } catch (err) {
      console.error("Error updating:", err);
      setError("Gagal mengupdate status barang. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a 
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 group transition-colors"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Kembali ke Dashboard</span>
          </a>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Ambil Barang</h1>
                  <p className="text-gray-500 mt-1">Scan barcode atau masukkan kode manual</p>
                </div>
                <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full self-start">
                  ADMIN ONLY
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Scanner & Input */}
          <div className="space-y-6">
            {/* Scanner Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-4">
                <h2 className="text-white font-bold text-lg flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Scan Barcode
                </h2>
              </div>
              <div className="p-6">
                <BarcodeScanner 
                  onScan={(k) => {
                    const upperCode = k.toUpperCase().trim();
                    setKode(upperCode);
                    cariBarangByKode(upperCode);
                  }} 
                />
              </div>
            </div>

            {/* Manual Input Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-4">
                <h2 className="text-white font-bold text-lg flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Input Manual
                </h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Masukkan kode ambil"
                      value={kode}
                      onChange={(e) => {
                        const normalized = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
                        setKode(normalized);
                        setError("");
                        setBarang(null);
                      }}
                      className="w-full px-4 py-4 text-lg sm:text-xl font-mono uppercase tracking-wider border-2 border-gray-200 rounded-xl text-center focus:border-orange-500 focus:ring-3 focus:ring-orange-100 transition-all outline-none text-gray-900 placeholder-gray-400"
                      maxLength={6}
                      autoFocus
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      {kode.length}/6
                    </div>
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fadeIn">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-700 font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !kode.trim()}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Mencari...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>CARI BARANG</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-orange-900 mb-1">Tips Penggunaan</h3>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>• Scan barcode atau input manual kode 6 karakter</li>
                    <li>• Pastikan barang belum diambil sebelumnya</li>
                    <li>• Konfirmasi hanya bisa dilakukan oleh admin</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Result */}
          <div>
            {barang ? (
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden h-full">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-white font-bold text-lg flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Barang Ditemukan
                    </h2>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-bold">
                      ✓ Verified
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Kode & Info */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Kode Ambil</p>
                            <p className="text-2xl font-bold text-green-600 tracking-wider">{barang.kode_ambil}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detail Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-500">Nama Pemilik</span>
                        </div>
                        <p className="text-lg font-bold text-gray-800 truncate">{barang.nama_pemilik}</p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <span className="text-sm font-medium text-gray-500">Nomor Slot</span>
                        </div>
                        <p className="text-lg font-bold text-gray-800">Slot {barang.slot}</p>
                      </div>

                      {barang.waktu_masuk && (
                        <div className="sm:col-span-2 bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-500">Waktu Masuk</span>
                          </div>
                          <p className="text-base font-medium text-gray-800">
                            {barang.waktu_masuk.toDate().toLocaleString('id-ID', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Foto Barang */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Foto Barang</label>
                      {barang.foto_url ? (
                        <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 aspect-square">
                          <Image
                            src={barang.foto_url}
                            alt="Foto barang"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 aspect-square">
                          <div className="text-center">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-500 text-sm font-medium">Tidak ada foto</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={handleKonfirmasiClick}
                      disabled={loading || barang.status === 'diambil'}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Memproses...</span>
                        </>
                      ) : barang.status === 'diambil' ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          <span>BARANG SUDAH DIAMBIL</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>KONFIRMASI PENGAMBILAN</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/50 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-12 h-full">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Cari Barang Terlebih Dahulu</h3>
                <p className="text-gray-500 text-center text-sm">
                  Masukkan kode ambil atau scan barcode untuk melihat detail barang
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && barang && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">Konfirmasi Pengambilan</h3>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-6 text-center">
                  Konfirmasi pengambilan barang milik <span className="font-bold text-gray-900">{barang.nama_pemilik}</span>?
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <span className="text-sm font-medium text-gray-600">Kode:</span>
                    <span className="text-xl font-bold text-orange-600 tracking-wider">{barang.kode_ambil}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <span className="text-sm font-medium text-gray-600">Slot:</span>
                    <span className="text-lg font-bold text-purple-600">{barang.slot}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                  >
                    Batal
                  </button>
                  <button
                    onClick={konfirmasiAmbil}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg shadow hover:shadow-lg transition-all duration-200"
                  >
                    Konfirmasi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Notification */}
        <SuccessNotification
          show={showSuccessNotif}
          title="Barang berhasil diambil!"
          message={`Pemilik: ${successData.nama}\nKode: ${successData.kode}`}
          onClose={() => setShowSuccessNotif(false)}
        />
      </div>
    </div>
  );
}

export default function AmbilPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AmbilPageContent />
    </ProtectedRoute>
  );
}