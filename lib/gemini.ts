import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateMusicalThesis(userADNA: any, userBDNA: any) {
  const prompt = `
    You are the "AI Maestro" for Music DNA Match, a high-dimensional music discovery platform.
    Analyze the compatibility between two users based on their 12D Musical DNA vectors.

    User A DNA: ${JSON.stringify(userADNA.vectors)}
    User B DNA: ${JSON.stringify(userBDNA.vectors)}
    
    The 12D vector represents:
    - Spectral Centroid (Brightness/Sharpness)
    - Transient Density (Attack/Percussiveness)
    - Harmonicity (Purity/Grit)
    - Dynamic Range (Compression/Expressiveness)
    - Polyrhythmic Complexity
    - Intervalic Tension
    - Pulse Saliency
    - Timbral Warmth
    - Spatial Density (Ambience)
    - Abstraction Level

    TASK:
    Write a short "Musical Thesis" (max 3 sentences) that explains their mathematical and aesthetic connection.
    Use sophisticated musical terminology (e.g., "spectral brightness", "polyrhythmic stability", "timbral weight").
    Focus on WHY they match, avoiding generic phrases.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Significant structural alignment detected across the vector space, suggesting a deep aesthetic frequency overlap.";
  }
}
