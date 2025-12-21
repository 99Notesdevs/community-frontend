import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/route';
import PostCard from '@/components/posts/PostCard';

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
}

interface Community {
  id: number;
  name: string;
  banner: string;
  icon: string;
  description: string;
  members: number;
  online: number;
  rules: string[];
}

export default function CommunityPage() {
  const { id } = useParams<{ id: string }>();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch community details and posts in parallel
        const [communityRes, postsRes] = await Promise.all([
          api.get<{ success: boolean; data: Community }>(`/communities/${id}`),
          api.get<{ success: boolean; data: Post[] }>(`/communities/${id}/posts`)
        ]);

        if (communityRes.success) {
          setCommunity(communityRes.data);
        }
        
        if (postsRes.success) {
          // Transform posts to match the PostCard's expected format
          const formattedPosts = postsRes.data.map(post => ({
            ...post,
            id: String(post.id), // Ensure ID is a string
            votesCount: post.votesCount || 0,
            commentsCount: post.commentsCount || 0,
            community: communityRes.data?.name || '',
            communityIcon: communityRes.data?.icon || '',
            createdAt: new Date() // You might want to get this from the API
          }));
          setPosts(formattedPosts);
        }
      } catch (err) {
        setError('Failed to load community data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="flex justify-center p-8 text-foreground">Loading...</div>;
  if (error) return <div className="text-red-500 dark:text-red-400 p-8">{error}</div>;
  if (!community) return <div className="p-8 text-foreground">Community not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {community && (
        <div className="space-y-6">
          {/* Banner with improved layout */}
          <div className="relative overflow-visible rounded-md shadow-sm">
            <div className="aspect-w-16 aspect-h-6 bg-muted rounded-t-md overflow-hidden">
              <img 
                src={community.banner} 
                alt="Community Banner" 
                className="w-full h-40 sm:h-48 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/1200x300/f3f4f6/9ca3af?text=Community+Banner';
                }}
              />
            </div>
            <div className="relative z-10 px-4 sm:px-6 -mt-8 flex items-end space-x-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-card p-0.5 rounded-full shadow-md border-2 border-border overflow-hidden">
                <img 
                  src={community.icon} 
                  alt="Community Icon" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/100/3b82f6/ffffff?text=' + community.name.charAt(0).toUpperCase();
                  }}
                />
              </div>
              <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-md shadow-sm border border-border mb-2">
                <h1 className="text-xl font-semibold text-foreground">{community.name}</h1>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">{community.members?.toLocaleString() || '0'}</span> members • 
                  <span className="text-green-500 dark:text-green-400 font-medium"> {community.online || '0'} online</span>
                </p>
              </div>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-8">
            {/* Posts section */}
            <div className="lg:col-span-2 space-y-4">
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map(post => (
                    <div key={post.id} className="transition-all duration-200 hover:shadow-sm rounded-lg overflow-hidden">
                      <PostCard post={post} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-lg border p-8 text-center">
                  <p className="text-muted-foreground">No posts yet in this community</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Be the first to create a post!</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* About Card */}
              <div className="bg-card border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b">
                  <h3 className="font-medium text-foreground">About</h3>
                </div>
                <div className="p-4 break-words overflow-hidden">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {community.description || 'No description available'}
                  </p>
                </div>
              </div>

              {/* Rules Card */}
              {community.rules?.length > 0 && (
                <div className="bg-card border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-3 border-b">
                    <h3 className="font-medium text-foreground">Community Rules</h3>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2">
                      {community.rules.map((rule, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <span className="text-muted-foreground/70 mr-2">•</span>
                          <span className="text-muted-foreground">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}