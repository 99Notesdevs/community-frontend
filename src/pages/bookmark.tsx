import { useEffect, useState } from 'react';
import { api } from '@/api/route';
import { PostCard } from '@/components/posts/PostCard';
import type { Post } from '@/components/posts/PostCard';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export default function BookmarkPage() {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      try {
        const response = await api.get('/bookmark/profile/bookmarks');
        const responseData = response as unknown as ApiResponse<Array<{ post: any }>>;

        if (responseData.success) {
          // Transform the bookmarked posts to match the Post interface
          const transformedPosts = responseData.data.map(item => {
            const post = item.post;
            return {
              id: post.id,
              title: post.title,
              content: post.content,
              type: post.type || 'TEXT',
              author: post.author?.username || 'Anonymous',
              authorId: post.authorId?.toString() || '0',
              community: post.community?.name || 'Community',
              communityIcon: post.community?.iconUrl || '',
              createdAt: new Date(post.createdAt),
              votesCount: post.votesCount || 0,
              commentsCount: post.commentsCount || 0,
              imageUrl: post.imageUrl,
              link: post.link,
              isBookmarked: true,
              votes: post.votesCount || 0,
              comments: post.commentsCount || 0,
              ...(post.poll && { poll: post.poll })
            };
          });

          setBookmarkedPosts(transformedPosts);
        } else {
          toast.error('Failed to load bookmarked posts');
        }
      } catch (error) {
        console.error('Error fetching bookmarked posts:', error);
        toast.error('An error occurred while loading your bookmarks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarkedPosts();
  }, []);

  const handleBookmarkToggle = async (postId: string) => {
    try {
      const response = await api.post<ApiResponse<{ success: boolean }>>(`/bookmark/${postId}/bookmark`);
      const responseData = response as unknown as ApiResponse<{ success: boolean }>;
      
      if (responseData.success) {
        // Remove the unbookmarked post from the list
        setBookmarkedPosts(prevPosts => 
          prevPosts.filter(post => post.id !== postId)
        );
        toast.success('Post removed from bookmarks');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Bookmarks</h1>
      
      {bookmarkedPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">You haven't bookmarked any posts yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarkedPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onBookmarkToggle={handleBookmarkToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}