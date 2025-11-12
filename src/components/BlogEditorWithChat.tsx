import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Loader2, Eye, Edit3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MarkdownToolbar } from "./MarkdownToolbar";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface BlogEditorWithChatProps {
  title: string;
  content: string;
  keywords: string[];
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
}

export const BlogEditorWithChat = ({
  title,
  content,
  keywords,
  onTitleChange,
  onContentChange,
}: BlogEditorWithChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInsertMarkdown = (text: string, cursorOffset?: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = content;

    // Insert text at cursor position
    const newContent =
      currentContent.substring(0, start) + text + currentContent.substring(end);

    onContentChange(newContent);

    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos = cursorOffset !== undefined ? start + cursorOffset : start + text.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const { data, error } = await supabase.functions.invoke("chat-edit-blog", {
        body: {
          message: input,
          blogContent: content,
          blogTitle: title,
          keywords: keywords,
          conversationHistory,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error in chat:", error);
      toast.error(error.message || "Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Editor Section - 2/3 width */}
      <div className="lg:col-span-2 space-y-4">
        <Input
          placeholder="Blog Title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-3xl font-bold border-none px-0 focus-visible:ring-0"
        />

        {keywords && keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 py-4 border-y">
            {keywords.map((keyword, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}

        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="mt-4">
            <Card className="overflow-hidden">
              <MarkdownToolbar onInsert={handleInsertMarkdown} />
              <Textarea
                ref={textareaRef}
                placeholder="Start writing your blog content in GitHub Flavored Markdown..."
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                className="min-h-[600px] text-base leading-relaxed border-none rounded-none px-4 py-4 focus-visible:ring-0 resize-none font-mono"
              />
            </Card>
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
            <Card className="p-6 min-h-[600px]">
              <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-h5:text-lg prose-h6:text-base prose-a:text-primary prose-strong:text-foreground">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-6">
                        <table className="min-w-full divide-y divide-border border border-border" {...props} />
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead className="bg-muted" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-border last:border-r-0" {...props} />
                    ),
                    tbody: ({ node, ...props }) => (
                      <tbody className="bg-background divide-y divide-border" {...props} />
                    ),
                    tr: ({ node, ...props }) => (
                      <tr className="hover:bg-muted/50 transition-colors" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-border last:border-r-0" {...props} />
                    ),
                    code: ({ node, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      // Check if it's inline code by checking if there's a language class
                      const isInline = !match;
                      return isInline ? (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props}>
                          {children}
                        </code>
                      ) : (
                        <div className="relative my-4">
                          <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                            {match[1]}
                          </div>
                          <code className="block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono" {...props}>
                            {children}
                          </code>
                        </div>
                      );
                    },
                    pre: ({ node, ...props }) => (
                      <pre className="my-4" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc list-inside space-y-2 my-4" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal list-inside space-y-2 my-4" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="ml-4" {...props} />
                    ),
                    hr: ({ node, ...props }) => (
                      <hr className="my-8 border-t-2 border-border" {...props} />
                    ),
                    img: ({ node, ...props }) => (
                      <img className="rounded-lg my-6 max-w-full h-auto" {...props} />
                    ),
                  }}
                >
                  {content || "*No content yet. Start writing in the Edit tab.*"}
                </ReactMarkdown>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Section - 1/3 width */}
      <Card className="flex flex-col h-[calc(100vh-200px)] sticky top-24">
        <div className="p-4 border-b bg-gradient-primary text-primary-foreground">
          <h3 className="font-semibold">AI Assistant</h3>
          <p className="text-xs opacity-90 mt-1">Ask me to help edit your blog</p>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-sm space-y-2">
                  <p className="font-medium">Try asking:</p>
                  <div className="text-xs space-y-1 text-left bg-muted p-3 rounded-lg">
                    <p>• "Make the intro more engaging"</p>
                    <p>• "Add a conclusion section"</p>
                    <p>• "Improve SEO optimization"</p>
                    <p>• "Add more examples"</p>
                  </div>
                </div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about your blog..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
