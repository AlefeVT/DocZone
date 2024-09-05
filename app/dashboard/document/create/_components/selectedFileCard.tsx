'use client';

import { FileTextIcon } from 'lucide-react';

interface SelectedFileCardProps {
  fileName: string;
  fileSize: number;
}

export default function SelectedFileCard({
  fileName,
  fileSize,
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
    </div>
  );
}
