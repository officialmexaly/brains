'use client';

import { useState, useRef } from 'react';
import { uploadFile, formatFileSize, getFileIcon } from '@/lib/fileUpload';
import { Attachment } from '@/types';
import { toast } from 'sonner';

interface FileUploadProps {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

export default function FileUpload({
  attachments,
  onAttachmentsChange,
  maxFiles = 5,
  maxFileSize = 10,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check max files
    if (attachments.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Check file sizes
    const oversizedFiles = files.filter((f) => f.size > maxFileSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`File size must be less than ${maxFileSize}MB`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map((file) => uploadFile(file));
      const results = await Promise.all(uploadPromises);

      const newAttachments: Attachment[] = results.map((result) => ({
        id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID until saved to DB
        name: result.name,
        url: result.url,
        size: result.size,
        type: result.type,
        uploadedAt: new Date(),
      }));

      onAttachmentsChange([...attachments, ...newAttachments]);
      toast.success(`${files.length} file(s) uploaded successfully`);
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

  const handleRemove = (attachment: Attachment) => {
    onAttachmentsChange(attachments.filter((a) => a.id !== attachment.id));
    toast.success('Attachment removed');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-900">
          Attachments
        </label>
        <span className="text-xs text-slate-500">
          {attachments.length}/{maxFiles} files (max {maxFileSize}MB each)
        </span>
      </div>

      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || attachments.length >= maxFiles}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || attachments.length >= maxFiles}
          className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div className="text-sm">
              <span className="font-semibold text-blue-600 group-hover:text-blue-700">
                {uploading ? 'Uploading...' : 'Click to upload'}
              </span>
              <span className="text-slate-600"> or drag and drop</span>
            </div>
            <p className="text-xs text-slate-500">
              PNG, JPG, PDF, DOC (max {maxFileSize}MB)
            </p>
          </div>
        </button>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 group hover:bg-slate-100 transition-colors"
            >
              <span className="text-2xl">{getFileIcon(attachment.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {attachment.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(attachment)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
