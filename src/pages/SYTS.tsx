
import React, { useState, useEffect } from 'react';
import YouTubeSummarizer from '@/components/YouTubeSummarizer';
import VideoCompilationGenerator from '@/components/VideoCompilationGenerator';
import BottomNav from '@/components/BottomNav';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const SYTS = () => {
  // Default tab is 'summarize'
  const [activeTab, setActiveTab] = useState('summarize');

  return (
    <div className="min-h-screen app-background">
      <div className="max-w-4xl mx-auto p-6 pb-24">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
          ShortYourTubeShorts
        </h1>
        
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="summarize">Summarize Video</TabsTrigger>
            <TabsTrigger value="compilation">Create Compilation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summarize" className="mt-0">
            <YouTubeSummarizer />
          </TabsContent>
          
          <TabsContent value="compilation" className="mt-0">
            <VideoCompilationGenerator />
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
};

export default SYTS;
