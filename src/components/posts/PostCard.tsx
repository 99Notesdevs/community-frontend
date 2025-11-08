import { useState } from 'react';
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

interface Post {
  id: string;
  title: string;
  content: string;
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
}

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [showFullContent, setShowFullContent] = useState(false);
  const navigate = useNavigate();

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    // Show toast notification
    console.log('Post URL copied to clipboard');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    api.post(`/bookmark/${post.id}/bookmark`);
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

  return (
    <article className="post-card bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 mb-4 hover:bg-card/80 dark:hover:bg-card/90">
      <div className="p-5 transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
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
        <h2 className="text-xl font-semibold text-foreground mb-3 leading-snug">
          {post.title}
        </h2>

        {/* Content */}
        <div className="text-foreground/90 mb-4">
          <p className="whitespace-pre-wrap text-foreground/90 mb-2 leading-relaxed">
            {showFullContent ? post.content : truncatedContent}
          </p>
          {post.content.length > 300 && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-primary hover:text-primary/90 text-sm font-medium mt-1 transition-colors duration-200"
            >
              {showFullContent ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Image */}
        {post.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden border border-border">
            <img 
              src={post.imageUrl} 
              alt="Post image"
              className="w-full max-h-96 object-cover hover:scale-[1.02] transition-transform duration-300"
              loading="lazy"
            />
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
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <div className="flex items-center space-x-4">
            <VotingSystem 
              initialVotes={post.votesCount} 
              postId={post.id}
              orientation="horizontal"
              size="md"
            />
            
            <button 
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md hover:bg-muted/30 transition-colors duration-200 text-muted-foreground hover:text-foreground"
              onClick={handleCommentClick}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{post.commentsCount} Comments</span>
            </button>

            <button 
              onClick={handleShare}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md hover:bg-muted/30 transition-colors duration-200 text-muted-foreground hover:text-foreground"
            >
              <Share className="h-4 w-4" />
              <span className="text-sm font-medium">Share</span>
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
              <span className="text-sm font-medium">Save</span>
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