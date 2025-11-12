import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Folder, MoreVertical } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || blog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getInitials = (title: string) => {
    const words = title.split(" ");
    return words.length > 1 
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : title.substring(0, 2).toUpperCase();
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const blogDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - blogDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return blogDate.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated />
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-7xl">
        <div className="flex justify-between items-center mb-8 mt-4">
          <h1 className="text-2xl font-semibold text-foreground">Content</h1>
          <Link to="/create">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              New content
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Select defaultValue="recent">
            <SelectTrigger className="w-[180px] bg-background border-border">
              <SelectValue placeholder="Recently created" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently created</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-background border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[140px] bg-background border-border">
              <SelectValue placeholder="Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[140px] bg-background border-border">
              <SelectValue placeholder="Author" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Authors</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by keyword"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
        </div>

        {/* Blog List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your content...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" 
                ? "No content found matching your filters" 
                : "No content yet"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link to="/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first content
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBlogs.map((blog) => (
              <Link key={blog.id} to={`/editor/${blog.id}`}>
                <div className="group bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {blog.keywords.length > 0 ? blog.keywords.slice(0, 2).join(", ") : "My blog post"}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <button className="hover:text-foreground transition-colors flex items-center gap-1">
                          <Folder className="h-4 w-4" />
                          Move to folder
                        </button>
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                          general
                        </span>
                        <button className="hover:text-foreground transition-colors text-xs">
                          + Tag
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-md text-xs font-medium ${
                        blog.status === "published"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                      </span>
                      
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                        {getInitials(blog.title)}
                      </div>
                      
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                        {formatDate(blog.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
