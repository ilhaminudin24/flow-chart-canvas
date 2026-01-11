import { DiagramType, MermaidTheme, MermaidProjectFile } from '@/types/diagram';

/**
 * Utility functions for exporting and importing Mermaid diagram files
 */

// Diagram type detection patterns
const DIAGRAM_TYPE_PATTERNS: Array<{ pattern: RegExp; type: DiagramType }> = [
    { pattern: /^flowchart\s/im, type: 'flowchart' },
    { pattern: /^graph\s/im, type: 'flowchart' },
    { pattern: /^sequenceDiagram/im, type: 'sequence' },
    { pattern: /^classDiagram/im, type: 'class' },
    { pattern: /^stateDiagram/im, type: 'state' },
    { pattern: /^erDiagram/im, type: 'er' },
    { pattern: /^gantt/im, type: 'gantt' },
    { pattern: /^pie/im, type: 'pie' },
    { pattern: /^mindmap/im, type: 'mindmap' },
    { pattern: /^timeline/im, type: 'timeline' },
    { pattern: /^quadrantChart/im, type: 'quadrant' },
    { pattern: /^gitGraph/im, type: 'gitgraph' },
    { pattern: /^C4Context/im, type: 'c4' },
    { pattern: /^C4Container/im, type: 'c4' },
    { pattern: /^C4Component/im, type: 'c4' },
    { pattern: /^C4Dynamic/im, type: 'c4' },
    { pattern: /^C4Deployment/im, type: 'c4' },
    { pattern: /^sankey/im, type: 'sankey' },
    { pattern: /^block-beta/im, type: 'block' },
    { pattern: /^journey/im, type: 'journey' },
];

/**
 * Detect diagram type from Mermaid code
 */
export function detectDiagramType(code: string): DiagramType {
    const trimmedCode = code.trim();

    for (const { pattern, type } of DIAGRAM_TYPE_PATTERNS) {
        if (pattern.test(trimmedCode)) {
            return type;
        }
    }

    // Default to flowchart if no match
    return 'flowchart';
}

/**
 * Download a file with given content
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
}

/**
 * Export Mermaid code as .mmd file
 */
export function exportAsMermaid(code: string, filename: string = 'diagram'): void {
    downloadFile(code, `${filename}.mmd`, 'text/plain;charset=utf-8');
}

/**
 * Export Mermaid code as .txt file
 */
export function exportAsText(code: string, filename: string = 'diagram'): void {
    downloadFile(code, `${filename}.txt`, 'text/plain;charset=utf-8');
}

/**
 * Export as project file (.flowilham) with metadata
 */
export function exportAsProject(
    code: string,
    diagramType: DiagramType,
    theme: MermaidTheme,
    filename: string = 'diagram',
    title?: string,
    description?: string
): void {
    const projectFile: MermaidProjectFile = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        diagramType,
        theme,
        code,
        title,
        description,
    };

    const content = JSON.stringify(projectFile, null, 2);
    downloadFile(content, `${filename}.flowilham`, 'application/json;charset=utf-8');
}

/**
 * Parse imported file content based on file type
 */
export async function parseImportedFile(file: File): Promise<{
    code: string;
    diagramType?: DiagramType;
    theme?: MermaidTheme;
    title?: string;
    description?: string;
}> {
    const content = await file.text();
    const extension = file.name.split('.').pop()?.toLowerCase();

    // For .flowilham or .json files, try to parse as project file
    if (extension === 'flowilham' || extension === 'json') {
        try {
            const projectFile = JSON.parse(content) as MermaidProjectFile;

            // Validate required fields
            if (!projectFile.code || typeof projectFile.code !== 'string') {
                throw new Error('Invalid project file: missing code');
            }

            return {
                code: projectFile.code,
                diagramType: projectFile.diagramType,
                theme: projectFile.theme,
                title: projectFile.title,
                description: projectFile.description,
            };
        } catch (error) {
            // If JSON parsing fails for .json file, treat as plain text
            if (extension === 'json') {
                throw new Error('Invalid JSON project file');
            }
        }
    }

    // For .mmd and .txt files, treat as raw Mermaid code
    // Auto-detect diagram type from content
    const detectedType = detectDiagramType(content);

    return {
        code: content,
        diagramType: detectedType,
    };
}

/**
 * Validate Mermaid code syntax (basic validation)
 */
export function validateMermaidCode(code: string): { isValid: boolean; error?: string } {
    const trimmedCode = code.trim();

    if (!trimmedCode) {
        return { isValid: false, error: 'Code is empty' };
    }

    // Check if code starts with a known diagram type
    const detectedType = detectDiagramType(trimmedCode);
    const hasValidStart = DIAGRAM_TYPE_PATTERNS.some(({ pattern }) => pattern.test(trimmedCode));

    if (!hasValidStart) {
        // If no known pattern found but there's code, it might still be valid
        // Let Mermaid itself do the final validation
        return { isValid: true };
    }

    return { isValid: true };
}

/**
 * Get accepted file extensions for import
 */
export function getAcceptedFileTypes(): string {
    return '.mmd,.txt,.flowilham,.json';
}

/**
 * Generate suggested filename based on diagram type and current date
 */
export function generateFilename(diagramType: DiagramType): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${diagramType}-${dateStr}`;
}
