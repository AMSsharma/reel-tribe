
import React from 'react';
import BottomNav from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

const SYTS = () => {
  return (
    <div className="min-h-screen app-background">
      <div className="max-w-4xl mx-auto p-6 pb-24">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
          Share YouTube Short (SYTS)
        </h1>

        <Card className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-md shadow-sm mb-8 p-6">
          <div className="flex items-center space-x-3 text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 p-4 rounded-lg mb-6">
            <Info className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">This is where you'll find AI-summarized YouTube videos that have been shared by users.</p>
          </div>
          
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No Videos Yet</h2>
            <p className="text-muted-foreground mb-6">
              Be the first to create and share a YouTube video summary!
            </p>
            <Link to="/profile">
              <Button className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white">
                Create a Summary
              </Button>
            </Link>
          </div>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default SYTS;
