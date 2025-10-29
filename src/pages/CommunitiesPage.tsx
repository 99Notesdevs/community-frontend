import { useEffect, useState } from 'react';
import { Search, Plus, Users, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/api/route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
       
        <div className="w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search communities..."
              className="pl-10 w-full sm:w-80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden transition-all hover:shadow-md">
              <Skeleton className="h-32 w-full" />
              <CardHeader className="relative">
                <div className="absolute -top-6 left-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                <div className="pt-6">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </div>
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : communities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {communities.map((community) => (
            <Card key={community.id} className="group overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
              <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
                {community.bannerUrl && (
                  <img 
                    src={community.bannerUrl} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
              <CardHeader className="relative pb-2">
                <div className="absolute -top-6 left-4 h-12 w-12 rounded-full border-4 border-background bg-background overflow-hidden shadow-md">
                  {community.iconUrl ? (
                    <img 
                      src={community.iconUrl} 
                      alt={community.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted/50 flex items-center justify-center">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="pt-6">
                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/r/${community.id}`} 
                      className="font-semibold hover:underline text-foreground/90 hover:text-foreground transition-colors"
                    >
                      r/{community.name}
                    </Link>
                    {community.nsfw && (
                      <Badge variant="destructive" className="text-xs">NSFW</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {community.description || 'No description provided'}
                  </p>
                </div>
              </CardHeader>
              <CardFooter className="flex justify-between items-center pt-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1.5" />
                  <span>{community.membersCount?.toLocaleString() || 0}</span>
                </div>
                <Button 
                  variant={joinedCommunityIds.includes(community.id) ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => handleJoinCommunity(community.id)}
                  className="transition-all"
                >
                  {joinedCommunityIds.includes(community.id) ? 'Joined' : 'Join'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-muted/30">
          <div className="bg-muted p-4 rounded-full mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No communities found</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            We couldn't find any communities matching your search. Try adjusting your search or create a new community.
          </p>
          <Button>
            Create Community
            <Plus className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="gap-1.5"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Previous
            </Button>
            <div className="flex items-center gap-1 px-4">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'ghost'}
                    size="sm"
                    className={`w-10 h-10 p-0 ${currentPage === pageNum ? '' : 'text-muted-foreground'}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-muted-foreground px-1">...</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 p-0 text-muted-foreground"
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="gap-1.5"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunitiesPage;