"use client";

import { X } from "lucide-react";
import { Button } from "@/components/atoms";

interface PdfPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfData: string | null;
  title?: string;
  subtitle?: string;
}

export function PdfPreviewModal({
  open,
  onOpenChange,
  pdfData,
  title = "PDF Preview",
  subtitle,
}: PdfPreviewModalProps) {
  if (!open) return null;

  const pdfDataUrl = pdfData
    ? `data:application/pdf;base64,${pdfData}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full h-[95vh] overflow-hidden flex flex-col border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              {subtitle && (
                <p className="text-sm text-gray-500">{subtitle}</p>
              )}
            </div>

            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              aria-label="Close preview"
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-gray-100 min-h-0">
          {pdfDataUrl ? (
            <div className="w-full h-full p-4 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-lg shadow-inner border border-gray-200 overflow-hidden">
                <iframe
                  src={pdfDataUrl}
                  className="w-full h-full border-0"
                  title="PDF Preview"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-12">
              <div className="text-center">
                <p className="text-gray-500">No PDF data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex-shrink-0 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
