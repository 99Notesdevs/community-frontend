import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { api } from '@/api/route';
type CommunityType = 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';

interface CommunityRule {
  title: string;
  description: string;
}

export function CreateCommunityModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    iconUrl: '',
    bannerUrl: '',
    type: 'PUBLIC' as CommunityType,
    nsfw: false,
    rules: [{ title: '', description: '' }] as CommunityRule[],
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      const response=api.post('/communities', formData);
      console.log('Submitting:', formData);
      onClose();
    }
  };

  const handlePrev = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRuleChange = (index: number, field: keyof CommunityRule, value: string) => {
    const newRules = [...formData.rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setFormData(prev => ({ ...prev, rules: newRules }));
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, { title: '', description: '' }],
    }));
  };

  const removeRule = (index: number) => {
    if (formData.rules.length > 1) {
      const newRules = formData.rules.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, rules: newRules }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto rounded-md">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-lg font-semibold">Create Community</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center justify-between my-4 px-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-col items-center flex-1">
              <div 
                className={`w-7 h-7 rounded-sm flex items-center justify-center text-sm font-medium transition-colors ${
                  currentStep >= step 
                    ? 'bg-primary text-white' 
                    : 'bg-muted text-muted-foreground/70'
                }`}
              >
                {step}
              </div>
              <span className="text-xs mt-1.5 text-muted-foreground">
                {['Details', 'Images', 'Settings', 'Rules'][step - 1]}
              </span>
              {step < 4 && (
                <div className="h-px bg-border flex-1 mx-2 mt-3.5" />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-5 px-1 py-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="r/community_name"
                className="mt-1.5 text-sm h-9 rounded-sm"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Community names including capitalization cannot be changed.
              </p>
            </div>
            
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Community Name"
                className="mt-1.5 text-sm h-9 rounded-sm"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="What's your community about?"
                className="mt-1.5 text-sm h-9 rounded-sm"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 2: Images */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <Label>Community Icon</Label>
              <div className="mt-2 flex items-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {formData.iconUrl ? (
                    <img src={formData.iconUrl} alt="Community Icon" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-muted-foreground">Icon</span>
                  )}
                </div>
                <div className="ml-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setFormData(prev => ({ ...prev, iconUrl: url }));
                      }
                    }}
                    className="hidden"
                    id="icon-upload"
                  />
                  <Button variant="outline" size="sm" asChild className="rounded-sm">
                    <label htmlFor="icon-upload" className="cursor-pointer">
                      Upload Icon
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Square image, at least 256x256px
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label>Banner Image (Optional)</Label>
              <div className="mt-2">
                <div className="h-32 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                  {formData.bannerUrl ? (
                    <img src={formData.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-muted-foreground">Banner Image</span>
                  )}
                </div>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setFormData(prev => ({ ...prev, bannerUrl: url }));
                      }
                    }}
                    className="hidden"
                    id="banner-upload"
                  />
                  <Button variant="outline" size="sm" asChild>
                    <label htmlFor="banner-upload" className="cursor-pointer">
                      Upload Banner
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended size: 1920x384px
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Community Type & Settings */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <Label className="block mb-2">Community Type</Label>
              <RadioGroup 
                value={formData.type} 
                onValueChange={(value: CommunityType) => setFormData(prev => ({ ...prev, type: value }))}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PUBLIC" id="public" />
                  <Label htmlFor="public" className="flex-1">
                    <div className="font-medium">Public</div>
                    <p className="text-sm text-muted-foreground">Anyone can view, post, and comment</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PRIVATE" id="private" />
                  <Label htmlFor="private" className="flex-1">
                    <div className="font-medium">Private</div>
                    <p className="text-sm text-muted-foreground">Only approved users can view and participate</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="RESTRICTED" id="restricted" />
                  <Label htmlFor="restricted" className="flex-1">
                    <div className="font-medium">Restricted</div>
                    <p className="text-sm text-muted-foreground">Anyone can view, but only approved users can post</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <div className="font-medium">NSFW Content</div>
                <p className="text-sm text-muted-foreground">
                  This community is for mature audiences only
                </p>
              </div>
              <Switch
                checked={formData.nsfw}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, nsfw: checked }))}
              />
            </div>
          </div>
        )}

        {/* Step 4: Rules */}
        {currentStep === 4 && (
          <div className="space-y-5 px-1 py-2">
            <p className="text-sm text-muted-foreground">
              Set rules for your community. You can add more rules later.
            </p>
            
            {formData.rules.map((rule, index) => (
              <div key={index} className="border rounded-md p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Rule {index + 1}</h4>
                  {formData.rules.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRule(index)}
                      className="text-destructive h-8 px-2"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={rule.title}
                    onChange={(e) => handleRuleChange(index, 'title', e.target.value)}
                    placeholder="e.g. No spam"
                    className="mt-1.5 text-sm h-9 rounded-sm"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={rule.description}
                    onChange={(e) => handleRuleChange(index, 'description', e.target.value)}
                    placeholder="Detailed description of the rule"
                    className="mt-1.5 text-sm h-9 rounded-sm"
                    rows={2}
                  />
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={addRule}
              className="w-full mt-2"
            >
              Add Another Rule
            </Button>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="rounded-sm"
          >
            Back
          </Button>
          <Button 
            size="sm" 
            onClick={handleNext}
            className="rounded-sm"
          >
            {currentStep === 4 ? 'Create Community' : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
