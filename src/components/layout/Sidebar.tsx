import { Home, TrendingUp, Search, MessageSquare, Users, Plus, Hash } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { CreateCommunityModal } from '../community/CreateCommunityModal';
import { api } from '@/api/route';

interface COmmunityResponse{
  id: number,
  userId: number,
  communityId: number,
  role: string,
  joinedAt: Date,
  community: Community
}
interface Community{
  id: number,
  name: string,
  displayName: string,
  description: string,
  iconUrl: string,
  bannerUrl: string,
  type: string,
  nsfw: false,
  createdAt: Date,
  updatedAt: Date,
  ownerId: number
}
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Trending', href: '/trending', icon: TrendingUp },
    { name: 'Explore', href: '/explore', icon: Search },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Communities', href: '/communities', icon: Users },
  ];

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        console.log("Fetching communities...");
        const response = await api.get<{ success: boolean; data: COmmunityResponse[] }>('/communities/me');
        console.log("API Response:", response.data);
        
        if (response.success) {
          // Assuming the communities are in response.data.data
          setCommunities(response.data.map((community) => community.community));
        }
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    };
  
    fetchCommunities();
  }, []);
  // const joinedCommunities = [
  //   { name: 'r/technology', members: '2.1M', icon: '💻' },
  //   { name: 'r/programming', members: '1.8M', icon: '👨\u200d💻' },
  //   { name: 'r/webdev', members: '890K', icon: '🌐' },
  //   { name: 'r/reactjs', members: '650K', icon: '⚛️' },
  //   { name: 'r/javascript', members: '1.2M', icon: '📜' },
  // ];

  return (
    <>
      {/* Create Community Modal */}
      <CreateCommunityModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-900 border-r border-sidebar-border dark:border-gray-700 z-40 transition-transform duration-300 overflow-y-auto",
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
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md transition-colors duration-200",
                    isActive 
                      ? "bg-gray-200 dark:bg-gray-700 font-medium text-foreground dark:text-white" 
                      : "text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200"
                  )}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Create Community */}
          <div className="pt-4 border-t border-border dark:border-gray-700">
            <button 
              onClick={() => {
                onClose();
                setIsCreateModalOpen(true);
              }}
              className="w-full flex items-center px-3 py-2 text-primary hover:bg-primary-light dark:hover:bg-primary/20 rounded-lg transition-smooth"
            >
              <Plus className="h-5 w-5 mr-3" />
              Create Community
            </button>
          </div>

          {/* Joined Communities */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground dark:text-gray-400 mb-3 px-3">
              Your Communities
            </h3>
            <div className="space-y-1">
              {communities.map((community) => (
                <Link
                  key={community.name}
                  to={`/r/${community.id}`}
                  onClick={onClose}
                  className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group"
                >
                  <span className="text-lg mr-3">{community.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {community.name}
                    </div>
                    <div className="text-xs text-muted-foreground dark:text-gray-400">
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