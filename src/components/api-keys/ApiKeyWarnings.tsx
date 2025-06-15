
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { MAX_API_KEYS } from '@/constants/apiKeys';

interface ApiKeyWarningsProps {
  canCreateNewKey: boolean;
  newApiKey: string;
  onCopyToClipboard: (text: string) => void;
  onDismissNewKey: () => void;
}

export const ApiKeyWarnings: React.FC<ApiKeyWarningsProps> = ({
  canCreateNewKey,
  newApiKey,
  onCopyToClipboard,
  onDismissNewKey
}) => {
  return (
    <>
      {/* API Key Limit Warning */}
      {!canCreateNewKey && (
        <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-orange-800 dark:text-orange-200">API Key Limit Reached</CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              You have reached the maximum limit of {MAX_API_KEYS} API keys. Please delete an existing key to create a new one.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* New API Key Display */}
      {newApiKey && (
        <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200">New API Key Created</CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Make sure to copy your API key now. You won't be able to see it again!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-background rounded border font-mono text-sm">
              <span className="flex-1 break-all">{newApiKey}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCopyToClipboard(newApiKey)}
                className="flex items-center gap-1 shrink-0"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
            <Button
              onClick={onDismissNewKey}
              variant="ghost"
              size="sm"
              className="mt-3"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
};
