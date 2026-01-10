import { useRef, useState, useEffect } from 'react';
import { MermaidTheme } from '@/types/diagram';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DiagramPreviewProps {
  svgOutput: string;
  theme: MermaidTheme;
  isRendering: boolean;
  isValid: boolean;
}

export const DiagramPreview = ({ svgOutput, theme, isRendering, isValid }: DiagramPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.25));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.min(Math.max(prev + delta, 0.25), 3));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
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
            className="absolute inset-0 flex items-center justify-center p-8"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: scale }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="diagram-render"
              dangerouslySetInnerHTML={{ __html: svgOutput }}
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
      </div>
    </div>
  );
};
