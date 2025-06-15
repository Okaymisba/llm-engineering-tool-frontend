
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentProcessingStatus } from '@/components/documents/DocumentProcessingStatus';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const AddDocumentPage: React.FC = () => {
  const { apiKeyId } = useParams<{ apiKeyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<any>(null);
  const [uploadedDocument, setUploadedDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApiKey();
  }, [apiKeyId, user]);

  useEffect(() => {
    if (!uploadedDocument) return;

    const channel = supabase
      .channel('document-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: `id=eq.${uploadedDocument.id}`
        },
        (payload) => {
          console.log('Document status updated:', payload);
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
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [uploadedDocument, toast]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (document: any) => {
    setUploadedDocument(document);
    toast({
      title: "Upload Successful",
      description: "Your document has been uploaded and is being processed.",
    });
  };

  const handleBackToApiKeys = () => {
    navigate('/api-keys');
  };

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
          
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Add Document</h1>
            <p className="text-muted-foreground mt-1">
              Upload a document for API key: {apiKey?.label}
            </p>
          </div>
        </div>

        {!uploadedDocument ? (
          <DocumentUpload
            apiKeyId={apiKeyId!}
            onUploadSuccess={handleUploadSuccess}
          />
        ) : (
          <DocumentProcessingStatus
            document={uploadedDocument}
            onUploadAnother={() => setUploadedDocument(null)}
          />
        )}
      </div>
    </div>
  );
};
