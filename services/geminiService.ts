import { GoogleGenAI } from "@google/genai";
import { Lead } from "../types";

// NOTE: In a real environment, this key would come strictly from process.env.API_KEY
// For this demo, we assume the environment is set up correctly.
const API_KEY = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateLeadSummary = async (lead: Lead): Promise<string> => {
  if (!API_KEY) {
    // Fallback if no key is present for the demo UI
    return `Simulation: Provides a concise summary of the relationship with ${lead.name} at ${lead.company}. Enable API Key to generate real insights.`;
  }

  try {
    const prompt = `
      Summarize the current status and key activities for the following CRM lead.
      Provide a concise 3-sentence summary for a sales representative.
      
      Lead Name: ${lead.name}
      Company: ${lead.company}
      Status: ${lead.status}
      Source: ${lead.source}
      Last Contact: ${lead.lastContact}
      Activities: ${JSON.stringify(lead.activities)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate summary at this time.";
  }
};

export const generateEmailDraft = async (lead: Lead, tone: string): Promise<string> => {
  if (!API_KEY) {
    return `Subject: Following up\n\nHi ${lead.name},\n\nThis is a simulated AI draft based on your request for a ${tone} email.\n\nBest,\nOneSource Team`;
  }

  try {
    const prompt = `
      Draft a ${tone} sales email to ${lead.name} from ${lead.company}.
      The current lead status is ${lead.status}.
      Reference the last activity if applicable: ${lead.activities.length > 0 ? lead.activities[0].content : 'New inquiry'}.
      Keep it professional and under 150 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Draft generation failed.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate draft.";
  }
};