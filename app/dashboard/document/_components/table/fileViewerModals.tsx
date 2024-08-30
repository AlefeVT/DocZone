
import { FileData } from '@/interfaces/FileData';
import PdfViewerModal from '../PdfViewerModal';
import ImageViewerModal from '../ImageViewerModal';

export function FileViewerModals({
  selectedFile,
  fileUrl,
  setSelectedFile,
}: {
  selectedFile: FileData | null;
  fileUrl: string | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<FileData | null>>;
}) {
  return (
    <>
      {selectedFile && selectedFile.fileType === 'application/pdf' && (
        <PdfViewerModal
          isOpen={!!selectedFile}
          onClose={() => setSelectedFile(null)}
          fileName={selectedFile.fileName}
          fileUrl={fileUrl!}
        />
      )}

      {selectedFile && selectedFile.fileType.startsWith('image/') && (
        <ImageViewerModal
          isOpen={!!selectedFile}
          onClose={() => setSelectedFile(null)}
          fileName={selectedFile.fileName}
          fileUrl={fileUrl!}
        />
      )}
    </>
  );
}
