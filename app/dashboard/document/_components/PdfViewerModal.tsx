import { Loader } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl: string;
}

export default function PdfViewerModal({
  isOpen,
  onClose,
  fileName,
  fileUrl,
}: PdfViewerModalProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
  }, [isOpen]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-lg max-w-5xl w-full h-[85vh]">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 rounded-t-lg">
          <h2 className="text-xl font-semibold">{fileName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ✖
          </button>
        </div>
        <div className="h-[calc(100%-3.5rem)] overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <Loader className="animate-spin h-10 w-10" />
            </div>
          )}
          <iframe
            src={fileUrl}
            className="w-full h-full rounded-b-lg"
            style={{
              border: 'none',
            }}
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
    </div>
  );
}
