
import React from 'react';
import BottomNav from '@/components/BottomNav';
import { Bell, Heart, MessageCircle, User } from 'lucide-react';

// Mock activity data
const ACTIVITIES = [
  {
    id: '1',
    type: 'like',
    user: { name: 'TechMaster', avatar: 'https://i.pravatar.cc/150?img=1' },
    content: 'liked your short "How to Master Swift in 10 Minutes"',
    time: '2h ago'
  },
  {
    id: '2',
    type: 'comment',
    user: { name: 'CodeArtist', avatar: 'https://i.pravatar.cc/150?img=2' },
    content: 'commented: "Great tips! Very useful 👍"',
    time: '5h ago'
  },
  {
    id: '3',
    type: 'follow',
    user: { name: 'FutureTech', avatar: 'https://i.pravatar.cc/150?img=3' },
    content: 'started following you',
    time: '1d ago'
  },
  {
    id: '4',
    type: 'like',
    user: { name: 'ReactMaster', avatar: 'https://i.pravatar.cc/150?img=4' },
    content: 'liked your short "Mastering React Hooks"',
    time: '2d ago'
  },
  {
    id: '5',
    type: 'mention',
    user: { name: 'DevGuru', avatar: 'https://i.pravatar.cc/150?img=5' },
    content: 'mentioned you in a comment: "@user check this out!"',
    time: '3d ago'
  }
];

const Activity = () => {
  return (
    <div className="flex flex-col min-h-screen app-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="flex justify-between items-center px-4 h-14">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">Activity</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 mt-14 mb-16">
        <div className="max-w-md mx-auto p-4">
          <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-md rounded-xl shadow-sm overflow-hidden">
            {ACTIVITIES.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/20"
              >
                <div className="relative">
                  <img 
                    src={activity.user.avatar} 
                    alt={activity.user.name}
                    className="w-12 h-12 rounded-full object-cover" 
                  />
                  <div className="absolute -bottom-1 -right-1 rounded-full p-1.5 bg-white dark:bg-gray-800">
                    {activity.type === 'like' && (
                      <Heart size={14} className="text-red-500 fill-red-500" />
                    )}
                    {activity.type === 'comment' && (
                      <MessageCircle size={14} className="text-blue-500" />
                    )}
                    {activity.type === 'follow' && (
                      <User size={14} className="text-purple-500" />
                    )}
                    {activity.type === 'mention' && (
                      <Bell size={14} className="text-yellow-500" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user.name}</span>{' '}
                    {activity.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Activity;
