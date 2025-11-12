import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { User, Upload } from "lucide-react";
import { AuthorData } from "@/pages/Onboarding";

interface Step5AuthorInfoProps {
  onSubmit: (data: AuthorData) => void;
  initialData: Partial<AuthorData>;
}

export const Step5AuthorInfo = ({ onSubmit, initialData }: Step5AuthorInfoProps) => {
  const [formData, setFormData] = useState<AuthorData>({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    position: initialData.position || "",
    description: initialData.description || "",
    avatarUrl: initialData.avatarUrl,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof AuthorData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
          <User className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Author profile</h2>
        <p className="text-muted-foreground">Tell us about yourself</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => updateField('position', e.target.value)}
            placeholder="e.g., Content Manager, Marketing Director"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Bio</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="A short bio about yourself..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Profile photo</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Drag and drop or click to upload
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Optional - You can add this later
            </p>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg">
          Complete setup
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary"></div>
        <div className="w-2 h-2 rounded-full bg-primary"></div>
        <div className="w-2 h-2 rounded-full bg-primary"></div>
        <div className="w-2 h-2 rounded-full bg-primary"></div>
        <div className="w-2 h-2 rounded-full bg-primary"></div>
      </div>
    </Card>
  );
};
