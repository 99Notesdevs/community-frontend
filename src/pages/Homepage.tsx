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

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-6">Loading posts...</div>;
  }

  if (error) {
    return <div className="max-w-4xl mx-auto px-4 py-6 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PostCreationBar />

      <div className="flex items-center justify-between mb-6 border-b">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'feed'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'}`}
          >
            Your Feed
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 font-medium text-sm flex items-center space-x-1 ${activeTab === 'saved'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Bookmark className="h-4 w-4" />
            <span>Saved</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSortBy('hot')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm ${
              sortBy === 'hot' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Hot</span>
          </button>

          <button
            onClick={() => setSortBy('new')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm ${
              sortBy === 'new' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
          >
            <Star className="h-4 w-4" />
            <span>New</span>
          </button>

          <button
            onClick={() => setSortBy('top')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm ${
              sortBy === 'top' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Top</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No posts found. Be the first to create one!
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;