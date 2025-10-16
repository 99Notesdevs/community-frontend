import { useState, useEffect } from 'react';
import { Image, Link as LinkIcon, BarChart2, X, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/api/route';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type PostType = 'TEXT' | 'IMAGE' | 'LINK' | 'POLL';

interface Community {
  id: number;
  name: string;
  iconUrl: string;
}

interface PollOption {
  text: string;
}

const PostCreationBar = () => {
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('TEXT');
  const [url, setUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { text: '' },
    { text: '' },
  ]);
  
  // UI state
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await api.get('/communities?skip=0&take=10') as { success: boolean; data: Community[] };
        if (response?.success && Array.isArray(response.data)) {
          setCommunities(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch communities:', error);
      }
    };

    fetchCommunities();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedCommunity || !title.trim()) return;
    
    // Create base payload with common fields
    const payload: {
      communityId: number;
      title: string;
      content: string;
      type: PostType;
      url?: string;
      imageUrl?: string;
      videoUrl?: string;
      pollOptions?: Array<{ text: string }>;
    } = {
      communityId: selectedCommunity.id,
      title: title.trim(),
      content: content.trim(),
      type: postType,
      imageUrl:"",
      videoUrl:"",
      pollOptions:[]
    };

    // Add type-specific fields
    if (postType === 'LINK') {
      payload.url = url;
    } else if (postType === 'IMAGE' && imageFile) {
      // In a real app, you would upload the image first and get the URL
      // For now, we'll just use a placeholder
      payload.imageUrl = URL.createObjectURL(imageFile);
    } else if (postType === 'POLL') {
      payload.pollOptions = pollOptions.filter(opt => opt.text.trim());
    }

    try {
      setIsSubmitting(true);
      const response = await api.post('/posts', payload) as { success: boolean };
      
      // Reset form on success
      if (response.success) {
        setTitle('');
        setContent('');
        setUrl('');
        setImageFile(null);
        setPollOptions([
          { text: '' },
          { text: '' },
        ]);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the appropriate content based on post type
  const renderPostContent = () => {
    switch (postType) {
      case 'TEXT':
        return (
          <Textarea
            placeholder="Text (optional)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px]"
          />
        );
      case 'IMAGE':
        return (
          <div className="border-2 border-dashed rounded-md p-4 text-center">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Image className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {imageFile ? imageFile.name : 'Click to upload an image'}
              </p>
            </label>
          </div>
        );
      case 'LINK':
        return (
          <div className="space-y-2">
            <Input
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Textarea
              placeholder="Text (optional)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        );
      case 'POLL':
        return (
          <div className="space-y-3">
            <Textarea
              placeholder="What do you want to ask?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mb-4"
            />
            {pollOptions.map((option) => (
              <div key={option.id} className="flex gap-2">
                <Input
                  value={option.text}
                  onChange={(e) => {
                    const newOptions = pollOptions.map(opt => 
                      opt.id === option.id ? { ...opt, text: e.target.value } : opt
                    );
                    setPollOptions(newOptions);
                  }}
                  placeholder="Option"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (pollOptions.length > 2) {
                      setPollOptions(pollOptions.filter(opt => opt.id !== option.id));
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {pollOptions.length < 6 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPollOptions([...pollOptions, { id: crypto.randomUUID(), text: '' }]);
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Option
              </Button>
            )}
          </div>
        );
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 mb-4">
      {/* Community Selection */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between mb-4">
            {selectedCommunity ? `r/${selectedCommunity.name}` : 'Choose a community'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
          {communities.map((community) => (
            <DropdownMenuItem
              key={community.id}
              onClick={() => setSelectedCommunity(community)}
            >
              r/{community.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Post Type Tabs */}
      <Tabs 
  value={postType.toLowerCase()} 
  onValueChange={(value) => setPostType(value.toUpperCase() as PostType)}
  className="mb-4"
>
  <TabsList className="grid grid-cols-4">
    <TabsTrigger value="text">Post</TabsTrigger>
    <TabsTrigger value="image">Image</TabsTrigger>
    <TabsTrigger value="link">Link</TabsTrigger>
    <TabsTrigger value="poll">Poll</TabsTrigger>
  </TabsList>
</Tabs>

      {/* Title Input */}
      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4"
      />

      {/* Dynamic Content */}
      <div className="mb-4">
        {renderPostContent()}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={!selectedCommunity || !title.trim() || isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </div>
  );
};

export default PostCreationBar;