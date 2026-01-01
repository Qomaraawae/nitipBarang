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
              flex items-center justify-center border-2
              ${occupied 
                ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                : isSelected
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white shadow-lg scale-105 border-transparent'
                  : 'bg-white dark:bg-gray-900 border-green-500 dark:border-green-400 text-gray-700 dark:text-gray-300 hover:border-green-600 dark:hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:shadow-sm'
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