import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Step1WebsiteUrl } from "@/components/onboarding/Step1WebsiteUrl";
import { Step2Analyzing } from "@/components/onboarding/Step2Analyzing";
import { Step3BrandInfo } from "@/components/onboarding/Step3BrandInfo";
import { Step4Categories } from "@/components/onboarding/Step4Categories";
import { Step5AuthorInfo } from "@/components/onboarding/Step5AuthorInfo";

export interface BrandData {
  websiteUrl: string;
  brandName: string;
  businessDescription: string;
  targetAudience: string;
  benefits: string;
  location: string;
  language: string;
  toneOfVoice: string;
  industry: string;
}

export interface AuthorData {
  firstName: string;
  lastName: string;
  position: string;
  description: string;
  avatarUrl?: string;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [brandData, setBrandData] = useState<Partial<BrandData>>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [authorData, setAuthorData] = useState<Partial<AuthorData>>({});

  const handleWebsiteSubmit = async (url: string) => {
    setWebsiteUrl(url);
    setCurrentStep(2);

    try {
      // Call the analyze-website edge function
      const { data, error } = await supabase.functions.invoke('analyze-website', {
        body: { websiteUrl: url }
      });

      if (error) throw error;

      // Pre-fill brand data with analysis results
      setBrandData({
        websiteUrl: url,
        brandName: data.brandName || '',
        businessDescription: data.businessDescription || '',
        targetAudience: data.targetAudience || '',
        benefits: data.benefits || '',
        industry: data.industry || '',
        toneOfVoice: data.toneOfVoice || '',
        location: '',
        language: 'English',
      });

      // Simulate analysis delay
      setTimeout(() => {
        setCurrentStep(3);
      }, 3000);

    } catch (error) {
      console.error('Error analyzing website:', error);
      toast.error('Failed to analyze website, but you can still continue');
      
      // Still move forward with empty data
      setBrandData({
        websiteUrl: url,
        brandName: '',
        businessDescription: '',
        targetAudience: '',
        benefits: '',
        location: '',
        language: 'English',
        toneOfVoice: '',
        industry: '',
      });

      setTimeout(() => {
        setCurrentStep(3);
      }, 3000);
    }
  };

  const handleBrandInfoSubmit = (data: BrandData) => {
    setBrandData(data);
    setCurrentStep(4);
  };

  const handleCategoriesSubmit = (categories: string[]) => {
    setSelectedCategories(categories);
    setCurrentStep(5);
  };

  const handleAuthorInfoSubmit = async (data: AuthorData) => {
    setAuthorData(data);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Save brand profile
      const { error: brandError } = await supabase
        .from('brand_profiles')
        .insert({
          user_id: user.id,
          website_url: brandData.websiteUrl!,
          brand_name: brandData.brandName!,
          business_description: brandData.businessDescription,
          target_audience: brandData.targetAudience,
          benefits: brandData.benefits,
          location: brandData.location,
          language: brandData.language,
          tone_of_voice: brandData.toneOfVoice,
          industry: brandData.industry,
        });

      if (brandError) throw brandError;

      // Save author profile
      const { error: authorError } = await supabase
        .from('author_profiles')
        .insert({
          user_id: user.id,
          first_name: data.firstName,
          last_name: data.lastName,
          position: data.position,
          description: data.description,
          avatar_url: data.avatarUrl,
        });

      if (authorError) throw authorError;

      // Save categories
      if (selectedCategories.length > 0) {
        const { error: categoriesError } = await supabase
          .from('blog_categories')
          .insert(
            selectedCategories.map(name => ({
              user_id: user.id,
              name,
              enabled: true,
            }))
          );

        if (categoriesError) throw categoriesError;
      }

      toast.success('Your blog is ready to start creating content!');
      navigate('/dashboard');

    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast.error('Failed to save your information. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {currentStep === 1 && (
          <Step1WebsiteUrl onSubmit={handleWebsiteSubmit} />
        )}
        {currentStep === 2 && (
          <Step2Analyzing websiteUrl={websiteUrl} />
        )}
        {currentStep === 3 && (
          <Step3BrandInfo 
            initialData={brandData as BrandData} 
            onSubmit={handleBrandInfoSubmit} 
          />
        )}
        {currentStep === 4 && (
          <Step4Categories 
            onSubmit={handleCategoriesSubmit}
            initialCategories={selectedCategories}
          />
        )}
        {currentStep === 5 && (
          <Step5AuthorInfo 
            onSubmit={handleAuthorInfoSubmit}
            initialData={authorData}
          />
        )}
      </div>
    </div>
  );
};

export default Onboarding;
