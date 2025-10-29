import { useEffect, useState, useCallback, useRef } from 'react';
import PostCreationBar from '@/components/posts/PostCreationBar';
import PostCard from '@/components/posts/PostCard';
import { TrendingUp, Star, Bookmark } from 'lucide-react';
import { api } from '@/api/route';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  community: string;
  communityIcon: string;
  createdAt: Date;
  votesCount: number;
  commentsCount: number;
  imageUrl?: string;
  link?: string;
  isBookmarked?: boolean;
  [key: string]: any; // for other properties we might not use directly
}

const Homepage = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'saved'>('feed');
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const bookmarkedPostIdsRef = useRef<Set<string>>(new Set());

  const fetchBookmarks = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping bookmarks fetch');
      return new Set<string>();
    }

    try {
      console.log('Fetching bookmarks...');
      const response = await api.get<{ success: boolean; data: Array<{ post: Post }> }>('/bookmark/profile/bookmarks');
      console.log('Bookmarks response:', response);
      
      if (response.success && response.data) {
        const bookmarkedIds = new Set(response.data.map(bookmark => bookmark.post.id.toString()));
        console.log('Bookmarked post IDs:', bookmarkedIds);
        bookmarkedPostIdsRef.current = bookmarkedIds;
        return bookmarkedIds;
      }
      return new Set<string>();
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      return new Set<string>();
    }
  }, [isAuthenticated]);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await api.get<{ success: boolean; data: Post[] }>('/posts');
      if (response.success) {
        return response.data.map((post: any) => ({
          ...post,
          votes: post.votesCount,
          comments: post.commentsCount,
          author: post.authorId?.toString() || 'Anonymous',
          community: post.community?.name || 'Community',
          communityIcon: post.community?.iconUrl || '',
          createdAt: new Date(post.createdAt),
          isBookmarked: bookmarkedPostIdsRef.current.has(post.id.toString())
        }));
      }
      return [];
    } catch (err) {
      console.error('Error fetching posts:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading data...');
        
        // Always fetch posts
        const postsData = await fetchPosts();
        console.log('Fetched posts:', postsData.length);
        
        // Only fetch bookmarks if authenticated
        let bookmarkedIds = new Set<string>();
        if (isAuthenticated) {
          bookmarkedIds = await fetchBookmarks();
          console.log('Fetched bookmarks count:', bookmarkedIds.size);
        }

        // Update posts with bookmarked status
        const postsWithBookmarks = postsData.map(post => ({
          ...post,
          isBookmarked: bookmarkedIds.has(post.id.toString())
        }));

        console.log('Setting posts with bookmarks:', postsWithBookmarks.length);
        setPosts(postsWithBookmarks);
      } catch (err) {
        setError('An error occurred while loading data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]); // Add isAuthenticated as dependency

  const filteredPosts = activeTab === 'saved'
    ? posts.filter(post => post.isBookmarked)
    : posts;

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();

    switch (sortBy) {
      case 'new':
        return dateB - dateA;
      case 'top':
        return b.votesCount - a.votesCount;
      case 'hot':
      default:
        // Simple hot algorithm: combine votes and recency
        const hoursSinceA = (Date.now() - dateA) / (1000 * 60 * 60);
        const hoursSinceB = (Date.now() - dateB) / (1000 * 60 * 60);
        const aScore = a.votesCount / Math.pow(hoursSinceA + 2, 1.8);
        const bScore = b.votesCount / Math.pow(hoursSinceB + 2, 1.8);
        return bScore - aScore;
    }
  });

  // Skeleton loader component
  const SkeletonPost = () => (
    <div className="bg-card rounded-xl p-6 mb-6 border border-border animate-pulse">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-muted"></div>
        <div className="space-y-1">
          <div className="h-4 w-24 bg-muted rounded"></div>
          <div className="h-3 w-16 bg-muted rounded"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-muted rounded"></div>
        <div className="h-4 w-full bg-muted rounded"></div>
        <div className="h-4 w-5/6 bg-muted rounded"></div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex space-x-4">
          <div className="h-8 w-16 bg-muted rounded"></div>
          <div className="h-8 w-16 bg-muted rounded"></div>
        </div>
        <div className="h-8 w-20 bg-muted rounded"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse mb-8">
          <div className="h-12 bg-muted rounded-lg mb-6"></div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <div className="h-10 w-24 bg-muted rounded-lg"></div>
              <div className="h-10 w-24 bg-muted rounded-lg"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-10 w-20 bg-muted rounded-lg"></div>
              <div className="h-10 w-20 bg-muted rounded-lg"></div>
              <div className="h-10 w-20 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <SkeletonPost key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-6 rounded-xl text-center">
          <h3 className="font-medium text-lg mb-2">Something went wrong</h3>
          <p className="text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <PostCreationBar />
      </div>

      <div className="space-y-4">
        {sortedPosts.length > 0 ? (
          <div className="space-y-4">
            {sortedPosts.map((post) => (
              <div 
                key={post.id} 
                className="bg-card rounded-xl border border-border overflow-hidden transition-all hover:shadow-md hover:border-primary/20"
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
              {activeTab === 'saved' ? (
                <Bookmark className="h-8 w-8 text-muted-foreground" />
              ) : (
                <svg 
                  className="h-8 w-8 text-muted-foreground" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="1.5" 
                    d="M12 4v16m8-8H4" 
                  />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              {activeTab === 'saved' ? 'No saved posts' : 'No posts yet'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {activeTab === 'saved'
                ? 'Posts you save will appear here. Start exploring and save posts you want to come back to later.'
                : 'Be the first to create a post and start the conversation!'}
            </p>
            {activeTab !== 'saved' && (
              <button
                onClick={() => document.querySelector('textarea')?.focus()}
                className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Create Post
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;