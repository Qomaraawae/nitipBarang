import { Timestamp } from "firebase/firestore";

export interface Barang {
  id?: string;
  nama_pemilik: string;
  kode_ambil: string;
  slot: number;
  foto_url?: string;
  status: "dititipkan" | "diambil";
  waktu_masuk: Timestamp;
  waktu_keluar?: Timestamp;
  user_id: string;
  created_by_email?: string;
}

export interface BarangFormData {
  nama_pemilik: string;
  foto?: File | null;
  slot?: number;
}