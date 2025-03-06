
import { Home, User, Search, Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        <Link 
          to="/" 
          className={`flex flex-col items-center ${
            isActive('/') 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600' 
              : 'text-gray-500'
          }`}
        >
          <Home className={`w-6 h-6 ${isActive('/') ? 'stroke-[#ea384c]' : ''}`} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link 
          to="/search" 
          className={`flex flex-col items-center ${
            isActive('/search') 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600' 
              : 'text-gray-500'
          }`}
        >
          <Search className={`w-6 h-6 ${isActive('/search') ? 'stroke-[#ea384c]' : ''}`} />
          <span className="text-xs mt-1">Search</span>
        </Link>
        <Link 
          to="/activity" 
          className={`flex flex-col items-center ${
            isActive('/activity') 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600' 
              : 'text-gray-500'
          }`}
        >
          <Heart className={`w-6 h-6 ${isActive('/activity') ? 'stroke-[#ea384c]' : ''}`} />
          <span className="text-xs mt-1">Activity</span>
        </Link>
        <Link 
          to="/profile" 
          className={`flex flex-col items-center ${
            isActive('/profile') 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600' 
              : 'text-gray-500'
          }`}
        >
          <User className={`w-6 h-6 ${isActive('/profile') ? 'stroke-[#ea384c]' : ''}`} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
