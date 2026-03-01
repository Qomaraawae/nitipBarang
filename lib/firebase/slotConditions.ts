import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";

export type SlotConditionStatus = "normal" | "rusak" | "maintenance";

export interface SlotCondition {
  slotNumber: number;
  status: SlotConditionStatus;
  reason: string;
  updatedAt: Date | null;
  updatedBy: string;
  updatedByEmail: string;
}

// Koleksi Firestore: "slot_conditions"
export const slotConditionsCollection = collection(db, "slot_conditions");

/**
 * Set/update kondisi sebuah slot (hanya admin)
 */
export const setSlotCondition = async (
  slotNumber: number,
  status: SlotConditionStatus,
  reason: string,
  adminUid: string,
  adminEmail: string,
): Promise<void> => {
  const docRef = doc(slotConditionsCollection, `slot_${slotNumber}`);
  await setDoc(
    docRef,
    {
      slotNumber,
      status,
      reason,
      updatedAt: serverTimestamp(),
      updatedBy: adminUid,
      updatedByEmail: adminEmail,
    },
    { merge: true },
  );
};

/**
 * Ambil semua slot yang tidak normal (rusak / maintenance)
 */
export const getProblematicSlots = async (): Promise<SlotCondition[]> => {
  const q = query(slotConditionsCollection, where("status", "!=", "normal"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as SlotCondition);
};

/**
 * Listener realtime untuk semua kondisi slot
 */
export const onSlotConditionsChange = (
  callback: (conditions: Record<number, SlotCondition>) => void,
) => {
  return onSnapshot(slotConditionsCollection, (snapshot) => {
    const result: Record<number, SlotCondition> = {};
    snapshot.docs.forEach((d) => {
      const data = d.data() as SlotCondition;
      result[data.slotNumber] = data;
    });
    callback(result);
  });
};
