import { useState } from 'react';
import { ChevronUp, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
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
      
      if (response) {
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

  const formatVotes = (count: number | undefined | null) => {
    const num = count || 0;
    if (Math.abs(num) >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (Math.abs(num) >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const iconSizeClasses = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  return (
    <div className={cn(
      "flex items-center bg-transparent",
      orientation === 'vertical' ? "flex-col space-y-0.5" : "flex-row space-x-0.5"
    )}>
      <button
        onClick={() => handleVote('up')}
        disabled={isLoading}
        className={cn(
          "p-1 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-40",
          userVote === 'up' ? 'text-orange-500' : 'text-gray-500/90 dark:text-gray-400/90',
          sizeClasses[size],
        )}
      >
        <ArrowUp className={cn(iconSizeClasses[size], 'stroke-[3px]')} />
      </button>
      
      <span className={cn(
        "font-medium text-center min-w-[20px] text-xs text-gray-600 dark:text-gray-300",
        size === 'sm' ? 'text-[11px]' : size === 'md' ? 'text-xs' : 'text-sm',
        "select-none"
      )}>
        {formatVotes(votes)}
      </span>
      
      <div className="border-t border-gray-200 dark:border-gray-700 w-3.5 mx-auto my-0.5"></div>
      
      <button
        onClick={() => handleVote('down')}
        disabled={isLoading}
        className={cn(
          "p-1 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-40",
          userVote === 'down' ? 'text-blue-500' : 'text-gray-500/90 dark:text-gray-400/90',
          sizeClasses[size],
        )}
      >
        <ArrowDown className={cn(iconSizeClasses[size], 'stroke-[3px]')} />
      </button>
    </div>
  );
};

export default VotingSystem;