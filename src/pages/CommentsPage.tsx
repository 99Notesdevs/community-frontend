import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { api } from '@/api/route';
import VotingSystem from '@/components/posts/VotingSystem';
import PostCard from '@/components/posts/PostCard';
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

interface Post {
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
interface Comment {
  id: number;
  content: string;
  authorId: number;
  postId: number;
  parentId: number | null;
  votesCount: number;
  createdAt: string;
  updatedAt: string;
  author?: string; // Will be populated from the user data
  replies?: Comment[];
}


const CommentsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch post and comments
  const fetchPostAndComments = async () => {
    try {
      setIsLoading(true);
      
      // Fetch post
      const postResponse = await api.get<{ success: boolean; data: Post }>(`/posts/${postId}`);
      console.log('Post response:', postResponse);
      
      if (!postResponse.success) {
        throw new Error('Failed to fetch post');
      }
      
      // Make sure we have the data in the expected format
      const postData = postResponse.data || postResponse.data;
      console.log('Post data:', postData);
      setPost(postData);

      // Fetch comments
      const commentsResponse = await api.get<{ success: boolean; data: Comment[] }>(`/comments/post/${postId}`);
      console.log('Comments response:', commentsResponse);
      
      if (!commentsResponse.success) {
        throw new Error('Failed to fetch comments');
      }
      
      // Handle both response.data.data and response.data formats
      let commentsData = commentsResponse.data || commentsResponse.data;
      
      // Ensure we have an array
      if (!Array.isArray(commentsData)) {
        console.warn('Expected comments to be an array, got:', commentsData);
        commentsData = [];
      }
      
      console.log('Processed comments data:', commentsData);
      
      // Transform the flat comments into a tree structure
      const commentMap = new Map<number, any>();
      const rootComments: Comment[] = [];
      
      // First pass: create map of all comments
      commentsData.forEach((comment: any) => {
        if (comment && typeof comment === 'object' && 'id' in comment) {
          commentMap.set(comment.id, { ...comment, replies: [] });
        }
      });
      
      console.log('Comment map:', commentMap);
      
      // Second pass: build tree structure
      commentMap.forEach((comment) => {
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId);
          if (parent) {
            if (!parent.replies) parent.replies = [];
            parent.replies.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });
      
      console.log('Root comments:', rootComments);
      setComments(rootComments);
    } catch (error) {
      console.error('Error in fetchPostAndComments:', error);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPostAndComments();
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const response = await api.post<{
        success: boolean;
        data: Comment;
      }>('/comments', {
        content: newComment,
        postId: Number(postId),
        commentId: replyingTo ? Number(replyingTo) : null
      });

      if (response.success) {
        const newCommentData = {
          ...response.data,
          replies: [],
          votesCount: 0,
        };

        if (replyingTo) {
          // Add reply to the parent comment's replies
          setComments(prev => {
            const updateComments = (comments: Comment[]): Comment[] => {
              return comments.map(comment => {
                if (comment.id === Number(replyingTo)) {
                  return {
                    ...comment,
                    replies: [...(comment.replies || []), newCommentData]
                  };
                }
                if (comment.replies) {
                  return {
                    ...comment,
                    replies: updateComments(comment.replies)
                  };
                }
                return comment;
              });
            };
            return updateComments(prev);
          });
        } else {
          // Add new top-level comment
          setComments(prev => [newCommentData, ...prev]);
        }

        // Update the post's comment count
        if (post) {
          setPost({
            ...post,
            commentsCount: post.commentsCount + 1,
          });
        }

        setNewComment('');
        setReplyingTo(null);
      } else {
        console.error('Failed to add comment:', response);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const renderComments = (commentList: Comment[] | undefined, level = 0) => {
    if (!Array.isArray(commentList) || commentList.length === 0) {
      return null;
    }

    return commentList.map((comment) => {
      if (!comment || typeof comment !== 'object' || !('id' in comment)) {
        console.warn('Invalid comment data:', comment);
        return null;
      }

      const { 
        id, 
        content = '', 
        author = 'Anonymous', 
        authorId,
        createdAt = new Date().toISOString(),
        votesCount = 0,
        replies = []
      } = comment;

      return (
        <div 
          key={id}
          className={`${level > 0 ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}
        >
          <div className="flex items-start gap-3 py-2">
            <Avatar className="h-7 w-7 mt-0.5 flex-shrink-0">
              <AvatarFallback className="text-xs">{String(authorId || '').charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <div className="flex flex-wrap items-baseline gap-x-2 text-xs">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{authorId || 'User'}</span>
                  <span className="text-gray-400 dark:text-gray-500">•</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">{content}</p>
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <VotingSystem 
                    initialVotes={votesCount} 
                    commentId={id}
                    size="sm"
                    orientation="horizontal"
                    onVote={(newVote) => {
                      console.log('Vote updated:', newVote);
                    }}
                  />
                  <button 
                    className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                    onClick={() => setReplyingTo(replyingTo === id.toString() ? null : id.toString())}
                  >
                    Reply
                  </button>
                </div>
              </div>

              {replyingTo === id.toString() && (
                <form onSubmit={handleAddComment} className="mt-2 ml-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a reply..."
                    className="min-h-[60px] text-sm mt-2"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => setReplyingTo(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      size="sm" 
                      className="h-8 px-3 text-xs"
                      disabled={!newComment.trim()}
                    >
                      Reply
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {replies && replies.length > 0 && (
            <div className="mt-1">
              {renderComments(replies, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Post not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4 -ml-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      {/* Post */}
      {post && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden mb-4">
          <div className="p-0">
            <PostCard post={post} />
          </div>
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm text-gray-500">
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-1.5" />
              <span>{post.commentsCount || 0} {post.commentsCount === 1 ? 'Comment' : 'Comments'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Comment form */}
      {user ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden mb-4">
          <form onSubmit={handleAddComment} className="p-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What are your thoughts?"
              className="min-h-[80px] text-sm"
            />
            <div className="mt-2 flex justify-end">
              <Button 
                type="submit" 
                size="sm" 
                disabled={!newComment.trim()}
                className="px-4"
              >
                Comment
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 mb-4 text-center">
          <p className="text-sm text-gray-500">Please sign in to comment</p>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : Array.isArray(comments) && comments.length > 0 ? (
          renderComments(comments)
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to share what you think!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsPage;