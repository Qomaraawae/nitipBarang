import { useState, useEffect } from "react";
import { barangCollection } from "@/lib/firebase/firestore";
import { query, where, onSnapshot } from "firebase/firestore";
import { Barang } from "@/lib/types";

export function useBarangRealTime() {
  const [barang, setBarang] = useState<(Barang & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query tanpa orderBy
    const q = query(
      barangCollection,
      where("status", "==", "dititipkan")
      // orderBy dihapus sementara
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Barang & { id: string }));
      
      // Sort manual di client side
      const sortedData = data.sort((a, b) => {
        const timeA = a.waktu_masuk?.toMillis?.() || 0;
        const timeB = b.waktu_masuk?.toMillis?.() || 0;
        return timeB - timeA; // Descending
      });
      
      setBarang(sortedData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { barang, loading };
}