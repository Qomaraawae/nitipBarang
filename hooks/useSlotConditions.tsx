import { useEffect, useState } from "react";
import {
  SlotCondition,
  onSlotConditionsChange,
} from "@/lib/firebase/slotConditions";

interface UseSlotConditionsReturn {
  conditions: Record<number, SlotCondition>;
  rusakSlots: number[];
  maintenanceSlots: number[];
  loading: boolean;
}

export function useSlotConditions(): UseSlotConditionsReturn {
  const [conditions, setConditions] = useState<Record<number, SlotCondition>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSlotConditionsChange((data) => {
      setConditions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const rusakSlots = Object.values(conditions)
    .filter((c) => c.status === "rusak")
    .map((c) => c.slotNumber);

  const maintenanceSlots = Object.values(conditions)
    .filter((c) => c.status === "maintenance")
    .map((c) => c.slotNumber);

  return { conditions, rusakSlots, maintenanceSlots, loading };
}
