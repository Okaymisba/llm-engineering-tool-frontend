
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { DocumentsList } from '@/components/documents/DocumentsList';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentProcessingStatus } from '@/components/documents/DocumentProcessingStatus';

const MAX_DOCUMENTS = 3;

export const DocumentsPage: React.FC = () => {
  const { apiKeyId } = useParams<{ apiKeyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadedDocument, setUploadedDocument] = useState<any>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApiKey();
    fetchDocuments();
  }, [apiKeyId, user]);

  useEffect(() => {
    if (!documents.length) return;

    const channel = supabase
      .channel('document-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `api_id=eq.${apiKeyId}`
        },
        (payload) => {
          console.log('Document updated:', payload);
          
          if (payload.eventType === 'INSERT') {
            setDocuments(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setDocuments(prev => prev.map(doc => 
              doc.id === payload.new.id ? payload.new : doc
            ));
            
            if (uploadedDocument && uploadedDocument.id === payload.new.id) {
              setUploadedDocument(payload.new);
              
              if (payload.new.status === 'completed') {
                toast({
                  title: "Document Processed",
                  description: "Your document has been successfully processed and is ready to use.",
                });
              } else if (payload.new.status === 'failed') {
                toast({
                  title: "Processing Failed",
                  description: "There was an error processing your document. Please try again.",
                  variant: "destructive"
                });
              }
            }
          } else if (payload.eventType === 'DELETE') {
            setDocuments(prev => prev.filter(doc => doc.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documents.length, apiKeyId, uploadedDocument, toast]);

  const fetchApiKey = async () => {
    if (!user || !apiKeyId) return;

    try {
      const { data, error } = await supabase
        .from('apis')
        .select('*')
        .eq('id', apiKeyId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      setApiKey(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch API key details",
        variant: "destructive"
      });
      navigate('/api-keys');
    }
  };

  const fetchDocuments = async () => {
    if (!user || !apiKeyId) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('api_id', apiKeyId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setDocuments(data || []);
    } catch (error: any) {
      console.error('Failed to fetch documents:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (document: any) => {
    setUploadedDocument(document);
    setShowUpload(false);
    toast({
      title: "Upload Successful",
      description: "Your document has been uploaded and is being processed.",
    });
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      // First get the document to get the file path
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Delete from storage first
      if (document.file_url) {
        const filePath = document.file_url.split('/').pop();
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('documents')
            .remove([`${user.id}/${filePath}`]);
          
          if (storageError) {
            console.error('Storage deletion error:', storageError);
          }
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  const handleBackToApiKeys = () => {
    navigate('/api-keys');
  };

  const canUploadMore = documents.length < MAX_DOCUMENTS;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-8 max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBackToApiKeys}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to API Keys
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Documents</h1>
              <p className="text-muted-foreground mt-1">
                Manage documents for API key: {apiKey?.label}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {documents.length}/{MAX_DOCUMENTS} documents used
              </p>
            </div>
            
            {canUploadMore && !showUpload && !uploadedDocument && (
              <Button onClick={() => setShowUpload(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            )}
          </div>
        </div>

        {uploadedDocument ? (
          <DocumentProcessingStatus
            document={uploadedDocument}
            onUploadAnother={() => {
              setUploadedDocument(null);
              setShowUpload(true);
            }}
          />
        ) : showUpload ? (
          <div className="mb-8">
            <DocumentUpload
              apiKeyId={apiKeyId!}
              onUploadSuccess={handleUploadSuccess}
            />
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowUpload(false)}
              >
                Cancel Upload
              </Button>
            </div>
          </div>
        ) : (
          <DocumentsList
            documents={documents}
            onDeleteDocument={handleDeleteDocument}
            canUploadMore={canUploadMore}
            onStartUpload={() => setShowUpload(true)}
          />
        )}
      </div>
    </div>
  );
};
