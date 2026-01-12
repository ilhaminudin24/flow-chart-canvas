import { useState, useCallback, useEffect, useRef } from 'react';
import { DiagramType, MermaidTheme, EditorState } from '@/types/diagram';
import { getDefaultCode } from '@/lib/diagramTemplates';
import { useHistory } from './useHistory';
import mermaid from 'mermaid';

const STORAGE_KEY = 'flowgen-diagram-state';
const DEBOUNCE_MS = 300;

interface EditorSettings {
  diagramType: DiagramType;
  theme: MermaidTheme;
  projectTitle: string;
}

export const useDiagramEditor = () => {
  // Settings (diagram type, theme, projectTitle) - not part of undo/redo history
  const [settings, setSettings] = useState<EditorSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          diagramType: parsed.diagramType || 'flowchart',
          theme: parsed.theme || 'default',
          projectTitle: parsed.projectTitle || '',
        };
      } catch {
        // ignore
      }
    }
    return {
      diagramType: 'flowchart' as DiagramType,
      theme: 'default' as MermaidTheme,
      projectTitle: '',
    };
  });

  // Code with undo/redo history
  const getInitialCode = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.code || getDefaultCode('flowchart');
      } catch {
        // ignore
      }
    }
    return getDefaultCode('flowchart');
  };

  const codeHistory = useHistory<string>(getInitialCode());

  // Validation state
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [svgOutput, setSvgOutput] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: settings.theme,
      // Use 'strict' security level to prevent XSS vulnerabilities
      securityLevel: 'strict',
      maxTextSize: 50000,
      fontFamily: 'Inter, system-ui, sans-serif',
      // Disable HTML labels to use SVG text elements which render more reliably
      flowchart: {
        htmlLabels: false,
      },
    });
  }, [settings.theme]);

  // Render diagram
  const renderDiagram = useCallback(async (code: string, theme: MermaidTheme) => {
    if (!code.trim()) {
      setSvgOutput('');
      setIsValid(true);
      setError(null);
      return;
    }

    setIsRendering(true);

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme,
        // Use 'strict' security level to prevent XSS vulnerabilities
        securityLevel: 'strict',
        maxTextSize: 50000,
        fontFamily: 'Inter, system-ui, sans-serif',
        // Disable HTML labels to use SVG text elements which render more reliably
        flowchart: {
          htmlLabels: false,
        },
      });

      const { svg } = await mermaid.render(`mermaid-${Date.now()}`, code);
      setSvgOutput(svg);
      setIsValid(true);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid diagram syntax';
      setIsValid(false);
      setError(errorMessage);
    } finally {
      setIsRendering(false);
    }
  }, []);

  // Debounced render
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      renderDiagram(codeHistory.state, settings.theme);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [codeHistory.state, settings.theme, renderDiagram]);

  // Save to localStorage
  useEffect(() => {
    const state: EditorState = {
      code: codeHistory.state,
      diagramType: settings.diagramType,
      theme: settings.theme,
      projectTitle: settings.projectTitle,
      isValid,
      error,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [codeHistory.state, settings, isValid, error]);

  const setCode = useCallback((code: string) => {
    codeHistory.set(code);
  }, [codeHistory]);

  const setDiagramType = useCallback((diagramType: DiagramType) => {
    const newCode = getDefaultCode(diagramType);
    setSettings(prev => ({ ...prev, diagramType }));
    codeHistory.set(newCode);
    codeHistory.clear(); // Clear history when changing diagram type
  }, [codeHistory]);

  const setTheme = useCallback((theme: MermaidTheme) => {
    setSettings(prev => ({ ...prev, theme }));
  }, []);

  const setProjectTitle = useCallback((projectTitle: string) => {
    setSettings(prev => ({ ...prev, projectTitle }));
  }, []);

  const resetToTemplate = useCallback(() => {
    const newCode = getDefaultCode(settings.diagramType);
    codeHistory.set(newCode);
  }, [settings.diagramType, codeHistory]);

  /**
   * Import a project/diagram with optional metadata
   */
  const importProject = useCallback((data: {
    code: string;
    diagramType?: DiagramType;
    theme?: MermaidTheme;
    title?: string;
  }) => {
    if (data.code) {
      codeHistory.set(data.code);
    }
    if (data.diagramType || data.theme || data.title !== undefined) {
      setSettings(prev => ({
        ...prev,
        ...(data.diagramType && { diagramType: data.diagramType }),
        ...(data.theme && { theme: data.theme }),
        ...(data.title !== undefined && { projectTitle: data.title }),
      }));
    }
  }, [codeHistory]);

  return {
    code: codeHistory.state,
    diagramType: settings.diagramType,
    theme: settings.theme,
    projectTitle: settings.projectTitle,
    isValid,
    error,
    svgOutput,
    isRendering,
    setCode,
    setDiagramType,
    setTheme,
    setProjectTitle,
    resetToTemplate,
    importProject,
    // Undo/Redo
    undo: codeHistory.undo,
    redo: codeHistory.redo,
    canUndo: codeHistory.canUndo,
    canRedo: codeHistory.canRedo,
  };
};
