import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Step2AnalyzingProps {
  websiteUrl: string;
}

export const Step2Analyzing = ({ websiteUrl }: Step2AnalyzingProps) => {
  return (
    <Card className="p-8">
      <div className="text-center space-y-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Analyzing your website</h2>
          <p className="text-muted-foreground">
            We're scanning {websiteUrl} to understand your business...
          </p>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
          <p>✓ Scanning pages</p>
          <p>✓ Pulling key content</p>
          <p>✓ Summarizing what your business is about</p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary"></div>
        <div className="w-2 h-2 rounded-full bg-primary"></div>
        <div className="w-2 h-2 rounded-full bg-muted"></div>
        <div className="w-2 h-2 rounded-full bg-muted"></div>
        <div className="w-2 h-2 rounded-full bg-muted"></div>
      </div>
    </Card>
  );
};
