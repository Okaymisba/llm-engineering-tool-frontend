
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { ApiKeyFormData } from '@/types/apiKeys';
import { MAX_API_KEYS } from '@/constants/apiKeys';
import { useIsMobile } from '@/hooks/use-mobile';

interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ApiKeyFormData;
  onFormDataChange: (data: ApiKeyFormData) => void;
  onCreateApiKey: () => void;
  canCreateNewKey: boolean;
}

export const CreateApiKeyDialog: React.FC<CreateApiKeyDialogProps> = ({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onCreateApiKey,
  canCreateNewKey
}) => {
  const isMobile = useIsMobile();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          className="flex items-center gap-2" 
          disabled={!canCreateNewKey}
          title={!canCreateNewKey ? `You can only create up to ${MAX_API_KEYS} API keys` : "Create new API key"}
        >
          <Plus className="h-4 w-4" />
          {!isMobile && "Create API Key"}
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
              onChange={(e) => onFormDataChange({ ...formData, label: e.target.value })}
              placeholder="e.g., Production API"
            />
          </div>
          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => onFormDataChange({ ...formData, instructions: e.target.value })}
              placeholder="Instructions for this API key..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="token_limit">Daily Token Limit</Label>
            <Input
              id="token_limit"
              placeholder="Unlimited by default"
              value={formData.token_limit === -1 ? "" : formData.token_limit}
              onChange={(e) => onFormDataChange({ ...formData, token_limit: e.target.value === "" ? -1 : parseInt(e.target.value) })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onCreateApiKey} disabled={!formData.label.trim()}>
            Create API Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
