import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useConnectedAccounts } from '@/hooks/useConnectedAccounts';
import { Camera, Github, Mail, Chrome } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading, updateProfile, uploadAvatar } = useProfile();
  const { accounts, loading: accountsLoading, connectGitHub } = useConnectedAccounts();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: ''
  });

  const [isUpdating, setIsUpdating] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        username: profile.username || ''
      });
    }
  }, [profile]);

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    const result = await updateProfile(formData);
    
    if (result?.success) {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
    setIsUpdating(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    const result = await uploadAvatar(file);
    if (result?.success) {
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated.",
      });
    } else {
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConnectGitHub = async () => {
    try {
      await connectGitHub();
      toast({
        title: "Connecting to GitHub",
        description: "You will be redirected to GitHub to complete the connection.",
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to GitHub. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'email':
        return <Mail className="h-5 w-5 text-muted-foreground" />;
      case 'google':
        return <Chrome className="h-5 w-5 text-blue-600" />;
      case 'github':
        return (
          <div className="p-1 bg-black rounded">
            <Github className="h-4 w-4 text-white" />
          </div>
        );
      default:
        return <Mail className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'email':
        return 'Email';
      case 'google':
        return 'Google';
      case 'github':
        return 'GitHub';
      default:
        return provider;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex w-full">
        <div className={`flex-1 p-4 lg:p-8`}>
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Profile</h1>
              <p className="text-muted-foreground text-sm lg:text-base">Manage your account information and connected services.</p>
            </div>

            {/* Profile Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">Profile Information</CardTitle>
                <CardDescription className="text-sm lg:text-base">
                  Update your personal information and profile picture.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20 lg:h-24 lg:w-24">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="text-xl lg:text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {profile?.first_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-medium text-foreground">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the camera icon to upload a new picture. Recommended size: 1:1 ratio.
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter your username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={isUpdating}
                  className="w-full sm:w-auto"
                >
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </Button>
              </CardContent>
            </Card>

            {/* Connected Accounts Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">Connected Accounts</CardTitle>
                <CardDescription className="text-sm lg:text-base">
                  Manage your connected social accounts for easier sign-in.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {accountsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading connected accounts...</p>
                  </div>
                ) : (
                  accounts.map((account) => (
                    <div key={account.provider} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-border rounded-lg gap-3 sm:gap-0">
                      <div className="flex items-center gap-3">
                        {getProviderIcon(account.provider)}
                        <div>
                          <p className="font-medium text-foreground">{getProviderName(account.provider)}</p>
                          <p className="text-sm text-muted-foreground break-all">
                            {account.provider === 'email' ? account.email : 
                             account.connected ? 'Connected' : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      {account.provider === 'email' ? (
                        <Badge variant="secondary">Primary</Badge>
                      ) : account.connected ? (
                        <Badge variant="default">Connected</Badge>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full sm:w-auto"
                          onClick={account.provider === 'github' ? handleConnectGitHub : undefined}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
