"use client";

import { useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface Props {
  onScan: (kode: string) => void;
}

export default function BarcodeScanner({ onScan }: Props) {
  const [scanning, setScanning] = useState(false);

  const startScan = () => {
    setScanning(true);
    const html5Qrcode = new Html5Qrcode("reader");

    html5Qrcode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          html5Qrcode.stop();
          setScanning(false);
        },
        (error) => {
          console.warn(error);
        }
      )
      .catch((err) => {
        alert("Gagal akses kamera: " + err);
        setScanning(false);
      });
  };

  return (
    <div className="space-y-6">
      <button
        onClick={startScan}
        disabled={scanning}
        className="w-full py-6 bg-green-600 text-white rounded-xl font-bold text-2xl"
      >
        {scanning ? "Scanning..." : "SCAN KODE AMBIL"}
      </button>
      {scanning && <div id="reader" className="w-full rounded-lg overflow-hidden"></div>}
    </div>
  );
}