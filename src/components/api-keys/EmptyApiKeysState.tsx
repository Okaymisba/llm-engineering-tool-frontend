
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FileText } from 'lucide-react';

interface EmptyApiKeysStateProps {
  onCreateApiKey: () => void;
  canCreateNewKey: boolean;
}

export const EmptyApiKeysState: React.FC<EmptyApiKeysStateProps> = ({
  onCreateApiKey,
  canCreateNewKey
}) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
          <p className="text-muted-foreground mb-6">Create your first API key to get started</p>
          <Button 
            onClick={onCreateApiKey}
            disabled={!canCreateNewKey}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
