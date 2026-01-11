import { useEffect, useCallback } from 'react';

type KeyboardHandler = () => void;

interface ShortcutMap {
    [key: string]: KeyboardHandler;
}

interface UseKeyboardShortcutsOptions {
    undo?: KeyboardHandler;
    redo?: KeyboardHandler;
    save?: KeyboardHandler;
    reset?: KeyboardHandler;
    zoomIn?: KeyboardHandler;
    zoomOut?: KeyboardHandler;
    zoomReset?: KeyboardHandler;
    export?: KeyboardHandler;
    enabled?: boolean;
}

/**
 * Hook for handling keyboard shortcuts in the editor
 * 
 * Default shortcuts:
 * - Ctrl+Z: Undo
 * - Ctrl+Y / Ctrl+Shift+Z: Redo
 * - Ctrl+S: Save/Export
 * - Ctrl+R: Reset
 * - Ctrl+Plus: Zoom In
 * - Ctrl+Minus: Zoom Out
 * - Ctrl+0: Reset Zoom
 * - Ctrl+E: Export dialog
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions) {
    const {
        undo,
        redo,
        save,
        reset,
        zoomIn,
        zoomOut,
        zoomReset,
        export: exportFn,
        enabled = true,
    } = options;

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!enabled) return;

            // Check if user is typing in an input field (except Monaco Editor)
            const target = event.target as HTMLElement;
            const isMonacoEditor = target.closest('.monaco-editor');
            const isInputField = ['INPUT', 'TEXTAREA'].includes(target.tagName) && !isMonacoEditor;

            // Allow shortcuts in Monaco Editor but not in regular inputs
            if (isInputField) return;

            const { key, ctrlKey, metaKey, shiftKey } = event;
            const cmdOrCtrl = ctrlKey || metaKey;

            if (cmdOrCtrl) {
                switch (key.toLowerCase()) {
                    case 'z':
                        if (shiftKey && redo) {
                            event.preventDefault();
                            redo();
                        } else if (!shiftKey && undo) {
                            event.preventDefault();
                            undo();
                        }
                        break;

                    case 'y':
                        if (redo) {
                            event.preventDefault();
                            redo();
                        }
                        break;

                    case 's':
                        if (save) {
                            event.preventDefault();
                            save();
                        }
                        break;

                    case 'r':
                        if (reset) {
                            event.preventDefault();
                            reset();
                        }
                        break;

                    case 'e':
                        if (exportFn) {
                            event.preventDefault();
                            exportFn();
                        }
                        break;

                    case '=':
                    case '+':
                        if (zoomIn) {
                            event.preventDefault();
                            zoomIn();
                        }
                        break;

                    case '-':
                        if (zoomOut) {
                            event.preventDefault();
                            zoomOut();
                        }
                        break;

                    case '0':
                        if (zoomReset) {
                            event.preventDefault();
                            zoomReset();
                        }
                        break;
                }
            }
        },
        [enabled, undo, redo, save, reset, zoomIn, zoomOut, zoomReset, exportFn]
    );

    useEffect(() => {
        if (enabled) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [enabled, handleKeyDown]);
}
