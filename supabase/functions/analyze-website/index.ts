import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { websiteUrl } = await req.json();

    if (!websiteUrl) {
      throw new Error("Website URL is required");
    }

    console.log(`Analyzing website: ${websiteUrl}`);

    const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!perplexityApiKey) {
      throw new Error("PERPLEXITY_API_KEY not configured");
    }

    // Use Perplexity to analyze the website
    const analysisPrompt = `Analyze the website ${websiteUrl} and provide a structured analysis with the following information:

1. Brand Name: The company or brand name
2. Business Description: A 2-3 sentence summary of what the business does
3. Target Audience: Who are their primary customers/users
4. Key Benefits: Main value propositions or benefits they offer
5. Industry: The primary industry or sector they operate in
6. Tone of Voice: Describe their communication style (e.g., professional, casual, technical, friendly)

Format your response as a JSON object with these exact keys: brandName, businessDescription, targetAudience, benefits, industry, toneOfVoice

Only return the JSON object, no additional text.`;

    console.log("Calling Perplexity API for website analysis...");

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${perplexityApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "You are a business analyst. Analyze websites and return structured JSON data only.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error:", errorText);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Perplexity API response received");

    const analysisText = data.choices[0]?.message?.content || "";
    console.log("Analysis text:", analysisText);

    // Try to parse JSON from the response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/) ||
        analysisText.match(/```\n?([\s\S]*?)\n?```/) || [null, analysisText];

      const jsonText = jsonMatch[1] || analysisText;
      analysis = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error("Failed to parse JSON from analysis:", parseError);
      // Fallback: return a basic structure
      analysis = {
        brandName: "Unknown",
        businessDescription: analysisText.substring(0, 200),
        targetAudience: "General audience",
        benefits: "To be determined",
        industry: "General",
        toneOfVoice: "Professional",
      };
    }

    console.log("Parsed analysis:", analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in analyze-website function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
