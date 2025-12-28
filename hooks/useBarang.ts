// hooks/useBarang.ts
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";
import { Barang } from "@/types/barang";

export function useBarangRealTime() {
  const [barang, setBarang] = useState<(Barang & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
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
          setError(null);
        },
        (error) => {
          console.error("Error fetching barang:", {
            message: error.message,
            code: error.code,
            name: error.name
          });
          setError(error.message || "Gagal mengambil data barang");
          setLoading(false);
        }
      );

      return () => {
        try {
          unsubscribe();
        } catch (err) {
          console.error("Error unsubscribing:", err);
        }
      };
    } catch (err: any) {
      console.error("Error in useBarangRealTime:", err);
      setError(err.message || "Terjadi kesalahan");
      setLoading(false);
    }
  }, []);

  return { barang, loading, error };
}

// Hook untuk ambil barang by user
export function useBarangByUser(userId: string) {
  const [barang, setBarang] = useState<(Barang & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
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
          setError(null);
        },
        (error) => {
          console.error("Error fetching user barang:", {
            userId: userId,
            message: error.message,
            code: error.code,
            name: error.name
          });
          setError(error.message || "Gagal mengambil data barang pengguna");
          setLoading(false);
        }
      );

      return () => {
        try {
          unsubscribe();
        } catch (err) {
          console.error("Error unsubscribing user barang:", {
            userId: userId,
            error: err
          });
        }
      };
    } catch (err: any) {
      console.error("Error in useBarangByUser:", err);
      setError(err.message || "Terjadi kesalahan");
      setLoading(false);
    }
  }, [userId]);

  return { barang, loading, error };
}