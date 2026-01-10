import { useState } from 'react';
import { toPng, toSvg, toJpeg } from 'html-to-image';
import { Download, ChevronDown, Image, FileCode, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

interface ExportButtonProps {
  svgOutput: string;
  isValid: boolean;
}

export const ExportButton = ({ svgOutput, isValid }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const createExportContainer = () => {
    const container = document.createElement('div');
    container.style.cssText = 'position: absolute; left: -9999px; top: -9999px; background: white; padding: 40px;';
    container.innerHTML = svgOutput;
    document.body.appendChild(container);
    return container;
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
      let dataUrl: string;
      const container = createExportContainer();

      switch (format) {
        case 'svg':
          dataUrl = await toSvg(container, { quality: 1, backgroundColor: 'white' });
          break;
        case 'png':
          dataUrl = await toPng(container, { quality: 1, pixelRatio: 3, backgroundColor: 'white' });
          break;
        case 'jpg':
          dataUrl = await toJpeg(container, { quality: 0.95, backgroundColor: 'white' });
          break;
      }

      document.body.removeChild(container);

      // Download
      const link = document.createElement('a');
      link.download = `diagram.${format}`;
      link.href = dataUrl;
      link.click();

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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
