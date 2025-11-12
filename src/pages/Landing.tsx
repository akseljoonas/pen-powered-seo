import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Sparkles, Target, Users, Zap } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Create High-Quality
                <span className="text-primary"> SEO Blogs </span>
                with AI
              </h1>
              <p className="text-xl text-muted-foreground">
                Transform your content strategy with AI-powered blog generation. Analyze competitors, maintain your tone, and rank higher.
              </p>
              <div className="flex gap-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Creating Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="AI Blog Creation Platform" 
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Rank Higher</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform handles the heavy lifting so you can focus on your business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Keyword Optimization</h3>
              <p className="text-muted-foreground">
                Input your target keywords and let AI optimize your content for maximum visibility
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Competitor Analysis</h3>
              <p className="text-muted-foreground">
                Analyze up to 3 competitor blogs to create content that stands out
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tone Matching</h3>
              <p className="text-muted-foreground">
                Maintain your unique brand voice by learning from your previous content
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rich Editor</h3>
              <p className="text-muted-foreground">
                Refine AI-generated drafts with our powerful, intuitive editor
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-12 bg-primary text-center">
            <h2 className="text-4xl font-bold mb-4 text-primary-foreground">
              Ready to Transform Your Content Strategy?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already using BlogForge AI to create SEO-optimized content
            </p>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="shadow-lg bg-background text-foreground hover:bg-background/90">
                Get Started Now - It's Free
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 BlogForge AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
