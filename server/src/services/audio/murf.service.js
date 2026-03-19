const MURF_API_BASE = "https://api.murf.ai/v1/speech/generate";
const DEFAULT_MURF_STYLE = "Conversational";

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

  const requestedStyle =
    typeof process.env.MURF_STYLE === "string" && process.env.MURF_STYLE.trim()
      ? process.env.MURF_STYLE.trim()
      : DEFAULT_MURF_STYLE;

  const buildPayload = (style) => {
    const payload = {
      text: text.trim(),
      voiceId: resolvedVoiceId,
    };

    if (style && typeof style === "string") {
      payload.style = style;
    }

    return payload;
  };

  const runRequest = async (payload) => {
    const response = await fetch(MURF_API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    return response;
  };

  let response = await runRequest(buildPayload(requestedStyle));

  if (!response.ok) {
    const firstErrorText = await response
      .text()
      .catch(() => "Unknown Murf error");

    // Retry without style if conversational style is not accepted for this voice/account.
    response = await runRequest(buildPayload(null));
    if (!response.ok) {
      const secondErrorText = await response
        .text()
        .catch(() => firstErrorText || "Unknown Murf error");
      throw new Error(`Murf request failed: ${secondErrorText}`);
    }
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
