
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, XCircle, Clock, Upload } from 'lucide-react';

interface DocumentProcessingStatusProps {
  document: any;
  onUploadAnother: () => void;
}

export const DocumentProcessingStatus: React.FC<DocumentProcessingStatusProps> = ({
  document,
  onUploadAnother
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'processing':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Your document has been successfully processed and is ready to use with your API key.';
      case 'failed':
        return 'There was an error processing your document. Please try uploading again.';
      case 'processing':
      default:
        return 'Your document is being processed. This may take a few minutes depending on the file size and content.';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{document.filename}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(document.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(document.status)}
              {getStatusBadge(document.status)}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(document.status)}
              <h3 className="font-medium">
                {document.status === 'completed' ? 'Processing Complete' :
                 document.status === 'failed' ? 'Processing Failed' :
                 'Processing Document'}
              </h3>
            </div>
            
            <p className="text-muted-foreground">
              {getStatusMessage(document.status)}
            </p>

            {document.status === 'processing' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Please wait while we process your document...</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onUploadAnother}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Another Document
            </Button>
          </div>
        </CardContent>
      </Card>

      {document.status === 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Success!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your document has been successfully uploaded and processed. It's now available 
              for use with your API key and can be queried through your application.
            </p>
          </CardContent>
        </Card>
      )}

      {document.status === 'failed' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">Processing Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We encountered an error while processing your document. This could be due to:
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
              <li>Unsupported file format or corrupted file</li>
              <li>File content that cannot be extracted</li>
              <li>Temporary server issues</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              Please try uploading the document again or contact support if the issue persists.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
