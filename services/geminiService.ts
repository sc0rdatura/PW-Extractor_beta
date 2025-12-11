import { GoogleGenAI } from "@google/genai";
import { PROMPT_PROJECT_EXTRACTION, PROMPT_CONTACT_INDEXING } from "../constants";
import { ProjectData, ContactDictionary } from "../types";

const getClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const runProjectExtraction = async (
  pdfText: string,
  targetList: string,
  issueDate: string
): Promise<ProjectData[]> => {
  const ai = getClient();
  
  // Using gemini-3-pro-preview for complex text tasks per guidelines
  const modelId = "gemini-3-pro-preview";

  const userPrompt = `
    Here is the Issue Date: ${issueDate}.
    Here is the Target List of interest:
    ${targetList}

    Here is the raw PDF Text content:
    ${pdfText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction: PROMPT_PROJECT_EXTRACTION,
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Parse JSON
    return JSON.parse(text) as ProjectData[];
  } catch (error) {
    console.error("Project Extraction Error:", error);
    throw error;
  }
};

export const runContactIndexing = async (
  pdfText: string,
  targetList: string
): Promise<ContactDictionary> => {
  const ai = getClient();
  // Using gemini-3-pro-preview for complex text tasks per guidelines
  const modelId = "gemini-3-pro-preview";

  const userPrompt = `
    Here is the Target List of projects to focus on:
    ${targetList}

    Here is the raw PDF Text content:
    ${pdfText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction: PROMPT_CONTACT_INDEXING,
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as ContactDictionary;
  } catch (error) {
    console.error("Contact Indexing Error:", error);
    throw error;
  }
};