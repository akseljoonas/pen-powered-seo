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
    const { keywords, competitorUrls, toneSampleUrls } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!PERPLEXITY_API_KEY) {
      throw new Error("PERPLEXITY_API_KEY is not configured");
    }

    // Step 1: Fetch tone of voice blogs
    console.log("Fetching tone of voice blogs...");
    const toneSampleContents: string[] = [];
    
    if (toneSampleUrls && toneSampleUrls.length > 0) {
      for (const url of toneSampleUrls) {
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
                  content: `Extract the complete blog content from this URL: ${url}. Return only the blog text content, including the title, body paragraphs, and any key sections. Format it clearly.`,
                },
              ],
              max_tokens: 10000,
            }),
          });

          if (perplexityResponse.ok) {
            const data = await perplexityResponse.json();
            toneSampleContents.push(data.choices[0].message.content);
            console.log(`Fetched tone sample from: ${url}`);
          } else {
            console.error(`Failed to fetch tone sample from ${url}:`, perplexityResponse.status);
          }
        } catch (error) {
          console.error(`Error fetching tone sample from ${url}:`, error);
        }
      }
    }

    // Step 2: Fetch competitor blog contents
    console.log("Fetching competitor blogs...");
    const competitorContents: string[] = [];
    
    if (competitorUrls && competitorUrls.length > 0) {
      for (const url of competitorUrls) {
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
                  content: `Extract the complete blog content from this URL: ${url}. Return only the blog text content, including the title, body paragraphs, and key sections. Format it clearly.`,
                },
              ],
              max_tokens: 10000,
            }),
          });

          if (perplexityResponse.ok) {
            const data = await perplexityResponse.json();
            competitorContents.push(data.choices[0].message.content);
            console.log(`Fetched competitor blog from: ${url}`);
          } else {
            console.error(`Failed to fetch competitor blog from ${url}:`, perplexityResponse.status);
          }
        } catch (error) {
          console.error(`Error fetching competitor blog from ${url}:`, error);
        }
      }
    }

    // Step 3: Research keywords with Perplexity to get up-to-date information
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
                content: `Analyze ALL of keyword: ${keyword} features, functionality, and pricing as seen on their official page (only use official sources like their website, docs, and help center):

For general product info:
Analyze all of the key most popular and highlighted features and what they do
Analyze the product's ICP (company industries, sizes, employee roles)
Analyze the differentiator of [platform] compared to its top 3 competitors (you can use review sites and other sources only for this task)

For pricing:
Get the full pricing page content and help/FAQ/billing docs.
Do a detailed breakdown of all pricing tiers, including add-ons, usage-basis, extra charges, and hidden caveats/limitations.
List all advanced billable events, edge-case fees, and upsell triggers
Calculate example prices for multiple volume/usage levels if relevant.
Give a feature by feature for every plan
Extract all FAQs from their pricing page as bulletpoints.
List whether they offer any discounts, free plans, or free trials (only based on official information)
Use only Markdown for tables, bulletpoints, and clarity. Format everything in your answer. Don't give me any files.`,
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

    // Step 4: Build the prompt for blog generation using the user's exact structure
    let prompt = `I want to write a well researched, simple to read SEO blog based on my tone of voice that you get from my existing blogs, relevant information that you find from my competitors' ranking blogs, and some extra research information that I provide you with.

I'm going to provide you with ${toneSampleContents.length} blog${toneSampleContents.length !== 1 ? 's' : ''} that I've written for our SEO so you can grasp my style.
${toneSampleContents.map((content, idx) => `\n=== BLOG ${idx + 1} (Tone of Voice Example) ===\n${content}\n`).join("\n")}

Now I'm going to provide you with some top-ranking competitors' blogs for my target keyword${keywords.length > 1 ? 's' : ''} [${keywords.join(", ")}].
${competitorContents.length > 0 ? competitorContents.map((content, idx) => `\n=== COMPETITOR BLOG ${idx + 1} ===\n${content}\n`).join("\n") : "No competitor blogs provided."}
${competitorContents.length === 0 ? "Since no competitor blogs were provided, rely solely on my tone of voice and the provided extra information in the next step." : ""}

Now I'm going to give you the most up-to-date relevant information about this topic:

=== RESEARCH FINDINGS ===
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

If there's any contradictory information between the top-ranking competitor blogs and my research findings above, prioritize the information in the research findings because this is the most up-to-date. But overall try to use both sources and make the most comprehensive byproduct.

Based on this information, write an SEO blog in a similar style to the ones I've written previously.

Requirements:
- Naturally incorporate the target keywords: ${keywords.join(", ")}
- Use engaging headings and subheadings (H2, H3, etc.)
- Include actionable takeaways
- Approximately 1500-2000 words
- Use simple, readable language that matches my tone of voice
- Format the content in GitHub Flavoured Markdown

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
