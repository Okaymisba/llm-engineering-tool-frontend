
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Copy, Eye, EyeOff, MoreVertical, Upload, RefreshCw, Trash2 } from 'lucide-react';
import { ApiKeyInfo } from '@/types/apiKeys';
import { maskApiKey, formatDate, getUsagePercentage } from '@/utils/apiKeyUtils';

interface ApiKeyTableProps {
  apiKeys: ApiKeyInfo[];
  visibleKeys: Set<string>;
  onToggleVisibility: (key: string) => void;
  onCopyToClipboard: (text: string) => void;
  onUploadDocument: (keyId: string) => void;
  onRegenerateKey: (keyId: string) => void;
  onDeleteKey: (keyId: string) => void;
}

export const ApiKeyTable: React.FC<ApiKeyTableProps> = ({
  apiKeys,
  visibleKeys,
  onToggleVisibility,
  onCopyToClipboard,
  onUploadDocument,
  onRegenerateKey,
  onDeleteKey
}) => {
  return (
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
              const usagePercentage = getUsagePercentage(key.tokens_used ?? 0, key.token_limit_per_day ?? 0);
              const isVisible = visibleKeys.has(key.api_key);
              
              return (
                <TableRow key={key.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{key.label}</div>
                      {key.instructions && (
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {key.instructions}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {maskApiKey(key.api_key, isVisible)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onToggleVisibility(key.api_key)}
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
                        onClick={() => onCopyToClipboard(key.api_key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{(key.tokens_used ?? 0).toLocaleString()}</span>
                        <span>{(key.token_limit_per_day ?? 0).toLocaleString()}</span>
                      </div>
                      <Progress
                        value={usagePercentage}
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground">
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
                        <span className="text-muted-foreground">Never</span>
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
                        <DropdownMenuItem onClick={() => onUploadDocument(key.id)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Document
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRegenerateKey(key.id)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteKey(key.id)}
                          className="text-destructive"
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
  );
};
