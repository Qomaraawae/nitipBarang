'use client';

import { useEffect, useState } from "react";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { notFound } from "next/navigation";
import Image from "next/image";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DetailBarang({ params }: PageProps) {
  const [barang, setBarang] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { id } = await params;
        console.log("🔍 Mencari barang dengan kode_ambil:", id);
        
        // Query Firestore untuk mencari dokumen berdasarkan kode_ambil
        const q = query(collection(db, "barang"), where("kode_ambil", "==", id));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          console.log("❌ Tidak ada barang dengan kode_ambil:", id);
          notFound();
          return;
        }

        // Ambil dokumen pertama yang cocok
        const doc = querySnapshot.docs[0];
        const data = { id: doc.id, ...doc.data() };
        console.log("✅ Barang ditemukan:", data);
        setBarang(data);
      } catch (error) {
        console.error("❌ Error saat mengambil data:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params]);

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

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Status Badge */}
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
              {/* Info Section */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Kode Ambil</label>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-blue-600">{barang.kode_ambil}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(barang.kode_ambil)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Copy kode"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

              {/* Photo Section */}
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

        {/* Action Buttons */}
        {barang.status === 'dititipkan' && (
          <div className="mt-6">
            <a
              href={(() => {
                // Format nomor WhatsApp
                let phone = barang.no_hp.replace(/\D/g, '');
                if (phone.startsWith('0')) phone = '62' + phone.substring(1);
                if (!phone.startsWith('62')) phone = '62' + phone;
                
                // Format pesan dengan template literal
                const message = encodeURIComponent(
                  `Halo ${barang.nama_pemilik}!

Barang kamu sudah aman tersimpan nih!

Lokasi: Slot *${barang.slot}*
Kode Ambil: *${barang.kode_ambil}*

Jangan lupa simpan kode ini ya! Kamu butuh kode ini untuk ambil barang nanti.

Cek detail: ${window.location.href}`
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
      </div>
    </div>
  );
}