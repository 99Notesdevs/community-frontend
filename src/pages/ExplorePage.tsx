import { useState, useEffect, useCallback } from 'react';
import { Search, MessageSquare, Hash } from 'lucide-react';
import PostCard from '@/components/posts/PostCard';
import { api } from '@/api/route';
import { Link } from 'react-router-dom';
interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  community: string;
  communityIcon: string;
  createdAt: string;
  votesCount: number;
  commentsCount: number;
  imageUrl?: string;
  link?: string;
}

interface Community {
  id: string;
  name: string;
  description: string;
  icon: string;
  members: number;
  isJoined: boolean;
}

const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'communities'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState({
    posts: true,
    communities: true,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await api.get<{ success: boolean; data: Post[] }>('/posts');
      if (response.success) {
        setPosts(response.data);
      }
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(prev => ({ ...prev, posts: false }));
    }
  }, []);

  const fetchCommunities = useCallback(async () => {
    try {
      const response = await api.get<{ success: boolean; data: Community[] }>('/communities');
      if (response.success) {
        setCommunities(response.data);
      }
    } catch (err) {
      setError('Failed to fetch communities');
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(prev => ({ ...prev, communities: false }));
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchCommunities();
  }, [fetchPosts, fetchCommunities]);

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.community.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (community.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        {/* Search Bar */}
        <div className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts, communities, and users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-foreground bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-3 bg-card hover:bg-muted/50 border border-border rounded-lg transition-all duration-200"
            aria-label="Toggle filters"
          >
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Filters</span>
          </button>
        </div>
<<<<<<< HEAD
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search posts, communities, and users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input pl-10 pr-4 text-lg h-12"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-smooth ${
            activeTab === 'posts' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Posts ({loading.posts ? '...' : filteredPosts.length})</span>
        </button>
        
        <button
          onClick={() => setActiveTab('communities')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-smooth ${
            activeTab === 'communities' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Hash className="h-4 w-4" />
          <span>Communities ({loading.communities ? '...' : filteredCommunities.length})</span>
=======
      </div>

      {/* Filters Panel */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-48 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground/90">Search Filters</h3>
            <button 
              onClick={() => setShowFilters(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close filters"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Time Range</label>
              <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none">
                <option>All Time</option>
                <option>Past Hour</option>
                <option>Past Day</option>
                <option>Past Week</option>
                <option>Past Month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Sort By</label>
              <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none">
                <option>Relevance</option>
                <option>Most Recent</option>
                <option>Most Upvoted</option>
                <option>Most Commented</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Content Type</label>
              <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none">
                <option>All Content</option>
                <option>Text Posts</option>
                <option>Images</option>
                <option>Links</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center mb-8 overflow-x-auto pb-2 -mx-1">
        <div className="flex space-x-1 bg-muted/30 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              activeTab === 'posts' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground/90 hover:bg-muted/50'
            }`}
            aria-selected={activeTab === 'posts'}
          >
            <MessageSquare className="h-4 w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Posts</span>
            <span className="ml-1.5 px-1.5 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground">
              {filteredPosts.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('communities')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              activeTab === 'communities' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground/90 hover:bg-muted/50'
            }`}
            aria-selected={activeTab === 'communities'}
          >
            <Hash className="h-4 w-4" />
            <span className="whitespace-nowrap">Communities</span>
            <span className="ml-1.5 px-1.5 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground">
              {filteredCommunities.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              activeTab === 'users' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground/90 hover:bg-muted/50'
            }`}
            aria-selected={activeTab === 'users'}
          >
            <Users className="h-4 w-4" />
            <span className="whitespace-nowrap">Users</span>
            <span className="ml-1.5 px-1.5 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground">
              {filteredUsers.length}
            </span>
          </button>
        </div>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-smooth ${
            activeTab === 'users' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Users ({filteredUsers.length})</span>
>>>>>>> a9c2547 (My profile)
        </button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {activeTab === 'posts' && (
          <>
            {loading.posts ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={{
                    ...post,
                    votesCount: post.votesCount,
                    commentsCount: post.commentsCount,
                    createdAt: new Date(post.createdAt)
                  }} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No posts found
                </h3>
                <p className="text-muted-foreground">
                  Try different keywords or filters
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'communities' && (
          <>
            {loading.communities ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCommunities.map((community) => (
                  <div key={community.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {community.icon || <Hash className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <div className="flex-1">
                        <Link to={`/r/${community.id}`} className="font-semibold text-lg hover:underline">
                          r/{community.name}
                        </Link>
                        <p className="text-muted-foreground text-sm mb-2 line-clamp-1">
                          {community.description || 'No description'}
                        </p>
                        <div className="flex items-center justify-between">
                          <button 
                            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                              community.isJoined
                                ? 'bg-muted text-foreground hover:bg-muted/80'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            }`}
                          >
                            {community.isJoined ? 'Joined' : 'Join'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Hash className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No communities found
                </h3>
                <p className="text-muted-foreground">
                  Try different keywords or create a new community
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;