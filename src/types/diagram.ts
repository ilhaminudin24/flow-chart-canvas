export type DiagramType =
  | 'flowchart'
  | 'sequence'
  | 'class'
  | 'state'
  | 'er'
  | 'gantt'
  | 'pie'
  | 'mindmap'
  | 'timeline'
  | 'quadrant'
  | 'gitgraph'
  | 'c4'
  | 'sankey'
  | 'block'
  | 'journey';

export type MermaidTheme = 'default' | 'dark' | 'forest' | 'neutral';

export interface DiagramTemplate {
  type: DiagramType;
  name: string;
  icon: string;
  description: string;
  template: string;
}

export interface EditorState {
  code: string;
  diagramType: DiagramType;
  theme: MermaidTheme;
  isValid: boolean;
  error: string | null;
}

export interface ExportOptions {
  format: 'svg' | 'png' | 'jpg';
  scale: number;
  background: 'transparent' | 'white' | 'dark';
}

export interface MermaidProjectFile {
  version: string;
  createdAt: string;
  updatedAt: string;
  diagramType: DiagramType;
  theme: MermaidTheme;
  code: string;
  title?: string;
  description?: string;
}

export type ImportableFileType = 'mmd' | 'txt' | 'flowilham' | 'json';

