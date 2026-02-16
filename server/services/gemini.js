const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        if (this.apiKey) {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        } else {
            console.warn('Gemini API key not found. Using mock behavior.');
        }
    }

    async generateCreativeCopy(input) {
        if (!this.model) {
            return {
                tagline: "Empowering Your Future",
                description: `We are a leading ${input.industry} company dedicated to ${input.audience}. Our values: ${input.values}.`,
                socialPost: `Check out our new ${input.industry} solution! #${input.keywords}`
            };
        }

        try {
            const prompt = `Create a brand identity for a ${input.industry} company targeting ${input.audience}.
      Brand values: ${input.values}.
      Tone: ${input.tone}.
      Keywords: ${input.keywords}.
      
      Generate a JSON object with:
      - tagline: A catchy 3-5 word slogan.
      - description: A 2-sentence brand description.
      - socialPost: A short social media announcement with hashtags.
      - bio: A short bio for social profiles.
      - names: An array of 5 creative brand name ideas.
      - colors: An array of 3 hex color codes.`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // Attempt to extract JSON from markdown block if present
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                text = jsonMatch[1];
            }

            return JSON.parse(text);
        } catch (error) {
            console.error('Error generating creative copy with Gemini:', error);
            throw new Error('Failed to generate creative copy');
        }
    }
}

module.exports = new GeminiService();
