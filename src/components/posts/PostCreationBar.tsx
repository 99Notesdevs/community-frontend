import { useState } from 'react';
import { Image, Smile, Hash, MapPin, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PostCreationBar = () => {
  const [content, setContent] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [showExpanded, setShowExpanded] = useState(false);

  const communities = [
    { name: 'r/technology', icon: '💻' },
    { name: 'r/programming', icon: '👨‍💻' },
    { name: 'r/webdev', icon: '🌐' },
    { name: 'r/reactjs', icon: '⚛️' },
  ];

  const handlePost = () => {
    if (content.trim()) {
      // Dummy post creation
      console.log('Creating post:', { content, community: selectedCommunity });
      setContent('');
      setSelectedCommunity('');
      setShowExpanded(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-card mb-6">
      {/* Collapsed view */}
      {!showExpanded ? (
        <div 
          onClick={() => setShowExpanded(true)}
          className="flex items-center space-x-3 cursor-text"
        >
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-medium">JD</span>
          </div>
          <div className="flex-1 bg-muted rounded-full px-4 py-3 text-muted-foreground">
            What's happening in your community?
          </div>
        </div>
      ) : (
        /* Expanded view */
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-medium">JD</span>
              </div>
              <select 
                value={selectedCommunity}
                onChange={(e) => setSelectedCommunity(e.target.value)}
                className="form-input py-1 text-sm"
              >
                <option value="">Choose a community</option>
                {communities.map((community) => (
                  <option key={community.name} value={community.name}>
                    {community.icon} {community.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowExpanded(false)}
              className="p-1 hover:bg-muted rounded-full transition-smooth"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening in your community?"
            className="form-textarea min-h-[120px] text-lg"
            maxLength={500}
            autoFocus
          />

          {/* Character counter */}
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{content.length}/500</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-primary-light rounded-full transition-smooth text-primary">
                <Image className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-primary-light rounded-full transition-smooth text-primary">
                <Smile className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-primary-light rounded-full transition-smooth text-primary">
                <Hash className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-primary-light rounded-full transition-smooth text-primary">
                <MapPin className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-primary-light rounded-full transition-smooth text-primary">
                <Calendar className="h-5 w-5" />
              </button>
            </div>
            
            <Button 
              onClick={handlePost}
              disabled={!content.trim() || !selectedCommunity}
              className="btn-primary"
            >
              Post
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCreationBar;