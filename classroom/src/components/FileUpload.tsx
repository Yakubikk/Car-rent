import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';

interface FileUploadProps {
  files: File[];
  setFiles: (files: File[]) => void;
  maxFileSize?: number; // in MB
  maxFiles?: number;
  acceptedFileTypes?: string;
  label?: string;
  placeholder?: string;
  maxSizeMessage?: string;
  fileTypeMessage?: string;
  maxCountMessage?: string;
}

const FileUpload = ({
  files,
  setFiles,
  maxFileSize = 10, // Default 10MB
  maxFiles = 10,    // Default 10 files
  acceptedFileTypes = '*',
  label,
  placeholder,
  maxSizeMessage,
  fileTypeMessage,
  maxCountMessage
}: FileUploadProps) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  
  // Messages with defaults
  const messages = {
    label: label || t('fileUpload.attachments'),
    placeholder: placeholder || t('fileUpload.dragAndDrop'),
    maxSizeMessage: maxSizeMessage || t('fileUpload.maxFileSize', { size: maxFileSize }),
    fileTypeMessage: fileTypeMessage || t('fileUpload.invalidFileType'),
    maxCountMessage: maxCountMessage || t('fileUpload.maxFilesExceeded', { count: maxFiles })
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };
  
  const handleFiles = (newFiles: File[]) => {
    // Check if adding these files would exceed max count
    if (files.length + newFiles.length > maxFiles) {
      toast.error(messages.maxCountMessage);
      return;
    }
    
    // Check file size and type
    const oversizedFiles = newFiles.filter(file => file.size > maxFileSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(messages.maxSizeMessage);
      return;
    }
    
    // Check file types if specific types are required
    if (acceptedFileTypes !== '*') {
      const invalidFiles = newFiles.filter(file => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const acceptedTypes = acceptedFileTypes.split(',').map(type => type.trim().toLowerCase());
        
        // If we're checking by MIME type
        if (acceptedTypes.some(type => type.includes('/'))) {
          return !acceptedTypes.some(type => file.type.match(type));
        }
        
        // If we're checking by extension
        return !acceptedTypes.some(type => type === `.${fileExtension}` || type === fileExtension);
      });
      
      if (invalidFiles.length > 0) {
        toast.error(messages.fileTypeMessage);
        return;
      }
    }
    
    setFiles([...files, ...newFiles]);
  };
  
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };
  
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-1">
        {messages.label}
      </label>
      
      <div
        className={`border-2 border-dashed rounded-md p-6 text-center mb-4 transition ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept={acceptedFileTypes}
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center cursor-pointer"
        >
          <FiUpload size={32} className="text-muted-foreground mb-2" />
          <p className="text-muted-foreground mb-1">{messages.placeholder}</p>
          <p className="text-sm text-muted-foreground">{messages.maxSizeMessage}</p>
        </label>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <FiFile className="text-primary" size={20} />
                <div className="overflow-hidden">
                  <div className="truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-600"
              >
                <FiX size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
