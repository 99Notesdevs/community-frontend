import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/route';
import PostCard from '@/components/posts/PostCard';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  community: string;
  communityIcon: string;
  createdAt: Date;
  votes: number;
  comments: number;
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
            votes: post.votes || 0,
            comments: post.comments || 0,
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

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!community) return <div className="p-8">Community not found</div>;

  return (
    <div className="flex flex-col">
      {community && (
        <>
          {/* Banner */}
          <div className="relative">
            <img src={community.banner} alt="Community Banner" className="w-full h-48 object-cover" />
            <div className="absolute -bottom-10 left-6 flex items-center space-x-4">
              <img src={community.icon} alt="Community Icon" className="w-20 h-20 rounded-full border-4 border-white shadow-md" />
              <div>
                <h1 className="text-2xl font-bold">{community.name}</h1>
                <p className="text-gray-600 text-sm">
                  {community.members?.toLocaleString() || '0'} members • {community.online || '0'} online
                </p>
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 mt-16">
            {/* Main posts area */}
            <div className="md:col-span-2 space-y-4">
              {posts.length > 0 ? (
                posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No posts yet in this community</div>
              )}
            </div>

            {/* Sidebar with data & rules */}
            <div className="bg-white border rounded-xl p-4 shadow space-y-4 h-fit sticky top-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">About Community</h3>
                <p className="text-sm text-gray-600">{community.description || 'No description available'}</p>
              </div>
              {community.rules?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Rules</h3>
                  <ul className="text-sm text-gray-600 list-disc ml-5 space-y-1">
                    {community.rules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}