import { MermaidTheme } from '@/types/diagram';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Palette } from 'lucide-react';

interface ThemeSelectorProps {
  value: MermaidTheme;
  onChange: (theme: MermaidTheme) => void;
}

const themes: { value: MermaidTheme; label: string; preview: string }[] = [
  { value: 'default', label: 'Default', preview: 'bg-blue-500' },
  { value: 'dark', label: 'Dark', preview: 'bg-slate-700' },
  { value: 'forest', label: 'Forest', preview: 'bg-green-600' },
  { value: 'neutral', label: 'Neutral', preview: 'bg-gray-500' },
];

export const ThemeSelector = ({ value, onChange }: ThemeSelectorProps) => {
  const currentTheme = themes.find(t => t.value === value);

  return (
    <Select value={value} onValueChange={(v) => onChange(v as MermaidTheme)}>
      <SelectTrigger className="w-[140px] bg-secondary border-border text-sm">
        <SelectValue>
          <span className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <span>{currentTheme?.label}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-popover border-border">
        {themes.map((theme) => (
          <SelectItem
            key={theme.value}
            value={theme.value}
            className="cursor-pointer focus:bg-secondary"
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded ${theme.preview}`} />
              <span>{theme.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
