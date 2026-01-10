import { DiagramType, MermaidTheme } from '@/types/diagram';
import { DiagramTypeSelector } from './DiagramTypeSelector';
import { ThemeSelector } from './ThemeSelector';
import { ExportButton } from './ExportButton';
import { RotateCcw, Github, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ToolbarProps {
  diagramType: DiagramType;
  theme: MermaidTheme;
  isValid: boolean;
  svgOutput: string;
  onDiagramTypeChange: (type: DiagramType) => void;
  onThemeChange: (theme: MermaidTheme) => void;
  onReset: () => void;
}

export const Toolbar = ({
  diagramType,
  theme,
  isValid,
  svgOutput,
  onDiagramTypeChange,
  onThemeChange,
  onReset,
}: ToolbarProps) => {
  return (
    <header className="h-14 bg-toolbar-bg border-b border-border px-4 flex items-center justify-between">
      {/* Left section - Logo & Type selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center glow-ring">
            <span className="text-lg">📊</span>
          </div>
          <h1 className="text-lg font-semibold hidden sm:block">
            <span className="text-gradient">FlowGen</span>
          </h1>
        </div>
        
        <div className="w-px h-6 bg-border hidden sm:block" />
        
        <DiagramTypeSelector value={diagramType} onChange={onDiagramTypeChange} />
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        <ThemeSelector value={theme} onChange={onThemeChange} />
        
        <div className="w-px h-6 bg-border hidden sm:block" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onReset} className="h-8 w-8 p-0">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset to template</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => window.open('https://mermaid.js.org/intro/', '_blank')}
            >
              <FileText className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mermaid Docs</TooltipContent>
        </Tooltip>

        <ExportButton svgOutput={svgOutput} isValid={isValid} />
      </div>
    </header>
  );
};
