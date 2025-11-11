'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useEffect, useRef, useState } from 'react';
import { Attachment } from '@/types';
import { uploadFile, formatFileSize, getFileIcon } from '@/lib/fileUpload';
import { toast } from 'sonner';

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  attachments?: Attachment[];
  onAttachmentsChange?: (attachments: Attachment[]) => void;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
  attachments = [],
  onAttachmentsChange
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
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
    immediatelyRender: false, // Fix SSR hydration issue
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[500px] px-8 py-6 text-slate-900',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !onAttachmentsChange) return;

    // Check max files
    if (attachments.length + files.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    // Check file sizes
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter((f) => f.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map((file) => uploadFile(file));
      const results = await Promise.all(uploadPromises);

      const newAttachments: Attachment[] = results.map((result) => ({
        id: `temp-${Date.now()}-${Math.random()}`,
        name: result.name,
        url: result.url,
        size: result.size,
        type: result.type,
        uploadedAt: new Date(),
      }));

      onAttachmentsChange([...attachments, ...newAttachments]);
      toast.success(`${files.length} file(s) uploaded`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    if (onAttachmentsChange) {
      onAttachmentsChange(attachments.filter((a) => a.id !== attachmentId));
      toast.success('Attachment removed');
    }
  };

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
    disabled
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-all hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-700'
      }`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-slate-200 bg-slate-50 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h7 M7 20h7 M14 4L10 20" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18 M8 5h8 M7 19h10" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline Code"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <span className="font-bold text-sm">H2</span>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <span className="font-bold text-sm">H3</span>
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h1v5 M1 9h3 M8 6h13 M8 12h13 M8 18h13 M3 14h1v5 M1 19h3" />
          </svg>
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        {/* Code Block */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Line"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />
          </svg>
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
          </svg>
        </ToolbarButton>

        {onAttachmentsChange && (
          <>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>

            {/* Attachment Button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading || attachments.length >= 5}
            />
            <ToolbarButton
              onClick={() => fileInputRef.current?.click()}
              title={uploading ? 'Uploading...' : 'Attach Files'}
              disabled={uploading || attachments.length >= 5}
            >
              {uploading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              )}
            </ToolbarButton>

            {attachments.length > 0 && (
              <span className="text-xs text-slate-600 px-2 flex items-center">
                {attachments.length}/5
              </span>
            )}
          </>
        )}
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Attachments List (below editor) */}
      {onAttachmentsChange && attachments.length > 0 && (
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">
            Attachments ({attachments.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 group hover:border-slate-300 transition-colors"
              >
                <span className="text-xl">{getFileIcon(attachment.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 truncate">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
