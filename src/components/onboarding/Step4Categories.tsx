import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FolderOpen } from "lucide-react";

interface Step4CategoriesProps {
  onSubmit: (categories: string[]) => void;
  initialCategories: string[];
}

const PREDEFINED_CATEGORIES = [
  "Marketing",
  "Development",
  "Design",
  "Sales",
  "Product",
  "Customer Success",
  "HR & Culture",
  "Finance",
  "Operations",
  "Leadership",
];

export const Step4Categories = ({ onSubmit, initialCategories }: Step4CategoriesProps) => {
  const [selected, setSelected] = useState<string[]>(
    initialCategories.length > 0 ? initialCategories : PREDEFINED_CATEGORIES.slice(0, 3)
  );

  const toggleCategory = (category: string) => {
    setSelected(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selected);
  };

  return (
    <Card className="p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
          <FolderOpen className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Choose your blog categories</h2>
        <p className="text-muted-foreground">Select topics you want to write about</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {PREDEFINED_CATEGORIES.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selected.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <Label
                htmlFor={category}
                className="text-sm font-normal cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSubmit([])}
            className="flex-1"
          >
            Skip
          </Button>
          <Button type="submit" className="flex-1" size="lg">
            Continue
          </Button>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary"></div>
        <div className="w-2 h-2 rounded-full bg-primary"></div>
        <div className="w-2 h-2 rounded-full bg-primary"></div>
        <div className="w-2 h-2 rounded-full bg-primary"></div>
        <div className="w-2 h-2 rounded-full bg-muted"></div>
      </div>
    </Card>
  );
};
