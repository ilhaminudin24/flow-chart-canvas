import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        get length() {
            return Object.keys(store).length;
        },
        key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock Mermaid
vi.mock('mermaid', () => ({
    default: {
        initialize: vi.fn(),
        render: vi.fn().mockResolvedValue({ svg: '<svg data-testid="mermaid-svg"></svg>' }),
        parse: vi.fn().mockResolvedValue(true),
    },
}));

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
    default: vi.fn(({ value, onChange }) => (
        <textarea
            data-testid="monaco-editor"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
        />
    )),
}));

// Mock html-to-image
vi.mock('html-to-image', () => ({
    toPng: vi.fn().mockResolvedValue('data:image/png;base64,mock'),
    toSvg: vi.fn().mockResolvedValue('data:image/svg+xml;base64,mock'),
    toJpeg: vi.fn().mockResolvedValue('data:image/jpeg;base64,mock'),
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});
