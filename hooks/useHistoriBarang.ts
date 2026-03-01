import { useState, useEffect } from "react";
import { historiCollection } from "@/lib/firebase/firestore";
import {
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

export function useHistoriBarang(userId?: string) {
  const [histori, setHistori] = useState<HistoriItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId === undefined) {
      setLoading(false);
      return;
    }

    let q;

    if (userId) {
      // Query HANYA histori dengan jenis "ambil" untuk user tertentu
      q = query(
        historiCollection,
        where("userId", "==", userId),
        where("jenis", "==", "ambil"),
        orderBy("tanggal", "desc"),
      );
    } else {
      // Untuk admin: query semua histori TAPI hanya jenis "ambil"
      q = query(
        historiCollection,
        where("jenis", "==", "ambil"),
        orderBy("tanggal", "desc"),
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as HistoriItem,
        );
        setHistori(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching histori:", error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [userId]);

  return { histori, loading };
}
