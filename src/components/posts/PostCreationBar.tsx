import { useState, useEffect } from 'react';
import { Image, Link as LinkIcon, BarChart2, X, ChevronDown, Plus, Trash2, Globe, Lock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/api/route';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { compressFile, uploadImageToS3 } from '@/config/imageUploadS3';

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
    // Get the user id here to structure the storage in aws.
    const userId = localStorage.getItem('id');
    
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
      /**
       * Use compressFile function from src/config/imageUploadS3.ts
       * Returns a File type that should be appended in a formData sent to aws for uploading
       */
      const newFile = await compressFile(imageFile);
      const formData = new FormData();
      formData.append("imageUrl", newFile);
      const upload = await uploadImageToS3(formData, `user-${userId}/iamges`, `user: ${userId}--valid-name-here`);

      payload.imageUrl = upload;
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
          <div className="mt-3">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] w-full text-base p-4 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none transition-all"
            />
          </div>
        );
      case 'IMAGE':
        return (
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center transition-colors hover:border-yellow-400 dark:hover:border-yellow-600">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-full mb-3">
                <Image className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                {imageFile ? 'Change image' : 'Upload an image'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {imageFile ? imageFile.name : 'JPG, PNG or GIF up to 10MB'}
              </p>
              {!imageFile && (
                <Button variant="outline" size="sm" className="rounded-full border-yellow-300 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700">
                  Select from computer
                </Button>
              )}
            </label>
            {imageFile && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <Image className="h-10 w-10 object-cover rounded mr-3" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 truncate max-w-[180px]">
                      {imageFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(imageFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );
      case 'LINK':
        return (
          <div className="space-y-4 mt-3">
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Paste URL here"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-10 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <div className="mt-2">
              <Textarea
                placeholder="Add a comment (optional)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] w-full text-base p-4 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
              />
            </div>
            {url && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="h-40 bg-gray-100 dark:bg-gray-800">
                  {/* Link preview would go here */}
                </div>
                <div className="p-3">
                  <p className="text-sm text-gray-500 truncate">{url}</p>
                  <h4 className="font-medium mt-1">Link Preview Title</h4>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    This is a preview of the linked content. The actual content will be fetched when you post.
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      case 'POLL':
        return (
          <div className="space-y-4 mt-3">
            <Textarea
              placeholder="What do you want to ask?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] w-full text-base p-4 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
            />
            <div className="space-y-3">
              {pollOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                    </div>
                    <Input
                      value={option.text}
                      onChange={(e) => {
                        const newOptions = [...pollOptions];
                        newOptions[index] = { ...option, text: e.target.value };
                        setPollOptions(newOptions);
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="pl-10 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  {pollOptions.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => {
                        setPollOptions(pollOptions.filter((_, i) => i !== index));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {pollOptions.length < 6 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                onClick={() => {
                  setPollOptions([...pollOptions, { text: '' }]);
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" /> Add Option
              </Button>
            )}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {pollOptions.length} of 6 options used. Polls can have between 2 and 6 options.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-4 overflow-hidden">
      {/* Header with community selection */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-full transition-colors"
              >
                {selectedCommunity ? (
                  <>
                    <div className="h-6 w-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-medium">
                      {selectedCommunity.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-yellow-700 dark:text-yellow-400">r/{selectedCommunity.name}</span>
                  </>
                ) : (
                  <>
                    <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Users className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                    <span className="font-medium text-gray-500">Choose community</span>
                  </>
                )}
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-72 max-h-80 overflow-y-auto p-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
              align="start"
              sideOffset={8}
            >
              <div className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">YOUR COMMUNITIES</div>
              {communities.map((community) => (
                <DropdownMenuItem
                  key={community.id}
                  onClick={() => setSelectedCommunity(community)}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full bg-yellow-500 flex-shrink-0 flex items-center justify-center text-white text-sm font-medium">
                    {community.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">r/{community.name}</div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Post Type Tabs */}
      <div className="px-4 pt-1">
        <Tabs 
          value={postType.toLowerCase()} 
          onValueChange={(value) => setPostType(value.toUpperCase() as PostType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 bg-transparent p-0 border-b border-gray-100 dark:border-gray-800 rounded-none">
            <TabsTrigger 
              value="text" 
              className="py-3 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <span className="text-sm font-medium">Post</span>
            </TabsTrigger>
            <TabsTrigger 
              value="image"
              className="py-3 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <span className="text-sm font-medium">Image</span>
            </TabsTrigger>
            <TabsTrigger 
              value="link"
              className="py-3 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <span className="text-sm font-medium">Link</span>
            </TabsTrigger>
            <TabsTrigger 
              value="poll"
              className="py-3 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <span className="text-sm font-medium">Poll</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Title and Content */}
      <div className="px-4 py-3">
        <div className="mb-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-lg font-medium p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
          />
        </div>

        {/* Dynamic Content */}
        <div className="mt-2">
          {renderPostContent()}
        </div>
      </div>

      {/* Footer with Submit Button */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={!selectedCommunity || !title.trim() || isSubmitting}
          className="rounded-full px-6 font-medium h-9 bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </div>
  );
};

export default PostCreationBar;