import { useEffect, useState } from 'react';
import PostCreationBar from '@/components/posts/PostCreationBar';
import PostCard from '@/components/posts/PostCard';
import { TrendingUp, Star } from 'lucide-react';
import { api } from '@/api/route';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
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
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await api.get<{ success: boolean; data: Post[] }>(`/posts`);
        if (response.success) {
          // Map the API response to match the Post interface expected by PostCard
          const formattedPosts = response.data.map((post: any) => ({
            ...post,
            votes: post.votesCount, // Map votesCount to votes
            comments: post.commentsCount, // Map commentsCount to comments
            author: post.authorId?.toString() || 'Anonymous', // Ensure author is a string
            community: 'Community', // Default community name
            communityIcon: '👥', // Default community icon
            createdAt: new Date(post.createdAt) // Ensure createdAt is a Date object
          }));
          setPosts(formattedPosts);
        } else {
          setError('Failed to fetch posts');
        }
      } catch (err) {
        setError('An error occurred while fetching posts');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const sortedPosts = [...posts].sort((a, b) => {
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

      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => setSortBy('hot')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-smooth ${
            sortBy === 'hot' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span className="font-medium">Hot</span>
        </button>
        
        <button
          onClick={() => setSortBy('new')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-smooth ${
            sortBy === 'new' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
        >
          <Star className="h-4 w-4" />
          <span className="font-medium">New</span>
        </button>
        
        <button
          onClick={() => setSortBy('top')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-smooth ${
            sortBy === 'top' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span className="font-medium">Top</span>
        </button>
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