"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo2,
    Redo2,
    Eraser,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface RichTextEditorProps {
    id?: string;
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
    disabled?: boolean;
    "aria-label"?: string;
}

const emptySubscribe = () => () => { };

export function RichTextEditor({
    id,
    value = "",
    onChange,
    placeholder = "Add job description, requirements, responsibilities, or paste directly...",
    className,
    minHeight = "160px",
    disabled = false,
    "aria-label": ariaLabel,
}: RichTextEditorProps) {
    const isMounted = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [3],
                },
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: "is-editor-empty",
            }),
        ],
        editorProps: {
            attributes: {
                ...(id ? { id } : {}),
                ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
                class: "focus:outline-none",
            },
        },
        content: value,
        editable: !disabled,
        immediatelyRender: false,
        onUpdate: ({ editor: currentEditor }) => {
            const isEmpty = currentEditor.isEmpty;
            const html = isEmpty ? "" : currentEditor.getHTML();
            onChange?.(html);
        },
    });

    // Synchronize editor content if external value changes (e.g. form reset or prefilled data)
    useEffect(() => {
        if (!editor) return;
        const currentHtml = editor.isEmpty ? "" : editor.getHTML();
        const incoming = value || "";

        if (incoming !== currentHtml) {
            if (!incoming) {
                editor.commands.clearContent();
            } else {
                editor.commands.setContent(incoming);
            }
        }
    }, [editor, value]);

    // Synchronize editable state
    useEffect(() => {
        if (!editor) return;
        if (editor.isEditable !== !disabled) {
            editor.setEditable(!disabled);
        }
    }, [editor, disabled]);

    if (!isMounted || !editor) {
        return (
            <div
                id={id}
                className={cn(
                    "w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-muted-foreground/60 transition-colors",
                    className
                )}
                style={{ minHeight }}
            >
                {placeholder}
            </div>
        );
    }

    const text = editor.getText().trim();
    const charCount = text.length;
    const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

    return (
        <div
            className={cn(
                "group/editor flex flex-col w-full rounded-md border border-input bg-background/50 transition-all duration-150 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
                disabled && "opacity-60 pointer-events-none",
                className
            )}
        >

            <div className="flex flex-wrap items-center gap-1 border-b border-border/60 bg-muted/30 px-2 py-1.5 backdrop-blur-xs">

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={disabled || !editor.can().chain().focus().toggleBold().run()}
                    className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-sm text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
                        editor.isActive("bold") && "bg-accent text-accent-foreground font-semibold shadow-2xs"
                    )}
                    title="Bold (Ctrl+B)"
                    aria-label="Bold"
                >
                    <Bold className="h-3.5 w-3.5" />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={disabled || !editor.can().chain().focus().toggleItalic().run()}
                    className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-sm text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
                        editor.isActive("italic") && "bg-accent text-accent-foreground font-semibold shadow-2xs"
                    )}
                    title="Italic (Ctrl+I)"
                    aria-label="Italic"
                >
                    <Italic className="h-3.5 w-3.5" />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={disabled || !editor.can().chain().focus().toggleStrike().run()}
                    className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-sm text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
                        editor.isActive("strike") && "bg-accent text-accent-foreground font-semibold shadow-2xs"
                    )}
                    title="Strikethrough"
                    aria-label="Strikethrough"
                >
                    <Strikethrough className="h-3.5 w-3.5" />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    disabled={disabled || !editor.can().chain().focus().toggleCode().run()}
                    className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-sm text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
                        editor.isActive("code") && "bg-accent text-accent-foreground font-semibold shadow-2xs"
                    )}
                    title="Inline Code"
                    aria-label="Inline Code"
                >
                    <Code className="h-3.5 w-3.5" />
                </button>

                <div className="h-4 w-px bg-border/60 mx-0.5" />


                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    disabled={disabled}
                    className={cn(
                        "inline-flex h-7 px-1.5 items-center justify-center rounded-sm text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors gap-1",
                        editor.isActive("heading", { level: 3 }) &&
                        "bg-accent text-accent-foreground font-semibold shadow-2xs"
                    )}
                    title="Section Heading"
                    aria-label="Section Heading"
                >
                    <Heading3 className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-semibold">H3</span>
                </button>

                <div className="h-4 w-px bg-border/60 mx-0.5" />


                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    disabled={disabled}
                    className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-sm text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
                        editor.isActive("bulletList") &&
                        "bg-accent text-accent-foreground font-semibold shadow-2xs"
                    )}
                    title="Bullet List"
                    aria-label="Bullet List"
                >
                    <List className="h-3.5 w-3.5" />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    disabled={disabled}
                    className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-sm text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
                        editor.isActive("orderedList") &&
                        "bg-accent text-accent-foreground font-semibold shadow-2xs"
                    )}
                    title="Numbered List"
                    aria-label="Numbered List"
                >
                    <ListOrdered className="h-3.5 w-3.5" />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    disabled={disabled}
                    className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-sm text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
                        editor.isActive("blockquote") &&
                        "bg-accent text-accent-foreground font-semibold shadow-2xs"
                    )}
                    title="Quote"
                    aria-label="Quote"
                >
                    <Quote className="h-3.5 w-3.5" />
                </button>

                <div className="h-4 w-px bg-border/60 mx-0.5" />


                <button
                    type="button"
                    onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                    disabled={disabled}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    title="Clear Formatting"
                    aria-label="Clear Formatting"
                >
                    <Eraser className="h-3.5 w-3.5" />
                </button>

                <div className="ml-auto flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={disabled || !editor.can().chain().focus().undo().run()}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-40"
                        title="Undo (Ctrl+Z)"
                        aria-label="Undo"
                    >
                        <Undo2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={disabled || !editor.can().chain().focus().redo().run()}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-40"
                        title="Redo (Ctrl+Y)"
                        aria-label="Redo"
                    >
                        <Redo2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>


            <div className="relative overflow-hidden">
                <EditorContent
                    editor={editor}
                    className="px-3 py-2.5 text-sm leading-relaxed max-h-[280px] overflow-y-auto"
                    style={{ minHeight }}
                />
            </div>


            <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-3 py-1 text-[11px] text-muted-foreground/70">
                <span className="truncate">Supports Markdown shortcuts (*bold*, - lists)</span>
                <span className="shrink-0 font-mono">
                    {charCount > 0 ? `${charCount} chars • ${wordCount} words` : "Empty"}
                </span>
            </div>
        </div>
    );
}

export default RichTextEditor;
