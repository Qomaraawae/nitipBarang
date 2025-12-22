import { Barang } from "@/types/barang"; // ✅ Fixed import path

interface SlotGridProps {
  barang: (Barang & { id: string })[];
  onSlotClick?: (slot: number) => void;
  selectedSlot?: number;
  maxSlots?: number;
}

export default function SlotGrid({ 
  barang, 
  onSlotClick, 
  selectedSlot,
  maxSlots = 50 
}: SlotGridProps) {
  const slots = Array.from({ length: maxSlots }, (_, i) => i + 1);
  
  const isSlotOccupied = (slotNumber: number) => {
    return barang.some(b => b.slot === slotNumber);
  };

  return (
    <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
      {slots.map((slot) => {
        const occupied = isSlotOccupied(slot);
        const isSelected = selectedSlot === slot;
        
        return (
          <button
            key={slot}
            onClick={() => !occupied && onSlotClick?.(slot)}
            disabled={occupied}
            className={`
              aspect-square rounded-lg font-bold text-lg transition-all duration-200
              ${occupied 
                ? 'bg-red-100 text-red-400 cursor-not-allowed border-2 border-red-200' 
                : isSelected
                  ? 'bg-green-500 text-white shadow-lg scale-110 border-2 border-green-600'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105 border-2 border-blue-200'
              }
            `}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}