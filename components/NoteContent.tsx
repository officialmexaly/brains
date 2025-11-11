'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useEffect, useRef } from 'react';

const lowlight = createLowlight(common);

interface NoteContentProps {
  content: string;
}

export default function NoteContent({ content }: NoteContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default code block
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
    ],
    content,
    editable: false, // Make it read-only
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none text-slate-900',
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Add copy buttons to code blocks
  useEffect(() => {
    if (contentRef.current) {
      const codeBlocks = contentRef.current.querySelectorAll('pre');

      codeBlocks.forEach((pre) => {
        // Skip if already has a copy button
        if (pre.querySelector('.copy-button')) return;

        // Create copy button
        const button = document.createElement('button');
        button.className = 'copy-button absolute top-3 right-3 px-3 py-1.5 text-xs bg-slate-600 hover:bg-slate-500 rounded transition-all font-medium shadow-md';
        button.style.cssText = 'color: #ffffff !important;';
        button.textContent = 'Copy';

        button.addEventListener('click', async () => {
          const code = pre.querySelector('code');
          if (code) {
            await navigator.clipboard.writeText(code.textContent || '');
            button.textContent = 'Copied!';
            button.style.cssText = 'color: #ffffff !important;';
            button.className = 'copy-button absolute top-3 right-3 px-3 py-1.5 text-xs bg-green-600 hover:bg-green-500 rounded transition-all font-medium shadow-md';
            setTimeout(() => {
              button.textContent = 'Copy';
              button.style.cssText = 'color: #ffffff !important;';
              button.className = 'copy-button absolute top-3 right-3 px-3 py-1.5 text-xs bg-slate-600 hover:bg-slate-500 rounded transition-all font-medium shadow-md';
            }, 2000);
          }
        });

        // Wrap pre in relative container and add button
        pre.style.position = 'relative';
        pre.appendChild(button);
      });
    }
  }, [editor?.getHTML()]);

  if (!editor) {
    return null;
  }

  return (
    <div ref={contentRef}>
      <EditorContent editor={editor} />
    </div>
  );
}
