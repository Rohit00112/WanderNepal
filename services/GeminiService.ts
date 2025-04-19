import { GoogleGenerativeAI } from '@google/generative-ai';

type GeminiResponse = {
  text: string;
  error?: string;
};

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  constructor() {
    // Initialize with your API key
    this.genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyCFuLhopeQtPDuf2JSSM2lfFGOuY1NGqtE');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash'});  
  }




  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateResponse(prompt: string): Promise<GeminiResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text) {
          throw new Error('Empty response received from Gemini API');
        }

        return { text };
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error.message);

        if (attempt < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY * attempt);
          continue;
        }
      }
    }

    const errorMessage = lastError?.message || 'Failed to generate response';
    console.error('Gemini service error:', errorMessage);
    return { text: 'I apologize, but I encountered an error. Please try again.', error: errorMessage };
  }

  private getContextPrompt(): string {
    return `You are a knowledgeable AI travel assistant specializing in Nepal tourism. 
    You have extensive knowledge about Nepal's culture, destinations, customs, and travel requirements. 
    Your responses should be helpful, accurate, and culturally sensitive. 
    When appropriate, include practical tips and local insights that would benefit travelers.`;
  }

  async getChatResponse(userMessage: string): Promise<string> {
    const contextPrompt = this.getContextPrompt();
    const fullPrompt = `${contextPrompt}\n\nUser: ${userMessage}\n\nAssistant:`;
    
    const response = await this.generateResponse(fullPrompt);
    return response.error ? response.text : response.text.trim();
  }
}

export const geminiService = new GeminiService();