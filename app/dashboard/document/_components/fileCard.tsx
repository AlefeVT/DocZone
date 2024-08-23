import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { FileTextIcon, FileIcon, FileSpreadsheetIcon } from 'lucide-react'; 

interface FileData {
  id: string;
  fileName: string;
  fileType: string;
  createdAt: string;
  url: string;
}

interface FileCardProps {
  file: FileData;
}

export default function FileCard({ file }: FileCardProps) {
  const renderFilePreview = () => {
    if (file.fileType.startsWith('image/')) {
      return (
        <Image
          src={file.url}
          alt={file.fileName}
          width={200}
          height={200}
          className="w-full h-auto max-h-48 object-cover"
        />
      );
    } else if (file.fileType === 'application/pdf') {
      return <FileTextIcon className="h-36 w-36 text-gray-500" />;
    } else if (
      file.fileType.startsWith('application/vnd.ms-excel') ||
      file.fileType.startsWith(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
    ) {
      return <FileSpreadsheetIcon className="h-36 w-36 text-gray-500" />;
    } else {
      return <FileTextIcon className="h-36 w-36 text-gray-500" />;
    }
  };

  return (
    <Card key={file.id} className="w-[350px]">
      <CardHeader>
        <CardTitle>{file.fileName}</CardTitle>
        <CardDescription>Tipo: {file.fileType}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">
          Criado em: {new Date(file.createdAt).toLocaleString()}
        </p>
        <div className="flex justify-center items-center h-48 mb-2">
          {renderFilePreview()}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <a
          href={file.url}
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download
        </a>
      </CardFooter>
    </Card>
  );
}
