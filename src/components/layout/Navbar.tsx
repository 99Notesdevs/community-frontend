import { useState } from 'react';
import { Search, Bell, User, Menu, MessageSquare } from 'lucide-react';
import { Link , useNavigate} from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../../hooks/useAuthModal';
import { LogIn ,ChevronDown} from 'lucide-react';
interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Navbar = ({ onToggleSidebar, isSidebarOpen }: NavbarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user,isAuthenticated,logout } = useAuth();
  const { showLogin } = useAuthModal();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
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
          
          <div className="flex items-center gap-2 md:gap-4">
          {!isAuthenticated ? (
            <button
              onClick={() => showLogin()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--indigo-600)] rounded-md hover:bg-[var(--indigo-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--indigo-500)] transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden md:inline">Login</span>
            </button>
          ) : (
            <div className="relative group">
              <div className="flex items-center gap-2 focus:outline-none cursor-pointer py-2 px-1 rounded-md hover:bg-[var(--bg-light-secondary)] transition-colors">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.firstName}&background=random`}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border-2 border-[var(--border-light)] object-cover"
                />
                <span className="hidden md:inline text-sm font-medium text-[var(--text-light)]">
                  {user?.firstName}
                </span>
                <ChevronDown className="w-4 h-4 text-[var(--text-light)]" />
              </div>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-light)] rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-light-secondary)]"
                  >
                    Your Profile
                  </Link>
                  <div className="border-t border-[var(--border-light)] my-1"></div>
                  <Link
                    to="/myorders"
                    className="block px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-light-secondary)]"
                  >
                    My Orders
                  </Link>
                  <div className="border-t border-[var(--border-light)] my-1"></div>
                  <Link
                    to="/contact"
                    className="block px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-light-secondary)]"
                  >
                    Contact Us
                  </Link>
                  <div className="border-t border-[var(--border-light)] my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--red-600)] hover:bg-[var(--bg-light-secondary)]"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;