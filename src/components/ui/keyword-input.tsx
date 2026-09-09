"use client";

import React, { useState, KeyboardEvent, ClipboardEvent } from "react";
import { PlusCircle, X, Info, Sparkles, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface KeywordInputProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  label?: string;
  tooltipText?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  suggestions?: string[];
  onSave?: () => void;
  isSaving?: boolean;
}

export function KeywordInput({
  keywords = [],
  onChange,
  label = "Keywords",
  tooltipText = "Add keywords or aliases to help match and search items automatically.",
  placeholder = "Add your keywords",
  disabled = false,
  className,
  suggestions = [],
  onSave,
  isSaving = false,
}: KeywordInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addKeywords = (text: string) => {
    if (!text || disabled) return;

    // Split by comma, semicolon, or newline
    const items = text
      .split(/[,;\n]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (items.length === 0) return;

    const existingLower = new Set(keywords.map((k) => k.toLowerCase()));
    const newItems: string[] = [];

    for (const item of items) {
      if (!existingLower.has(item.toLowerCase())) {
        existingLower.add(item.toLowerCase());
        newItems.push(item);
      }
    }

    if (newItems.length > 0) {
      onChange([...keywords, ...newItems]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeywords(inputValue);
    } else if (e.key === ",") {
      e.preventDefault();
      addKeywords(inputValue);
    } else if (e.key === "Backspace" && !inputValue && keywords.length > 0) {
      onChange(keywords.slice(0, -1));
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.includes(",") || pastedText.includes(";") || pastedText.includes("\n")) {
      e.preventDefault();
      addKeywords(pastedText);
    }
  };

  const handleRemove = (kwToRemove: string) => {
    if (disabled) return;
    onChange(keywords.filter((k) => k.toLowerCase() !== kwToRemove.toLowerCase()));
  };

  const handleAddSuggestion = (sug: string) => {
    addKeywords(sug);
  };

  const handleAddAllSuggestions = () => {
    if (suggestions.length === 0) return;
    addKeywords(suggestions.join(", "));
  };

  // Filter out suggestions that are already in keywords
  const activeSuggestions = suggestions.filter(
    (sug) => !keywords.some((kw) => kw.toLowerCase() === sug.toLowerCase())
  );

  return (
    <div className={cn("space-y-3.5 w-full", className)}>
      {/* Label & Info Icon Header */}
      {label && (
        <div className="flex items-center gap-1.5">
          <span className="text-sm sm:text-base font-medium text-foreground/90">
            {label}
          </span>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center justify-center rounded-full focus:outline-hidden"
                  tabIndex={-1}
                >
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                {tooltipText}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Input Field + Plus Action */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={disabled}
            className="h-11 text-sm sm:text-base bg-white dark:bg-zinc-900/90 border border-gray-300 dark:border-zinc-700 text-foreground focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg placeholder:text-muted-foreground/60 shadow-2xs"
          />
        </div>
        <button
          type="button"
          onClick={() => addKeywords(inputValue)}
          disabled={disabled || !inputValue.trim()}
          title="Add keyword"
          className={cn(
            "text-blue-500 hover:text-blue-600 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all p-1 rounded-full flex items-center justify-center shrink-0"
          )}
        >
          <PlusCircle className="w-8 h-8 stroke-[1.5]" />
        </button>
      </div>

      {/* Keyword Badges / Chips */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {keywords.map((kw, index) => (
            <div
              key={`${kw}-${index}`}
              className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-[8px] border border-gray-400/80 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 text-sm font-normal shadow-2xs hover:border-zinc-600 dark:hover:border-zinc-400 transition-all select-none group"
            >
              <span>{kw}</span>
              <button
                type="button"
                onClick={() => handleRemove(kw)}
                disabled={disabled}
                className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 p-0.5 rounded-xs transition-colors"
                title={`Remove "${kw}"`}
              >
                <X className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Suggested Keywords (if available) */}
      {activeSuggestions.length > 0 && (
        <div className="pt-2 border-t border-dashed border-border/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Suggested keywords:
            </span>
            <button
              type="button"
              onClick={handleAddAllSuggestions}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              + Add all suggestions
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeSuggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleAddSuggestion(sug)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-medium bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
              >
                <Plus className="w-3 h-3 text-blue-500" />
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
