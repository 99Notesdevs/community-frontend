import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VotingSystemProps {
  initialVotes: number;
  postId: string;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
}

const VotingSystem = ({ 
  initialVotes, 
  postId, 
  orientation = 'vertical',
  size = 'md' 
}: VotingSystemProps) => {
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const handleVote = (type: 'up' | 'down') => {
    let newVotes = votes;
    let newUserVote: 'up' | 'down' | null = type;

    if (userVote === type) {
      // Remove vote
      newUserVote = null;
      newVotes = type === 'up' ? votes - 1 : votes + 1;
    } else if (userVote) {
      // Change vote
      newVotes = type === 'up' ? votes + 2 : votes - 2;
    } else {
      // New vote
      newVotes = type === 'up' ? votes + 1 : votes - 1;
    }

    setVotes(newVotes);
    setUserVote(newUserVote);
    
    // Dummy API call
    console.log('Voting:', { postId, type: newUserVote, votes: newVotes });
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
        className={cn(
          "vote-button",
          sizeClasses[size],
          userVote === 'up' && "upvote-active"
        )}
      >
        <ChevronUp className={iconSizeClasses[size]} />
      </button>
      
      <span className={cn(
        "font-bold transition-smooth",
        votes > 0 ? "text-vote-upvote" : votes < 0 ? "text-vote-downvote" : "text-muted-foreground",
        size === 'sm' ? "text-xs" : size === 'md' ? "text-sm" : "text-base"
      )}>
        {formatVotes(votes)}
      </span>
      
      <button
        onClick={() => handleVote('down')}
        className={cn(
          "vote-button",
          sizeClasses[size],
          userVote === 'down' && "downvote-active"
        )}
      >
        <ChevronDown className={iconSizeClasses[size]} />
      </button>
    </div>
  );
};

export default VotingSystem;