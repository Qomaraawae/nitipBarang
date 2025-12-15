import { Barang } from "@/lib/types";

const TOTAL_SLOT = 30;

export default function SlotGrid({ barangAktif }: { barangAktif: Barang[] }) {
  const slotTerisi = barangAktif.map((b) => b.slot);

  return (
    <div className="grid grid-cols-6 gap-3">
      {Array.from({ length: TOTAL_SLOT }, (_, i) => i + 1).map((slot) => {
        const terisi = slotTerisi.includes(slot);
        return (
          <div
            key={slot}
            className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl ${
              terisi ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {slot}
          </div>
        );
      })}
    </div>
  );
}