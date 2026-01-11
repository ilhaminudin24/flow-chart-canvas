import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectTitleProps {
    value: string;
    onChange: (value: string) => void;
}

export const ProjectTitle = ({ value, onChange }: ProjectTitleProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        setIsEditing(false);
        onChange(editValue.trim());
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditValue(value);
        }
    };

    if (isEditing) {
        return (
            <Input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                placeholder="Untitled Project"
                className="h-7 w-40 text-sm font-medium bg-background/50"
            />
        );
    }

    return (
        <button
            onClick={() => setIsEditing(true)}
            className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium',
                'hover:bg-muted/50 transition-colors group cursor-text',
                value ? 'text-foreground' : 'text-muted-foreground'
            )}
            title="Click to edit project title"
        >
            <span className="max-w-[150px] truncate">
                {value || 'Untitled Project'}
            </span>
            <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity" />
        </button>
    );
};
