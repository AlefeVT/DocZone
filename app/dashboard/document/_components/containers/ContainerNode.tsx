import { ChevronRight, Package, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/interfaces/ContainerTree';

interface ContainerNodeProps {
  container: Container;
  isOpen: boolean;
  onSelect: (containerId: string) => void;
  onToggle: (containerId: string) => void;
  openContainers: string[];
  isRoot: boolean;
}

const ContainerNode = ({
  container,
  isOpen,
  onSelect,
  onToggle,
  openContainers,
}: ContainerNodeProps) => {
  const handleSelectContainer = () => {
    onSelect(container.id);
  };

  return (
    <div className="pl-4">
      <Button
        onClick={() => {
          if (container.children.length === 0) {
            handleSelectContainer();
          }
          onToggle(container.id);
        }}
        className="flex p-4 items-center text-blue-600 hover:text-blue-800"
        variant="ghost"
        title={container.description || ''}
      >
        {container.children.length > 0 ? (
          <ChevronRight
            className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`}
            size={20}
          />
        ) : (
          <ExternalLink
            size={15}
            className="mr-2"
            onClick={handleSelectContainer}
          />
        )}
        <Package className="mr-2" size={20} />
        {container.name}
      </Button>
      {isOpen && container.children.length > 0 && (
        <div className="pl-4">
          {container.children.map((child) => (
            <ContainerNode
              key={child.id}
              container={child}
              isOpen={openContainers.includes(child.id)}
              onSelect={onSelect}
              onToggle={onToggle}
              openContainers={openContainers}
              isRoot={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContainerNode;
