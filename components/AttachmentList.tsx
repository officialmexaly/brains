'use client';

import { Attachment } from '@/types';
import { formatFileSize, getFileIcon } from '@/lib/fileUpload';

interface AttachmentListProps {
  attachments: Attachment[];
}

export default function AttachmentList({ attachments }: AttachmentListProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleDownload = (attachment: Attachment) => {
    window.open(attachment.url, '_blank');
  };

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">
        Attachments ({attachments.length})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attachments.map((attachment) => (
          <button
            key={attachment.id}
            onClick={() => handleDownload(attachment)}
            className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 hover:border-blue-300 transition-all group text-left"
          >
            <span className="text-3xl flex-shrink-0">{getFileIcon(attachment.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {attachment.name}
              </p>
              <p className="text-xs text-slate-500">
                {formatFileSize(attachment.size)}
              </p>
            </div>
            <svg
              className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
