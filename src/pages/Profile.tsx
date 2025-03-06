
import React from "react";
import { User, Settings, Edit, LogOut, Camera } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BottomNav from "@/components/BottomNav";

const Profile = () => {
  // Mock user data - in a real app, this would come from authentication
  const userData = {
    username: "johndoe",
    displayName: "John Doe",
    bio: "Content creator | Digital enthusiast | Making videos about tech and lifestyle",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    followers: 1248,
    following: 342,
    videos: 24,
    likes: 1582
  };

  return (
    <div className="min-h-screen app-background pb-16">
      <div className="max-w-md mx-auto p-4">
        {/* Profile Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
            @{userData.username}
          </h1>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Profile Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg mb-6">
          <div className="flex items-start gap-5">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-white">
                <AvatarImage src={userData.avatar} alt={userData.displayName} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white text-xl">
                  {userData.displayName.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-full p-1">
                <Camera className="h-4 w-4 text-white" />
              </button>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1">{userData.displayName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{userData.bio}</p>
              
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white"
                size="sm"
              >
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg mb-6">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2">
              <div className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
                {userData.videos}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Videos</div>
            </div>
            <div className="p-2">
              <div className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
                {userData.likes}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Likes</div>
            </div>
            <div className="p-2">
              <div className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
                {userData.followers}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
            </div>
            <div className="p-2">
              <div className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
                {userData.following}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Following</div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
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
          
          {/* Video Grid */}
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
            
            {/* More content message */}
            {userData.videos > 9 && (
              <div className="text-center mt-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Scroll to see {userData.videos - 9} more videos
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
