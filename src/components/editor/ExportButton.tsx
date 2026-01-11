import { useState } from 'react';
import { Download, ChevronDown, Image, FileCode, FileImage, FileText, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { MermaidTheme, DiagramType } from '@/types/diagram';
import { exportAsMermaid, exportAsProject, generateFilename } from '@/lib/mermaidFileUtils';

interface ExportButtonProps {
  svgOutput: string;
  isValid: boolean;
  theme?: MermaidTheme;
  code: string;
  diagramType: DiagramType;
}

// Theme background colors
const themeBackgrounds: Record<MermaidTheme, string> = {
  default: '#ffffff',
  dark: '#0f172a', // slate-900
  forest: '#ecfdf5', // emerald-50
  neutral: '#f5f5f5', // neutral-100
};

export const ExportButton = ({ svgOutput, isValid, theme = 'default', code, diagramType }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const bgColor = themeBackgrounds[theme] || themeBackgrounds.default;

  /**
   * Prepare SVG for export by ensuring proper attributes
   * For SVG export, we add a background rect matching the theme
   */
  const prepareSvgForExport = (svg: string, includeBg: boolean = true): string => {
    // Parse SVG to add necessary attributes
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');

    if (svgElement) {
      // Ensure xmlns is set
      if (!svgElement.hasAttribute('xmlns')) {
        svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }

      // Add background rect at the start if requested
      if (includeBg) {
        const existingBg = svgElement.querySelector('rect.export-bg');
        if (!existingBg) {
          const bgRect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
          bgRect.setAttribute('class', 'export-bg');
          bgRect.setAttribute('width', '100%');
          bgRect.setAttribute('height', '100%');
          bgRect.setAttribute('fill', bgColor);
          svgElement.insertBefore(bgRect, svgElement.firstChild);
        } else {
          // Update existing bg color
          existingBg.setAttribute('fill', bgColor);
        }
      }

      return new XMLSerializer().serializeToString(svgElement);
    }

    return svg;
  };

  /**
   * Export as SVG - direct blob download with theme background
   */
  const exportSvg = (): void => {
    const preparedSvg = prepareSvgForExport(svgOutput, true);
    const blob = new Blob([preparedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = 'diagram.svg';
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
  };

  /**
   * Get SVG dimensions from viewBox or width/height attributes
   */
  const getSvgDimensions = (svg: string): { width: number; height: number } => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');

    if (svgElement) {
      const viewBox = svgElement.getAttribute('viewBox');
      if (viewBox) {
        const parts = viewBox.split(/[\s,]+/).map(Number);
        if (parts.length === 4) {
          // viewBox format: minX minY width height
          return { width: parts[2], height: parts[3] };
        }
      }

      // Fallback to width/height attributes
      const width = parseFloat(svgElement.getAttribute('width') || '800');
      const height = parseFloat(svgElement.getAttribute('height') || '600');
      return { width, height };
    }

    return { width: 800, height: 600 };
  };

  /**
   * Prepare SVG for raster export - set explicit dimensions from viewBox
   */
  const prepareSvgForRasterExport = (svg: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');

    if (svgElement) {
      // Ensure xmlns is set
      if (!svgElement.hasAttribute('xmlns')) {
        svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }

      // Parse viewBox to get real dimensions
      const viewBox = svgElement.getAttribute('viewBox');
      if (viewBox) {
        const parts = viewBox.split(/[\s,]+/).map(Number);
        if (parts.length === 4) {
          const [minX, minY, vbWidth, vbHeight] = parts;
          // Add padding
          const padding = 40;
          const newWidth = vbWidth + padding * 2;
          const newHeight = vbHeight + padding * 2;

          // Update viewBox to include padding
          svgElement.setAttribute('viewBox', `${minX - padding} ${minY - padding} ${newWidth} ${newHeight}`);
          // Set explicit pixel dimensions for Image loading
          svgElement.setAttribute('width', String(newWidth));
          svgElement.setAttribute('height', String(newHeight));
        }
      }

      // Add background rect with theme color
      const existingBg = svgElement.querySelector('rect.export-bg');
      if (!existingBg) {
        const bgRect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('class', 'export-bg');
        bgRect.setAttribute('x', svgElement.getAttribute('viewBox')?.split(/[\s,]+/)[0] || '0');
        bgRect.setAttribute('y', svgElement.getAttribute('viewBox')?.split(/[\s,]+/)[1] || '0');
        bgRect.setAttribute('width', '100%');
        bgRect.setAttribute('height', '100%');
        bgRect.setAttribute('fill', bgColor);
        svgElement.insertBefore(bgRect, svgElement.firstChild);
      } else {
        existingBg.setAttribute('fill', bgColor);
      }

      return new XMLSerializer().serializeToString(svgElement);
    }

    return svg;
  };

  /**
   * Export as PNG or JPG using Canvas with theme background
   */
  const exportRaster = (format: 'png' | 'jpg'): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Prepare SVG with explicit dimensions from viewBox
      const preparedSvg = prepareSvgForRasterExport(svgOutput);
      const dimensions = getSvgDimensions(preparedSvg);

      const blob = new Blob([preparedSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const img = new window.Image();
      img.onload = () => {
        // Create canvas with viewBox dimensions (not CSS dimensions)
        const scale = 3;
        const width = dimensions.width || img.width;
        const height = dimensions.height || img.height;

        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Theme background (already in SVG, but fill canvas too for safety)
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Scale and draw SVG
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to data URL
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const quality = format === 'png' ? 1 : 0.95;
        const dataUrl = canvas.toDataURL(mimeType, quality);

        // Download
        const link = document.createElement('a');
        link.download = `diagram.${format}`;
        link.href = dataUrl;
        link.click();

        URL.revokeObjectURL(url);
        resolve();
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG for export'));
      };

      img.src = url;
    });
  };

  const handleExport = async (format: 'svg' | 'png' | 'jpg') => {
    if (!svgOutput || !isValid) {
      toast({
        title: 'Cannot export',
        description: 'Please fix any errors before exporting.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);

    try {
      switch (format) {
        case 'svg':
          exportSvg();
          break;
        case 'png':
        case 'jpg':
          await exportRaster(format);
          break;
      }

      toast({
        title: 'Export successful',
        description: `Your diagram has been exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'There was an error exporting your diagram.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Handle code export (Mermaid syntax or project file)
   */
  const handleCodeExport = (format: 'mmd' | 'flowilham') => {
    if (!code) {
      toast({
        title: 'Cannot export',
        description: 'No diagram code to export.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const filename = generateFilename(diagramType);

      if (format === 'mmd') {
        exportAsMermaid(code, filename);
      } else {
        exportAsProject(code, diagramType, theme, filename);
      }

      toast({
        title: 'Export successful',
        description: `Your diagram has been exported as ${format === 'mmd' ? '.mmd' : '.flowilham'} file.`,
      });
    } catch (error) {
      console.error('Code export error:', error);
      toast({
        title: 'Export failed',
        description: 'There was an error exporting your diagram.',
        variant: 'destructive',
      });
    }
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="sm"
          disabled={!isValid || !svgOutput || isExporting}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border-border">
        <DropdownMenuItem onClick={() => handleExport('svg')} className="cursor-pointer gap-2">
          <FileCode className="h-4 w-4" />
          <span>SVG (Vector)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('png')} className="cursor-pointer gap-2">
          <Image className="h-4 w-4" />
          <span>PNG (High Quality)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('jpg')} className="cursor-pointer gap-2">
          <FileImage className="h-4 w-4" />
          <span>JPG</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleCodeExport('mmd')} className="cursor-pointer gap-2">
          <FileText className="h-4 w-4" />
          <span>Mermaid Code (.mmd)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCodeExport('flowilham')} className="cursor-pointer gap-2">
          <Database className="h-4 w-4" />
          <span>Project File (.flowilham)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
