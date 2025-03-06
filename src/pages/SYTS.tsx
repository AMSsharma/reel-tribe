import React from "react";
import { MessageCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const SYTS = () => {
  return (
    <div className="min-h-screen app-background pb-16">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 mb-6">
          SYTS
        </h1>
        
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full mx-auto flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold">Welcome to SYTS</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Connect with creators and share your thoughts
            </p>
            <button className="px-6 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-shadow">
              Get Started
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default SYTS;
