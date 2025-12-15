import { Timestamp } from "firebase/firestore";

export type StatusBarang = "dititipkan" | "diambil" | "hilang";

export interface Barang {
  // HAPUS BARIS INI: id: string;
  nama_pemilik: string;
  no_hp: string;
  deskripsi?: string;
  slot: number;
  foto_url?: string;
  waktu_masuk: Timestamp;
  waktu_keluar?: Timestamp | null;
  status: StatusBarang;
  kode_ambil: string;
  created_at: Timestamp;
}