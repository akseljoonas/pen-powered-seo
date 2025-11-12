import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { BrandData } from "@/pages/Onboarding";

interface Step3BrandInfoProps {
  initialData: BrandData;
  onSubmit: (data: BrandData) => void;
}

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "E-commerce", "Education",
  "Marketing", "Real Estate", "Food & Beverage", "Travel", "Other"
];

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian",
  "Portuguese", "Dutch", "Japanese", "Chinese", "Korean"
];

export const Step3BrandInfo = ({ initialData, onSubmit }: Step3BrandInfoProps) => {
  const [formData, setFormData] = useState<BrandData>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof BrandData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Tell us about your brand</h2>
        <p className="text-muted-foreground">Help us create content that matches your voice</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brandName">Brand name *</Label>
            <Input
              id="brandName"
              value={formData.brandName}
              onChange={(e) => updateField('brandName', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <Select value={formData.industry} onValueChange={(value) => updateField('industry', value)}>
              <SelectTrigger id="industry">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessDescription">Business description *</Label>
          <Textarea
            id="businessDescription"
            value={formData.businessDescription}
            onChange={(e) => updateField('businessDescription', e.target.value)}
            placeholder="What does your business do?"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetAudience">Target audience</Label>
          <Input
            id="targetAudience"
            value={formData.targetAudience}
            onChange={(e) => updateField('targetAudience', e.target.value)}
            placeholder="Who are your primary customers?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="benefits">Key benefits</Label>
          <Textarea
            id="benefits"
            value={formData.benefits}
            onChange={(e) => updateField('benefits', e.target.value)}
            placeholder="What value do you provide?"
            rows={2}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="City, Country"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={formData.language} onValueChange={(value) => updateField('language', value)}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="toneOfVoice">Tone of voice</Label>
          <Input
            id="toneOfVoice"
            value={formData.toneOfVoice}
            onChange={(e) => updateField('toneOfVoice', e.target.value)}
            placeholder="e.g., Professional, Casual, Technical, Friendly"
          />
        </div>

        <Button type="submit" className="w-full" size="lg">
          Continue
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary"></div>
        <div className="w-2 h-2 rounded-full bg-primary"></div>
        <div className="w-2 h-2 rounded-full bg-primary"></div>
        <div className="w-2 h-2 rounded-full bg-muted"></div>
        <div className="w-2 h-2 rounded-full bg-muted"></div>
      </div>
    </Card>
  );
};
