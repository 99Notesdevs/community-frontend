import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/route';
import PostCard from '@/components/posts/PostCard';
import { format } from 'date-fns';

interface User {
  id: string;
  username: string;
  avatar: string;
  banner?: string;
  bio?: string;
  joinDate: string;
  karma: number;
  isFollowing?: boolean;
}

interface Post {
  id: string;
  title: string;
  content: string;
  community: string;
  communityIcon: string;
  createdAt: string;
  votes: number;
  comments: number;
  imageUrl?: string;
  link?: string;
}

export default function UserPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'saved'>('posts');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user details and posts in parallel
        const [userRes, postsRes] = await Promise.all([
          api.get<{ success: boolean; data: User }>(`/users/${id}`),
          api.get<{ success: boolean; data: Post[] }>(`/users/${id}/posts`)
        ]);

        if (userRes.success) {
          setUser(userRes.data);
        } else {
          throw new Error('User not found');
        }
        
        if (postsRes.success) {
          setPosts(postsRes.data);
        }
      } catch (err) {
        setError('Failed to load user data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleFollow = async () => {
    if (!user) return;
    
    try {
      const response = await api.post(`/users/${user.id}/follow`);
      if (response.success) {
        setUser(prev => prev ? { ...prev, isFollowing: !prev.isFollowing } : null);
      }
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!user) return <div className="p-8">User not found</div>;

  return (
    <div className="flex flex-col">
      {/* Banner */}
      <div className="relative">
        <div 
          className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600"
          style={user.banner ? { backgroundImage: `url(${user.banner})`, backgroundSize: 'cover' } : {}}
        >
          {/* Overlay for better text visibility */}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 relative z-10">
            <div className="flex items-end space-x-4">
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg" 
              />
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-white">u/{user.username}</h1>
                <div className="flex items-center space-x-4 text-white text-sm">
                  <span>• {user.karma?.toLocaleString() || 0} Karma</span>
                  <span>• Joined {format(new Date(user.joinDate), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 md:ml-auto md:mb-4">
              <button 
                onClick={handleFollow}
                className={`px-4 py-2 rounded-full font-medium ${
                  user.isFollowing 
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {user.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column - User info and about */}
          <div className="md:w-1/4 space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-2">About</h2>
              {user.bio ? (
                <p className="text-gray-700">{user.bio}</p>
              ) : (
                <p className="text-gray-500 italic">No bio yet</p>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-2">Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Post Karma</span>
                  <span className="font-medium">{Math.floor(user.karma * 0.7)?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comment Karma</span>
                  <span className="font-medium">{Math.floor(user.karma * 0.3)?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Age</span>
                  <span className="font-medium">
                    {Math.floor((new Date().getTime() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Posts and tabs */}
          <div className="md:w-3/4">
            {/* Tabs */}
            <div className="bg-white rounded-t-lg shadow border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`px-6 py-3 font-medium text-sm ${activeTab === 'posts' 
                    ? 'text-blue-500 border-b-2 border-blue-500' 
                    : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Posts
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`px-6 py-3 font-medium text-sm ${activeTab === 'comments' 
                    ? 'text-blue-500 border-b-2 border-blue-500' 
                    : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Comments
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`px-6 py-3 font-medium text-sm ${activeTab === 'saved' 
                    ? 'text-blue-500 border-b-2 border-blue-500' 
                    : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Saved
                </button>
              </nav>
            </div>
            
            {/* Posts/Content */}
            <div className="space-y-4 mt-4">
              {activeTab === 'posts' && posts.length > 0 && (
                posts.map(post => (
                  <PostCard 
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    content={post.content}
                    author={user.username}
                    community={post.community}
                    communityIcon={post.communityIcon}
                    createdAt={new Date(post.createdAt)}
                    votes={post.votes}
                    comments={post.comments}
                    imageUrl={post.imageUrl}
                    link={post.link}
                  />
                ))
              )}
              
              {activeTab === 'posts' && posts.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-500">When u/{user.username} creates a post, it will show up here.</p>
                </div>
              )}
              
              {activeTab === 'comments' && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                  <p className="text-gray-500">When u/{user.username} makes a comment, it will show up here.</p>
                </div>
              )}
              
              {activeTab === 'saved' && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved items yet</h3>
                  <p className="text-gray-500">When u/{user.username} saves a post or comment, it will show up here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}