import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keywords, competitorUrls, toneSample, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!PERPLEXITY_API_KEY) {
      throw new Error("PERPLEXITY_API_KEY is not configured");
    }

    // Initialize Supabase client to fetch brand profile
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Fetch brand profile if userId provided
    let brandProfile = null;
    if (userId) {
      const { data } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      brandProfile = data;
      console.log('Brand profile loaded:', brandProfile?.brand_name);
    }

    // Research each keyword with Perplexity to get up-to-date information
    console.log("Researching keywords with Perplexity...");
    const keywordResearch: Record<string, string> = {};

    for (const keyword of keywords) {
      try {
        const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar-deep-research",
            messages: [
              {
                role: "user",
                content: `Research the keyword "${keyword}" and provide comprehensive information including latest trends, statistics, best practices, and relevant developments. Focus on actionable insights.`,
              },
            ],
            max_tokens: 10000,
            search_recency_filter: "month",
          }),
        });

        if (perplexityResponse.ok) {
          const perplexityData = await perplexityResponse.json();
          keywordResearch[keyword] = perplexityData.choices[0].message.content;
          console.log(`Research completed for keyword: ${keyword}`);
        } else {
          console.error(`Perplexity API error for keyword ${keyword}:`, perplexityResponse.status);
          keywordResearch[keyword] = "Research unavailable";
        }
      } catch (error) {
        console.error(`Error researching keyword ${keyword}:`, error);
        keywordResearch[keyword] = "Research unavailable";
      }
    }

    // Build the prompt for blog generation
    let prompt = `You are an expert SEO content writer. Generate a high-quality, SEO-optimized blog post with the following requirements:

Target Keywords: ${keywords.join(", ")}

`;

    // Add brand context if available
    if (brandProfile) {
      prompt += `BRAND CONTEXT:
Brand Name: ${brandProfile.brand_name}
Industry: ${brandProfile.industry}
Business Description: ${brandProfile.business_description}
Target Audience: ${brandProfile.target_audience}
Key Benefits: ${brandProfile.benefits}
Tone of Voice: ${brandProfile.tone_of_voice}

Write this blog post FOR ${brandProfile.brand_name}, speaking directly to their target audience (${brandProfile.target_audience}). Match the ${brandProfile.tone_of_voice} tone throughout.

`;
    }

    prompt += `UP-TO-DATE KEYWORD RESEARCH:
${Object.entries(keywordResearch)
  .map(
    ([keyword, research]) => `
Keyword: ${keyword}
Latest Information:
${research}
---
`,
  )
  .join("\n")}

`;

    if (competitorUrls && competitorUrls.length > 0) {
      prompt += `\nAnalyze and improve upon these competitor blogs:
${competitorUrls.map((url: string, idx: number) => `${idx + 1}. ${url}`).join("\n")}
`;
    }

    if (toneSample) {
      prompt += `\nMatch the tone and writing style of this example:
${toneSample.substring(0, 1000)}...
`;
    }

    prompt += `\nGenerate a comprehensive blog post that:
1. Uses the UP-TO-DATE KEYWORD RESEARCH above to include latest trends, statistics, and developments
2. Naturally incorporates the target keywords throughout the content
3. ${brandProfile ? `Speaks to ${brandProfile.brand_name}'s audience (${brandProfile.target_audience})` : 'Provides unique insights and value'}
4. ${brandProfile ? `Maintains a ${brandProfile.tone_of_voice} tone consistently` : 'Uses an engaging, professional tone'}
5. Uses engaging headings and subheadings
6. Includes actionable takeaways
7. Is approximately 1500-2000 words
8. Has a compelling introduction and conclusion

Return ONLY a JSON object with this structure:
{
  "title": "The blog title (incorporate primary keyword)",
  "content": "The full blog content in github flavoured markdown format"
}`;

    console.log("Generating blog with Lovable AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log("Generated text:", generatedText);

    // Parse the JSON response with improved extraction
    let result;
    try {
      // Try to extract JSON from markdown code blocks if present
      let jsonText = generatedText;

      // Remove markdown code block markers
      const codeBlockMatch = generatedText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      }

      // Find JSON object boundaries
      const startIdx = jsonText.indexOf("{");
      const endIdx = jsonText.lastIndexOf("}");

      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        jsonText = jsonText.substring(startIdx, endIdx + 1);
      }

      result = JSON.parse(jsonText);

      // Validate result has required fields
      if (!result.title || !result.content) {
        throw new Error("Missing required fields in response");
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // If parsing fails, try to extract title and content manually
      const titleMatch = generatedText.match(/"title"\s*:\s*"([^"]+)"/);
      const contentMatch = generatedText.match(/"content"\s*:\s*"([\s\S]+?)"\s*}/);

      if (titleMatch && contentMatch) {
        result = {
          title: titleMatch[1],
          content: contentMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"'),
        };
      } else {
        // Last resort: use the full text as content
        result = {
          title: keywords[0] ? `How to Master ${keywords[0]}` : "Your SEO-Optimized Blog",
          content: generatedText,
        };
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-blog function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
