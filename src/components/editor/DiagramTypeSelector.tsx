import { DiagramType } from '@/types/diagram';
import { diagramTemplates } from '@/lib/diagramTemplates';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DiagramTypeSelectorProps {
  value: DiagramType;
  onChange: (type: DiagramType) => void;
}

export const DiagramTypeSelector = ({ value, onChange }: DiagramTypeSelectorProps) => {
  const currentTemplate = diagramTemplates.find(t => t.type === value);

  return (
    <Select value={value} onValueChange={(v) => onChange(v as DiagramType)}>
      <SelectTrigger className="w-[180px] bg-secondary border-border text-sm">
        <SelectValue>
          <span className="flex items-center gap-2">
            <span>{currentTemplate?.icon}</span>
            <span>{currentTemplate?.name}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-popover border-border max-h-[400px]">
        {diagramTemplates.map((template) => (
          <SelectItem
            key={template.type}
            value={template.type}
            className="cursor-pointer focus:bg-secondary"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{template.icon}</span>
              <div className="flex flex-col">
                <span className="font-medium">{template.name}</span>
                <span className="text-xs text-muted-foreground">{template.description}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
