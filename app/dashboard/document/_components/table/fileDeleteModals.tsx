import { Button } from '@/components/ui/button';
import { FileData } from '@/interfaces/FileData';
import axios from 'axios';
import { toast } from 'sonner';

export function FileDeleteModals({
  isDeleteModalOpen,
  isSingleDeleteModalOpen,
  fileToDelete,
  closeModal,
  closeSingleDeleteModal,
  setFiles,
  files,
  rowSelection,
  setRowSelection,
}: {
  isDeleteModalOpen: boolean;
  isSingleDeleteModalOpen: boolean;
  fileToDelete: FileData | null;
  closeModal: () => void;
  closeSingleDeleteModal: () => void;
  setFiles: React.Dispatch<React.SetStateAction<FileData[]>>;
  files: FileData[];
  rowSelection: Record<string, boolean>;
  setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const handleDeleteFiles = async () => {
    const selectedFileIds = Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((index) => files[parseInt(index)].id);

    if (selectedFileIds.length === 0) {
      toast.error('Você deve selecionar pelo menos um arquivo para excluir.');
      return;
    }

    try {
      await axios.post('/api/remove-media', { fileIds: selectedFileIds });
      toast.success('Documentos excluídos com sucesso!');
      setFiles(files.filter((file) => !selectedFileIds.includes(file.id)));
    } catch (error) {
      console.error('Error deleting files:', error);
      toast.error('Erro ao excluir os documentos.');
    } finally {
      closeModal();
      setRowSelection({});
    }
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      await axios.post('/api/remove-media', { fileIds: [fileToDelete.id] });
      toast.success('Documento excluído com sucesso!');
      setFiles(files.filter((file) => file.id !== fileToDelete.id));
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Erro ao excluir o documento.');
    } finally {
      closeSingleDeleteModal();
    }
  };

  return (
    <>
      {isDeleteModalOpen && (
        <div id="delete-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-lg font-semibold mb-4">Você tem certeza absoluta?</h2>
            <p className="text-gray-700 mb-6">
              Essa ação não pode ser desfeita. Isso excluirá permanentemente os documentos selecionados e removerá todos os dados de nossos servidores.
            </p>
            <div className="flex justify-end space-x-4">
              <Button variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteFiles}>
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {isSingleDeleteModalOpen && (
        <div id="single-delete-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-lg font-semibold mb-4">Você tem certeza que deseja excluir este documento?</h2>
            <p className="text-gray-700 mb-6">
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o documento e removerá todos os dados de nossos servidores.
            </p>
            <div className="flex justify-end space-x-4">
              <Button variant="secondary" onClick={closeSingleDeleteModal}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteFile}>
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
