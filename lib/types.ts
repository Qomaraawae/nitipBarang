// lib/types.ts
import { Timestamp } from "firebase/firestore";

export interface Barang {
  id?: string;
  nama_pemilik: string;
  no_hp: string;                  // ← TAMBAHKAN INI (wajib)
  // atau optional: no_hp?: string;
  kode_ambil: string;
  slot: number;
  foto_url?: string | null;
  status: "dititipkan" | "diambil" | "kadaluarsa";
  waktu_masuk: Timestamp;
  waktu_keluar?: Timestamp;
  user_id: string;
  created_by_email?: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

// BarangFormData juga tambahkan jika pakai di form
export interface BarangFormData {
  nama_pemilik: string;
  no_hp: string;                  // ← TAMBAHKAN DI SINI JUGA
  kode_ambil: string;
  slot: number;
  foto?: File | null;
}