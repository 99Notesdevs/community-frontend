import { useState } from 'react';
import { Search, Filter, Users, MessageSquare, Hash } from 'lucide-react';
import PostCard from '@/components/posts/PostCard';
import { dummyPosts, dummyCommunities, dummyUsers } from '@/data/dummyData';

const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'communities' | 'users'>('posts');
  const [showFilters, setShowFilters] = useState(false);

  const filteredPosts = dummyPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.community.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCommunities = dummyCommunities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = dummyUsers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Search className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Explore</h1>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-smooth"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search posts, communities, and users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input pl-10 pr-4 text-lg h-12"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-3">Search Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Time Range</label>
              <select className="form-input">
                <option>All Time</option>
                <option>Past Hour</option>
                <option>Past Day</option>
                <option>Past Week</option>
                <option>Past Month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select className="form-input">
                <option>Relevance</option>
                <option>Most Recent</option>
                <option>Most Upvoted</option>
                <option>Most Commented</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content Type</label>
              <select className="form-input">
                <option>All Content</option>
                <option>Text Posts</option>
                <option>Images</option>
                <option>Links</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-smooth ${
            activeTab === 'posts' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Posts ({filteredPosts.length})</span>
        </button>
        
        <button
          onClick={() => setActiveTab('communities')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-smooth ${
            activeTab === 'communities' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Hash className="h-4 w-4" />
          <span>Communities ({filteredCommunities.length})</span>
        </button>
        
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-smooth ${
            activeTab === 'users' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Users ({filteredUsers.length})</span>
        </button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {activeTab === 'posts' && (
          <>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No posts found
                </h3>
                <p className="text-muted-foreground">
                  Try different keywords or filters
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'communities' && (
          <>
            {filteredCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCommunities.map((community) => (
                  <div key={community.id} className="community-card">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{community.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{community.name}</h3>
                        <p className="text-muted-foreground text-sm mb-2">
                          {community.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {(community.members / 1000000).toFixed(1)}M members
                          </span>
                          <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
                            community.isJoined
                              ? 'bg-muted text-foreground hover:bg-muted-dark'
                              : 'btn-primary'
                          }`}>
                            {community.isJoined ? 'Joined' : 'Join'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Hash className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No communities found
                </h3>
                <p className="text-muted-foreground">
                  Try different keywords or create a new community
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <>
            {filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="community-card">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground font-medium">
                          {user.avatar}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">u/{user.username}</h3>
                        <p className="text-muted-foreground text-sm mb-1">
                          {user.displayName}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{user.karma.toLocaleString()} karma</span>
                          <span>
                            Joined {user.joinDate.toLocaleDateString()}
                          </span>
                        </div>
                        {user.bio && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {user.bio}
                          </p>
                        )}
                      </div>
                      <button className="btn-primary">
                        Follow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No users found
                </h3>
                <p className="text-muted-foreground">
                  Try different keywords
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;