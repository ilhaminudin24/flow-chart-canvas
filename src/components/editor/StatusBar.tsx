import { DiagramType } from '@/types/diagram';
import { cn } from '@/lib/utils';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

interface StatusBarProps {
  isValid: boolean;
  isRendering: boolean;
  diagramType: DiagramType;
  codeLength: number;
}

export const StatusBar = ({ isValid, isRendering, diagramType, codeLength }: StatusBarProps) => {
  return (
    <footer className="h-7 bg-muted/30 border-t border-border px-4 flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        {/* Status indicator */}
        <div className="flex items-center gap-1.5">
          {isRendering ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span>Rendering...</span>
            </>
          ) : isValid ? (
            <>
              <Check className="h-3 w-3 text-success" />
              <span>Valid</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3 text-destructive" />
              <span>Syntax Error</span>
            </>
          )}
        </div>

        <div className="w-px h-3 bg-border" />

        {/* Diagram type */}
        <span className="capitalize">{diagramType}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Character count */}
        <span>{codeLength} chars</span>
        
        <div className="w-px h-3 bg-border" />
        
        {/* Keyboard hint */}
        <span className="hidden sm:block">Ctrl+Wheel to zoom</span>
      </div>
    </footer>
  );
};
