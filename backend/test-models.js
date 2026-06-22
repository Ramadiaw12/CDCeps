import { GoogleGenerativeAI } from "@google/generative-ai";

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
);
const data = await res.json();

console.log("Modèles disponibles pour generateContent :");
data.models
  ?.filter(m => m.supportedGenerationMethods?.includes("generateContent"))
  .forEach(m => console.log(" -", m.name));
