import React, { useEffect, useState } from "react";
import { User, Settings, Edit, LogOut, Camera } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileData {
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const { user, signOut, loading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, full_name, bio, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfileData(data);
      } catch (error: any) {
        console.error("Error fetching profile:", error.message);
        toast.error("Couldn't load profile information");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else if (!loading) {
      setIsLoading(false);
    }
  }, [user, loading]);

  if (!loading && !user) {
    return <Navigate to="/auth" />;
  }

  const displayData = profileData || {
    username: user?.email?.split('@')[0] || "user",
    full_name: "Loading...",
    bio: "Loading profile information...",
    avatar_url: null
  };

  const statsData = {
    videos: 0,
    likes: 0,
    followers: 0,
    following: 0
  };

  return (
    <div className="min-h-screen app-background pb-16">
      <div className="max-w-md mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
            @{displayData.username}
          </h1>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg mb-6">
          <div className="flex items-start gap-5">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-white">
                <AvatarImage src={displayData.avatar_url || undefined} alt={displayData.full_name || displayData.username} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white text-xl">
                  {(displayData.full_name || displayData.username).substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-full p-1">
                <Camera className="h-4 w-4 text-white" />
              </button>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1">{displayData.full_name || displayData.username}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{displayData.bio || "No bio yet"}</p>
              
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white"
                size="sm"
              >
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg mb-6">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2">
              <div className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
                {statsData.videos}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Videos</div>
            </div>
            <div className="p-2">
              <div className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
                {statsData.likes}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Likes</div>
            </div>
            <div className="p-2">
              <div className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
                {statsData.followers}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
            </div>
            <div className="p-2">
              <div className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
                {statsData.following}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Following</div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="grid grid-cols-3 border-b border-gray-200 dark:border-gray-700">
            <button className="py-3 relative active">
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600"></div>
              <span className="text-sm font-medium">Videos</span>
            </button>
            <button className="py-3 text-gray-500 dark:text-gray-400">
              <span className="text-sm font-medium">Liked</span>
            </button>
            <button className="py-3 text-gray-500 dark:text-gray-400">
              <span className="text-sm font-medium">Saved</span>
            </button>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-3 gap-1">
              {Array.from({length: 9}).map((_, index) => (
                <div key={index} className="aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 via-pink-100 to-red-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-red-900/20 flex items-center justify-center">
                    <User className="text-gray-400 h-6 w-6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
