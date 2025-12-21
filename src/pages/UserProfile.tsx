import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '@/components/posts/PostCard';
import { format, parseISO } from 'date-fns';
import { 
  User, 
  Cake, 
  MessageSquare, 
  Award, 
  TrendingUp,
  Settings,
  Share2,
  ShoppingBag,
  Home
} from 'lucide-react';
import { api } from '@/api/route';
import { useAuth } from '@/contexts/AuthContext';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
interface Post {
  id: string;
  title: string;
  content: string;
  votesCount: number;
  commentsCount: number;
  authorId: string;
  communityId: string;
  createdAt: string;
  updatedAt: string;
  isBookmarked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  votesCount: number;
  authorId: string;
  postId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  postTitle?: string;
}

interface UserProfileData {
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
}

const defaultUser: UserProfileData = {
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
export default function UserProfile() {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfileData>(defaultUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user: authUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      console.log('fetchData called');
      if (!authUser?.id) {
        console.log('No authUser.id found');
        return;
      }
      
      console.log('Fetching data for user:', authUser.id);
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Making API calls...');
        const [postsResponse, commentsResponse] = await Promise.all([
          api.get<ApiResponse<Post[]>>(`/profile/profile-posts/?userId=${authUser.id}&skip=0&take=10`),
          api.get<ApiResponse<Comment[]>>(`/profile/profile-comments/?userId=${authUser.id}&skip=0&take=10`),
        ]) as [ApiResponse<Post[]>, ApiResponse<Comment[]>];

        console.log('API responses:', { postsResponse, commentsResponse });

        if (postsResponse.success) {
          setPosts(postsResponse.data);
          // Calculate post karma (sum of votes)
          const postKarma = postsResponse.data.reduce(
            (sum: number, post: Post) => sum + (post.votesCount || 0), 0
          );
          
          setCurrentUser(prev => ({
            ...prev,
            postKarma,
            karma: prev.karma + postKarma
          }));
        }

        if (commentsResponse.success) {
          setComments(commentsResponse.data);
          // Calculate comment karma (sum of votes)
          const commentKarma = commentsResponse.data.reduce(
            (sum: number, comment: Comment) => sum + (comment.votesCount || 0), 0
          );
          
          setCurrentUser(prev => ({
            ...prev,
            commentKarma,
            karma: prev.karma + commentKarma
          }));
        }
      } catch (err: any) {
        console.error('Error fetching profile data:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load profile data. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authUser?.id]);

  console.log('Rendering UserProfile', { loading, error, currentUser, posts, comments });

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative">
        <div 
          className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600"
          style={{ 
            backgroundImage: `url(${currentUser.banner})`, 
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
                src={currentUser.avatar} 
                alt={currentUser.username} 
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=4F46E5&color=fff&size=128`;
                }}
              />
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">u/{currentUser.username}</h1>
                <div className="flex items-center space-x-4 text-white text-sm drop-shadow">
                  <span className="flex items-center gap-1">
                    <Award size={16} />
                    {currentUser.karma.toLocaleString()} Karma
                  </span>
                  <span className="flex items-center gap-1">
                    <Cake size={16} />
                    Joined {format(parseISO(currentUser.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 md:ml-auto md:mb-4 flex gap-2">
              <button className="p-2 rounded-full bg-white hover:bg-gray-100 shadow-lg transition-colors">
                <Share2 size={20} className="text-gray-700" />
              </button>
              <Link 
                to="/settings" 
                className="px-4 py-2 rounded-full font-medium bg-white text-gray-800 hover:bg-gray-100 shadow-lg transition-colors flex items-center gap-2"
              >
                <Settings size={18} />
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar - User info */}
          <div className="lg:w-80 space-y-4">
            {/* About Card */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <User size={18} />
                About
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                {currentUser.bio || 'No bio available.'}
              </p>
            </div>
            
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp size={18} />
                Stats
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Post Karma</span>
                  <span className="font-semibold text-orange-500">{currentUser.postKarma.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Comment Karma</span>
                  <span className="font-semibold text-blue-500">{currentUser.commentKarma.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Followers</span>
                    <span className="font-medium">{currentUser.followers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Following</span>
                    <span className="font-medium">{currentUser.following}</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>
                      {Math.floor((new Date().getTime() - new Date(currentUser.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days old
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links Card */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <div className="space-y-2">
                <button
                  onClick={() => window.open('http://tests.main.local:5173', '_blank')}
                  className="w-full text-left px-4 py-2.5 rounded-lg transition-colors hover:bg-blue-50 text-blue-600 flex items-center gap-3 group"
                >
                  <Home size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Test Portal</span>
                </button>
                <button
                  onClick={() => window.open('http://shop.main.local:5174', '_blank')}
                  className="w-full text-left px-4 py-2.5 rounded-lg transition-colors hover:bg-green-50 text-green-600 flex items-center gap-3 group"
                >
                  <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Shop</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Right column - Content tabs */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex-1 px-6 py-3 font-medium text-sm transition-colors ${
                    activeTab === 'posts' 
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <MessageSquare size={16} />
                    Posts ({loading ? '...' : posts.length})
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`flex-1 px-6 py-3 font-medium text-sm transition-colors ${
                    activeTab === 'comments' 
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <MessageSquare size={16} />
                    Comments ({loading ? '...' : comments.length})
                  </span>
                </button>
              </nav>
            </div>
            
            {/* Content */}
            <div className="mt-4 space-y-4">
              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <div className="space-y-4">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <PostCard 
                        key={post.id}
                        post={{
                          id: post.id,
                          title: post.title,
                          content: post.content,
                          author: currentUser.username,
                          authorId: post.authorId,
                          community: '', // You might want to fetch the community name
                          communityIcon: '', // You might want to fetch the community icon
                          createdAt: new Date(post.createdAt),
                          votesCount: post.votesCount,
                          commentsCount: post.commentsCount,
                          isBookmarked: post.isBookmarked
                        }}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No posts found. Start by creating your first post!
                    </div>
                  )}
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <span>Comment on </span>
                          <Link 
                            to={`/post/${comment.postId}`} 
                            className="ml-1 font-medium text-blue-600 hover:underline"
                          >
                            {comment.postTitle || 'a post'}
                          </Link>
                          <span className="mx-1">•</span>
                          <span>{format(parseISO(comment.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                        <p className="text-gray-800">{comment.content}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-4 w-4 mr-1" 
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                            >
                              <path 
                                fillRule="evenodd" 
                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                                clipRule="evenodd" 
                              />
                            </svg>
                            {comment.votesCount}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No comments found. Start the conversation!
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