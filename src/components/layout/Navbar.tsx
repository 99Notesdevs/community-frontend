import { useState } from 'react';
import { Search, Bell, User, Menu, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Navbar = ({ onToggleSidebar, isSidebarOpen }: NavbarProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-muted transition-smooth md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">Community</span>
          </Link>
        </div>

        {/* Center search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search communities, posts, and users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 pr-4"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          <Link to="/messages" className="p-2 rounded-lg hover:bg-muted transition-smooth relative">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Link>
          
          <button className="p-2 rounded-lg hover:bg-muted transition-smooth relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              5
            </span>
          </button>
          
          <Link to="/profile" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-smooth">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="hidden sm:block font-medium">john_doe</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;