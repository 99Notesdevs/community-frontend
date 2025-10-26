import { useEffect, useState } from 'react';
import { Search, Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/api/route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Community {
  id: number;
  name: string;
  description: string;
  type: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
  iconUrl: string;
  bannerUrl: string;
  nsfw: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: number;
  membersCount?: number;
}

const CommunitiesPage = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all communities
        const [communitiesRes, joinedRes] = await Promise.all([
          api.get<{ data: Community[] }>('/communities'),
          api.get<{ data: { community: Community }[] }>('/communities/me')
        ]);
        
        setCommunities(communitiesRes.data);
        setJoinedCommunityIds(joinedRes.data.map(c => c.community.id));
      } catch (err) {
        setError('Failed to fetch communities');
        console.error('Error fetching communities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleJoinCommunity = async (communityId: number) => {
    try {
      const isCurrentlyJoined = joinedCommunityIds.includes(communityId);

      // Optimistic update
      setJoinedCommunityIds(prev => 
        isCurrentlyJoined 
          ? prev.filter(id => id !== communityId)
          : [...prev, communityId]
      );

      // Update members count optimistically
      setCommunities(communities.map(c => 
        c.id === communityId 
          ? { ...c, membersCount: (c.membersCount || 0) + (isCurrentlyJoined ? -1 : 1) }
          : c
      ));

      // API call
      const response = isCurrentlyJoined
        ? await api.post<{ success: boolean }>(`/communities/${communityId}/leave`)
        : await api.post<{ success: boolean }>(`/communities/${communityId}/join`);

      if (!response.success) {
        throw new Error(`Failed to ${isCurrentlyJoined ? 'leave' : 'join'} community`);
      }
    } catch (err) {
      // Revert on error
      const isCurrentlyJoined = joinedCommunityIds.includes(communityId);
      setJoinedCommunityIds(prev => 
        isCurrentlyJoined 
          ? prev.filter(id => id !== communityId)
          : [...prev, communityId]
      );
      setCommunities(communities.map(c => 
        c.id === communityId 
          ? { ...c, membersCount: (c.membersCount || 0) + (isCurrentlyJoined ? 1 : -1) }
          : c
      ));
      setError(`Failed to ${joinedCommunityIds.includes(communityId) ? 'leave' : 'join'} community`);
      console.error('Error updating community membership:', err);
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
                        alt={community.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <Users className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleJoinCommunity(community.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      joinedCommunityIds.includes(community.id)
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {joinedCommunityIds.includes(community.id) ? 'Leave' : 'Join'}
                  </button>
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