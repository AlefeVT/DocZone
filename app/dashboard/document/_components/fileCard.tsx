import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import Image from 'next/image';
import {
  FileTextIcon,
  FileSpreadsheetIcon,
  EyeIcon,
  Download,
  MoreHorizontal,
  Edit2, // Ícone de editar
  Trash2, // Ícone de excluir
} from 'lucide-react';
import { useState } from 'react';
import PdfViewerModal from './PdfViewerModal';
import ImageViewerModal from './ImageViewerModal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface FileData {
  id: string;
  fileName: string;
  fileType: string;
  createdAt: string;
  url: string;
}

interface FileCardProps {
  file: FileData;
  url_signed_file: string;
}

export default function FileCard({ file, url_signed_file }: FileCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <>
      <Card key={file.id} className="w-[350px] relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{file.fileName}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link
                    href={`/dashboard/document/${file.id}`}
                    className="flex items-center"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Link
                    href={`/dashboard/document/${file.id}/delete`}
                    className="flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <a
                    href={url_signed_file}
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </a>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center cursor-pointer"
                >
                  <EyeIcon className="h-5 w-5 mr-2" />
                  Visualizar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
      </Card>

      {file.fileType === 'application/pdf' && (
        <PdfViewerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          fileName={file.fileName}
          fileUrl={file.url}
        />
      )}

      {file.fileType.startsWith('image/') && (
        <ImageViewerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          fileName={file.fileName}
          fileUrl={url_signed_file}
        />
      )}
    </>
  );
}
