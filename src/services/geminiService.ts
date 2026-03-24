import { GoogleGenAI, Type, ThinkingLevel, Modality } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || "";

export const getAI = () => new GoogleGenAI({ apiKey: API_KEY });

// 1. AI Powered Chatbot (with Thinking Mode, Search, and Maps)
export const chatWithAI = async (message: string, options?: { useSearch?: boolean, useMaps?: boolean, useThinking?: boolean }) => {
  const ai = getAI();
  const config: any = {
    tools: [],
  };

  if (options?.useSearch) {
    config.tools.push({ googleSearch: {} });
  }
  if (options?.useMaps) {
    config.tools.push({ googleMaps: {} });
  }
  if (options?.useThinking) {
    config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
  }

  const model = options?.useMaps ? "gemini-2.5-flash" : (options?.useSearch ? "gemini-3-flash-preview" : "gemini-3.1-pro-preview");

  const response = await ai.models.generateContent({
    model,
    contents: message,
    config,
  });

  return {
    text: response.text,
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
  };
};

// 2. Fast AI Responses
export const fastAIResponse = async (message: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: message,
  });
  return response.text;
};

// 3. Medical Analysis (New)
export const medicalAnalysis = async (symptoms: string, history: any[]) => {
  const ai = getAI();
  const prompt = `As a medical assistant for Yemen Health Bridge, analyze the following symptoms and patient history. 
  Provide a preliminary analysis, potential patterns, and any epidemic alerts if relevant for the Yemen region.
  Symptoms: ${symptoms}
  History: ${JSON.stringify(history)}
  
  Format the response as JSON with fields: analysis, patterns, alerts, recommendations.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          patterns: { type: Type.STRING },
          alerts: { type: Type.STRING },
          recommendations: { type: Type.STRING },
        },
        required: ["analysis", "patterns", "alerts", "recommendations"],
      },
    },
  });

  return JSON.parse(response.text);
};

// 4. Analyze Images/Videos
export const analyzeMedia = async (prompt: string, mediaData: { data: string, mimeType: string }[]) => {
  const ai = getAI();
  const parts = [
    { text: prompt },
    ...mediaData.map(m => ({
      inlineData: {
        data: m.data,
        mimeType: m.mimeType
      }
    }))
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: { parts },
  });

  return response.text;
};

// 4. Image Generation (Pro Image with Aspect Ratios)
export const generateImagePro = async (prompt: string, aspectRatio: string = "1:1") => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio,
        imageSize: "1K"
      }
    }
  });

  const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return imagePart?.inlineData?.data;
};

// 5. Nano Banana 2 (Image Edit/Create)
export const nanoBananaEdit = async (prompt: string, baseImage?: { data: string, mimeType: string }) => {
  const ai = getAI();
  const parts: any[] = [{ text: prompt }];
  if (baseImage) {
    parts.push({
      inlineData: {
        data: baseImage.data,
        mimeType: baseImage.mimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: { parts },
  });

  const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return imagePart?.inlineData?.data;
};

// 6. Veo Video Generation (Prompt or Image-to-Video)
export const generateVideoVeo = async (prompt: string, options?: { image?: { data: string, mimeType: string }, aspectRatio?: '16:9' | '9:16' }) => {
  const ai = getAI();
  const config: any = {
    numberOfVideos: 1,
    resolution: '720p',
    aspectRatio: options?.aspectRatio || '16:9'
  };

  const payload: any = {
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config
  };

  if (options?.image) {
    payload.image = {
      imageBytes: options.image.data,
      mimeType: options.image.mimeType
    };
  }

  let operation = await ai.models.generateVideos(payload);

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  return operation.response?.generatedVideos?.[0]?.video?.uri;
};

// 7. Generate Speech (TTS)
export const generateSpeech = async (text: string, voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' = 'Kore') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

// 8. Epidemiological Trends Analysis
export const analyzeEpidemiology = async (data: any) => {
  const ai = getAI();
  const prompt = `
    Analyze the following anonymized patient data from Yemen to detect potential disease outbreaks, patterns, or epidemiological trends.
    
    DATA:
    ${JSON.stringify(data)}
    
    Provide a detailed report in JSON format with the following structure:
    {
      "summary": "A brief overview of the current epidemiological situation in Yemen.",
      "riskLevels": [
        { "disease": "Cholera", "risk": "Low/Medium/High", "reason": "..." },
        { "disease": "Malaria", "risk": "Low/Medium/High", "reason": "..." },
        { "disease": "Diphtheria", "risk": "Low/Medium/High", "reason": "..." }
      ],
      "outbreakAlerts": [
        { "region": "Taiz", "disease": "Cholera", "severity": "High", "description": "..." }
      ],
      "chartData": {
        "trend": [
          { "date": "2024-01", "cases": 10 },
          { "date": "2024-02", "cases": 15 }
        ],
        "distribution": [
          { "region": "Sanaa", "count": 50 },
          { "region": "Aden", "count": 30 }
        ]
      },
      "recommendations": ["...", "..."]
    }
    
    Ensure the response is strictly JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Epidemiology analysis error:", error);
    return null;
  }
};
