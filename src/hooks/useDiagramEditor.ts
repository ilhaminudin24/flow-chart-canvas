import { useState, useCallback, useEffect, useRef } from 'react';
import { DiagramType, MermaidTheme, EditorState } from '@/types/diagram';
import { getDefaultCode } from '@/lib/diagramTemplates';
import mermaid from 'mermaid';

const STORAGE_KEY = 'flowgen-diagram-state';
const DEBOUNCE_MS = 300;

export const useDiagramEditor = () => {
  const [state, setState] = useState<EditorState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      code: getDefaultCode('flowchart'),
      diagramType: 'flowchart' as DiagramType,
      theme: 'default' as MermaidTheme,
      isValid: true,
      error: null
    };
  });

  const [svgOutput, setSvgOutput] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: state.theme,
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
    });
  }, [state.theme]);

  // Render diagram
  const renderDiagram = useCallback(async (code: string, theme: MermaidTheme) => {
    if (!code.trim()) {
      setSvgOutput('');
      setState(prev => ({ ...prev, isValid: true, error: null }));
      return;
    }

    setIsRendering(true);
    
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme,
        securityLevel: 'loose',
        fontFamily: 'Inter, system-ui, sans-serif',
      });

      const { svg } = await mermaid.render(`mermaid-${Date.now()}`, code);
      setSvgOutput(svg);
      setState(prev => ({ ...prev, isValid: true, error: null }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid diagram syntax';
      setState(prev => ({ ...prev, isValid: false, error: errorMessage }));
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
      renderDiagram(state.code, state.theme);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [state.code, state.theme, renderDiagram]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setCode = useCallback((code: string) => {
    setState(prev => ({ ...prev, code }));
  }, []);

  const setDiagramType = useCallback((diagramType: DiagramType) => {
    const newCode = getDefaultCode(diagramType);
    setState(prev => ({ ...prev, diagramType, code: newCode }));
  }, []);

  const setTheme = useCallback((theme: MermaidTheme) => {
    setState(prev => ({ ...prev, theme }));
  }, []);

  const resetToTemplate = useCallback(() => {
    const newCode = getDefaultCode(state.diagramType);
    setState(prev => ({ ...prev, code: newCode }));
  }, [state.diagramType]);

  return {
    code: state.code,
    diagramType: state.diagramType,
    theme: state.theme,
    isValid: state.isValid,
    error: state.error,
    svgOutput,
    isRendering,
    setCode,
    setDiagramType,
    setTheme,
    resetToTemplate
  };
};
