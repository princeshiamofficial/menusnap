"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
    value?: string | number | null;
    onSave: (newValue: string) => void;
    placeholder?: string;
    multiline?: boolean;
    className?: string;
    inputClassName?: string;
}

export const EditableField = ({
    value,
    onSave,
    placeholder = "Click to edit",
    multiline = false,
    className = '',
    inputClassName = ''
}: EditableFieldProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(String(value || ''));
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => {
        setCurrentValue(String(value || ''));
    }, [value]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (String(value || '') !== currentValue) {
            onSave(currentValue);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter' && !multiline) {
            handleSave();
            e.preventDefault();
        } else if (e.key === 'Escape') {
            setCurrentValue(String(value || ''));
            setIsEditing(false);
        }
    };

    if (isEditing) {
        const commonProps = {
            ref: inputRef as any,
            value: currentValue,
            onChange: (e: React.ChangeEvent<any>) => setCurrentValue(e.target.value),
            onBlur: handleSave,
            onKeyDown: handleKeyDown,
            className: cn(
                "bg-yellow-100/50 dark:bg-yellow-900/50 border-primary ring-primary focus-visible:ring-primary p-1 -m-1 rounded-md transition-all",
                inputClassName
            ),
        };

        return multiline ? (
            <Textarea {...commonProps} rows={2} />
        ) : (
            <Input {...commonProps} type={typeof value === 'number' ? 'number' : 'text'} />
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={cn("hover:bg-primary/10 p-1 -m-1 rounded-md cursor-pointer group relative min-h-[24px]", className)}
            role="button"
            tabIndex={0}
            onFocus={() => setIsEditing(true)}
        >
            {value || <span className="text-muted-foreground italic">{placeholder}</span>}
            <Edit3 className="h-3 w-3 text-muted-foreground absolute top-1/2 -translate-y-1/2 right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};
