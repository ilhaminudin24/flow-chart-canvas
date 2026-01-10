import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  isValid: boolean;
  error: string | null;
}

export const CodeEditor = ({ code, onChange, isValid, error }: CodeEditorProps) => {
  return (
    <div className="h-full flex flex-col">
      <Suspense
        fallback={
          <div className="flex-1 p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        }
      >
        <MonacoEditor
          height="100%"
          defaultLanguage="markdown"
          value={code}
          onChange={(value) => onChange(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace',
            lineHeight: 22,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            renderLineHighlight: 'gutter',
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
          }}
        />
      </Suspense>
      
      {/* Error display */}
      {!isValid && error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20 animate-fade-in">
          <p className="text-sm text-destructive font-mono truncate">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};
