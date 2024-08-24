'use client';

import { FileTextIcon, X } from 'lucide-react';

interface SelectedFileCardProps {
  fileName: string;
  fileSize: number;
  onRemove: () => void;
}

export default function SelectedFileCard({
  fileName,
  fileSize,
  onRemove,
}: SelectedFileCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm dark:bg-gray-800 dark:border-gray-600">
      <div className="flex items-center">
        <div className="mr-4">
          <FileTextIcon />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {fileName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {Math.round(fileSize / 1024)} KB
          </p>
        </div>
      </div>
      <button
        type="button"
        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
        onClick={onRemove}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
