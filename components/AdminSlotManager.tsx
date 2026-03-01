"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  setSlotCondition,
  SlotConditionStatus,
  SlotCondition,
} from "@/lib/firebase/slotConditions";
import { useSlotConditions } from "@/hooks/useSlotConditions";
import { useSlotAvailability } from "@/hooks/useSlotAvailability";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Wrench, CheckCircle, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const TOTAL_SLOTS = 50;
const SLOTS_PER_ROW = 10;

type AdminSlotStatus = "available" | "occupied" | "rusak" | "maintenance";

interface EditDialogState {
  open: boolean;
  slotNumber: number | null;
  currentStatus: SlotConditionStatus;
  currentReason: string;
}

export default function AdminSlotManager() {
  const { user } = useAuth();
  const { occupiedSlots } = useSlotAvailability();
  const { conditions, rusakSlots, maintenanceSlots } = useSlotConditions();

  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    slotNumber: null,
    currentStatus: "normal",
    currentReason: "",
  });
  const [newStatus, setNewStatus] = useState<SlotConditionStatus>("rusak");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const getSlotStatus = (slotNumber: number): AdminSlotStatus => {
    if (rusakSlots.includes(slotNumber)) return "rusak";
    if (maintenanceSlots.includes(slotNumber)) return "maintenance";
    if (occupiedSlots.includes(slotNumber)) return "occupied";
    return "available";
  };

  const getSlotClassName = (slotNumber: number): string => {
    const status = getSlotStatus(slotNumber);
    const base =
      "w-12 h-12 rounded-lg font-medium transition-all duration-200 flex items-center justify-center text-sm border-2 cursor-pointer select-none";
    switch (status) {
      case "rusak":
        return `${base} bg-red-500 border-red-600 text-white hover:bg-red-600 hover:scale-105`;
      case "maintenance":
        return `${base} bg-amber-400 border-amber-500 text-white hover:bg-amber-500 hover:scale-105`;
      case "occupied":
        return `${base} bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-300 cursor-not-allowed`;
      default:
        return `${base} bg-green-100 dark:bg-green-900 border-green-500 dark:border-green-600 text-gray-800 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800 hover:scale-105`;
    }
  };

  const handleSlotClick = (slotNumber: number) => {
    const cond = conditions[slotNumber];
    setEditDialog({
      open: true,
      slotNumber,
      currentStatus: cond?.status ?? "normal",
      currentReason: cond?.reason ?? "",
    });
    setNewStatus(
      cond?.status && cond.status !== "normal" ? cond.status : "rusak",
    );
    setReason(cond?.reason ?? "");
  };

  const handleSave = async () => {
    if (!editDialog.slotNumber || !user) return;
    setSaving(true);
    try {
      await setSlotCondition(
        editDialog.slotNumber,
        newStatus,
        reason,
        user.uid,
        user.email ?? "",
      );
      toast.success(
        newStatus === "normal"
          ? `Slot ${editDialog.slotNumber} dikembalikan ke normal`
          : `Slot ${editDialog.slotNumber} ditandai sebagai ${newStatus}`,
      );
      setEditDialog((prev) => ({ ...prev, open: false }));
    } catch {
      toast.error("Gagal menyimpan kondisi slot");
    } finally {
      setSaving(false);
    }
  };

  const rows = Math.ceil(TOTAL_SLOTS / SLOTS_PER_ROW);

  const getStatusBadge = (cond?: SlotCondition) => {
    if (!cond || cond.status === "normal") return null;
    if (cond.status === "rusak")
      return (
        <Badge
          variant="destructive"
          className="gap-1 shrink-0 bg-red-500/90 dark:bg-red-500/80 text-white border-0"
        >
          <AlertTriangle className="h-3 w-3" />
          Rusak
        </Badge>
      );
    return (
      <Badge className="bg-amber-500/90 dark:bg-amber-500/80 text-white border-0 gap-1 shrink-0">
        <Wrench className="h-3 w-3" />
        Maintenance
      </Badge>
    );
  };

  return (
    <>
      {/* ===== MAIN CARD ===== */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 rounded-t-xl px-5 py-4">
          <CardTitle className="flex items-center gap-2 text-white text-base">
            <Wrench className="h-5 w-5" />
            Manajemen Kondisi Slot (Admin)
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-b-xl">
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
            {[
              {
                color:
                  "bg-green-100 dark:bg-green-900 border-green-500 dark:border-green-600",
                label: "Tersedia",
              },
              {
                color:
                  "bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-gray-500",
                label: "Terisi",
              },
              { color: "bg-red-500 border-red-600", label: "Rusak" },
              { color: "bg-amber-400 border-amber-500", label: "Maintenance" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded border-2 ${color}`} />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Klik slot mana saja untuk ubah kondisinya
          </p>

          {/* Slot Grid */}
          <div className="space-y-2">
            {Array.from({ length: rows }, (_, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-2">
                {Array.from({ length: SLOTS_PER_ROW }, (_, colIndex) => {
                  const slotNumber = rowIndex * SLOTS_PER_ROW + colIndex + 1;
                  if (slotNumber > TOTAL_SLOTS) return null;
                  return (
                    <button
                      key={slotNumber}
                      type="button"
                      onClick={() => handleSlotClick(slotNumber)}
                      className={getSlotClassName(slotNumber)}
                    >
                      {slotNumber}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <Separator className="my-5 bg-gray-200 dark:bg-gray-700" />

          {/* Slot Bermasalah Summary */}
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Slot Bermasalah ({rusakSlots.length + maintenanceSlots.length})
            </h4>

            {rusakSlots.length === 0 && maintenanceSlots.length === 0 ? (
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Semua slot dalam kondisi normal
              </div>
            ) : (
              <div className="space-y-2">
                {[...rusakSlots, ...maintenanceSlots]
                  .sort((a: number, b: number) => a - b)
                  .map((slotNum) => {
                    const cond = conditions[slotNum];
                    const isRusak = cond?.status === "rusak";
                    return (
                      <div
                        key={slotNum}
                        className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm border transition-colors ${
                          isRusak
                            ? "bg-red-50/80 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 hover:bg-red-100/80 dark:hover:bg-red-900/40"
                            : "bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100/80 dark:hover:bg-amber-900/40"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span
                            className={`font-bold w-8 shrink-0 ${
                              isRusak
                                ? "text-red-600 dark:text-red-400"
                                : "text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            #{slotNum}
                          </span>
                          {getStatusBadge(cond)}
                          {cond?.reason && (
                            <span className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-[120px] sm:max-w-[200px]">
                              {cond.reason}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleSlotClick(slotNum)}
                          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline shrink-0 ml-2 px-2 py-1 rounded-md transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ===== EDIT DIALOG ===== */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-w-sm p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-xl">
          {/* Dynamic color header */}
          <div
            className={`px-5 py-4 ${
              newStatus === "rusak"
                ? "bg-gradient-to-r from-red-500 to-rose-600"
                : newStatus === "maintenance"
                  ? "bg-gradient-to-r from-amber-400 to-orange-500"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600"
            }`}
          >
            <DialogHeader>
              <DialogTitle className="text-white font-bold flex items-center gap-2">
                {newStatus === "rusak" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : newStatus === "maintenance" ? (
                  <Wrench className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Kondisi Slot #{editDialog.slotNumber}
              </DialogTitle>
              <DialogDescription className="text-white/80 text-sm mt-0.5">
                Ubah status dan tambahkan keterangan kondisi slot ini
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-5 space-y-4 bg-white dark:bg-gray-900">
            {/* Current status info */}
            {editDialog.currentStatus !== "normal" && (
              <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3 text-sm">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-300">
                    Status saat ini:
                  </p>
                  <p className="text-amber-700 dark:text-amber-400 capitalize mt-0.5">
                    {editDialog.currentStatus}
                    {editDialog.currentReason
                      ? ` — ${editDialog.currentReason}`
                      : ""}
                  </p>
                </div>
              </div>
            )}

            {/* Status Select */}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                Status Baru
              </Label>
              <Select
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as SlotConditionStatus)}
              >
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                  <SelectItem value="normal">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-900 dark:text-gray-100">
                        Normal (Berfungsi)
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rusak">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-gray-900 dark:text-gray-100">
                        Rusak
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="maintenance">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-amber-500" />
                      <span className="text-gray-900 dark:text-gray-100">
                        Sedang Maintenance
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reason Textarea */}
            {newStatus !== "normal" && (
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                  Keterangan / Alasan
                </Label>
                <Textarea
                  placeholder="Contoh: Kunci macet, engsel patah, dll."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none rounded-lg"
                />
              </div>
            )}

            {/* Buttons */}
            <DialogFooter className="gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setEditDialog((prev) => ({ ...prev, open: false }))
                }
                className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className={`flex-1 text-white border-0 rounded-lg shadow-md ${
                  newStatus === "rusak"
                    ? "bg-red-600 hover:bg-red-700"
                    : newStatus === "maintenance"
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
