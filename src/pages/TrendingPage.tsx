import { useState } from 'react';
import PostCard from '@/components/posts/PostCard';
import { dummyPosts } from '@/data/dummyData';
import { Clock, Calendar, TrendingUp } from 'lucide-react';

const TrendingPage = () => {
  const [timeFilter, setTimeFilter] = useState<'hour' | 'day' | 'week' | 'month'>('day');

  // Filter posts based on time period
  const getFilteredPosts = () => {
    const now = new Date();
    const timeFrames = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    };

    return dummyPosts
      .filter(post => now.getTime() - post.createdAt.getTime() <= timeFrames[timeFilter])
      .sort((a, b) => b.votes - a.votes);
  };

  const trendingPosts = getFilteredPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Trending Posts</h1>
        </div>
      </div>

      {/* Time Filter Controls */}
      <div className="flex items-center space-x-2 mb-6 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setTimeFilter('hour')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-smooth ${
            timeFilter === 'hour' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span className="font-medium">Past Hour</span>
        </button>
        
        <button
          onClick={() => setTimeFilter('day')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-smooth ${
            timeFilter === 'day' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span className="font-medium">Today</span>
        </button>
        
        <button
          onClick={() => setTimeFilter('week')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-smooth ${
            timeFilter === 'week' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span className="font-medium">This Week</span>
        </button>
        
        <button
          onClick={() => setTimeFilter('month')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-smooth ${
            timeFilter === 'month' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span className="font-medium">This Month</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-2xl font-bold text-primary">{trendingPosts.length}</div>
          <div className="text-sm text-muted-foreground">Trending Posts</div>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-2xl font-bold text-primary">
            {trendingPosts.reduce((sum, post) => sum + post.votes, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Votes</div>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-2xl font-bold text-primary">
            {trendingPosts.reduce((sum, post) => sum + post.comments, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Comments</div>
        </div>
      </div>

      {/* Trending Posts */}
      <div className="space-y-4">
        {trendingPosts.length > 0 ? (
          trendingPosts.map((post, index) => (
            <div key={post.id} className="relative">
              {/* Trending rank */}
              <div className="absolute -left-2 top-4 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
                {index + 1}
              </div>
              <PostCard post={post} />
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No trending posts found
            </h3>
            <p className="text-muted-foreground">
              Try a different time period to see more posts
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingPage;