import { Button } from "@/components/ui/button";
import {
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Table,
  Image,
  Youtube,
  Columns2,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Smile,
  Twitter,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface MarkdownToolbarProps {
  onInsert: (text: string, cursorOffset?: number) => void;
}

export const MarkdownToolbar = ({ onInsert }: MarkdownToolbarProps) => {
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [iconName, setIconName] = useState("");

  const insertBulletList = () => {
    onInsert("- Item 1\n- Item 2\n- Item 3\n", 2);
  };

  const insertNumberedList = () => {
    onInsert("1. Item 1\n2. Item 2\n3. Item 3\n", 3);
  };

  const insertBlockquote = () => {
    onInsert("> Your quote here\n", 2);
  };

  const insertCodeBlock = () => {
    onInsert("```javascript\n// Your code here\n```\n", 14);
  };

  const insertHorizontalLine = () => {
    onInsert("\n---\n\n");
  };

  const insertColumns = () => {
    onInsert(
      "\n<div style='display: grid; grid-template-columns: 1fr 1fr; gap: 20px;'>\n<div>\n\n## Column 1\nContent for column 1\n\n</div>\n<div>\n\n## Column 2\nContent for column 2\n\n</div>\n</div>\n\n"
    );
  };

  const insertTable = () => {
    onInsert(
      "\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n\n"
    );
  };

  const insertHeading = (level: number) => {
    const hashes = "#".repeat(level);
    onInsert(`\n${hashes} Heading ${level}\n\n`, hashes.length + 1);
  };

  const handleInsertImage = () => {
    if (imageUrl) {
      const alt = imageAlt || "Image";
      onInsert(`![${alt}](${imageUrl})\n`);
      setImageUrl("");
      setImageAlt("");
    }
  };

  const handleInsertYoutube = () => {
    if (youtubeUrl) {
      // Extract video ID from various YouTube URL formats
      let videoId = "";
      try {
        const url = new URL(youtubeUrl);
        if (url.hostname.includes("youtu.be")) {
          videoId = url.pathname.slice(1);
        } else if (url.hostname.includes("youtube.com")) {
          videoId = url.searchParams.get("v") || "";
        }
      } catch {
        // If URL parsing fails, assume it's just the video ID
        videoId = youtubeUrl;
      }

      if (videoId) {
        onInsert(
          `\n<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 20px 0;">\n  <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n</div>\n\n`
        );
        setYoutubeUrl("");
      }
    }
  };

  const handleInsertTwitter = () => {
    if (twitterUrl) {
      onInsert(
        `\n<blockquote class="twitter-tweet"><a href="${twitterUrl}"></a></blockquote>\n<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>\n\n`
      );
      setTwitterUrl("");
    }
  };

  const handleInsertIcon = () => {
    if (iconName) {
      onInsert(iconName);
      setIconName("");
    }
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/30">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertBulletList}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertNumberedList}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertBlockquote}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertCodeBlock}
        title="Code Block"
      >
        <Code className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertHorizontalLine}
        title="Horizontal Line"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertColumns}
        title="Columns"
      >
        <Columns2 className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertTable}
        title="Table"
      >
        <Table className="h-4 w-4" />
      </Button>

      <div className="w-px h-8 bg-border mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertHeading(2)}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertHeading(3)}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertHeading(4)}
        title="Heading 4"
      >
        <Heading4 className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertHeading(5)}
        title="Heading 5"
      >
        <Heading5 className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertHeading(6)}
        title="Heading 6"
      >
        <Heading6 className="h-4 w-4" />
      </Button>

      <div className="w-px h-8 bg-border mx-1" />

      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="sm" title="Insert Image">
            <Image className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-alt">Alt Text (optional)</Label>
              <Input
                id="image-alt"
                placeholder="Description of image"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
            </div>
            <Button onClick={handleInsertImage} className="w-full">
              Insert Image
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="sm" title="Insert YouTube Video">
            <Youtube className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL or Video ID</Label>
              <Input
                id="youtube-url"
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleInsertYoutube} className="w-full">
              Insert Video
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="sm" title="Insert X/Twitter Post">
            <Twitter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twitter-url">X/Twitter Post URL</Label>
              <Input
                id="twitter-url"
                placeholder="https://twitter.com/user/status/..."
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleInsertTwitter} className="w-full">
              Insert Post
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="sm" title="Insert Icon">
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="icon-name">Icon/Emoji</Label>
              <Input
                id="icon-name"
                placeholder="✨ 🚀 💡 ⭐ 🎯"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Paste any emoji or use HTML entities
              </p>
            </div>
            <Button onClick={handleInsertIcon} className="w-full">
              Insert Icon
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
