import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Globe } from "lucide-react";

interface Step1WebsiteUrlProps {
  onSubmit: (url: string) => void;
}

export const Step1WebsiteUrl = ({ onSubmit }: Step1WebsiteUrlProps) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const validateUrl = (value: string) => {
    if (!value) {
      return "Website URL is required";
    }
    
    // Basic URL validation
    try {
      const urlObj = new URL(value.startsWith('http') ? value : `https://${value}`);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:' ? "" : "Invalid URL format";
    } catch {
      return "Please enter a valid URL";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateUrl(url);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    // Ensure URL has protocol
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    onSubmit(formattedUrl);
  };

  return (
    <Card className="p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Globe className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome to Postable</h1>
        <p className="text-muted-foreground">Let's set up your blog in just a few steps</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="website">What's your website URL?</Label>
          <Input
            id="website"
            type="text"
            placeholder="https://yourbusiness.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
            }}
            className={error ? "border-destructive" : ""}
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <p className="text-sm text-muted-foreground">
            We'll analyze your website to understand your business better
          </p>
        </div>

        <Button type="submit" className="w-full" size="lg">
          Continue
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary"></div>
        <div className="w-2 h-2 rounded-full bg-muted"></div>
        <div className="w-2 h-2 rounded-full bg-muted"></div>
        <div className="w-2 h-2 rounded-full bg-muted"></div>
        <div className="w-2 h-2 rounded-full bg-muted"></div>
      </div>
    </Card>
  );
};
