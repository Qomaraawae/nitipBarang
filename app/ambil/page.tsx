"use client";
import { useState } from "react";
import BarcodeScanner from "@/components/BarcodeScanner";
import SuccessNotification from "@/components/SuccessNotification";
import { barangCollection } from "@/lib/firebase/firestore";
import { query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AmbilPage() {
  const [kode, setKode] = useState("");
  const [barang, setBarang] = useState<any>(null);
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
      const q = query(barangCollection, where("kode_ambil", "==", kodeAmbil.toUpperCase()));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = { id: docSnap.id, ...docSnap.data() };
        
        if (data.status === 'diambil') {
          setError("Barang dengan kode ini sudah diambil sebelumnya.");
          setBarang(null);
        } else {
          setBarang(data);
        }
      } else {
        setError("Kode tidak ditemukan! Periksa kembali kode Anda.");
        setBarang(null);
      }
    } catch (err) {
      console.error("Error searching:", err);
      setError("Terjadi kesalahan: " + (err as Error).message);
    }
    setLoading(false);
  };

  const cariBarang = () => cariBarangByKode(kode);

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
      
      // Show success notification
      setSuccessData({
        nama: barang.nama_pemilik,
        kode: barang.kode_ambil
      });
      setShowSuccessNotif(true);
      
      // Redirect after notification closes (5 seconds)
      setTimeout(() => {
        router.push("/");
      }, 5000);
    } catch (err) {
      console.error("Error updating:", err);
      setError("Gagal mengupdate status barang: " + (err as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a 
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 group transition-colors"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Kembali</span>
          </a>
          
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Ambil Barang</h1>
              <p className="text-gray-500 mt-1">Scan barcode atau masukkan kode manual</p>
            </div>
          </div>
        </div>

        {/* Scanner Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-4">
            <h2 className="text-white font-semibold flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Scan Barcode
            </h2>
          </div>
          <div className="p-6">
            <BarcodeScanner onScan={(k) => {
              const upperCode = k.toUpperCase();
              setKode(upperCode);
              cariBarangByKode(upperCode);
            }} />
          </div>
        </div>

        {/* Manual Input Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-4">
            <h2 className="text-white font-semibold flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Input Manual
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Masukkan kode ambil"
                value={kode}
                onChange={(e) => {
                  setKode(e.target.value.toUpperCase());
                  setError("");
                  setBarang(null);
                }}
                onKeyPress={(e) => e.key === 'Enter' && cariBarang()}
                className="w-full px-6 py-5 border-2 border-gray-200 rounded-xl text-2xl text-center font-mono uppercase tracking-[0.3em] 
                           focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none
                           text-gray-900 caret-orange-500 placeholder-gray-400"
                maxLength={6}
                autoFocus
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                {kode.length}/6
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            <button
              onClick={cariBarang}
              disabled={loading || !kode.trim()}
              className="w-full py-5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Mencari...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>CARI BARANG</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result Card */}
        {barang && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold flex items-center">
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
            
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Info Section */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Kode Ambil</p>
                        <p className="text-3xl font-bold text-orange-600 tracking-wider">{barang.kode_ambil}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Nama Pemilik</p>
                        <p className="text-xl font-bold text-gray-800">{barang.nama_pemilik}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Nomor Slot</p>
                        <p className="text-xl font-bold text-gray-800">Slot {barang.slot}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <svg className="w-6 h-6 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Waktu Masuk</p>
                        <p className="text-base font-bold text-gray-800">
                          {barang.waktu_masuk?.toDate().toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photo Section */}
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-3 block">Foto Barang</label>
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
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 font-medium">Tidak ada foto</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleKonfirmasiClick}
                disabled={loading || barang.status === 'diambil'}
                className="w-full mt-8 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : barang.status === 'diambil' ? (
                  <>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <span>BARANG SUDAH DIAMBIL</span>
                  </>
                ) : (
                  <>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>KONFIRMASI BARANG DIAMBIL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Custom Confirmation Modal */}
        {showConfirmModal && barang && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Barang Ditemukan</h3>
                </div>
              </div>

              <div className="p-8">
                <p className="text-gray-700 text-lg mb-6 text-center font-medium">
                  Konfirmasi pengambilan barang milik <span className="font-bold text-gray-900">{barang.nama_pemilik}</span>?
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <span className="text-sm font-medium text-gray-600">Kode:</span>
                    <span className="text-2xl font-bold text-orange-600 tracking-wider">{barang.kode_ambil}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <span className="text-sm font-medium text-gray-600">Slot:</span>
                    <span className="text-xl font-bold text-purple-600">{barang.slot}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={konfirmasiAmbil}
                    className="py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Notification Popup */}
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