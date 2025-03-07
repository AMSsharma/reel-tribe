
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BottomNav from '@/components/BottomNav';
import YouTubeSummarizer from '@/components/YouTubeSummarizer';

const Profile = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth page if not logged in
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via the useEffect
  }

  return (
    <div className="min-h-screen app-background">
      <div className="max-w-4xl mx-auto p-6 pb-24">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
          Your Profile
        </h1>

        <Card className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-md shadow-sm mb-8">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Manage your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 flex items-center justify-center text-white text-xl font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-muted-foreground">Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
          </CardFooter>
        </Card>

        <Tabs defaultValue="summarizer" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summarizer">YouTube Summarizer</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summarizer" className="space-y-4">
            <YouTubeSummarizer />
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent videos and interactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center py-8 text-muted-foreground">No recent activity</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
