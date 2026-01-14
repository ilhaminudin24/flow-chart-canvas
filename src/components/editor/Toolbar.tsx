import { DiagramType, MermaidTheme } from '@/types/diagram';
import { DiagramTypeSelector } from './DiagramTypeSelector';
import { ThemeSelector } from './ThemeSelector';
import { ExportButton } from './ExportButton';
import { ImportButton } from './ImportButton';
import { ProjectTitle } from './ProjectTitle';
import { RotateCcw, FileText, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ToolbarProps {
  diagramType: DiagramType;
  theme: MermaidTheme;
  projectTitle: string;
  isValid: boolean;
  svgOutput: string;
  code: string;
  onDiagramTypeChange: (type: DiagramType) => void;
  onThemeChange: (theme: MermaidTheme) => void;
  onProjectTitleChange: (title: string) => void;
  onReset: () => void;
  onImport: (data: { code: string; diagramType?: DiagramType; theme?: MermaidTheme; title?: string }) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const Toolbar = ({
  diagramType,
  theme,
  projectTitle,
  isValid,
  svgOutput,
  code,
  onDiagramTypeChange,
  onThemeChange,
  onProjectTitleChange,
  onReset,
  onImport,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}: ToolbarProps) => {
  return (
    <header className="h-14 bg-toolbar-bg border-b border-border px-4 flex items-center justify-between">
      {/* Left section - Logo & Type selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center glow-ring overflow-hidden">
            <img src="/logo.png" alt="FlowGen Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-lg font-semibold hidden sm:block">
            <span className="text-gradient">FlowGen</span>
          </h1>
        </div>

        <div className="w-px h-6 bg-border hidden sm:block" />

        <ProjectTitle value={projectTitle} onChange={onProjectTitleChange} />

        <div className="w-px h-6 bg-border hidden sm:block" />

        <DiagramTypeSelector value={diagramType} onChange={onDiagramTypeChange} />
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-1">
        {/* Undo/Redo buttons */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-8 w-8 p-0"
              aria-label="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-8 w-8 p-0"
              aria-label="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

        <ThemeSelector value={theme} onChange={onThemeChange} />

        <div className="w-px h-6 bg-border hidden sm:block" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 w-8 p-0"
              aria-label="Reset to template"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset to template (Ctrl+R)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => window.open('https://mermaid.js.org/intro/', '_blank')}
              aria-label="Mermaid documentation"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mermaid Docs</TooltipContent>
        </Tooltip>

        <ImportButton onImport={onImport} />

        <ExportButton svgOutput={svgOutput} isValid={isValid} theme={theme} code={code} diagramType={diagramType} projectTitle={projectTitle} />
      </div>
    </header>
  );
};
