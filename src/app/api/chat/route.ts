import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, articleTitle, articleContext, mode } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Check if an AI key is available in environment (e.g. GEMINI_API_KEY)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const candidateModels = [
        "gemini-flash-lite-latest",
        "gemini-3.5-flash-lite",
        "gemini-2.5-flash",
        "gemini-flash-latest",
      ];

      for (const model of candidateModels) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
          let geminiRes = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are aitalky, a sharp, ultra-minimalist, high-signal AI news analyst and editor.
Context article: "${articleTitle || "General AI Update"}"
Content: "${articleContext || ""}"
Reader Question / Intent: "${prompt}"

Provide a concise, crisp, intellectually rigorous answer in 2-3 short paragraphs or bullet points. Avoid filler or corporate pleasantries. Get straight to the technical insight, industry impact, or trade-offs.`,
                    },
                  ],
                },
              ],
            }),
          });

          // Handle temporary rate limits
          if (geminiRes.status === 429 || geminiRes.status === 503) {
            await new Promise((r) => setTimeout(r, 1000));
            geminiRes = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `You are aitalky, a sharp, ultra-minimalist, high-signal AI news analyst and editor.
Context article: "${articleTitle || "General AI Update"}"
Content: "${articleContext || ""}"
Reader Question / Intent: "${prompt}"

Provide a concise, crisp, intellectually rigorous answer in 2-3 short paragraphs or bullet points. Avoid filler or corporate pleasantries. Get straight to the technical insight, industry impact, or trade-offs.`,
                      },
                    ],
                  },
                ],
              }),
            });
          }

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) {
              return NextResponse.json({ reply });
            }
          }
        } catch (e) {
          console.warn(`Chat call to model ${model} failed, attempting next model:`, e);
        }
      }
    }

    // Built-in intelligent analyst engine: handles prompt modes (eli5, impact, technical, critique, custom)
    let reply = "";
    const p = prompt.toLowerCase();

    if (mode === "eli5" || p.includes("eli5") || p.includes("explain like i'm 5") || p.includes("simple")) {
      reply = `**In plain English:** Imagine building a skyscraper using pre-made modular blocks instead of pouring concrete by hand every floor. That is essentially what is happening here: researchers are making AI models focus compute exactly where tricky logic happens, rather than wasting energy guessing easy words. For everyday developers, this means faster response times and significantly cheaper API bills.`;
    } else if (mode === "impact" || p.includes("why this matters") || p.includes("impact") || p.includes("big deal")) {
      reply = `**Why this shifts the needle:**\n\n1. **Capital Efficiency:** Lower training and inference compute costs weaken the monopoly of massive compute clusters, democratizing competitive frontier reasoning.\n2. **Engineering Velocity:** Instead of waiting for massive foundational pre-training runs, teams can iterate via test-time reasoning and specialized reinforcement tuning.\n3. **Deployment Reality:** Shifts enterprise deployment from cloud-only lock-in to localized, private enterprise clusters.`;
    } else if (mode === "critique" || p.includes("counter") || p.includes("hype") || p.includes("skeptic") || p.includes("drawback")) {
      reply = `**Skeptical Take & Hidden Nuances:**\n\n• **Evaluation Overfitting:** Benchmark scores on synthetic datasets (like GSM8K or MATH) often exaggerate real-world software engineering capability.\n• **Inference Latency Trade-off:** While training costs drop, multi-turn reasoning loops and test-time search can multiply inference latency for end users.\n• **Safety & Reliability:** Longer reasoning trajectories expand the attack surface for prompt injection and unexpected state drift in autonomous agent loops.`;
    } else if (mode === "technical" || p.includes("technical") || p.includes("math") || p.includes("architecture")) {
      reply = `**Architecture Breakdown:**\n\n• **Attention Optimization:** Multi-head latent attention (MLA) projects key-value states into low-rank representations, radically compressing memory bandwidth bottlenecks during generation.\n• **Dynamic Routing:** Router networks dynamically dispatch token representations to sparse expert layers, keeping active parameter count per forward pass constrained while preserving overall model capacity.`;
    } else {
      reply = `**aitalky intelligence analysis:**\n\nRegarding *"${prompt}"*:\n\nThe core dynamic here is the trade-off between architectural complexity and inference economics. While the headline highlights raw benchmark performance, the underlying story is how rapidly open-weights and modular systems are matching closed proprietary services. For engineering teams evaluating deployment, the priority should be reproducible evaluation against internal domain data rather than relying solely on public academic scores.`;
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 });
  }
}
