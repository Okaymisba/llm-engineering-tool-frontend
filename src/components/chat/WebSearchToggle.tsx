
import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WebSearchToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export const WebSearchToggle: React.FC<WebSearchToggleProps> = ({
  enabled,
  onToggle,
  disabled = false
}) => {
  return (
    <Button
      onClick={() => onToggle(!enabled)}
      disabled={disabled}
      variant={enabled ? "default" : "outline"}
      size="icon"
      className={cn(
        "h-8 w-8 shrink-0 transition-colors",
        enabled 
          ? "bg-blue-600 hover:bg-blue-700 text-white" 
          : "border-gray-300 hover:bg-gray-100"
      )}
      title={enabled ? "Web search enabled" : "Web search disabled"}
    >
      <Search className="h-4 w-4" />
    </Button>
  );
};
