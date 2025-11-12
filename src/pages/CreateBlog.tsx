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
import { Loader2, Plus, X, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ToneSample {
  id: string;
  title: string;
  content: string | null;
  url: string | null;
}

const CreateBlog = () => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [competitorUrls, setCompetitorUrls] = useState<string[]>(["", "", ""]);
  const [toneSamples, setToneSamples] = useState<ToneSample[]>([]);
  const [selectedToneSamples, setSelectedToneSamples] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newToneTitle, setNewToneTitle] = useState("");
  const [newToneUrl, setNewToneUrl] = useState("");
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
    if (!newToneTitle.trim() || !newToneUrl.trim()) {
      toast.error("Please fill in both title and blog URL");
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
          url: newToneUrl.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Tone sample added successfully!");
      setToneSamples([data, ...toneSamples]);
      setSelectedToneSamples([...selectedToneSamples, data.id]);
      setNewToneTitle("");
      setNewToneUrl("");
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

      // Get the selected tone sample URLs
      const toneSampleUrls = selectedToneSamples
        .map(id => toneSamples.find(s => s.id === id)?.url)
        .filter(url => url && url.trim() !== "");

      // Call the edge function to generate the blog
      const { data, error } = await supabase.functions.invoke("generate-blog", {
        body: {
          keywords,
          competitorUrls: competitorUrls.filter(url => url.trim() !== ""),
          toneSampleUrls,
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create New Blog</h1>
          <p className="text-muted-foreground">
            Provide details to generate your SEO-optimized content
          </p>
        </div>

        <div className="space-y-6">
          {/* Keywords Section */}
          <Card className="p-6">
            <Label className="text-lg font-semibold mb-4 block">Target Keywords</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Add keywords you want to rank for (max 10)
            </p>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter a keyword..."
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addKeyword()}
              />
              <Button onClick={addKeyword} disabled={keywords.length >= 10}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full"
                >
                  {keyword}
                  <button onClick={() => removeKeyword(idx)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </Card>

          {/* Competitor URLs Section */}
          <Card className="p-6">
            <Label className="text-lg font-semibold mb-4 block">Competitor Blog URLs</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Add up to 3 competitor blog URLs for analysis (optional)
            </p>
            <div className="space-y-3">
              {competitorUrls.map((url, idx) => (
                <Input
                  key={idx}
                  placeholder={`Competitor URL ${idx + 1}`}
                  value={url}
                  onChange={(e) => updateCompetitorUrl(idx, e.target.value)}
                  type="url"
                />
              ))}
            </div>
          </Card>

          {/* Tone Sample Selection */}
          <Card className="p-6">
            <Label className="text-lg font-semibold mb-4 block">Tone of Voice</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Select up to 3 of your existing blogs to match your writing style (optional)
            </p>
            <div className="space-y-3 mb-4">
              {toneSamples.map((sample) => (
                <label key={sample.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedToneSamples.includes(sample.id)}
                    onChange={(e) => {
                      if (e.target.checked && selectedToneSamples.length < 3) {
                        setSelectedToneSamples([...selectedToneSamples, sample.id]);
                      } else if (!e.target.checked) {
                        setSelectedToneSamples(selectedToneSamples.filter(id => id !== sample.id));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{sample.title}</span>
                  {sample.url && (
                    <span className="text-xs text-muted-foreground truncate max-w-xs">
                      ({sample.url})
                    </span>
                  )}
                </label>
              ))}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Blog URL for Tone of Voice
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Tone of Voice Sample</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tone-title">Title</Label>
                    <Input
                      id="tone-title"
                      placeholder="e.g., My Professional Blog"
                      value={newToneTitle}
                      onChange={(e) => setNewToneTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tone-url">Blog URL</Label>
                    <Input
                      id="tone-url"
                      type="url"
                      placeholder="https://yourblog.com/example-post"
                      value={newToneUrl}
                      onChange={(e) => setNewToneUrl(e.target.value)}
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
                      "Add Tone Sample"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </Card>

          {/* Generate Button */}
          <Button
            size="lg"
            className="w-full bg-gradient-primary hover:opacity-90"
            onClick={handleGenerate}
            disabled={isGenerating || keywords.length === 0}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Researching Keywords & Generating Blog...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Blog
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;
