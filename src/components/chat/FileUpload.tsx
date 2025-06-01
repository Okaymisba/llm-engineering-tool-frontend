
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Image, FileText, X } from 'lucide-react';

interface UploadedFile {
  file: File;
  type: 'image' | 'document';
  preview?: string;
}

interface FileUploadProps {
  uploadedFiles: UploadedFile[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  isLoading: boolean;
  onFileAdded: (files: UploadedFile[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  uploadedFiles,
  setUploadedFiles,
  isLoading,
  onFileAdded
}) => {
  const [isUploadExpanded, setIsUploadExpanded] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'document') => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];

    Array.from(files).forEach((file) => {
      const isValidImage = file.type.startsWith('image/') && fileType === 'image';
      const isValidDocument = (file.type === 'application/pdf' || file.type.includes('document') || file.type.includes('text')) && fileType === 'document';
      
      if (isValidImage || isValidDocument) {
        const uploadedFile: UploadedFile = {
          file,
          type: fileType
        };

        if (isValidImage) {
          const reader = new FileReader();
          reader.onload = (e) => {
            uploadedFile.preview = e.target?.result as string;
            newFiles.push(uploadedFile);
            if (newFiles.length === Array.from(files).length) {
              onFileAdded(newFiles);
            }
          };
          reader.readAsDataURL(file);
        } else {
          newFiles.push(uploadedFile);
        }
      }
    });

    if (newFiles.length > 0 && !newFiles.some(f => f.type === 'image')) {
      onFileAdded(newFiles);
    }

    // Clear the input
    if (event.target) {
      event.target.value = '';
    }
    setIsUploadExpanded(false);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="relative bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center space-x-2 max-w-xs">
              {file.type === 'image' && file.preview ? (
                <img src={file.preview} alt={file.file.name} className="w-8 h-8 object-cover rounded" />
              ) : (
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
              )}
              <span className="text-sm text-gray-700 truncate flex-1">{file.file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsUploadExpanded(!isUploadExpanded)}
          className="h-10 w-10 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          disabled={isLoading}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        
        {isUploadExpanded && (
          <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 space-y-1 animate-fade-in z-10">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Image className="h-4 w-4 text-blue-500" />
              <span>Upload Image</span>
            </button>
            <button
              onClick={() => documentInputRef.current?.click()}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <FileText className="h-4 w-4 text-green-500" />
              <span>Upload Document</span>
            </button>
          </div>
        )}
      </div>
      
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileUpload(e, 'image')}
        className="hidden"
      />
      
      <input
        ref={documentInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt"
        onChange={(e) => handleFileUpload(e, 'document')}
        className="hidden"
      />
    </div>
  );
};
