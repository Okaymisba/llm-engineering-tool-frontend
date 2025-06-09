
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Key, Copy, Trash2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ApiKey {
  id: string;
  label: string;
  api_key: string;
  instructions: string;
  tokens_used: number;
  total_tokens: number;
  last_used_at: string;
  created_at: string;
}

export const ApiKeysPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState({ label: '', instructions: '' });
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['api-keys', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('apis')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ApiKey[];
    },
    enabled: !!user,
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async (keyData: { label: string; instructions: string }) => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('apis')
        .insert({
          user_id: user.id,
          label: keyData.label,
          instructions: keyData.instructions,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setIsCreateDialogOpen(false);
      setNewApiKey({ label: '', instructions: '' });
      setMessage({ type: 'success', text: 'API key created successfully!' });
    },
    onError: (error: any) => {
      setMessage({ type: 'error', text: error.message || 'Failed to create API key' });
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('apis')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setMessage({ type: 'success', text: 'API key deleted successfully!' });
    },
    onError: (error: any) => {
      setMessage({ type: 'error', text: error.message || 'Failed to delete API key' });
    },
  });

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ type: 'success', text: 'API key copied to clipboard!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to copy to clipboard' });
    }
  };

  const maskApiKey = (key: string) => {
    return `${key.slice(0, 8)}${'*'.repeat(32)}${key.slice(-8)}`;
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">API Keys</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your API keys for programmatic access</p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Generate a new API key for programmatic access to your AI models
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">Label</Label>
                    <Input
                      id="label"
                      value={newApiKey.label}
                      onChange={(e) => setNewApiKey({ ...newApiKey, label: e.target.value })}
                      placeholder="e.g., Production API, Testing Key"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instructions (Optional)</Label>
                    <Textarea
                      id="instructions"
                      value={newApiKey.instructions}
                      onChange={(e) => setNewApiKey({ ...newApiKey, instructions: e.target.value })}
                      placeholder="Add any specific instructions or notes for this API key"
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={() => createApiKeyMutation.mutate(newApiKey)}
                    disabled={!newApiKey.label.trim() || createApiKeyMutation.isPending}
                    className="w-full"
                  >
                    {createApiKeyMutation.isPending ? 'Creating...' : 'Create API Key'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {message && (
            <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              {message.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-0 shadow-xl bg-white/90 backdrop-blur-sm dark:bg-gray-800/90">
                  <CardHeader className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent className="animate-pulse">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : apiKeys && apiKeys.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {apiKeys.map((apiKey) => (
                <Card key={apiKey.id} className="border-0 shadow-xl bg-white/90 backdrop-blur-sm dark:bg-gray-800/90">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center text-lg">
                          <Key className="mr-2 h-4 w-4" />
                          {apiKey.label}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Created {new Date(apiKey.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteApiKeyMutation.mutate(apiKey.id)}
                        className="text-red-500 hover:text-red-700"
                        disabled={deleteApiKeyMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">API Key</Label>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded font-mono">
                          {visibleKeys.has(apiKey.id) ? apiKey.api_key : maskApiKey(apiKey.api_key)}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="h-8 w-8"
                        >
                          {visibleKeys.has(apiKey.id) ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => copyToClipboard(apiKey.api_key)}
                          className="h-8 w-8"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Tokens Used</span>
                        <span className="font-medium">
                          {(apiKey.tokens_used || 0).toLocaleString()} / {(apiKey.total_tokens || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(((apiKey.tokens_used || 0) / (apiKey.total_tokens || 1)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {apiKey.last_used_at && (
                      <div className="text-xs text-gray-500">
                        Last used: {new Date(apiKey.last_used_at).toLocaleString()}
                      </div>
                    )}

                    {apiKey.instructions && (
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Instructions</Label>
                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                          {apiKey.instructions}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm dark:bg-gray-800/90">
              <CardContent className="py-16 text-center">
                <Key className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No API Keys Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first API key to start using our AI models programmatically
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First API Key
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
