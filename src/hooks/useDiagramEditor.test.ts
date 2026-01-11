import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDiagramEditor } from '@/hooks/useDiagramEditor';

// Mock the diagram templates
vi.mock('@/lib/diagramTemplates', () => ({
    getDefaultCode: vi.fn((type: string) => {
        const templates: Record<string, string> = {
            flowchart: 'flowchart TD\n    A[Start] --> B[End]',
            sequence: 'sequenceDiagram\n    A->>B: Hello',
            class: 'classDiagram\n    class Animal',
        };
        return templates[type] || templates.flowchart;
    }),
}));

describe('useDiagramEditor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('initialization', () => {
        it('should initialize with default state when localStorage is empty', () => {
            const { result } = renderHook(() => useDiagramEditor());

            expect(result.current.diagramType).toBe('flowchart');
            expect(result.current.theme).toBe('default');
            expect(result.current.isValid).toBe(true);
            expect(result.current.error).toBeNull();
        });

        it('should load state from localStorage when available', () => {
            const savedState = {
                code: 'flowchart LR\n    A --> B',
                diagramType: 'sequence',
                theme: 'dark',
                isValid: true,
                error: null,
            };
            localStorage.setItem('flowgen-diagram-state', JSON.stringify(savedState));

            const { result } = renderHook(() => useDiagramEditor());

            expect(result.current.diagramType).toBe('sequence');
            expect(result.current.theme).toBe('dark');
            expect(result.current.code).toBe('flowchart LR\n    A --> B');
        });

        it('should handle corrupted localStorage gracefully', () => {
            localStorage.setItem('flowgen-diagram-state', 'invalid-json');

            const { result } = renderHook(() => useDiagramEditor());

            expect(result.current.diagramType).toBe('flowchart');
            expect(result.current.theme).toBe('default');
        });
    });

    describe('setCode', () => {
        it('should update code state', () => {
            const { result } = renderHook(() => useDiagramEditor());
            const newCode = 'flowchart LR\n    X --> Y';

            act(() => {
                result.current.setCode(newCode);
            });

            expect(result.current.code).toBe(newCode);
        });

        it('should debounce rendering', async () => {
            const { result } = renderHook(() => useDiagramEditor());

            act(() => {
                result.current.setCode('flowchart TD\n    A --> B');
                result.current.setCode('flowchart TD\n    A --> C');
                result.current.setCode('flowchart TD\n    A --> D');
            });

            // Fast forward past debounce time
            await act(async () => {
                vi.advanceTimersByTime(350);
            });

            expect(result.current.code).toBe('flowchart TD\n    A --> D');
        });
    });

    describe('setDiagramType', () => {
        it('should update diagram type and load corresponding template', () => {
            const { result } = renderHook(() => useDiagramEditor());

            act(() => {
                result.current.setDiagramType('sequence');
            });

            expect(result.current.diagramType).toBe('sequence');
            expect(result.current.code).toContain('sequenceDiagram');
        });
    });

    describe('setTheme', () => {
        it('should update theme', () => {
            const { result } = renderHook(() => useDiagramEditor());

            act(() => {
                result.current.setTheme('dark');
            });

            expect(result.current.theme).toBe('dark');
        });
    });

    describe('resetToTemplate', () => {
        it('should reset code to original template', () => {
            const { result } = renderHook(() => useDiagramEditor());

            act(() => {
                result.current.setCode('modified code');
            });

            expect(result.current.code).toBe('modified code');

            act(() => {
                result.current.resetToTemplate();
            });

            expect(result.current.code).toContain('flowchart TD');
        });
    });

    describe('localStorage persistence', () => {
        it('should save state to localStorage on changes', async () => {
            vi.useRealTimers(); // Use real timers for this test
            const { result } = renderHook(() => useDiagramEditor());

            act(() => {
                result.current.setTheme('forest');
            });

            // Wait for the useEffect to run
            await waitFor(() => {
                const saved = localStorage.getItem('flowgen-diagram-state');
                expect(saved).not.toBeNull();
                if (saved) {
                    const parsed = JSON.parse(saved);
                    expect(parsed.theme).toBe('forest');
                }
            });
        });
    });
});
