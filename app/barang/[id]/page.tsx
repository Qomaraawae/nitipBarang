'use client';

import { useEffect, useState } from "react";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";
import { notFound } from "next/navigation";
import Image from "next/image";

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
  const [showCopyNotif, setShowCopyNotif] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    async function fetchData() {
      try {
        const { id } = await params;
        
        const q = query(collection(db, "barang"), where("kode_ambil", "==", id));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          notFound();
          return;
        }

        const doc = querySnapshot.docs[0];
        const data = { id: doc.id, ...doc.data() } as Barang;
        setBarang(data);
      } catch (error) {
        console.error("Error saat mengambil data:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params]);

  const handleCopyKode = async () => {
    try {
      await navigator.clipboard.writeText(barang!.kode_ambil);
      setShowCopyNotif(true);
      
      setTimeout(() => {
        setShowCopyNotif(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Gagal menyalin kode');
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
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showImageModal) {
        closeImageModal();
      }
    };

    const handleKeyZoom = (e: KeyboardEvent) => {
      if (!showImageModal) return;
      
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        setZoomLevel(1);
      }
    };

    if (showImageModal) {
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('keydown', handleKeyZoom);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('keydown', handleKeyZoom);
      document.body.style.overflow = 'auto';
    };
  }, [showImageModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!barang) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Detail Barang</h1>
              <p className="text-gray-500 mt-1">Informasi lengkap barang titipan</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Status</span>
              <span className={`px-4 py-2 rounded-full font-bold text-sm ${
                barang.status === 'dititipkan' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-500 text-white'
              }`}>
                {barang.status === 'dititipkan' ? '✓ AKTIF' : 'DIAMBIL'}
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Kode Ambil</label>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-blue-600">{barang.kode_ambil}</span>
                    <button
                      onClick={handleCopyKode}
                      className="group p-2 hover:bg-blue-50 rounded-lg transition-all duration-200 relative"
                      title="Copy kode"
                    >
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Nama Pemilik</p>
                      <p className="text-lg font-bold text-gray-800">{barang.nama_pemilik}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">No. WhatsApp</p>
                      <p className="text-lg font-bold text-gray-800">{barang.no_hp}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Nomor Slot</p>
                      <p className="text-lg font-bold text-gray-800">Slot {barang.slot}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Waktu Masuk</p>
                      <p className="text-lg font-bold text-gray-800">
                        {barang.waktu_masuk?.toDate().toLocaleString('id-ID', {
                          dateStyle: 'full',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Foto Barang</label>
                {barang.foto_url ? (
                  <div className="group relative rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 aspect-square">
                    <button
                      onClick={openImageModal}
                      className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-300 z-10 cursor-zoom-in"
                      aria-label="Preview foto barang"
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                    <Image
                      src={barang.foto_url}
                      alt="Foto barang"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
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
          </div>
        </div>

        {barang.status === 'dititipkan' && (
          <div className="mt-6">
            <a
              href={(() => {
                let phone = barang.no_hp.replace(/\D/g, '');
                if (phone.startsWith('0')) phone = '62' + phone.substring(1);
                if (!phone.startsWith('62')) phone = '62' + phone;
                
                const message = encodeURIComponent(
                  `Halo ${barang.nama_pemilik}!

Barang kamu sudah aman tersimpan nih!

Lokasi: Slot *${barang.slot}*
Kode Ambil: *${barang.kode_ambil}*

Jangan lupa simpan kode ini ya! Kamu butuh kode ini untuk ambil barang nanti.

Cek detail: ${typeof window !== 'undefined' ? window.location.href : ''}`
                );
                
                return `https://wa.me/${phone}?text=${message}`;
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>Hubungi via WhatsApp</span>
            </a>
          </div>
        )}

        {showImageModal && barang.foto_url && (
          <div className="fixed inset-0 z-50">
            <div 
              className="absolute inset-0 bg-black/95 backdrop-blur-sm animate-fadeIn"
              onClick={closeImageModal}
            ></div>
            
            <div className="relative h-full flex items-center justify-center p-4">
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110"
                aria-label="Tutup preview"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="relative w-full max-w-6xl max-h-[90vh] animate-scaleIn overflow-hidden rounded-xl">
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <img
                    src={barang.foto_url}
                    alt="Preview foto barang"
                    className="max-w-full max-h-full object-contain"
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6">
                  <p className="text-white font-medium text-sm sm:text-base">
                    Foto barang milik: <span className="font-bold">{barang.nama_pemilik}</span>
                  </p>
                  <p className="text-gray-300 text-xs sm:text-sm mt-1">
                    Slot: {barang.slot} • Kode: {barang.kode_ambil}
                  </p>
                </div>

                <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg p-1">
                  <button
                    className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 disabled:opacity-30"
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 1}
                    aria-label="Zoom out"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                    </svg>
                  </button>
                  
                  <span className="px-2 text-white text-sm font-medium min-w-[60px] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  
                  <button
                    className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 disabled:opacity-30"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 3}
                    aria-label="Zoom in"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </button>
                  
                  {zoomLevel > 1 && (
                    <button
                      className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded text-white text-sm font-medium transition-all duration-300"
                      onClick={() => setZoomLevel(1)}
                      aria-label="Reset zoom"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {showCopyNotif && (
          <div className="fixed top-4 right-4 z-50 animate-slideInRight">
            <div className="bg-white rounded-xl shadow-2xl border border-green-200 overflow-hidden max-w-sm">
              <div className="flex items-center p-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-900">Berhasil disalin!</p>
                  <p className="text-xs text-gray-600 mt-0.5">Kode <span className="font-mono font-bold">{barang.kode_ambil}</span> sudah tersalin</p>
                </div>
                <button
                  onClick={() => setShowCopyNotif(false)}
                  className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="h-1 bg-gray-100">
                <div className="h-full bg-green-500 animate-shrink" style={{ animationDuration: '3s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        
        .animate-shrink {
          animation: shrink 3s linear;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}