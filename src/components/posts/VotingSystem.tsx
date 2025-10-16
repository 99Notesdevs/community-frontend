import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/api/route';

interface VotingSystemProps {
  initialVotes: number;
  postId?: string;
  commentId?: number;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  onVote?: (newVote: 'up' | 'down' | null) => void;
}

const VotingSystem = ({ 
  initialVotes, 
  postId,
  commentId,
  orientation = 'vertical',
  size = 'md',
  onVote
}: VotingSystemProps) => {
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (type: 'up' | 'down') => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const newVote = userVote === type ? null : type;
      const voteType = newVote === 'up' ? 'UPVOTE' : 'DOWNVOTE';
      
      // Determine the API endpoint based on whether it's a post or comment
      const endpoint = commentId 
        ? `/comments/${commentId}/vote`
        : `/posts/${postId}/vote`;
      
      const response = await api.post(endpoint, { voteType });
      
      if (response.success) {
        // Update local state
        let newVotes = votes;
        
        if (userVote === type) {
          // Remove vote
          newVotes = type === 'up' ? votes - 1 : votes + 1;
        } else if (userVote) {
          // Change vote
          newVotes = type === 'up' ? votes + 2 : votes - 2;
        } else {
          // New vote
          newVotes = type === 'up' ? votes + 1 : votes - 1;
        }
        
        setVotes(newVotes);
        setUserVote(newVote);
        onVote?.(newVote);
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatVotes = (count: number) => {
    if (Math.abs(count) >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (Math.abs(count) >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className={cn(
      "flex items-center",
      orientation === 'vertical' ? "flex-col space-y-1" : "flex-row space-x-2"
    )}>
      <button
        onClick={() => handleVote('up')}
        disabled={isLoading}
        className={cn(
          "vote-button hover:text-vote-upvote transition-colors disabled:opacity-50",
          sizeClasses[size],
          userVote === 'up' ? "text-vote-upvote" : "text-muted-foreground"
        )}
        aria-label="Upvote"
      >
        <ChevronUp className={iconSizeClasses[size]} />
      </button>
      
      <span className={cn(
        "font-bold transition-smooth select-none",
        votes > 0 ? "text-vote-upvote" : votes < 0 ? "text-vote-downvote" : "text-muted-foreground",
        size === 'sm' ? "text-xs" : size === 'md' ? "text-sm" : "text-base"
      )}>
        {formatVotes(votes)}
      </span>
      
      <button
        onClick={() => handleVote('down')}
        disabled={isLoading}
        className={cn(
          "vote-button hover:text-vote-downvote transition-colors disabled:opacity-50",
          sizeClasses[size],
          userVote === 'down' ? "text-vote-downvote" : "text-muted-foreground"
        )}
        aria-label="Downvote"
      >
        <ChevronDown className={iconSizeClasses[size]} />
      </button>
    </div>
  );
};

export default VotingSystem;