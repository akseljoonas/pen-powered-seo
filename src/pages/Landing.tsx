import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span>✨</span>
              <span>AI-powered SEO content generation</span>
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              Create content that
              <br />
              <span className="text-primary">ranks & converts</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Generate high-quality, SEO-optimized blog posts that match your brand voice,
              outrank competitors, and drive real results.
            </p>
            
            <div className="flex gap-4 justify-center items-center">
              <Link to="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 h-12 px-8 text-base">
                  Get started free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="ghost" className="h-12 px-8 text-base">
                  Sign in
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              No credit card required · Start creating in minutes
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Deep keyword research</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered analysis of your target keywords to understand search intent and competition.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Competitor insights</h3>
              <p className="text-muted-foreground leading-relaxed">
                Analyze what's working for competitors and create content that stands out.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Brand voice matching</h3>
              <p className="text-muted-foreground leading-relaxed">
                Maintain consistent tone and style across all your content automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built for modern content teams</h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to high-quality SEO content
            </p>
          </div>
          
          <div className="space-y-12">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                1
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Add your keywords</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Tell us what you want to rank for, and we'll research the best approach.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                2
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Let AI do the heavy lifting</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Our AI analyzes competitors, researches your topic, and generates content in your brand voice.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                3
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Edit, polish & publish</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Fine-tune your content with our editor and publish when ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary-foreground">
            Start creating better content today
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join content creators who are already using Postable to rank higher and drive more traffic.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="h-12 px-8 text-base bg-background text-foreground hover:bg-background/90">
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">&copy; 2025 Postable. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
