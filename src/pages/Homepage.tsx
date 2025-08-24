import { useState } from 'react';
import PostCreationBar from '@/components/posts/PostCreationBar';
import PostCard from '@/components/posts/PostCard';
import { dummyPosts, dummyCommunities } from '@/data/dummyData';
import { TrendingUp, Users, Star } from 'lucide-react';

const Homepage = () => {
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');

  const sortedPosts = [...dummyPosts].sort((a, b) => {
    switch (sortBy) {
      case 'new':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'top':
        return b.votes - a.votes;
      case 'hot':
      default:
        // Simple hot algorithm: combine votes and recency
        const aScore = a.votes / Math.pow((Date.now() - a.createdAt.getTime()) / (1000 * 60 * 60) + 2, 1.8);
        const bScore = b.votes / Math.pow((Date.now() - b.createdAt.getTime()) / (1000 * 60 * 60) + 2, 1.8);
        return bScore - aScore;
    }
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Post Creation Bar */}
      <PostCreationBar />

      {/* Sort Controls */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => setSortBy('hot')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-smooth ${
            sortBy === 'hot' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span className="font-medium">Hot</span>
        </button>
        
        <button
          onClick={() => setSortBy('new')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-smooth ${
            sortBy === 'new' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
        >
          <Star className="h-4 w-4" />
          <span className="font-medium">New</span>
        </button>
        
        <button
          onClick={() => setSortBy('top')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-smooth ${
            sortBy === 'top' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span className="font-medium">Top</span>
        </button>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {sortedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <button className="btn-secondary">
          Load More Posts
        </button>
      </div>
    </div>
  );
};

export default Homepage;