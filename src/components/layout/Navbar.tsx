import { useState } from 'react';
import { Search, Bell, User, Menu, MessageSquare } from 'lucide-react';
import { Link , useNavigate} from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../../hooks/useAuthModal';
import { LogIn, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';
import LOGO from '../../../public/Logo.svg';
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2.5 rounded-lg hover:bg-muted/50 transition-all duration-200 md:hidden focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <Link to="/" className="flex items-center space-x-2">       
              <span className="text-primary-foreground font-bold text-lg"><img src={LOGO} alt="Logo" className="w-24 h-20" /></span>
          </Link>
        </div>

        {/* Center search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search communities, posts, and users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm bg-background border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
         
          
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            {!isAuthenticated ? (
            <button
              onClick={() => showLogin()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden md:inline">Login</span>
            </button>
          ) : (
            <div className="relative group">
              <div className="flex items-center gap-2 focus:outline-none cursor-pointer py-1.5 pr-1.5 pl-2.5 rounded-lg hover:bg-muted/50 transition-all duration-200 group-focus-within:ring-2 group-focus-within:ring-primary/20">
                <div className="relative">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user?.firstName}&background=random`}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border-2 border-border/50 group-hover:border-primary/50 transition-colors duration-200 object-cover"
                  />
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background"></span>
                </div>
                <span className="hidden md:inline text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                  {user?.firstName}
                </span>
                <ChevronDown className="w-4 h-4 text-foreground/60 group-hover:text-foreground transition-colors" />
              </div>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-1.5 w-56 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg py-1.5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-border/50 shadow-md">
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2.5 text-sm text-foreground/90 hover:bg-muted/50 transition-colors duration-150 group"
                  >
                    <User className="w-4 h-4 mr-3 text-foreground/60 group-hover:text-foreground/80 transition-colors" />
                    Your Profile
                  </Link>
                  <div className="border-t border-border/30 my-1"></div>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2.5 text-sm text-foreground/90 hover:bg-muted/50 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-foreground/60 group-hover:text-foreground/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                  <Link
                    to="/contact"
                    className="flex items-center px-4 py-2.5 text-sm text-foreground/90 hover:bg-muted/50 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-foreground/60 group-hover:text-foreground/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Us
                  </Link>
                  <div className="border-t border-border/30 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
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