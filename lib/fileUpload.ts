import { supabase } from './supabase';

export interface UploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
}

export const uploadFile = async (file: File): Promise<UploadResult> => {
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `attachments/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('brain-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('brain-attachments')
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (url: string): Promise<void> => {
  try {
    // Extract file path from URL
    const urlParts = url.split('/');
    const filePath = `attachments/${urlParts[urlParts.length - 1]}`;

    const { error } = await supabase.storage
      .from('brain-attachments')
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

export const getFileIcon = (type: string): string => {
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎥';
  if (type.startsWith('audio/')) return '🎵';
  if (type.includes('pdf')) return '📄';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('sheet') || type.includes('excel')) return '📊';
  if (type.includes('presentation') || type.includes('powerpoint')) return '📽️';
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '🗜️';
  return '📎';
};
