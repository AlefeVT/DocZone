import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl: string;
}

export default function ImageViewerModal({
  isOpen,
  onClose,
  fileName,
  fileUrl,
}: ImageViewerModalProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
  }, [isOpen]);

  const handleImageLoad = () => {
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-lg max-w-5xl w-full h-[85vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 rounded-t-lg">
          <h2 className="text-xl font-semibold">{fileName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ✖
          </button>
        </div>
        <div className="flex-grow overflow-hidden relative flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <Loader className="animate-spin h-10 w-10" />
            </div>
          )}
          <Image
            src={fileUrl}
            alt={fileName}
            layout="fill"
            objectFit="contain"
            className="rounded-b-lg"
            onLoadingComplete={handleImageLoad}
          />
        </div>
      </div>
    </div>
  );
}
