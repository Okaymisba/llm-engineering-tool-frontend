
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Trash2, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Document {
  id: string;
  filename: string;
  size: number;
  status: string;
  created_at: string;
  hits?: number;
  last_used?: string;
}

interface DocumentsListProps {
  documents: Document[];
  onDeleteDocument: (documentId: string) => void;
  canUploadMore: boolean;
  onStartUpload: () => void;
}

export const DocumentsList: React.FC<DocumentsListProps> = ({
  documents,
  onDeleteDocument,
  canUploadMore,
  onStartUpload
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
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

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">No documents uploaded</h3>
              <p className="text-muted-foreground">
                Upload your first document to get started with this API key.
              </p>
            </div>
            {canUploadMore && (
              <Button onClick={onStartUpload}>
                <Plus className="h-4 w-4 mr-2" />
                Upload First Document
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {canUploadMore && (
        <Card className="border-dashed">
          <CardContent className="py-8">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                You can upload {3 - documents.length} more document{3 - documents.length !== 1 ? 's' : ''}
              </p>
              <Button onClick={onStartUpload} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {documents.map((document) => (
        <Card key={document.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                {document.filename}
              </CardTitle>
              <div className="flex items-center gap-2">
                {getStatusIcon(document.status)}
                {getStatusBadge(document.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Size</p>
                <p className="font-medium">{formatFileSize(document.size)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Uploaded</p>
                <p className="font-medium">{formatDate(document.created_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Queries</p>
                <p className="font-medium">{document.hits || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Used</p>
                <p className="font-medium">
                  {document.last_used ? formatDate(document.last_used) : 'Never'}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Document</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{document.filename}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteDocument(document.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
