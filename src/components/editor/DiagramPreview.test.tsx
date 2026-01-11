import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiagramPreview } from '@/components/editor/DiagramPreview';

describe('DiagramPreview', () => {
    const defaultProps = {
        svgOutput: '<svg data-testid="test-svg"></svg>',
        theme: 'default' as const,
        isRendering: false,
        isValid: true,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render the preview container', () => {
            render(<DiagramPreview {...defaultProps} />);

            expect(screen.getByText('Drag to pan')).toBeInTheDocument();
        });

        it('should display SVG output when valid', () => {
            render(<DiagramPreview {...defaultProps} />);

            expect(screen.getByTestId('test-svg')).toBeInTheDocument();
        });

        it('should show loading spinner when rendering', () => {
            render(<DiagramPreview {...defaultProps} isRendering={true} />);

            expect(document.querySelector('.animate-spin')).toBeInTheDocument();
        });

        it('should show error message when not valid', () => {
            render(<DiagramPreview {...defaultProps} isValid={false} svgOutput="" />);

            expect(screen.getByText('Fix syntax errors to see preview')).toBeInTheDocument();
        });

        it('should show placeholder when no SVG output', () => {
            render(<DiagramPreview {...defaultProps} svgOutput="" />);

            expect(screen.getByText('Start typing to see your diagram')).toBeInTheDocument();
        });
    });

    describe('zoom controls', () => {
        it('should render zoom buttons', () => {
            render(<DiagramPreview {...defaultProps} />);

            expect(screen.getByText('100%')).toBeInTheDocument();
        });

        it('should increase zoom when zoom in clicked', () => {
            render(<DiagramPreview {...defaultProps} />);

            const zoomInButton = screen.getAllByRole('button')[1]; // Second button is zoom in
            fireEvent.click(zoomInButton);

            expect(screen.getByText('125%')).toBeInTheDocument();
        });

        it('should decrease zoom when zoom out clicked', () => {
            render(<DiagramPreview {...defaultProps} />);

            const zoomOutButton = screen.getAllByRole('button')[0]; // First button is zoom out
            fireEvent.click(zoomOutButton);

            expect(screen.getByText('75%')).toBeInTheDocument();
        });

        it('should reset zoom when reset clicked', () => {
            render(<DiagramPreview {...defaultProps} />);

            // First zoom in
            const zoomInButton = screen.getAllByRole('button')[1];
            fireEvent.click(zoomInButton);
            fireEvent.click(zoomInButton);

            expect(screen.getByText('150%')).toBeInTheDocument();

            // Then reset
            const resetButton = screen.getAllByRole('button')[2];
            fireEvent.click(resetButton);

            expect(screen.getByText('100%')).toBeInTheDocument();
        });
    });

    describe('theme backgrounds', () => {
        it('should apply correct background for default theme', () => {
            render(<DiagramPreview {...defaultProps} theme="default" />);

            const container = screen.getByText('Drag to pan').closest('.h-full');
            expect(container).toBeInTheDocument();
        });

        it('should apply correct background for dark theme', () => {
            render(<DiagramPreview {...defaultProps} theme="dark" />);

            const previewArea = document.querySelector('.bg-slate-900');
            expect(previewArea).toBeInTheDocument();
        });

        it('should apply correct background for forest theme', () => {
            render(<DiagramPreview {...defaultProps} theme="forest" />);

            const previewArea = document.querySelector('.bg-emerald-50');
            expect(previewArea).toBeInTheDocument();
        });
    });
});
