import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keywords, competitorUrls, toneSample } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!PERPLEXITY_API_KEY) {
      throw new Error("PERPLEXITY_API_KEY is not configured");
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
              // {
              //   role: "system",
              //   content:
              //     "You are a research assistant. Provide a comprehensive, up-to-date summary of the topic with latest trends, statistics, and developments. Be factual and cite recent information.",
              // },
              {
                role: "user",
                content: `Analyze ALL of keyword: ${keyword}  features, functionality, and pricing as seen on their official page (only use official sources like their website, docs, and help center):

For general product info:
Analyze all of the key most popular and highlighted features and what the do
Analyze the product's ICP (company industries, sizes, employee roles)
Analyze the differentiator of [platform] compared to it's top 3 competitors ( you can use review sites and other sources only for this task)

For pricing:
Get the full pricing page content and help/FAQ/billing docs.
Do a detailed breakdown of all pricing tiers, including add-ons, usage-basis, extra charges, and hidden caveats/limitations.
List all advanced billable events, edge-case fees, and upsell triggers
Calculate example prices for multiple volume/usage levels if relevant.
Give a feature by feature for every plan
Extract all FAQs from their pricing page as bulletpoints.
List wether they offer any discounts, free plans, or free trials (only based on official information)
Use only Markdown for tables, bulletpoints, and clarity. Format everything in your answer. Don't give me any fiels.`,
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

UP-TO-DATE KEYWORD RESEARCH:
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
3. Provides unique insights and value beyond competitor content
4. Uses engaging headings and subheadings
5. Includes actionable takeaways
6. Is approximately 1500-2000 words
7. Has a compelling introduction and conclusion

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
