import { useState, useEffect } from "react";
import { barangCollection } from "@/lib/firebase/firestore";
import { query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";

export interface HistoriBarang {
  id: string;
  nama_pemilik: string;
  no_hp: string;
  slot: number;
  foto_url?: string;
  waktu_masuk: Timestamp;
  waktu_keluar?: Timestamp;
  status: "dititipkan" | "diambil";
  kode_ambil: string;
}

export function useHistoriBarang() {
  const [barang, setBarang] = useState<HistoriBarang[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query semua barang yang sudah diambil, diurutkan dari terbaru
    const q = query(
      barangCollection,
      where("status", "==", "diambil"),
      orderBy("waktu_keluar", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as HistoriBarang));
      setBarang(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { barang, loading };
}