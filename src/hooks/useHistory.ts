import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
    past: T[];
    present: T;
    future: T[];
}

interface UseHistoryReturn<T> {
    state: T;
    set: (newState: T | ((prev: T) => T)) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    clear: () => void;
}

const MAX_HISTORY_LENGTH = 50;

export function useHistory<T>(initialPresent: T): UseHistoryReturn<T> {
    const [history, setHistory] = useState<HistoryState<T>>({
        past: [],
        present: initialPresent,
        future: [],
    });

    // Track if the current change should be batched with the previous one
    const batchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastChangeTimeRef = useRef<number>(0);
    const BATCH_THRESHOLD_MS = 500;

    const set = useCallback((newState: T | ((prev: T) => T)) => {
        setHistory((prevHistory) => {
            const resolvedNewState =
                typeof newState === 'function'
                    ? (newState as (prev: T) => T)(prevHistory.present)
                    : newState;

            // Don't add to history if the state hasn't changed
            if (JSON.stringify(resolvedNewState) === JSON.stringify(prevHistory.present)) {
                return prevHistory;
            }

            const now = Date.now();
            const timeSinceLastChange = now - lastChangeTimeRef.current;
            lastChangeTimeRef.current = now;

            // Batch rapid changes to avoid filling history with every keystroke
            if (timeSinceLastChange < BATCH_THRESHOLD_MS && prevHistory.past.length > 0) {
                // Update present without adding to history (batch with previous)
                return {
                    ...prevHistory,
                    present: resolvedNewState,
                    future: [], // Clear future on any new change
                };
            }

            // Limit history length
            const newPast = [...prevHistory.past, prevHistory.present].slice(-MAX_HISTORY_LENGTH);

            return {
                past: newPast,
                present: resolvedNewState,
                future: [], // Clear future on new change
            };
        });
    }, []);

    const undo = useCallback(() => {
        setHistory((prevHistory) => {
            if (prevHistory.past.length === 0) return prevHistory;

            const previous = prevHistory.past[prevHistory.past.length - 1];
            const newPast = prevHistory.past.slice(0, -1);

            return {
                past: newPast,
                present: previous,
                future: [prevHistory.present, ...prevHistory.future],
            };
        });
    }, []);

    const redo = useCallback(() => {
        setHistory((prevHistory) => {
            if (prevHistory.future.length === 0) return prevHistory;

            const next = prevHistory.future[0];
            const newFuture = prevHistory.future.slice(1);

            return {
                past: [...prevHistory.past, prevHistory.present],
                present: next,
                future: newFuture,
            };
        });
    }, []);

    const clear = useCallback(() => {
        setHistory((prevHistory) => ({
            past: [],
            present: prevHistory.present,
            future: [],
        }));
    }, []);

    return {
        state: history.present,
        set,
        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        clear,
    };
}
