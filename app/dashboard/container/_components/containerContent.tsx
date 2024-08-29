import { FileData } from '@/interfaces/FileData';
import { ContainerTable } from './containerTable';
import { ContainerTableSkeleton } from './containerTableSkeleton';

export function Content({
  loading,
  viewMode,
  containers,
}: {
  loading: boolean;
  viewMode: 'cards' | 'table';
  containers: FileData[];
}) {
  if (loading) {
    return viewMode === 'cards' ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div>aa</div>
        ))}
      </div>
    ) : (
      <ContainerTableSkeleton />
    );
  }

  return viewMode === 'cards' ? (
    <div>aa</div>
  ) : (
    <ContainerTable containers={containers} />
  );
}
