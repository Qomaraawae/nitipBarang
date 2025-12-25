import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";
import { Barang } from "@/types/barang";
import { logger } from "@/lib/logger";


export function useBarangRealTime() {
  const [barang, setBarang] = useState<(Barang & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const barangRef = collection(db, "barang");
    const q = query(
      barangRef,
      where("status", "==", "dititipkan"),
      orderBy("waktu_masuk", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as (Barang & { id: string })[];
        
        setBarang(data);
        setLoading(false);
      },
      (error) => {
  logger.error("Error fetching barang:", error);
  setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { barang, loading };
}

// Hook untuk ambil barang by user
export function useBarangByUser(userId: string) {
  const [barang, setBarang] = useState<(Barang & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const barangRef = collection(db, "barang");
    const q = query(
      barangRef,
      where("user_id", "==", userId),
      where("status", "==", "dititipkan"),
      orderBy("waktu_masuk", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as (Barang & { id: string })[];
        
        setBarang(data);
        setLoading(false);
      },
      (error) => {
  logger.error("Error fetching user barang:", {
    userId: userId,
    error: error
  });
  setLoading(false);
});

    return () => unsubscribe();
  }, [userId]);

  return { barang, loading };
}