const MURF_API_BASE = "https://api.murf.ai/v1/speech/generate";

function getAudioUrlFromResponse(payload) {
  return payload?.audioFile || payload?.audio_url || payload?.audioUrl || null;
}

function createRequestBody(text) {
  const voiceId = process.env.MURF_VOICE_ID || "en-US-natalie";

  return {
    text,
    voiceId,
  };
}

async function requestMurfAudio(text) {
  const apiKey = process.env.MURF_API_KEY;

  if (!apiKey) {
    throw new Error("MURF_API_KEY is missing in server environment.");
  }

  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("Text input is required to generate Murf speech.");
  }

  const response = await fetch(MURF_API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(createRequestBody(text.trim())),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown Murf error");
    throw new Error(`Murf request failed: ${errorText}`);
  }

  const payload = await response.json().catch(() => ({}));
  const audioUrl = getAudioUrlFromResponse(payload);

  if (!audioUrl) {
    throw new Error("Murf response did not include an audio URL.");
  }

  return { audioUrl, payload };
}

export async function generateSpeechAudioUrl(text) {
  try {
    const { audioUrl } = await requestMurfAudio(text);
    return audioUrl;
  } catch (error) {
    throw new Error(
      error?.message || "Failed to generate speech URL from Murf.",
    );
  }
}

export async function generateSpeechAudioBuffer(text) {
  try {
    const { audioUrl } = await requestMurfAudio(text);
    const audioResponse = await fetch(audioUrl);

    if (!audioResponse.ok) {
      const errorText = await audioResponse
        .text()
        .catch(() => "Unknown audio fetch error");
      throw new Error(`Failed to fetch Murf audio file: ${errorText}`);
    }

    const arrayBuffer = await audioResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    throw new Error(
      error?.message || "Failed to generate speech buffer from Murf.",
    );
  }
}
