import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, X, Sparkles, Target, Link2, Mic } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ToneSample {
  id: string;
  title: string;
  content: string;
}

const CreateBlog = () => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [competitorUrls, setCompetitorUrls] = useState<string[]>(["", "", ""]);
  const [toneSamples, setToneSamples] = useState<ToneSample[]>([]);
  const [selectedToneSample, setSelectedToneSample] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newToneTitle, setNewToneTitle] = useState("");
  const [newToneContent, setNewToneContent] = useState("");
  const [isSavingTone, setIsSavingTone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchToneSamples();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const fetchToneSamples = async () => {
    const { data, error } = await supabase
      .from("tone_samples")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setToneSamples(data);
    }
  };

  const addKeyword = () => {
    if (currentKeyword.trim() && keywords.length < 10) {
      setKeywords([...keywords, currentKeyword.trim()]);
      setCurrentKeyword("");
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const updateCompetitorUrl = (index: number, value: string) => {
    const newUrls = [...competitorUrls];
    newUrls[index] = value;
    setCompetitorUrls(newUrls);
  };

  const handleAddToneSample = async () => {
    if (!newToneTitle.trim() || !newToneContent.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    setIsSavingTone(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tone_samples")
        .insert({
          user_id: user.id,
          title: newToneTitle.trim(),
          content: newToneContent.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Tone sample added successfully!");
      setToneSamples([data, ...toneSamples]);
      setSelectedToneSample(data.id);
      setNewToneTitle("");
      setNewToneContent("");
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error adding tone sample:", error);
      toast.error(error.message || "Failed to add tone sample");
    } finally {
      setIsSavingTone(false);
    }
  };

  const handleGenerate = async () => {
    if (keywords.length === 0) {
      toast.error("Please add at least one keyword");
      return;
    }

    setIsGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get the selected tone sample content
      let toneSampleContent = "";
      if (selectedToneSample) {
        const sample = toneSamples.find(s => s.id === selectedToneSample);
        if (sample) {
          toneSampleContent = sample.content;
        }
      }

      // Call the edge function to generate the blog
      const { data, error } = await supabase.functions.invoke("generate-blog", {
        body: {
          keywords,
          competitorUrls: competitorUrls.filter(url => url.trim() !== ""),
          toneSample: toneSampleContent,
          userId: user.id,
        },
      });

      if (error) throw error;

      // Create a new blog entry
      const { data: blog, error: insertError } = await supabase
        .from("blogs")
        .insert({
          user_id: user.id,
          title: data.title,
          content: data.content,
          keywords,
          status: "draft",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Insert competitor URLs
      const validUrls = competitorUrls.filter(url => url.trim() !== "");
      if (validUrls.length > 0) {
        await supabase.from("competitor_urls").insert(
          validUrls.map(url => ({
            blog_id: blog.id,
            url: url.trim(),
          }))
        );
      }

      toast.success("Blog generated successfully!");
      navigate(`/editor/${blog.id}`);
    } catch (error: any) {
      console.error("Error generating blog:", error);
      toast.error(error.message || "Failed to generate blog");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-3">Create AI-Powered Content</h1>
            <p className="text-muted-foreground text-lg">
              Generate SEO-optimized blog posts that match your brand voice and outrank competitors
            </p>
          </div>

        <div className="space-y-6">
          {/* Keywords Section */}
          <Card className="p-6 border-border hover:border-primary/20 transition-colors">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <Label className="text-lg font-semibold">Target Keywords</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Add up to 10 keywords you want to rank for. We'll research and incorporate them naturally.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="e.g., content marketing strategy"
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                className="bg-background"
              />
              <Button onClick={addKeyword} disabled={keywords.length >= 10} variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                {keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium"
                  >
                    {keyword}
                    <button 
                      onClick={() => removeKeyword(idx)}
                      className="hover:bg-primary/20 rounded transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {keywords.length === 0 && (
              <div className="text-center p-8 bg-muted/30 rounded-lg border-2 border-dashed border-border">
                <p className="text-sm text-muted-foreground">No keywords added yet. Start by adding your first keyword above.</p>
              </div>
            )}
          </Card>

          {/* Competitor URLs Section */}
          <Card className="p-6 border-border hover:border-primary/20 transition-colors">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Link2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <Label className="text-lg font-semibold">Competitor Analysis</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Optional: Add competitor blog URLs to analyze what's working and create better content.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              {competitorUrls.map((url, idx) => (
                <Input
                  key={idx}
                  placeholder={`https://competitor-blog-${idx + 1}.com/article`}
                  value={url}
                  onChange={(e) => updateCompetitorUrl(idx, e.target.value)}
                  type="url"
                  className="bg-background"
                />
              ))}
            </div>
          </Card>

          {/* Tone Sample Selection */}
          <Card className="p-6 border-border hover:border-primary/20 transition-colors">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mic className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <Label className="text-lg font-semibold">Brand Voice & Style</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Optional: Choose a writing sample to match your unique tone and style.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedToneSample} onValueChange={setSelectedToneSample}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select a tone sample..." />
                </SelectTrigger>
                <SelectContent>
                  {toneSamples.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No tone samples yet</div>
                  ) : (
                    toneSamples.map((sample) => (
                      <SelectItem key={sample.id} value={sample.id}>
                        {sample.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    New
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Brand Voice Sample</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tone-title">Sample Name</Label>
                      <Input
                        id="tone-title"
                        placeholder="e.g., Casual & Friendly Style"
                        value={newToneTitle}
                        onChange={(e) => setNewToneTitle(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tone-content">Sample Content</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Paste an example of your writing that represents your brand voice
                      </p>
                      <Textarea
                        id="tone-content"
                        placeholder="Paste your writing sample here..."
                        value={newToneContent}
                        onChange={(e) => setNewToneContent(e.target.value)}
                        rows={10}
                        className="font-mono text-sm"
                      />
                    </div>
                    <Button
                      onClick={handleAddToneSample}
                      disabled={isSavingTone}
                      className="w-full"
                    >
                      {isSavingTone ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Tone Sample"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Card>

          {/* Generate Button */}
          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 h-14 text-base font-semibold"
            onClick={handleGenerate}
            disabled={isGenerating || keywords.length === 0}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Researching keywords & crafting your blog...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate SEO Blog Post
              </>
            )}
          </Button>
          
          {keywords.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Add at least one keyword to get started
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;
