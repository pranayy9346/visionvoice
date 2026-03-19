const MURF_API_BASE = "https://api.murf.ai/v1/speech/generate";

function extractAudioUrl(payload) {
  return payload?.audioFile || payload?.audio_url || payload?.audioUrl || null;
}

export async function generateSpeechAudioUrl(text, voiceId) {
  const apiKey = process.env.MURF_API_KEY;

  if (!apiKey) {
    throw new Error("MURF_API_KEY is missing in server environment.");
  }

  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("Text input is required to generate Murf speech.");
  }

  const resolvedVoiceId =
    typeof voiceId === "string" && voiceId.trim()
      ? voiceId.trim()
      : process.env.MURF_VOICE_ID || "en-US-natalie";

  const response = await fetch(MURF_API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      text: text.trim(),
      voiceId: resolvedVoiceId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown Murf error");
    throw new Error(`Murf request failed: ${errorText}`);
  }

  const payload = await response.json().catch(() => ({}));
  const audioUrl = extractAudioUrl(payload);

  if (!audioUrl) {
    throw new Error("Murf response did not include an audio URL.");
  }

  return audioUrl;
}

export async function generateSpeechAudioBuffer(text, voiceId) {
  const audioUrl = await generateSpeechAudioUrl(text, voiceId);
  const audioResponse = await fetch(audioUrl);

  if (!audioResponse.ok) {
    const errorText = await audioResponse
      .text()
      .catch(() => "Unknown audio fetch error");
    throw new Error(`Failed to fetch Murf audio file: ${errorText}`);
  }

  const arrayBuffer = await audioResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
