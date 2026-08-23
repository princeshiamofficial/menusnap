"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import Ruler from "@/components/editor/google-docs/ruler";

interface SummernoteEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  readOnly?: boolean;
  minHeight?: number;
  hideRuler?: boolean;
}

declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

export default function SummernoteEditor({
  initialContent = "",
  onChange,
  readOnly = false,
  minHeight = 450,
  hideRuler = false,
}: SummernoteEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const isInitializedRef = useRef(false);
  const [margins, setMargins] = useState({ left: 56, right: 56, indent: 0, tabStops: [] as any[] });

  useEffect(() => {
    let isMounted = true;

    const loadScript = (src: string, id: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.id = id;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.body.appendChild(script);
      });
    };

    const loadStyle = (href: string, id: string): void => {
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.id = id;
      document.head.appendChild(link);
    };

    async function initSummernote() {
      try {
        // Load Summernote Lite CSS
        loadStyle(
          "https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.css",
          "summernote-css"
        );

        // Load jQuery first if missing
        if (!window.jQuery && !window.$) {
          await loadScript(
            "https://code.jquery.com/jquery-3.6.0.min.js",
            "jquery-script"
          );
        }

        if (window.jQuery && !window.$) {
          window.$ = window.jQuery;
        }

        const jq = window.$ || window.jQuery;

        // Load Summernote Lite JS if plugin method is missing
        if (!jq?.fn?.summernote) {
          await loadScript(
            "https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.js",
            "summernote-js"
          );
        }

        if (window.jQuery && !window.$) {
          window.$ = window.jQuery;
        }

        const activeJQuery = window.$ || window.jQuery;

        if (!isMounted) return;

        // Initialize Summernote instance
        if (textareaRef.current && !isInitializedRef.current && activeJQuery?.fn?.summernote) {
          setIsLoaded(true);
          const $el = activeJQuery(textareaRef.current);
          $el.summernote({
            placeholder: "Type your content here...",
            tabsize: 2,
            height: minHeight,
            disableResizeEditor: false,
            toolbar: readOnly
              ? []
              : [
                  ["style", ["style"]],
                  ["font", ["bold", "underline", "clear", "italic", "strikethrough"]],
                  ["fontname", ["fontname"]],
                  ["fontsize", ["fontsize"]],
                  ["color", ["color"]],
                  ["para", ["ul", "ol", "paragraph"]],
                  ["table", ["table"]],
                  ["insert", ["link", "picture", "video"]],
                  ["view", ["fullscreen", "codeview", "help"]],
                ],
            callbacks: {
              onChange: (contents: string) => {
                if (onChange) {
                  onChange(contents);
                }
              },
              onKeydown: (e: KeyboardEvent) => {
                if (e.keyCode === 9) {
                  e.preventDefault();
                  try {
                    document.execCommand('insertHTML', false, '<span class="Apple-tab-span" style="white-space:pre; display:inline-block; min-width:48px;">&#9;</span>');
                  } catch {
                    // Fallback
                  }
                }
              },
            },
          });

          // Set initial content
          if (initialContent) {
            $el.summernote("code", initialContent);
          }

          if (readOnly) {
            $el.summernote("disable");
          }

          isInitializedRef.current = true;
        }
      } catch (err) {
        console.error("Failed to load Summernote dependencies:", err);
      }
    }

    initSummernote();

    return () => {
      isMounted = false;
      if (isInitializedRef.current && window.$ && textareaRef.current) {
        try {
          window.$(textareaRef.current).summernote("destroy");
        } catch {
          // Cleanup error ignored
        }
        isInitializedRef.current = false;
      }
    };
  }, [minHeight, readOnly]);

  return (
    <div className="summernote-gdocs-wrapper min-h-screen w-full bg-[#f8f9fa] flex flex-col items-center py-6 px-2 sm:py-10 sm:px-4">
      {!isLoaded && (
        <div className="flex flex-col items-center justify-center h-[600px] w-full max-w-[816px] bg-white rounded-sm border border-slate-200 shadow-md text-slate-500 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="font-medium text-sm">Loading Google Docs Style Summernote...</span>
        </div>
      )}
      <div className={`w-full max-w-[816px] ${!isLoaded ? "hidden" : "block"}`}>
        {!readOnly && !hideRuler && (
          <div className="mb-3 w-full border border-slate-200 rounded-sm shadow-sm overflow-hidden bg-white">
            <Ruler onMarginsChange={setMargins} />
          </div>
        )}
        <textarea ref={textareaRef} defaultValue={initialContent} />
      </div>

      <style jsx global>{`
        /* Google Docs Canvas & Paper Layout for Summernote */
        .summernote-gdocs-wrapper .note-editor.note-frame {
          border: none !important;
          background: transparent !important;
          width: 100% !important;
          max-width: 816px !important;
          margin: 0 auto !important;
        }

        .summernote-gdocs-wrapper .note-toolbar {
          background: #ffffff !important;
          border: 1px solid #dadce0 !important;
          border-radius: 24px !important;
          padding: 4px 12px !important;
          margin-bottom: 20px !important;
          box-shadow: 0 1px 3px rgba(60,64,67,0.15) !important;
          display: flex !important;
          flex-wrap: wrap !important;
          align-items: center !important;
          gap: 2px !important;
          position: sticky !important;
          top: 8px !important;
          z-index: 30 !important;
        }

        .summernote-gdocs-wrapper .note-toolbar .note-btn-group {
          margin-right: 4px !important;
        }

        .summernote-gdocs-wrapper .note-toolbar .note-btn {
          border: none !important;
          background: transparent !important;
          border-radius: 4px !important;
          padding: 4px 8px !important;
          color: #444746 !important;
          font-size: 13px !important;
        }

        .summernote-gdocs-wrapper .note-toolbar .note-btn:hover {
          background: #f1f3f4 !important;
          color: #1f1f1f !important;
        }

        .summernote-gdocs-wrapper .note-editing-area {
          background: #ffffff !important;
          box-shadow: 0 1px 3px 1px rgba(60,64,67,0.15), 0 1px 2px 0 rgba(60,64,67,0.3) !important;
          border-radius: 2px !important;
          min-height: 1056px !important;
        }

        .summernote-gdocs-wrapper .note-editable {
          padding: 48px ${margins.right}px 48px ${margins.left}px !important;
          font-family: Arial, Inter, Roboto, sans-serif !important;
          font-size: 11pt !important;
          line-height: 1.5 !important;
          color: #202124 !important;
          white-space: pre-wrap !important;
          tab-size: 4 !important;
          -moz-tab-size: 4 !important;
          min-height: 1000px !important;
        }

        .summernote-gdocs-wrapper .note-editable span[style*="white-space:pre"],
        .summernote-gdocs-wrapper .note-editable .Apple-tab-span {
          display: inline-block !important;
          min-width: 36px !important;
          max-width: 60px !important;
          white-space: pre !important;
        }

        .summernote-gdocs-wrapper .note-editable table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 12px 0 !important;
        }

        .summernote-gdocs-wrapper .note-editable th,
        .summernote-gdocs-wrapper .note-editable td {
          padding: 6px 12px !important;
          vertical-align: top !important;
        }

        .summernote-gdocs-wrapper .note-editable img {
          max-width: 100% !important;
          height: auto !important;
        }

        @media (max-width: 640px) {
          .summernote-gdocs-wrapper .note-editable {
            padding: 24px 20px !important;
          }
        }

        .summernote-gdocs-wrapper .note-editable p {
          margin-bottom: 0 !important;
          line-height: 1.5 !important;
        }

        .summernote-gdocs-wrapper .note-editable u {
          text-decoration: underline !important;
          text-underline-offset: 3px !important;
        }

        .summernote-gdocs-wrapper .note-statusbar {
          background: transparent !important;
          border-top: none !important;
        }
      `}</style>
    </div>
  );
}
