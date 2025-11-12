import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, LayoutGrid, Undo2, Redo2, Eye, Send, Upload } from "lucide-react";

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
  const [blog, setBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetKeywords, setTargetKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("post");

  useEffect(() => {
    checkAuth();
    fetchBlog();
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              Preview
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
          
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Click here to start writing..."
            className="min-h-[600px] text-base border-0 p-0 resize-none focus-visible:ring-0 bg-transparent"
          />
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
