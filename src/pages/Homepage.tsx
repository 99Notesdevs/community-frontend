import { useEffect, useState, useCallback, useRef } from 'react';
import PostCreationBar from '@/components/posts/PostCreationBar';
import PostCard from '@/components/posts/PostCard';
import { TrendingUp, Star, Bookmark } from 'lucide-react';
import { api } from '@/api/route';
import { useAuth } from '@/contexts/AuthContext';
interface API{
  success: boolean;
  data: {
    posts: Post[];
  };
}
interface Post {
  id: string;
  title: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'LINK' | 'POLL';
  author: string;
  authorId: string;
  community: Community;
  communityIcon: string;
  createdAt: Date;
  votesCount: number;
  commentsCount: number;
  imageUrl?: string;
  url?: string;
  isBookmarked?: boolean;
  poll?: {
    id: string;
    question: string;
    options: Array<{
      id: string;
      text: string;
      voteCount: number;
      voted: boolean;
    }>;
    totalVotes: number;
    hasVoted: boolean;
    endsAt?: Date;
    isExpired: boolean;
    pollOptionId?: string;
  };
}
interface Community {
  id: number;
  name: string;
  displayName: string,
  description: string,
  iconUrl: string,
  bannerUrl: string,
  type: string,
  nsfw: boolean,
  createdAt: Date,
  updatedAt: Date,
  ownerId: number;
}
const Homepage = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'saved'>('feed');
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('new');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const bookmarkedPostIdsRef = useRef<Set<string>>(new Set());

  const handleNewPost = useCallback((newPost: Post) => {
    // Format the new post to match our existing post structure
    const formattedPost: Post = {
      ...newPost,
      id: newPost.id.toString(),
      author: newPost.authorId?.toString() || 'Anonymous',
      community: newPost.community || {
        id: 0,
        name: 'default',
        displayName: 'Default Community',
        description: '',
        iconUrl: '',
        bannerUrl: '',
        type: 'public',
        nsfw: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: 0
      },
      votesCount: newPost.votesCount || 0,
      commentsCount: newPost.commentsCount || 0,
      createdAt: new Date(newPost.createdAt),
      isBookmarked: false
    };

    // Add the new post to the beginning of the posts array
    setPosts(prevPosts => [formattedPost, ...prevPosts]);
  }, []);

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
      console.log('Fetching posts from API...');
      const response = await api.get<API>('/posts');
      console.log('Posts API response:', response);
      
      // Handle the response structure where posts are in response.data
      const postsData = response.success && Array.isArray(response.data.posts) 
        ? response.data.posts 
        : [];
      
      if (!postsData.length) {
        console.log('No posts data received');
        return [];
      }
      
      return postsData.map((post: any) => ({
        ...post,
        id: post.id?.toString(),
        votes: post.votesCount || post.votes || 0,
        comments: post.commentsCount || post.comments || 0,
        author: post.authorId?.toString() || post.author || 'Anonymous',
        community: post.community || { 
          id: post.communityId || 0,
          name: 'community',
          displayName: 'Community',
          description: '',
          iconUrl: '',
          bannerUrl: '',
          type: 'public',
          nsfw: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ownerId: 0
        },
        communityIcon: post.communityIcon || '',
        createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
        isBookmarked: bookmarkedPostIdsRef.current.has(post.id?.toString() || '')
      }));
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
    <div className="bg-card border border-border/50 p-4 mb-3 animate-pulse">
      <div className="flex items-center space-x-2.5 mb-3">
        <div className="w-7 h-7 rounded-full bg-muted"></div>
        <div className="space-y-1.5">
          <div className="h-3 w-20 bg-muted"></div>
          <div className="h-2.5 w-12 bg-muted"></div>
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-4 w-3/4 bg-muted"></div>
        <div className="h-3.5 w-full bg-muted"></div>
        <div className="h-3.5 w-5/6 bg-muted"></div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex space-x-3">
          <div className="h-7 w-14 bg-muted"></div>
          <div className="h-7 w-14 bg-muted"></div>
        </div>
        <div className="h-7 w-16 bg-muted"></div>
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
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <PostCreationBar onPostCreated={handleNewPost} />
      </div>

      <div className="space-y-3">
        {sortedPosts.length > 0 ? (
          <div className="space-y-3">
            {sortedPosts.map((post) => (
              <div
                key={post.id}
                className="bg-card border border-border/50 hover:border-border transition-colors duration-200"
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-dashed border-border/50 p-8 text-center">
            <div className="mx-auto w-12 h-12 flex items-center justify-center mb-3">
              {activeTab === 'saved' ? (
                <Bookmark className="h-6 w-6 text-muted-foreground" />
              ) : (
                <svg
                  className="h-6 w-6 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              )}
            </div>
            <h3 className="text-base font-medium text-foreground mb-1">
              {activeTab === 'saved' ? 'No saved posts' : 'No posts yet'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {activeTab === 'saved'
                ? 'Posts you save will appear here. Start exploring and save posts you want to come back to later.'
                : 'Be the first to create a post and start the conversation!'}
            </p>
            {activeTab !== 'saved' && (
              <button
                onClick={() => document.querySelector('textarea')?.focus()}
                className="mt-3 inline-flex items-center px-3.5 py-1.5 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
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