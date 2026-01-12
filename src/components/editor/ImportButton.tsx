import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { DiagramType, MermaidTheme } from '@/types/diagram';
import { parseImportedFile, getAcceptedFileTypes } from '@/lib/mermaidFileUtils';

interface ImportButtonProps {
    onImport: (data: {
        code: string;
        diagramType?: DiagramType;
        theme?: MermaidTheme;
        title?: string;
    }) => void;
}

export const ImportButton = ({ onImport }: ImportButtonProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const maxFileSize = 1 * 1024 * 1024;

            if (file.size > maxFileSize) {
                throw new Error('File size exceeds maximum limit of 1MB');
            }

            const allowedExtensions = ['mmd', 'txt', 'flowilham', 'json'];
            const fileExtension = file.name.split('.').pop()?.toLowerCase();

            if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
                throw new Error('Invalid file type. Only .mmd, .txt, .flowilham, and .json files are allowed.');
            }

            const data = await parseImportedFile(file);

            onImport({
                code: data.code,
                diagramType: data.diagramType,
                theme: data.theme,
                title: data.title,
            });

            toast({
                title: 'Import successful',
                description: `Loaded "${file.name}" successfully.`,
            });
        } catch (error) {
            console.error('Import error:', error);
            toast({
                title: 'Import failed',
                description: error instanceof Error ? error.message : 'Failed to import file.',
                variant: 'destructive',
            });
        }

        event.target.value = '';
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept={getAcceptedFileTypes()}
                onChange={handleFileChange}
                className="hidden"
                aria-label="Import diagram file"
            />
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClick}
                        className="h-8 w-8 p-0"
                        aria-label="Import diagram"
                    >
                        <Upload className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Import Diagram (Ctrl+O)</TooltipContent>
            </Tooltip>
        </>
    );
};
