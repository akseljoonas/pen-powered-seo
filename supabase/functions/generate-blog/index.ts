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

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the prompt for blog generation
    let prompt = `You are an expert SEO content writer. Generate a high-quality, SEO-optimized blog post with the following requirements:

Target Keywords: ${keywords.join(", ")}

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
1. Naturally incorporates the target keywords
2. Provides unique insights and value
3. Uses engaging headings and subheadings
4. Includes actionable takeaways
5. Is approximately 1500-2000 words
6. Has a compelling introduction and conclusion

Return ONLY a JSON object with this structure:
{
  "title": "The blog title (incorporate primary keyword)",
  "content": "The full blog content in markdown format"
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

    // Parse the JSON response
    let result;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                       generatedText.match(/```\n([\s\S]*?)\n```/);
      
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        result = JSON.parse(generatedText);
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // If parsing fails, create a structured response from the generated text
      const lines = generatedText.split("\n");
      result = {
        title: keywords[0] ? `How to Master ${keywords[0]}` : "Your SEO-Optimized Blog",
        content: generatedText,
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-blog function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
