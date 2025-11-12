import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, FileText, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Blog {
  id: string;
  title: string;
  status: string;
  created_at: string;
  keywords: string[];
}

const Dashboard = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchBlogs();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const fetchBlogs = async () => {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error loading blogs");
    } else {
      setBlogs(data || []);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Blogs</h1>
            <p className="text-muted-foreground">Create and manage your SEO-optimized content</p>
          </div>
          <Link to="/create">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90">
              <Plus className="mr-2 h-5 w-5" />
              Create New Blog
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No blogs yet</h2>
            <p className="text-muted-foreground mb-6">
              Get started by creating your first SEO-optimized blog
            </p>
            <Link to="/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Blog
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link key={blog.id} to={`/editor/${blog.id}`}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">{blog.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    {new Date(blog.created_at).toLocaleDateString()}
                  </div>
                  {blog.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {blog.keywords.slice(0, 3).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        blog.status === "published"
                          ? "bg-secondary/10 text-secondary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {blog.status}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
