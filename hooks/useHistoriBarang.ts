// hooks/useHistoriBarang.ts
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

export interface HistoriItem {
  id: string;
  userId: string;
  jenis: "titip" | "ambil";
  barangId?: string;
  namaBarang: string;
  namaPemilik: string;
  slot: number;
  kodeAmbil: string;
  tanggal: Timestamp;
  status: "berhasil" | "gagal";
  catatan?: string;
}

export function useHistoriBarang(
  userId?: string,
  jenisFilter?: "titip" | "ambil" | "semua",
) {
  const [histori, setHistori] = useState<HistoriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const constraints: any[] = [];
    const historiCollection = collection(db, "histori");

    // HANYA filter userId jika ada (untuk user biasa)
    // Jika userId undefined (admin), ambil SEMUA data
    if (userId) {
      constraints.push(where("userId", "==", userId));
    }

    // Filter jenis
    if (jenisFilter && jenisFilter !== "semua") {
      constraints.push(where("jenis", "==", jenisFilter));
    }

    constraints.push(orderBy("tanggal", "desc"));

    const q = query(historiCollection, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as HistoriItem[];
        setHistori(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error:", error);
        setError(error.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId, jenisFilter]);

  return { histori, loading, error };
}
