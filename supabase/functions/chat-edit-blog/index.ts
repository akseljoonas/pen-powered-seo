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
    const { message, blogContent, blogTitle, keywords, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build conversation with full context
    const keywordsText = keywords && keywords.length > 0 ? keywords.join(", ") : "none specified";
    
    const messages = [
      {
        role: "system",
        content: `You are an expert blog editor and SEO specialist. Help the user edit and improve their blog content.

Current Blog Context:
- Title: ${blogTitle || "Untitled"}
- Target Keywords: ${keywordsText}
- Content: ${blogContent || "No content yet"}

Your role:
- Provide specific, actionable suggestions for improvements
- Help with SEO optimization and keyword integration
- Improve readability, structure, and engagement
- Suggest better headlines, transitions, and conclusions
- When suggesting edits, show the improved version using markdown code blocks
- Be concise but helpful

Remember: The blog is written in Markdown format. When suggesting text changes, provide the complete improved section.`
      },
      ...conversationHistory,
      {
        role: "user",
        content: message
      }
    ];

    console.log("Processing blog edit request...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in chat-edit-blog function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
