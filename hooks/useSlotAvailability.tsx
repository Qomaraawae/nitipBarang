import { useState, useEffect } from "react";
import { barangCollection } from "@/lib/firebase/firestore";
import { query, where, onSnapshot } from "firebase/firestore";

export function useSlotAvailability() {
  const [occupiedSlots, setOccupiedSlots] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query barang yang sedang dititipkan
    const q = query(
      barangCollection,
      where("status", "==", "dititipkan")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const slots = snapshot.docs.map((doc) => doc.data().slot as number);
      setOccupiedSlots(slots);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { occupiedSlots, loading };
}