import { useEffect, useState } from 'react';
import { Search, Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/api/route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Community {
  id: number;
  name: string;
  displayName: string;
  description: string;
  iconUrl: string;
  bannerUrl: string;
  type: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
  nsfw: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: number;
  membersCount?: number;
  isJoined?: boolean;
}

const CommunitiesPage = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<{ success: boolean; data: Community[] }>(
          `/communities?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchQuery)}`
        );
        
        if (response.success && response.data) {
          // Map the API response to include default values for missing fields
          const formattedCommunities = response.data.map((community: any) => ({
            ...community,
            membersCount: community.membersCount || 0,
            isJoined: community.isJoined || false,
            iconUrl: community.iconUrl || '',
            bannerUrl: community.bannerUrl || '',
          }));
          
          setCommunities(formattedCommunities);
          // If the API doesn't return total count, we'll handle pagination based on the array length
          const totalItems = response.data.length;
          setTotalPages(Math.ceil(totalItems / itemsPerPage));
        } else {
          throw new Error('Failed to fetch communities');
        }
      } catch (error) {
        console.error('Failed to fetch communities:', error);
        setError('Failed to load communities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchCommunities, 300);
    return () => clearTimeout(debounceTimer);
  }, [currentPage, searchQuery]);

  const handleJoinCommunity = async (communityId: number) => {
    try {
      const communityIndex = communities.findIndex(c => c.id === communityId);
      if (communityIndex === -1) return;

      const updatedCommunities = [...communities];
      const wasJoined = updatedCommunities[communityIndex].isJoined;
      
      // Optimistic update
      updatedCommunities[communityIndex] = {
        ...updatedCommunities[communityIndex],
        isJoined: !wasJoined,
        membersCount: wasJoined 
          ? (updatedCommunities[communityIndex].membersCount || 1) - 1 
          : (updatedCommunities[communityIndex].membersCount || 0) + 1
      };
      setCommunities(updatedCommunities);

      // API call
      const response = wasJoined 
        ? await api.post<{ success: boolean }>(`/communities/${communityId}/leave`)
        : await api.post<{ success: boolean }>(`/communities/${communityId}/join`);

      if (!response.success) {
        throw new Error(`Failed to ${wasJoined ? 'leave' : 'join'} community`);
      }
    } catch (error) {
      console.error('Failed to update community join status:', error);
      // Revert on error
      setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, isJoined: !c.isJoined } : c));
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Communities</h1>
        <Button asChild>
          <Link to="/communities/create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Community
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search communities..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : communities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {communities.map((community) => (
            <div key={community.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-20 bg-muted relative">
                {community.bannerUrl && (
                  <img 
                    src={community.bannerUrl} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start -mt-8 mb-2">
                  <div className="h-12 w-12 rounded-full border-4 border-background bg-background overflow-hidden">
                    {community.iconUrl ? (
                      <img 
                        src={community.iconUrl} 
                        alt={community.displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <Users className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <Button 
                    variant={community.isJoined ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => handleJoinCommunity(community.id)}
                    className="shrink-0"
                  >
                    {community.isJoined ? 'Joined' : 'Join'}
                  </Button>
                </div>
                <Link to={`/r/${community.id}`} className="font-medium hover:underline block mb-1">
                  r/{community.name}
                </Link>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {community.description || 'No description'}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  {community.membersCount?.toLocaleString() || 0} members
                </div>
                {community.nsfw && (
                  <span className="inline-block mt-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                    NSFW
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No communities found</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommunitiesPage;