import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

function pcmToWav(
  pcmBuffer: Buffer,
  sampleRate: number = 24000,
  numChannels: number = 1,
  bitsPerSample: number = 16
): Buffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

export async function POST(req: NextRequest) {
  try {
    const { text, voice = "Aoede" } = await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "TTS key not configured" }, { status: 503 });
    }

    const cleanText = text.slice(0, 800).trim();

    const ttsModels = [
      "gemini-3.1-flash-tts-preview",
      "gemini-3.8-flash-tts",
    ];

    for (const model of ttsModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: cleanText }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voice,
                  },
                },
              },
            },
          }),
        });

        if (!res.ok) {
          console.warn(`[Neural TTS] Model ${model} returned ${res.status}`);
          continue;
        }

        const data = await res.json();
        const base64Audio = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (base64Audio) {
          const pcm = Buffer.from(base64Audio, "base64");
          const wav = pcmToWav(pcm, 24000);

          return new NextResponse(new Uint8Array(wav), {
            status: 200,
            headers: {
              "Content-Type": "audio/wav",
              "Content-Length": wav.length.toString(),
              "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
            },
          });
        }
      } catch (err) {
        console.warn(`[Neural TTS] Error with model ${model}:`, err);
      }
    }

    return NextResponse.json({ error: "Neural TTS synthesis unavailable" }, { status: 502 });
  } catch (err) {
    console.error("[Neural TTS] General error:", err);
    return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 });
  }
}
