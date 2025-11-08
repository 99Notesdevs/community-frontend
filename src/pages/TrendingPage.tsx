import { useState } from 'react';
import PostCard from '@/components/posts/PostCard';
import { dummyPosts } from '@/data/dummyData';
import { Clock, Calendar, TrendingUp, Flame, MessageCircle, ArrowUp, Bookmark } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        {/* Time Filter Controls */}
        <div className="inline-flex items-center p-1 bg-muted/50 rounded-lg border border-border">
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
                'flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
                timeFilter === value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground/80 hover:bg-muted/30'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { 
            value: trendingPosts.length, 
            label: 'Trending Posts',
            icon: Flame,
            color: 'text-rose-500 bg-rose-500/10'
          },
          { 
            value: trendingPosts.reduce((sum, post) => sum + post.votes, 0),
            label: 'Total Votes',
            icon: ArrowUp,
            color: 'text-emerald-500 bg-emerald-500/10'
          },
          { 
            value: trendingPosts.reduce((sum, post) => sum + post.comments, 0),
            label: 'Total Comments',
            icon: MessageCircle,
            color: 'text-blue-500 bg-blue-500/10'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="bg-card p-5 rounded-xl border border-border/50 hover:border-border transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trending Posts */}
      <div className="space-y-5">
        {trendingPosts.length > 0 ? (
          trendingPosts.map((post, index) => (
            <div key={post.id} className="relative group">
              {/* Trending rank */}
              <div className={cn(
                "absolute -left-3 top-5 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold z-10 transition-all duration-200",
                index < 3 
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-amber-50 shadow-md shadow-amber-500/20'
                  : 'bg-muted-foreground/10 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
              )}>
                {index + 1}
              </div>
              <div className="transition-all duration-200 hover:-translate-y-0.5">
                <PostCard post={post} />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30">
            <TrendingUp className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No trending posts found
            </h3>
            <p className="text-muted-foreground/70 max-w-md mx-auto">
              Try a different time period or check back later for trending content
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingPage;