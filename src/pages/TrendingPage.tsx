import { useState } from 'react';
import PostCard from '@/components/posts/PostCard';
import { dummyPosts } from '@/data/dummyData';
import { Clock, Calendar, TrendingUp, MessageCircle, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-6">Trending</h1>
        <div className="inline-flex items-center p-0.5 bg-muted/20 rounded border border-border/50">
          {[
            { value: 'hour', label: 'Hour', icon: Clock },
            { value: 'day', label: 'Today', icon: Calendar },
            { value: 'week', label: 'Week', icon: Calendar },
            { value: 'month', label: 'Month', icon: Calendar },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTimeFilter(value as any)}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors',
                timeFilter === value
                  ? 'bg-background text-foreground'
                  : 'text-muted-foreground hover:text-foreground/90 hover:bg-muted/20'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>



      {/* Trending Posts */}
      <div className="space-y-5">
        {trendingPosts.length > 0 ? (
          trendingPosts.map((post, index) => (
            <div key={post.id} className="relative group">
              {/* Trending rank */}
              <div className={cn(
                "absolute -left-1 top-5 w-5 h-5 flex items-center justify-center text-xs font-medium transition-colors",
                index < 3 
                  ? 'text-amber-600'
                  : 'text-muted-foreground/60'
              )}>
                {index + 1}
              </div>
              <div className="ml-4">
                <PostCard post={post} />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-border/50 rounded bg-muted/10">
            <TrendingUp className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-base font-medium text-foreground mb-1">
              No trending posts found
            </h3>
            <p className="text-muted-foreground text-sm">
              Try a different time period
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingPage;