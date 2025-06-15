
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploadLoading: boolean;
  onUploadDocument: (file: File) => void;
  apiKeyId?: string;
}

export const UploadDocumentDialog: React.FC<UploadDocumentDialogProps> = ({
  open,
  onOpenChange,
  apiKeyId
}) => {
  const navigate = useNavigate();

  const handleNavigateToDocuments = () => {
    onOpenChange(false);
    if (apiKeyId) {
      navigate(`/api-keys/${apiKeyId}/documents`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Documents</DialogTitle>
          <DialogDescription>
            View, upload, and manage documents for your API key
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You'll be redirected to the documents management page where you can:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• View all uploaded documents and their status</li>
            <li>• Upload new files (up to 3 documents per API key)</li>
            <li>• Track processing status in real-time</li>
            <li>• Delete existing documents</li>
            <li>• Support for PDF, DOCX, TXT, JPG, PNG (max 25MB)</li>
          </ul>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleNavigateToDocuments} className="flex-1">
              Go to Documents Page
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
