import { useState, useEffect } from 'react';
import { MessageCircle, Share, Bookmark, MoreHorizontal, ExternalLink, MessageSquare, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import VotingSystem from './VotingSystem';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/api/route';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
import { toast } from 'sonner';

export interface Post {
  id: string;
  title: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'LINK' | 'POLL';
  author: string;
  authorId: string;
  community: string;
  communityIcon: string;
  createdAt: Date;
  votesCount: number;
  commentsCount: number;
  imageUrl?: string;
  link?: string;
  isBookmarked?: boolean;
  poll?: Poll;
}

interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  voted: boolean;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  hasVoted: boolean;
  endsAt?: Date;
  isExpired: boolean;
  pollOptionId?: string;
}


interface PostCardProps {
  post: Post;
  onBookmarkToggle?: (postId: string) => Promise<void>;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onBookmarkToggle }) => {
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [pollState, setPollState] = useState<Poll | null>(post.poll || null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch poll data if it's a poll post
  useEffect(() => {
  const fetchPollData = async () => {
    if (post.type === 'POLL' && post.id) {
      try {
        const [optionsRes, resultsRes] = await Promise.all([
          api.get<ApiResponse<any>>(`/polls/options/${post.id}`),
          api.get<ApiResponse<any>>(`/polls/results/${post.id}`)
        ]);
        
        const optionsData = optionsRes as unknown as ApiResponse<any>;
        const resultsData = resultsRes as unknown as ApiResponse<any>;
        
        if (optionsData.success && resultsData.success) {
        // Get current user ID from your auth context or local storage
        const currentUserId = 1; // Replace with actual user ID
        
        // Create a map of poll options with their vote counts and user's vote status
        const optionsMap = new Map();
        
        // Process options response
        optionsData.data.forEach((opt: any) => {
          optionsMap.set(opt.id, {
            id: opt.id.toString(),
            text: opt.text,
            voteCount: opt.votes,
            voted: opt.voters.some((v: any) => v.userId === currentUserId)
          });
        });
        
        // Process results to update vote counts and check if user has voted
        const options = resultsData.data.map((result: any) => {
          const option = optionsMap.get(result.id) || {
            id: result.id.toString(),
            text: result.text,
            voteCount: result.votes,
            voted: false
          };
          
          // Update with the most recent vote count
          option.voteCount = result.votes;
          option.voted = result.voters.some((v: any) => v.userId === currentUserId);
          
          return option;
        });

        const totalVotes = options.reduce((sum: number, opt: any) => sum + opt.voteCount, 0);
        const hasVoted = options.some((opt: any) => opt.voted);
        
        setPollState({
          id: post.id,
          question: post.content,
          options,
          totalVotes,
          hasVoted,
          endsAt: post.poll?.endsAt ? new Date(post.poll.endsAt) : undefined,
          isExpired: post.poll?.endsAt ? new Date(post.poll.endsAt) < new Date() : false
        });
      }
    } catch (error) {
      console.error('Failed to fetch poll data:', error);
      toast.error('Failed to load poll data');
    }
  }
};

  fetchPollData();
}, [post.id, post.type, post.content, post.poll?.endsAt]);

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    // Show toast notification
    console.log('Post URL copied to clipboard');
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (onBookmarkToggle) {
        await onBookmarkToggle(post.id);
      } else {
        await api.post(`/bookmark/${post.id}/bookmark`);
        setIsBookmarked(!isBookmarked);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const handleMessageUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/messages?userId=${post.authorId}`);
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/u/${post.authorId}`);
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post.community) {
      alert('Please select a community before viewing this post');
      return;
    }
    navigate(`/post/${post.id}`);
  };

  const truncatedContent = post.content.length > 300 
    ? post.content.substring(0, 300) + '...' 
    : post.content;

  const handleVote = async (pollOptionId: string) => {
    if (!pollState || pollState.hasVoted || isLoading) return;
    
    try {
      setIsLoading(true);
      const response = await api.post<ApiResponse<{ success: boolean }>>('/polls/vote', { 
        pollOptionId: parseInt(pollOptionId),
        postId: post.id 
      });

      const responseData = response as unknown as ApiResponse<{ success: boolean }>;

      if (responseData.success) {
      // Update the local state to reflect the vote
      const updatedOptions = pollState.options.map(opt => {
        const isSelected = opt.id === pollOptionId;
        return {
          ...opt,
          voteCount: isSelected ? opt.voteCount + 1 : opt.voteCount,
          voted: isSelected
        };
      });

      setPollState(prev => ({
        ...prev!,
        options: updatedOptions,
        hasVoted: true,
        totalVotes: prev!.totalVotes + 1,
        pollOptionId: pollOptionId
      }));
      
      toast.success('Vote submitted successfully');
    }
  } catch (error) {
    console.error('Failed to submit vote:', error);
    toast.error('Failed to submit vote');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <article className="post-card bg-card border border-border/30 rounded-md overflow-hidden shadow-xs hover:shadow-sm transition-all duration-200 mb-3 hover:bg-card/90 dark:hover:bg-card/90">
      <div className="p-4 transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
          <span className="text-lg">{post.communityIcon}</span>
          <span className="font-medium text-foreground">{post.community}</span>
          <span className="text-muted-foreground/50">•</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span 
                className="hover:underline cursor-pointer hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                Posted by u/{post.author}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={handleViewProfile}>
                <User className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMessageUser}>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Message</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span>•</span>
          <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
        </div>

        {/* Title */}
        <h2 className="text-lg font-medium text-foreground mb-2 leading-tight">
          {post.title}
        </h2>

        {/* Content */}
        <div className="text-foreground/80 mb-3 text-sm">
          <p className="whitespace-pre-wrap mb-2 leading-normal">
            {showFullContent ? post.content : truncatedContent}
          </p>
          {post.content.length > 300 && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-primary hover:text-primary/80 text-xs font-medium mt-1 transition-colors duration-200"
            >
              {showFullContent ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Image */}
        {post.imageUrl && (
          <div className="mb-3 rounded overflow-hidden border border-border">
            <img 
              src={post.imageUrl} 
              alt="Post image"
              className="w-full max-h-80 object-cover hover:opacity-95 transition-opacity duration-200"
              loading="lazy"
            />
          </div>
        )}

        {/* Poll */}
        {post.type === 'POLL' && pollState && (
  <div className="mb-4 border border-border rounded-lg p-4">
    <h4 className="font-medium text-foreground mb-3">{pollState.question}</h4>
    <div className="space-y-3">
      {pollState.options.map((option) => {
        const percentage = pollState.totalVotes > 0 
          ? Math.round((option.voteCount / pollState.totalVotes) * 100) 
          : 0;
        const isUserVote = option.voted;
        
        return (
          <div key={option.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {option.text}
                {isUserVote && (
                  <span className="ml-2 text-xs text-primary">✓ Your vote</span>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {percentage}% • {option.voteCount} vote{option.voteCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div 
              className={`h-2 rounded-full overflow-hidden ${
                isUserVote ? 'bg-primary/20' : 'bg-muted'
              }`}
            >
              <div 
                className={`h-full ${
                  isUserVote ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => handleVote(option.id)}
                disabled={isLoading}
                className={`text-xs px-3 py-1 rounded-full border ${
                  isUserVote 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border hover:bg-muted/50'
                } transition-colors disabled:opacity-50`}
              >
                {isUserVote ? 'Voted' : 'Vote'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
    <div className="mt-3 text-xs text-muted-foreground flex justify-between items-center">
      <span>
        {pollState.totalVotes} vote{pollState.totalVotes !== 1 ? 's' : ''}
      </span>
      {pollState.endsAt && (
        <span>
          {pollState.isExpired 
            ? 'Poll ended'
            : `Ends in ${formatDistanceToNow(pollState.endsAt, { addSuffix: true })}`}
        </span>
      )}
    </div>
  </div>
)}

        {/* External Link */}
        {post.link && (
          <a 
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors duration-200 mb-4 group"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-sm text-primary group-hover:text-primary/90 transition-colors">
              {new URL(post.link).hostname}
            </span>
          </a>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/20">
          <div className="flex items-center space-x-3">
            <VotingSystem 
              initialVotes={post.votesCount} 
              postId={post.id}
              orientation="horizontal"
              size="md"
            />
            
            <button 
              className="flex items-center space-x-1.5 px-2 py-1 rounded hover:bg-muted/20 transition-colors duration-150 text-muted-foreground hover:text-foreground text-sm"
              onClick={handleCommentClick}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs font-medium">{post.commentsCount}</span>
            </button>

            <button 
              onClick={handleShare}
              className="flex items-center space-x-1.5 px-2 py-1 rounded hover:bg-muted/20 transition-colors duration-150 text-muted-foreground hover:text-foreground text-sm"
            >
              <Share className="h-4 w-4" />
              <span className="text-xs font-medium">Share</span>
            </button>

            <button 
              onClick={handleBookmark}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md transition-colors duration-200 ${
                isBookmarked 
                  ? 'text-primary hover:bg-primary/5' 
                  : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          <button 
            className="p-1.5 rounded-md hover:bg-muted/30 transition-colors duration-200 text-muted-foreground hover:text-foreground"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        
         
      </div>
    </article>
  );
};

export default PostCard;