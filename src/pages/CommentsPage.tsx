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

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  community: string;
  communityIcon: string;
  createdAt: string;
  votes: number;
  comments: number;
  imageUrl?: string;
  link?: string;
}

const CommentsPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
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
      const postResponse = await api.get(`/posts/${postId}`);
      console.log('Post response:', postResponse);
      
      if (!postResponse.success) {
        throw new Error('Failed to fetch post');
      }
      
      // Make sure we have the data in the expected format
      const postData = postResponse.data?.data || postResponse.data;
      console.log('Post data:', postData);
      setPost(postData);

      // Fetch comments
      const commentsResponse = await api.get(`/comments/post/${postId}`);
      console.log('Comments response:', commentsResponse);
      
      if (!commentsResponse.success) {
        throw new Error('Failed to fetch comments');
      }
      
      // Handle both response.data.data and response.data formats
      let commentsData = commentsResponse.data?.data || commentsResponse.data;
      
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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const response = await api.post<{
        success: boolean;
        data: Comment & { author: string };
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
          author: user.username // Assuming user object has username
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
            comments: post.comments + 1
          });
        }

        setNewComment('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const renderComments = (commentList: any[] | undefined, level = 0) => {
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
          className={`mt-4 ${level > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}
        >
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{authorId}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-semibold">{authorId}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500">
                    {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-1 text-sm whitespace-pre-wrap">{content}</p>
                <div className="mt-2 flex items-center space-x-4 text-xs">
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
                    className="text-gray-500 hover:text-blue-500"
                    onClick={() => setReplyingTo(replyingTo === id.toString() ? null : id.toString())}
                  >
                    Reply
                  </button>
                </div>
              </div>

              {replyingTo === id.toString() && (
                <form onSubmit={handleAddComment} className="mt-3 ml-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a reply..."
                    className="min-h-[80px]"
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setReplyingTo(null)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm">
                      Reply
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {replies && replies.length > 0 && (
            <div className="mt-2">
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
    <div className="container mx-auto py-6 max-w-3xl">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to posts
      </Button>

      {/* Post */}
      {post && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <span>Posted by u/{post.author || 'Unknown'}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
          <p className="whitespace-pre-line mb-4">{post.content}</p>
          {post.imageUrl && (
            <div className="my-4">
              <img 
                src={post.imageUrl} 
                alt="Post" 
                className="max-h-96 w-auto rounded-md object-cover"
              />
            </div>
          )}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{comments?.length || 0} comments</span>
            </div>
          </div>
        </div>
      )}

      {/* Comment form */}
      {user ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleAddComment}>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What are your thoughts?"
              className="min-h-[100px]"
            />
            <div className="mt-3 flex justify-end">
              <Button type="submit" disabled={!newComment.trim()}>
                Comment
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-6 text-center">
          <p className="text-gray-500">Please sign in to comment</p>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-4">
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