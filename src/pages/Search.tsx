
import React, { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { Search as SearchIcon, X } from "lucide-react";
import { motion } from "framer-motion";

const Search = () => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchFocus = () => {
    setIsSearchActive(true);
  };

  const handleSearchBlur = () => {
    if (searchQuery.length === 0) {
      setIsSearchActive(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchActive(false);
  };

  return (
    <div className="min-h-screen app-background pb-16">
      <div className="max-w-md mx-auto p-4">
        <div className="relative">
          <div 
            className={`flex items-center p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
              isSearchActive ? "ring-2 ring-pink-500" : ""
            }`}
            onClick={!isSearchActive ? handleSearchFocus : undefined}
          >
            <SearchIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            
            {isSearchActive ? (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                placeholder="Search videos, creators..."
                className="flex-1 bg-transparent border-none outline-none px-3 py-1"
                autoFocus
              />
            ) : (
              <div className="flex-1 px-3 py-1 text-gray-500">
                Search videos, creators...
              </div>
            )}
            
            {searchQuery.length > 0 && (
              <button onClick={clearSearch} className="p-1">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {isSearchActive && searchQuery.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <div className="text-center text-gray-500 dark:text-gray-400">
              {searchQuery.length > 0 ? (
                <p>Searching for "{searchQuery}"...</p>
              ) : (
                <p>Type to search</p>
              )}
            </div>
          </motion.div>
        )}

        {!isSearchActive && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
              Trending
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div 
                  key={item}
                  className="aspect-square rounded-xl overflow-hidden relative insta-youtube-gradient-card shadow-md"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-400">Trending #{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Search;
