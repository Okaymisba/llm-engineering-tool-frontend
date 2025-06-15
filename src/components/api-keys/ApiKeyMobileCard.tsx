
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Copy, Eye, EyeOff, MoreVertical, Upload, RefreshCw, Trash2 } from 'lucide-react';
import { ApiKeyInfo } from '@/types/apiKeys';
import { maskApiKey, formatDate, getUsagePercentage } from '@/utils/apiKeyUtils';

interface ApiKeyMobileCardProps {
  apiKey: ApiKeyInfo;
  isVisible: boolean;
  onToggleVisibility: (key: string) => void;
  onCopyToClipboard: (text: string) => void;
  onUploadDocument: (keyId: string) => void;
  onRegenerateKey: (keyId: string) => void;
  onDeleteKey: (keyId: string) => void;
}

export const ApiKeyMobileCard: React.FC<ApiKeyMobileCardProps> = ({
  apiKey,
  isVisible,
  onToggleVisibility,
  onCopyToClipboard,
  onUploadDocument,
  onRegenerateKey,
  onDeleteKey
}) => {
  const usagePercentage = getUsagePercentage(apiKey.tokens_used, apiKey.token_limit_per_day);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{apiKey.label}</CardTitle>
            {apiKey.instructions && (
              <CardDescription className="text-sm mt-1">
                {apiKey.instructions}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUploadDocument(apiKey.id)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRegenerateKey(apiKey.id)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteKey(apiKey.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">API Key</Label>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
              {maskApiKey(apiKey.api_key, isVisible)}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleVisibility(apiKey.api_key)}
              className="h-8 w-8 p-0"
            >
              {isVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onCopyToClipboard(apiKey.api_key)}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div>
          <Label className="text-sm font-medium">Usage</Label>
          <div className="space-y-2 mt-1">
            <div className="flex justify-between text-sm">
              <span>{(apiKey.tokens_used ?? 0).toLocaleString()}</span>
              <span>{(apiKey.token_limit_per_day ?? 0).toLocaleString()}</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {usagePercentage}% used
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <Label className="text-sm font-medium">Created</Label>
            <p className="text-sm text-muted-foreground">
              {formatDate(apiKey.created_at)}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium">Last Used</Label>
            <p className="text-sm text-muted-foreground">
              {apiKey.last_used_at ? (
                formatDate(apiKey.last_used_at)
              ) : (
                <span className="text-muted-foreground">Never</span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
