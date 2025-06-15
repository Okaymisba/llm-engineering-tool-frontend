import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ApiKeyInfo, ApiKeyFormData } from '@/types/apiKeys';
import { MAX_API_KEYS } from '@/constants/apiKeys';
import { generateApiKey } from '@/utils/apiKeyUtils';
import { CreateApiKeyDialog } from '@/components/api-keys/CreateApiKeyDialog';
import { ApiKeyWarnings } from '@/components/api-keys/ApiKeyWarnings';
import { ApiKeyMobileCard } from '@/components/api-keys/ApiKeyMobileCard';
import { ApiKeyTable } from '@/components/api-keys/ApiKeyTable';
import { UploadDocumentDialog } from '@/components/api-keys/UploadDocumentDialog';
import { EmptyApiKeysState } from '@/components/api-keys/EmptyApiKeysState';

export const ApiKeysPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string>('');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [newApiKey, setNewApiKey] = useState<string>('');
  
  const [formData, setFormData] = useState<ApiKeyFormData>({
    label: '',
    instructions: '',
    token_limit: -1
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const fetchApiKeys = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching API keys for user:', user.id);
      
      const { data, error } = await supabase
        .from('apis')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching API keys:', error);
        throw error;
      }
      
      console.log('API keys fetched successfully:', data);
      setApiKeys(data || []);
    } catch (error: any) {
      console.error('Failed to fetch API keys:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch API keys",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, [user]);

  const createApiKey = async () => {
    if (!user) return;
    
    if (apiKeys.length >= MAX_API_KEYS) {
      toast({
        title: "Limit Reached",
        description: `You can only create up to ${MAX_API_KEYS} API keys. Please delete an existing key to create a new one.`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      const apiKey = generateApiKey();
      
      const { data, error } = await supabase
        .from('apis')
        .insert({
          user_id: user.id,
          label: formData.label,
          instructions: formData.instructions,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setNewApiKey(data.api_key);
      setShowNewKeyDialog(false);
      fetchApiKeys();
      setFormData({ label: '', instructions: '', token_limit: -1 });
      toast({
        title: "Success",
        description: "API key created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create API key",
        variant: "destructive"
      });
    }
  };

  const deleteApiKey = async (apiKeyId: string) => {
    try {
      const { error } = await supabase
        .from('apis')
        .delete()
        .eq('id', apiKeyId);

      if (error) {
        throw error;
      }

      fetchApiKeys();
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete API key",
        variant: "destructive"
      });
    }
  };

  const regenerateApiKey = async (apiKeyId: string) => {
    try {
      const newKey = generateApiKey();
      
      const { error } = await supabase
        .from('apis')
        .update({ api_key: newKey })
        .eq('id', apiKeyId);

      if (error) {
        throw error;
      }

      fetchApiKeys();
      toast({
        title: "Success",
        description: "API key regenerated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate API key",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const toggleKeyVisibility = (apiKey: string) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(apiKey)) {
      newVisibleKeys.delete(apiKey);
    } else {
      newVisibleKeys.add(apiKey);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const handleUploadDocument = (keyId: string) => {
    setSelectedApiKeyId(keyId);
    setShowUploadDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading API keys...</p>
        </div>
      </div>
    );
  }

  const canCreateNewKey = apiKeys.length < MAX_API_KEYS;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex w-full">
        <div className="flex-1 p-4 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">API Keys</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your API keys and monitor usage ({apiKeys.length}/{MAX_API_KEYS} used)
                </p>
              </div>
            </div>
            
            <CreateApiKeyDialog
              open={showNewKeyDialog}
              onOpenChange={setShowNewKeyDialog}
              formData={formData}
              onFormDataChange={setFormData}
              onCreateApiKey={createApiKey}
              canCreateNewKey={canCreateNewKey}
            />
          </div>

          <ApiKeyWarnings
            canCreateNewKey={canCreateNewKey}
            newApiKey={newApiKey}
            onCopyToClipboard={copyToClipboard}
            onDismissNewKey={() => setNewApiKey('')}
          />

          {/* API Keys Content */}
          {apiKeys.length === 0 ? (
            <EmptyApiKeysState
              onCreateApiKey={() => setShowNewKeyDialog(true)}
              canCreateNewKey={canCreateNewKey}
            />
          ) : (
            <>
              {isMobile ? (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <ApiKeyMobileCard
                      key={key.id}
                      apiKey={key}
                      isVisible={visibleKeys.has(key.api_key)}
                      onToggleVisibility={toggleKeyVisibility}
                      onCopyToClipboard={copyToClipboard}
                      onUploadDocument={handleUploadDocument}
                      onRegenerateKey={regenerateApiKey}
                      onDeleteKey={deleteApiKey}
                    />
                  ))}
                </div>
              ) : (
                <ApiKeyTable
                  apiKeys={apiKeys}
                  visibleKeys={visibleKeys}
                  onToggleVisibility={toggleKeyVisibility}
                  onCopyToClipboard={copyToClipboard}
                  onUploadDocument={handleUploadDocument}
                  onRegenerateKey={regenerateApiKey}
                  onDeleteKey={deleteApiKey}
                />
              )}
            </>
          )}

          <UploadDocumentDialog
            open={showUploadDialog}
            onOpenChange={setShowUploadDialog}
            uploadLoading={false}
            onUploadDocument={() => {}}
            apiKeyId={selectedApiKeyId}
          />
        </div>
      </div>
    </div>
  );
};
