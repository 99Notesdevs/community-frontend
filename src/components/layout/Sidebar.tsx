import { Home, TrendingUp, Search, MessageSquare, Users, Plus, Hash } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Trending', href: '/trending', icon: TrendingUp },
    { name: 'Explore', href: '/explore', icon: Search },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Communities', href: '/communities', icon: Users },
  ];

  const joinedCommunities = [
    { name: 'r/technology', members: '2.1M', icon: '💻' },
    { name: 'r/programming', members: '1.8M', icon: '👨‍💻' },
    { name: 'r/webdev', members: '890K', icon: '🌐' },
    { name: 'r/reactjs', members: '650K', icon: '⚛️' },
    { name: 'r/javascript', members: '1.2M', icon: '📜' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-sidebar border-r border-sidebar-border z-40 transition-transform duration-300 overflow-y-auto",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-4 space-y-6">
          {/* Main Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn("nav-item", isActive && "active")}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Create Community */}
          <div className="pt-4 border-t border-border">
            <button className="w-full flex items-center px-3 py-2 text-primary hover:bg-primary-light rounded-lg transition-smooth">
              <Plus className="h-5 w-5 mr-3" />
              Create Community
            </button>
          </div>

          {/* Joined Communities */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-3">
              Your Communities
            </h3>
            <div className="space-y-1">
              {joinedCommunities.map((community) => (
                <Link
                  key={community.name}
                  to={`/r/${community.name.split('/')[1]}`}
                  onClick={onClose}
                  className="flex items-center px-3 py-2 rounded-lg hover:bg-sidebar-hover transition-smooth group"
                >
                  <span className="text-lg mr-3">{community.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {community.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {community.members} members
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;