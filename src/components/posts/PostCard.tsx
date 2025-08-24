import { useState } from 'react';
import { MessageCircle, Share, Bookmark, MoreHorizontal, ExternalLink } from 'lucide-react';
import VotingSystem from './VotingSystem';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  community: string;
  communityIcon: string;
  createdAt: Date;
  votes: number;
  comments: number;
  imageUrl?: string;
  link?: string;
  isBookmarked?: boolean;
}

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [showFullContent, setShowFullContent] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    // Show toast notification
    console.log('Post URL copied to clipboard');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    console.log('Bookmarked:', !isBookmarked);
  };

  const truncatedContent = post.content.length > 300 
    ? post.content.substring(0, 300) + '...' 
    : post.content;

  return (
    <article className="post-card p-4 mb-4">
      <div className="flex space-x-3">
        {/* Voting System */}
        <div className="flex-shrink-0">
          <VotingSystem 
            initialVotes={post.votes} 
            postId={post.id}
            orientation="vertical"
            size="md"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <span className="text-lg">{post.communityIcon}</span>
            <span className="font-medium text-foreground">{post.community}</span>
            <span>•</span>
            <span>Posted by u/{post.author}</span>
            <span>•</span>
            <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-foreground mb-2 leading-tight">
            {post.title}
          </h2>

          {/* Content */}
          <div className="text-foreground mb-3">
            <p className="whitespace-pre-wrap">
              {showFullContent ? post.content : truncatedContent}
            </p>
            {post.content.length > 300 && (
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-primary hover:text-primary-hover text-sm font-medium mt-1"
              >
                {showFullContent ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>

          {/* Image */}
          {post.imageUrl && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <img 
                src={post.imageUrl} 
                alt="Post image"
                className="w-full max-h-96 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* External Link */}
          {post.link && (
            <a 
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted transition-smooth mb-3"
            >
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-primary hover:text-primary-hover">
                {new URL(post.link).hostname}
              </span>
            </a>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{post.comments}</span>
            </button>

            <button 
              onClick={handleShare}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground"
            >
              <Share className="h-4 w-4" />
              <span className="text-sm font-medium">Share</span>
            </button>

            <button 
              onClick={handleBookmark}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-muted transition-smooth ${
                isBookmarked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">Save</span>
            </button>

            <button className="p-2 rounded-lg hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;