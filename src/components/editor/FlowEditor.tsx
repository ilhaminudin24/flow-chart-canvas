import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDiagramEditor } from '@/hooks/useDiagramEditor';
import { Toolbar } from './Toolbar';
import { CodeEditor } from './CodeEditor';
import { DiagramPreview } from './DiagramPreview';
import { StatusBar } from './StatusBar';
import { Code2, Eye, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'split' | 'code' | 'preview';

export const FlowEditor = () => {
  const {
    code,
    diagramType,
    theme,
    isValid,
    error,
    svgOutput,
    isRendering,
    setCode,
    setDiagramType,
    setTheme,
    resetToTemplate,
  } = useDiagramEditor();

  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [splitPosition, setSplitPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isResizing) return;
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPosition(Math.min(Math.max(position, 20), 80));
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toolbar
        diagramType={diagramType}
        theme={theme}
        isValid={isValid}
        svgOutput={svgOutput}
        onDiagramTypeChange={setDiagramType}
        onThemeChange={setTheme}
        onReset={resetToTemplate}
      />

      {/* View mode tabs (mobile) */}
      <div className="flex sm:hidden border-b border-border bg-muted/30">
        {[
          { mode: 'code' as const, icon: Code2, label: 'Code' },
          { mode: 'preview' as const, icon: Eye, label: 'Preview' },
        ].map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors',
              viewMode === mode
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Main content area */}
      <main
        className="flex-1 flex overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Code Editor Panel */}
        <motion.div
          className={cn(
            'flex flex-col border-r border-border overflow-hidden',
            viewMode === 'preview' && 'hidden sm:flex'
          )}
          style={{ width: viewMode === 'split' ? `${splitPosition}%` : viewMode === 'code' ? '100%' : undefined }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Panel header */}
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Editor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn('status-dot', isValid ? 'success' : 'bg-destructive')} />
              <span className="text-xs text-muted-foreground hidden sm:block">
                {isValid ? 'Ready' : 'Error'}
              </span>
            </div>
          </div>
          <div className="flex-1 editor-container">
            <CodeEditor
              code={code}
              onChange={setCode}
              isValid={isValid}
              error={error}
            />
          </div>
        </motion.div>

        {/* Resize handle (desktop split view) */}
        {viewMode === 'split' && (
          <div
            className="hidden sm:flex w-1 bg-border hover:bg-primary/50 cursor-col-resize items-center justify-center transition-colors group"
            onMouseDown={handleMouseDown}
          >
            <GripVertical className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        )}

        {/* Preview Panel */}
        <motion.div
          className={cn(
            'flex-1 flex flex-col overflow-hidden',
            viewMode === 'code' && 'hidden sm:flex'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Panel header */}
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Preview</span>
            </div>
            {isRendering && (
              <span className="text-xs text-muted-foreground animate-pulse">
                Rendering...
              </span>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <DiagramPreview
              svgOutput={svgOutput}
              theme={theme}
              isRendering={isRendering}
              isValid={isValid}
            />
          </div>
        </motion.div>
      </main>

      <StatusBar
        isValid={isValid}
        isRendering={isRendering}
        diagramType={diagramType}
        codeLength={code.length}
      />
    </div>
  );
};
