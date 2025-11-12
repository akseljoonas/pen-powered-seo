import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={handlePublish} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish"
              )}
            </Button>
          </div>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <Input
                placeholder="Blog Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-3xl font-bold border-none px-0 focus-visible:ring-0"
              />
            </div>

            {blog?.keywords && blog.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 py-4 border-y">
                {blog.keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}

            <Textarea
              placeholder="Start writing your blog content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[600px] text-lg leading-relaxed border-none px-0 focus-visible:ring-0 resize-none"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BlogEditor;
