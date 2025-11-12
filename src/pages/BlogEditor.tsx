import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, LayoutGrid, Undo2, Redo2, Eye, Send, Upload, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Blog {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  status: string;
}

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetKeywords, setTargetKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("post");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  useEffect(() => {
    checkAuth();
    if (id === "generating") {
      handleGeneration();
    } else {
      fetchBlog();
    }
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const handleGeneration = async () => {
    const state = location.state as {
      keywords: string[];
      competitorUrls: string[];
      toneSampleContent: string;
    };

    if (!state) {
      navigate("/create");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Step 1: Researching keywords
      setGenerationStep(1);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Pulling example blogs
      setGenerationStep(2);
      
      // Call the edge function to generate the blog
      const { data, error } = await supabase.functions.invoke("generate-blog", {
        body: {
          keywords: state.keywords,
          competitorUrls: state.competitorUrls,
          toneSample: state.toneSampleContent,
          userId: user.id,
        },
      });

      if (error) throw error;

      // Step 3: Writing blog post
      setGenerationStep(3);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Parse content field if it's JSON string
      let parsedContent = data.content;
      if (typeof data.content === 'string') {
        try {
          const contentObj = JSON.parse(data.content);
          parsedContent = contentObj.content || data.content;
        } catch {
          // Content is already a string, use as-is
          parsedContent = data.content;
        }
      }

      // Create a new blog entry
      const { data: blog, error: insertError } = await supabase
        .from("blogs")
        .insert({
          user_id: user.id,
          title: data.title,
          content: parsedContent,
          keywords: state.keywords,
          status: "draft",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Insert competitor URLs
      if (state.competitorUrls.length > 0) {
        await supabase.from("competitor_urls").insert(
          state.competitorUrls.map(url => ({
            blog_id: blog.id,
            url: url.trim(),
          }))
        );
      }

      toast.success("Blog generated successfully!");
      
      // Navigate to the newly created blog
      navigate(`/editor/${blog.id}`, { replace: true });
    } catch (error: any) {
      console.error("Error generating blog:", error);
      toast.error(error.message || "Failed to generate blog");
      navigate("/create");
    }
  };

  const fetchBlog = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Error loading blog");
      navigate("/dashboard");
    } else {
      setBlog(data);
      setTitle(data.title);
      setContent(data.content || "");
      setTargetKeywords(data.keywords?.join(", ") || "");
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("blogs")
      .update({
        title,
        content,
      })
      .eq("id", id);

    setIsSaving(false);

    if (error) {
      toast.error("Error saving blog");
    } else {
      toast.success("Blog saved successfully!");
    }
  };

  const handlePublish = async () => {
    if (!id) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("blogs")
      .update({
        title,
        content,
        status: "published",
      })
      .eq("id", id);

    setIsSaving(false);

    if (error) {
      toast.error("Error publishing blog");
    } else {
      toast.success("Blog published successfully!");
      navigate("/dashboard");
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  if (isLoading || id === "generating") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full p-8">
          <h2 className="text-2xl font-bold mb-8 text-center">Generating Your Blog Post</h2>
          
          <div className="space-y-6">
            {/* Checkpoint 1: Researching keyword */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {generationStep > 1 ? (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                ) : generationStep === 1 ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-muted" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${generationStep >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  1. Researching Keywords
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Analyzing target keywords and gathering latest trends
                </p>
              </div>
            </div>

            {/* Checkpoint 2: Pulling example blogs */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {generationStep > 2 ? (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                ) : generationStep === 2 ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-muted" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${generationStep >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  2. Pulling Example Blogs
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Analyzing competitor content and best practices
                </p>
              </div>
            </div>

            {/* Checkpoint 3: Writing blog post */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {generationStep > 3 ? (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                ) : generationStep === 3 ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-muted" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${generationStep >= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  3. Writing Blog Post
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Crafting SEO-optimized content with your brand voice
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            This may take 30-60 seconds...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
              <LayoutGrid className="h-4 w-4" />
              Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{blog?.status === "published" ? "Published" : "Draft"}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-green-600">●</span>
                <span className="text-xs text-muted-foreground">Synced</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-muted rounded transition-colors" disabled>
              <Undo2 className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-muted rounded transition-colors" disabled>
              <Redo2 className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-muted rounded transition-colors" disabled>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="text-sm text-muted-foreground">
              {wordCount} words<br />
              {charCount} characters
            </div>

            <Button 
              variant="outline" 
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {isPreviewMode ? "Edit" : "Preview"}
            </Button>

            <Button 
              onClick={handlePublish} 
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Publish post
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Editor Area */}
        <div className="flex-1 p-12">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My new post"
            className="text-5xl font-bold border-0 p-0 mb-8 focus-visible:ring-0 bg-transparent"
          />
          
          {isPreviewMode ? (
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Click here to start writing..."
              className="min-h-[600px] text-base border-0 p-0 resize-none focus-visible:ring-0 bg-transparent"
            />
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-[400px] border-l border-border bg-card p-6 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="post">Post</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="toc">ToC</TabsTrigger>
            </TabsList>

            <TabsContent value="post" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Post settings</h3>

                <div className="space-y-2">
                  <Label htmlFor="keywords">
                    Target Keyword(s) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="keywords"
                    value={targetKeywords}
                    onChange={(e) => setTargetKeywords(e.target.value)}
                    placeholder="e.g., SEO tools, content marketing"
                  />
                  <p className="text-xs text-muted-foreground">
                    Main keywords this post targets for SEO
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Cover image</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Drag an image</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Once you drop an image it will be automatically uploaded
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Description</Label>
                    <span className="text-xs text-destructive">Add description to publish/preview</span>
                  </div>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description of post..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="seo">SEO</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Authors</Label>
                    <span className="text-xs text-destructive">Add an author to publish/preview</span>
                  </div>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select author(s)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="me">Me</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <h3 className="text-lg font-semibold">SEO Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure SEO metadata for this post
              </p>
            </TabsContent>

            <TabsContent value="toc" className="space-y-4">
              <h3 className="text-lg font-semibold">Table of Contents</h3>
              <p className="text-sm text-muted-foreground">
                Manage the table of contents for this post
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
