"use client";
import { useAuth } from "@/context/AuthContext";
import { useHistoriBarang } from "@/hooks/useHistoriBarang";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

type PeriodFilter = 'semua' | 'hari-ini' | 'minggu-ini' | 'bulan-ini';

export default function HistoriPage() {
  const { user, loading: authLoading } = useAuth();
  const { barang, loading: dataLoading } = useHistoriBarang();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('semua');

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const hitungDurasi = (masuk: any, keluar: any) => {
    if (!masuk || !keluar) return "-";
    
    try {
      const durasiMs = keluar.toMillis() - masuk.toMillis();
      const durasiJam = Math.floor(durasiMs / (1000 * 60 * 60));
      const durasiMenit = Math.floor((durasiMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (durasiJam > 0) {
        return `${durasiJam} jam ${durasiMenit} menit`;
      }
      return `${durasiMenit} menit`;
    } catch (error) {
      return "-";
    }
  };

  // Filter barang berdasarkan periode
  const filterBarangByPeriod = () => {
    if (selectedPeriod === 'semua') return barang;

    return barang.filter(b => {
      if (!b.waktu_keluar) return false;
      
      const tanggalKeluar = b.waktu_keluar.toDate();
      const sekarang = new Date();

      switch (selectedPeriod) {
        case 'hari-ini':
          return tanggalKeluar.toDateString() === sekarang.toDateString();
        
        case 'minggu-ini':
          const mingguLalu = new Date();
          mingguLalu.setDate(mingguLalu.getDate() - 7);
          return tanggalKeluar >= mingguLalu;
        
        case 'bulan-ini':
          return (
            tanggalKeluar.getMonth() === sekarang.getMonth() &&
            tanggalKeluar.getFullYear() === sekarang.getFullYear()
          );
        
        default:
          return true;
      }
    });
  };

  const filteredBarang = filterBarangByPeriod();

  // Hitung statistik
  const hariIniCount = barang.filter(b => {
    if (!b.waktu_keluar) return false;
    const today = new Date().toDateString();
    return b.waktu_keluar.toDate().toDateString() === today;
  }).length;

  const mingguIniCount = barang.filter(b => {
    if (!b.waktu_keluar) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return b.waktu_keluar.toDate() >= weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Histori Aktivitas</h1>
              <p className="text-gray-500 mt-1">Riwayat barang yang sudah diambil</p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Histori</p>
                <p className="text-3xl font-bold text-gray-800">{dataLoading ? "..." : barang.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Hari Ini</p>
                <p className="text-3xl font-bold text-gray-800">{dataLoading ? "..." : hariIniCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Minggu Ini</p>
                <p className="text-3xl font-bold text-gray-800">{dataLoading ? "..." : mingguIniCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Periode */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Filter Periode</h3>
              <p className="text-sm text-gray-500">Pilih rentang waktu untuk menampilkan histori</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedPeriod('semua')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  selectedPeriod === 'semua'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Semua
              </button>
              
              <button
                onClick={() => setSelectedPeriod('hari-ini')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  selectedPeriod === 'hari-ini'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Hari Ini
              </button>
              
              <button
                onClick={() => setSelectedPeriod('minggu-ini')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  selectedPeriod === 'minggu-ini'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Minggu Ini
              </button>
              
              <button
                onClick={() => setSelectedPeriod('bulan-ini')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  selectedPeriod === 'bulan-ini'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Bulan Ini
              </button>
            </div>
          </div>
        </div>

        {/* Histori List */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Daftar Riwayat</h2>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                {filteredBarang.length} Items
              </span>
            </div>
          </div>

          <div className="p-6">
            {dataLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-500">Memuat histori...</p>
              </div>
            ) : filteredBarang.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  {selectedPeriod === 'semua' ? 'Belum ada histori' : 'Tidak ada data untuk periode ini'}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {selectedPeriod === 'semua' 
                    ? 'Riwayat pengambilan barang akan muncul di sini'
                    : 'Coba pilih periode lain untuk melihat data'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBarang.map((b) => (
                  <div
                    key={b.id}
                    className="group bg-gradient-to-r from-gray-50 to-white hover:from-purple-50 hover:to-indigo-50 border border-gray-200 hover:border-purple-300 rounded-xl p-6 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Foto */}
                      <div className="flex-shrink-0">
                        {b.foto_url ? (
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                            <Image
                              src={b.foto_url}
                              alt="Foto barang"
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Pemilik</p>
                          <p className="text-lg font-bold text-gray-800">{b.nama_pemilik}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Slot</p>
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                              {b.slot}
                            </div>
                            <span className="text-sm text-gray-600">Kode: <strong className="text-gray-800">{b.kode_ambil}</strong></span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">Waktu Masuk</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {b.waktu_masuk?.toDate().toLocaleString('id-ID', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            }) || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">Waktu Keluar</p>
                          <p className="text-sm font-semibold text-green-600">
                            {b.waktu_keluar?.toDate().toLocaleString('id-ID', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            }) || "-"}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500 mb-1">Durasi Penitipan</p>
                          <div className="inline-flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-lg border border-purple-100">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-bold text-purple-700">
                              {hitungDurasi(b.waktu_masuk, b.waktu_keluar)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}