
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProfile } from '@/hooks/useProfile';
import { useModels } from '@/hooks/useModels';
import { SettingsNavigation } from '@/components/settings/SettingsNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lock, Bell, Cpu, ExternalLink } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const { models } = useModels();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleLowBalanceNotifyChange = async (checked: boolean) => {
    const result = await updateProfile({ low_balance_notify: checked });
    if (result?.success) {
      toast({
        title: "Settings updated",
        description: "Low balance notification preference updated.",
      });
    }
  };

  const handleDefaultModelChange = async (modelId: string) => {
    const result = await updateProfile({ default_model: modelId });
    if (result?.success) {
      toast({
        title: "Default model updated",
        description: "Your default model has been updated.",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          <SettingsNavigation />
          <div className="flex-1 p-8">
            <div className="animate-pulse">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  const selectedModel = models.find(m => m.id === profile?.default_model);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <SettingsNavigation />
        <div className="flex-1 p-8 max-w-4xl">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">Manage your account preferences and security settings.</p>
            </div>

            {/* Password Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password & Security
                </CardTitle>
                <CardDescription>
                  Update your password and security preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handlePasswordChange} 
                  disabled={isUpdatingPassword || !passwordData.newPassword}
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure your notification preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Low Balance Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your account balance is running low.
                    </p>
                  </div>
                  <Switch
                    checked={profile?.low_balance_notify || false}
                    onCheckedChange={handleLowBalanceNotifyChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Default Model Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Default Model
                </CardTitle>
                <CardDescription>
                  Apps will use this model by default, but they may override it if they choose to do so. 
                  This model will also be used as your default fallback model.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Default Model</Label>
                  <Select value={profile?.default_model || ''} onValueChange={handleDefaultModelChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a default model">
                        {selectedModel && (
                          <div className="flex items-center gap-2">
                            <span>{selectedModel.name}</span>
                            {selectedModel.badge && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {selectedModel.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            <span>{model.name}</span>
                            {model.badge && (
                              <span className="text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">
                                {model.badge}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedModel && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{selectedModel.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Provider: {selectedModel.provider}
                        </p>
                        {selectedModel.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedModel.description}
                          </p>
                        )}
                      </div>
                      {selectedModel.badge && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          {selectedModel.badge}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <Button variant="outline" className="w-full" asChild>
                  <a href="#" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Browse available models and prices
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
