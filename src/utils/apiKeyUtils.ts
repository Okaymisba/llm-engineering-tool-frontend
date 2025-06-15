
export const generateApiKey = (): string => {
  const prefix = 'sk-';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix;
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const maskApiKey = (apiKey: string, isVisible: boolean): string => {
  if (isVisible) {
    return apiKey;
  }
  return `${apiKey.substring(0, 8)}${'*'.repeat(24)}${apiKey.substring(apiKey.length - 4)}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getUsagePercentage = (used: number, limit: number): number => {
  return Math.round((used / limit) * 100);
};
