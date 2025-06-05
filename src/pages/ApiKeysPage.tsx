
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Plus, Copy, Eye, EyeOff, Upload, MoreVertical, RefreshCw, Trash2, Edit, FileText, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ApiKeyInfo {
  api_key: string;
  label: string;
  instructions: string;
  total_tokens: number;
  tokens_used: number;
  tokens_remaining: number;
  token_limit_per_day: number;
  created_at: string;
  last_used_at: string | null;
}

export const ApiKeysPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [newApiKey, setNewApiKey] = useState<string>('');
  const [uploadLoading, setUploadLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    label: '',
    instructions: '',
    token_limit: 1000
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/api-keys', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const keys = await response.json();
        setApiKeys(keys);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch API keys",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch API keys",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const createApiKey = async () => {
    try {
      const response = await fetch('/api/generate-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          label: formData.label,
          instructions: formData.instructions,
          tl: formData.token_limit
        })
      });

      if (response.ok) {
        const result = await response.json();
        setNewApiKey(result.api_key);
        setShowNewKeyDialog(false);
        fetchApiKeys();
        setFormData({ label: '', instructions: '', token_limit: 1000 });
        toast({
          title: "Success",
          description: "API key created successfully",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to create API key",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive"
      });
    }
  };

  const deleteApiKey = async (apiKey: string) => {
    try {
      const response = await fetch(`/api/api-keys/${apiKey}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchApiKeys();
        toast({
          title: "Success",
          description: "API key deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete API key",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive"
      });
    }
  };

  const regenerateApiKey = async (apiKey: string) => {
    try {
      const response = await fetch(`/api/api-keys/${apiKey}/regenerate`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchApiKeys();
        toast({
          title: "Success",
          description: "API key regenerated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to regenerate API key",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate API key",
        variant: "destructive"
      });
    }
  };

  const uploadDocument = async (file: File) => {
    if (!selectedApiKey) return;
    
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/api-keys/${selectedApiKey}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: `Document uploaded successfully. ${result.chunks_created} chunks created.`,
        });
        setShowUploadDialog(false);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to upload document",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setUploadLoading(false);
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

  const maskApiKey = (apiKey: string) => {
    if (visibleKeys.has(apiKey)) {
      return apiKey;
    }
    return `${apiKey.substring(0, 8)}${'*'.repeat(24)}${apiKey.substring(apiKey.length - 4)}`;
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

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
              <p className="text-gray-600 mt-1">Manage your API keys and monitor usage</p>
            </div>
          </div>
          
          <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Create a new API key to access your services
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g., Production API"
                  />
                </div>
                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Instructions for this API key..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="token_limit">Daily Token Limit</Label>
                  <Input
                    id="token_limit"
                    type="number"
                    value={formData.token_limit}
                    onChange={(e) => setFormData({ ...formData, token_limit: parseInt(e.target.value) || 1000 })}
                    min="100"
                    max="100000"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={createApiKey} disabled={!formData.label.trim()}>
                  Create API Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* New API Key Display */}
        {newApiKey && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">New API Key Created</CardTitle>
              <CardDescription className="text-green-700">
                Make sure to copy your API key now. You won't be able to see it again!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 p-3 bg-white rounded border font-mono text-sm">
                <span className="flex-1">{newApiKey}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(newApiKey)}
                  className="flex items-center gap-1"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
              <Button
                onClick={() => setNewApiKey('')}
                variant="ghost"
                size="sm"
                className="mt-3"
              >
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        {/* API Keys Table */}
        {apiKeys.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No API Keys</h3>
                <p className="text-gray-600 mb-6">Create your first API key to get started</p>
                <Button onClick={() => setShowNewKeyDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your API Keys</CardTitle>
              <CardDescription>
                Manage and monitor your API key usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => {
                    const usagePercentage = getUsagePercentage(key.tokens_used, key.token_limit_per_day);
                    return (
                      <TableRow key={key.api_key}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{key.label}</div>
                            {key.instructions && (
                              <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                {key.instructions}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {maskApiKey(key.api_key)}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleKeyVisibility(key.api_key)}
                            >
                              {visibleKeys.has(key.api_key) ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(key.api_key)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{key.tokens_used.toLocaleString()}</span>
                              <span>{key.token_limit_per_day.toLocaleString()}</span>
                            </div>
                            <Progress
                              value={usagePercentage}
                              className="h-2"
                            />
                            <div className="text-xs text-gray-500">
                              {usagePercentage}% used
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(key.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {key.last_used_at ? (
                              formatDate(key.last_used_at)
                            ) : (
                              <span className="text-gray-400">Never</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedApiKey(key.api_key);
                                  setShowUploadDialog(true);
                                }}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Document
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => regenerateApiKey(key.api_key)}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Regenerate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteApiKey(key.api_key)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Upload Document Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload a document to be processed and associated with your API key
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="document">Document File</Label>
                <Input
                  id="document"
                  type="file"
                  accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadDocument(file);
                  }}
                  disabled={uploadLoading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: PDF, DOCX, TXT, JPG, PNG
                </p>
              </div>
              {uploadLoading && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span className="text-sm">Processing document...</span>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
