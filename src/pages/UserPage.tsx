import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

import { 
  User as UserIcon,
  Cake, 
  MessageSquare, 
  Award, 
  TrendingUp,
  Share2,
  Settings,
  Home,
  MessageSquareText,
  Bookmark
} from 'lucide-react';
import { api } from '@/api/route';
import PostCard from '@/components/posts/PostCard';

interface User {
  id: string;
  username: string;
  avatar: string;
  banner: string;
  bio: string;
  createdAt: string;
  karma: number;
  postKarma: number;
  commentKarma: number;
  followers: number;
  following: number;
  isFollowing?: boolean;
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

interface Comment {
  id: string;
  content: string;
  votesCount: number;
  authorId: string;
  postId: string;
  postTitle: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}
const defaultUser: User = {
  id: '1',
  username: 'JohnDoe',
  avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=4F46E5&color=fff&size=128',
  banner: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=300&fit=crop',
  bio: 'Frontend Developer | React Enthusiast | Coffee Lover',
  createdAt: '2023-01-15T10:30:00Z',
  karma: 1245,
  postKarma: 850,
  commentKarma: 395,
  followers: 128,
  following: 87
};

export default function UserPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<User>(defaultUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
  if (!id) {
    setError('User ID is required');
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setError(null);
    
    // Fetch user details, posts, and comments in parallel
    const [postsRes] = await Promise.all([
      api.get<ApiResponse<Post[]>>(`/posts/${id}?skip=0&take=10`)
    ]);

    console.log('Posts API response:', postsRes);

    if (postsRes?.success && Array.isArray(postsRes.data)) {
      const formattedPosts = postsRes.data.map((post: any) => ({
        ...post,
        id: post.id?.toString(),
        votesCount: post.votesCount || 0,
        commentsCount: post.commentsCount || 0,
        author: post.authorId?.toString() || 'Anonymous',
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
        isBookmarked: false
      }));
      setPosts(formattedPosts);
    } else {
      console.error('Unexpected posts response format:', postsRes);
      setPosts([]);
    }
  } catch (err) {
    console.error('Error fetching user data:', err);
    const errorMessage = err.response?.data?.message || err.message || 'Failed to load user data';
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};
    fetchData();
  }, [id]);

  const handleFollow = async () => {
    if (!user) return;
    
    try {
      const response = await api.post<ApiResponse<any>>(`/users/${id}/follow`);
      if (response.success) {
        setUser(prev => prev ? { 
          ...prev, 
          isFollowing: !prev.isFollowing,
          followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1 
        } : defaultUser);
      }
    } catch (err) {
      console.error('Error following user:', err);
      setError('Failed to update follow status');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  if (!user) return <div className="p-8 text-center">User not found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative">
        <div 
          className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600"
          style={{ 
            backgroundImage: `url(${user.banner})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 relative z-10">
            <div className="flex items-end space-x-4">
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=4F46E5&color=fff&size=128`;
                }}
              />
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">u/{user.username}</h1>
                <div className="flex items-center space-x-4 text-white text-sm drop-shadow">
                  <span className="flex items-center gap-1">
                    <Award size={16} />
                    {user.karma.toLocaleString()} Karma
                  </span>
                  <span className="flex items-center gap-1">
                    <Cake size={16} />
                    Joined {format(parseISO(user.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 md:ml-auto md:mb-4 flex gap-2">
              <button className="p-2 rounded-full bg-white hover:bg-gray-100 shadow-lg transition-colors">
                <Share2 size={20} className="text-gray-700" />
              </button>
              <button 
                onClick={handleFollow}
                className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 shadow-lg transition-colors ${
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
      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column - User info */}
          <div className="md:w-1/4 space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <UserIcon size={18} /> About
              </h2>
              <p className="text-gray-700 text-sm">{user.bio}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Followers</span>
                  <span className="font-medium">{user.followers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Following</span>
                  <span className="font-medium">{user.following.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp size={18} /> Karma
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Post Karma</span>
                  <span className="font-medium">{user.postKarma.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comment Karma</span>
                  <span className="font-medium">{user.commentKarma.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Content */}
          <div className="md:w-3/4">
            {/* Tabs */}
            <div className="bg-white rounded-t-lg shadow border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === 'posts' 
                    ? 'text-blue-500 border-b-2 border-blue-500' 
                    : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <MessageSquareText size={16} />
                  Posts
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === 'comments' 
                    ? 'text-blue-500 border-b-2 border-blue-500' 
                    : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <MessageSquare size={16} />
                  Comments
                </button>
              </nav>
            </div>
            
            {/* Tab content */}
            <div className="bg-white rounded-b-lg shadow divide-y">
              {activeTab === 'posts' && (
                <div className="divide-y">
                  {posts.length > 0 ? (
                    posts.map(post => (
                      <PostCard 
                        key={post.id} 
                        post={{
                          id: post.id.toString(),
                          votesCount: post.votesCount || 0,
                          type:post.type,
                          commentsCount: post.commentsCount || 0,
                          community: post.community,
                          author: post.authorId?.toString() || 'Unknown',
                          authorId: post.authorId?.toString() || '',
                          createdAt: new Date(post.createdAt),
                          title: post.title || '',
                          content: post.content || ''
                        }} 
                      />
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center py-12">
                        <MessageSquareText size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-700">No posts yet</h3>
                        <p className="text-gray-500 mt-1">When u/{user.username} makes their first post, it will appear here.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'comments' && (
                <div className="divide-y">
                  {comments.length > 0 ? (
                    comments.map(comment => (
                      <div key={comment.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="text-sm text-gray-500 mb-1">
                              Commented on post "{comment.postId}"
                            </div>
                            <p className="text-gray-800">{comment.content}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Award size={14} />
                                {comment.votesCount}
                              </span>
                              <span>{format(parseISO(comment.createdAt), 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center py-12">
                        <MessageSquare size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-700">No comments yet</h3>
                        <p className="text-gray-500 mt-1">When u/{user.username} makes their first comment, it will appear here.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}