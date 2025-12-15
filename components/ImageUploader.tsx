"use client";
import { useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import Toast from "@/components/Toast";

interface Props {
  onUpload: (url: string) => void;
}

export default function ImageUploader({ onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const url = await uploadToCloudinary(file);
      onUpload(url);
      setToast({ message: "Foto berhasil diupload!", type: "success" });
    } catch (err: any) {
      const errorMsg = err.message || "Upload foto gagal!";
      setError(errorMsg);
      setToast({ message: errorMsg, type: "error" });
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={5000}
        />
      )}

      <label className="block w-full cursor-pointer">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-500 transition-colors bg-gray-50 hover:bg-blue-50">
          <div className="flex flex-col items-center justify-center space-y-3">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600 font-medium">Mengunggah foto...</p>
              </>
            ) : (
              <>
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-600 font-medium">Klik untuk upload foto</p>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max. 5MB)</p>
              </>
            )}
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          disabled={uploading}
          className="hidden"
        />
      </label>
      
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}