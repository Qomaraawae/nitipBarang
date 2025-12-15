"use client";
import { useEffect } from "react";

interface SuccessNotificationProps {
  show: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function SuccessNotification({ 
  show, 
  title, 
  message, 
  onClose 
}: SuccessNotificationProps) {
  useEffect(() => {
    if (show) {
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden pointer-events-auto animate-slideInUp">
        {/* Header with Green Gradient */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-base whitespace-pre-line">{message}</p>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 animate-progressBar"></div>
        </div>
      </div>
    </div>
  );
}