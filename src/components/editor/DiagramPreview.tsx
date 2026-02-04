import { useRef, useState, useEffect, MutableRefObject, useCallback } from 'react';
import { MermaidTheme } from '@/types/diagram';
import { motion, useMotionValue } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Move, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { sanitizeSvg } from '@/lib/svgSanitizer';

interface ZoomControls {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
}

interface EditState {
  isEditing: boolean;
  originalText: string;
  newText: string;
  position: { x: number; y: number };
}

interface DiagramPreviewProps {
  svgOutput: string;
  theme: MermaidTheme;
  isRendering: boolean;
  isValid: boolean;
  zoomRef?: MutableRefObject<ZoomControls>;
  onRename?: (oldText: string, newText: string) => void;
}

export const DiagramPreview = ({
  svgOutput,
  theme,
  isRendering,
  isValid,
  zoomRef,
  onRename
}: DiagramPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [scale, setScale] = useState(1);
  // Use motion values for pan position (no re-render on change)
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  // Edit state
  const [editState, setEditState] = useState<EditState>({
    isEditing: false,
    originalText: '',
    newText: '',
    position: { x: 0, y: 0 }
  });

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.25));
  const handleReset = () => {
    setScale(1);
    panX.set(0);
    panY.set(0);
  };

  // Expose zoom controls via ref for keyboard shortcuts
  useEffect(() => {
    if (zoomRef) {
      zoomRef.current = {
        zoomIn: handleZoomIn,
        zoomOut: handleZoomOut,
        reset: handleReset,
      };
    }
  }, [zoomRef]);

  // Focus input when editing starts
  useEffect(() => {
    if (editState.isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editState.isEditing]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.min(Math.max(prev + delta, 0.25), 5));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking on editable text or already editing
    if (editState.isEditing) return;

    if (e.button === 0) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startX: panX.get(),
        startY: panY.get()
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      panX.set(dragStartRef.current.startX + deltaX);
      panY.set(dragStartRef.current.startY + deltaY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  /**
   * Get text from the nearest text element for a clicked SVG element
   * This handles cases where user clicks on rect/path but we need the sibling text
   */
  const findTextForElement = (element: Element): string | null => {
    // If it's already a text/tspan, return its content
    if (element.tagName.toLowerCase() === 'tspan') {
      return element.textContent?.trim() || null;
    }
    if (element.tagName.toLowerCase() === 'text') {
      const tspan = element.querySelector('tspan');
      return tspan ? tspan.textContent?.trim() || null : element.textContent?.trim() || null;
    }

    // For rect/path with .actor class, find sibling text with same class
    const parent = element.parentElement;
    if (parent) {
      // Look for sibling text element
      const siblingText = parent.querySelector('text.actor, text.messageText, text');
      if (siblingText) {
        const tspan = siblingText.querySelector('tspan');
        return tspan ? tspan.textContent?.trim() || null : siblingText.textContent?.trim() || null;
      }
    }

    return null;
  };

  /**
   * Handle click on diagram - detect text elements for editing
   */
  const handleDiagramClick = useCallback((e: React.MouseEvent) => {
    if (!onRename || isDragging) return;

    const target = e.target as Element;
    const tagName = target.tagName.toLowerCase();

    let text = '';

    // Direct click on tspan - cleanest case
    if (tagName === 'tspan') {
      text = target.textContent?.trim() || '';
    }
    // Direct click on text element
    else if (tagName === 'text') {
      const tspan = target.querySelector('tspan');
      text = tspan ? tspan.textContent?.trim() || '' : target.textContent?.trim() || '';
    }
    // Click on rect/path/polygon (shape elements) - find associated text
    else if (['rect', 'path', 'polygon', 'circle', 'ellipse', 'line'].includes(tagName)) {
      // Check if this is an actor box or node shape
      if (target.classList.contains('actor') || target.closest('.actor') || target.closest('.node')) {
        text = findTextForElement(target) || '';
      }
    }
    // Click on foreignObject content (flowchart nodes use this)
    else if (target.closest('foreignObject')) {
      const fo = target.closest('foreignObject');
      if (fo) {
        // Get the label div inside foreignObject
        const labelDiv = fo.querySelector('.nodeLabel, .label, span, div');
        if (labelDiv) {
          // Use innerText to avoid getting nested styles
          text = (labelDiv as HTMLElement).innerText?.trim() || '';
        }
      }
    }
    // Click on span/div inside SVG (some Mermaid diagrams use HTML in foreignObject)
    else if (tagName === 'span' || tagName === 'div' || tagName === 'p') {
      text = (target as HTMLElement).innerText?.trim() || '';
    }

    // Only proceed if we found valid text
    if (!text) return;

    // Filter out CSS-like content (safety check)
    if (text.includes('{') || text.includes('}') || text.match(/#[a-f0-9]{6,}/i)) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    setEditState({
      isEditing: true,
      originalText: text,
      newText: text,
      position: {
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top
      }
    });
  }, [onRename, isDragging]);

  const handleEditSubmit = () => {
    if (editState.newText && editState.newText !== editState.originalText) {
      onRename?.(editState.originalText, editState.newText);
    }
    setEditState({
      isEditing: false,
      originalText: '',
      newText: '',
      position: { x: 0, y: 0 }
    });
  };

  const handleEditCancel = () => {
    setEditState({
      isEditing: false,
      originalText: '',
      newText: '',
      position: { x: 0, y: 0 }
    });
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleEditCancel();
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const bgClass = theme === 'dark' ? 'bg-slate-900' : theme === 'forest' ? 'bg-emerald-50' : 'bg-white';

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          className="h-7 w-7 p-0"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground min-w-[50px] text-center font-mono">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          className="h-7 w-7 p-0"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-7 w-7 p-0"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Edit3 className="h-3 w-3" />
          <span>Click text to edit</span>
          <span className="mx-1">|</span>
          <Move className="h-3 w-3" />
          <span>Drag to pan</span>
        </div>
      </div>

      {/* Preview area */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1 overflow-hidden relative',
          bgClass,
          editState.isEditing ? 'cursor-default' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />

        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isValid && !isRendering && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-muted-foreground">Fix syntax errors to see preview</p>
            </div>
          </div>
        )}

        {isValid && svgOutput && (
          <motion.div
            ref={diagramRef}
            className="absolute inset-0 flex items-center justify-center p-8"
            style={{
              x: panX,
              y: panY,
              scale: scale,
              touchAction: 'none'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            onClick={handleDiagramClick}
          >
            <div
              className={cn(
                "diagram-render",
                onRename && "[&_text]:cursor-pointer [&_text]:hover:fill-primary [&_.nodeLabel]:cursor-pointer [&_.actor]:cursor-pointer"
              )}
              dangerouslySetInnerHTML={{ __html: sanitizeSvg(svgOutput) }}
            />
          </motion.div>
        )}

        {!svgOutput && isValid && !isRendering && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6 text-muted-foreground">
              <p>Start typing to see your diagram</p>
            </div>
          </div>
        )}

        {/* Inline Edit Overlay */}
        {editState.isEditing && (
          <div
            className="absolute z-50"
            style={{
              left: editState.position.x,
              top: editState.position.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="bg-popover border border-border rounded-lg shadow-lg p-2 flex gap-2 items-center">
              <Input
                ref={inputRef}
                value={editState.newText}
                onChange={(e) => setEditState(prev => ({ ...prev, newText: e.target.value }))}
                onKeyDown={handleEditKeyDown}
                onBlur={handleEditSubmit}
                className="h-8 w-40 text-sm"
                placeholder="Enter new name..."
              />
              <Button size="sm" className="h-8" onClick={handleEditSubmit}>
                Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

