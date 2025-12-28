"use client";
import { useState, useCallback } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import Toast from "@/components/Toast";

interface Props {
  onUpload: (url: string) => void;
}

export default function ImageUploader({ onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran file (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      setToast({ 
        message: "Ukuran file maksimal 5MB", 
        type: "error" 
      });
      return;
    }

    // Validasi tipe file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError("Format file harus JPG, PNG, atau WebP");
      setToast({ 
        message: "Format file harus JPG, PNG, atau WebP", 
        type: "error" 
      });
      return;
    }

    setError("");
    setUploading(true);

    try {
      const url = await uploadToCloudinary(file);
      onUpload(url);
      setToast({ 
        message: "Foto berhasil diupload!", 
        type: "success" 
      });
    } catch (err: any) {
      const errorMsg = err.message || "Upload foto gagal!";
      setError(errorMsg);
      setToast({ 
        message: errorMsg, 
        type: "error" 
      });
    } finally {
      setUploading(false);
      if (e.target) {
        e.target.value = ""; // Reset input
      }
    }
  }, [onUpload]);

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}

      <label className="block w-full cursor-pointer" aria-label="Upload foto barang">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 transition-colors bg-gray-50 hover:bg-blue-50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              document.getElementById('file-upload')?.click();
            }
          }}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            {uploading ? (
              <>
                <div 
                  className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" 
                  role="status"
                  aria-label="Mengunggah foto"
                />
                <p className="text-sm text-gray-600 font-medium">
                  Mengunggah foto...
                </p>
                <p className="text-xs text-gray-500">
                  Mohon tunggu
                </p>
              </>
            ) : (
              <>
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm text-gray-600 font-medium">
                  Klik untuk upload foto
                </p>
                <p className="text-xs text-gray-500 text-center">
                  PNG, JPG, JPEG, WebP<br />(Max. 5MB)
                </p>
              </>
            )}
          </div>
        </div>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          disabled={uploading}
          className="hidden"
          aria-describedby="file-upload-description"
        />
      </label>

      <p id="file-upload-description" className="sr-only">
        Upload foto barang untuk penitipan. Format yang didukung: PNG, JPG, JPEG, WebP. Ukuran maksimal: 5MB.
      </p>

      {error && (
        <div 
          className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}