const { IamAuthenticator } = require('ibm-watson/auth');
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');

class WatsonService {
    constructor() {
        if (process.env.IBM_WATSON_API_KEY && process.env.IBM_WATSON_SERVICE_URL) {
            this.nlu = new NaturalLanguageUnderstandingV1({
                version: '2022-04-07',
                authenticator: new IamAuthenticator({
                    apikey: process.env.IBM_WATSON_API_KEY,
                }),
                serviceUrl: process.env.IBM_WATSON_SERVICE_URL,
            });
        } else {
            console.warn('IBM Watson credentials not found. Using mock behavior.');
        }
    }

    async generateStrategy(input) {
        if (!this.nlu) {
            return {
                strategy: `Strategic positioning for ${input.industry} targeting ${input.audience}. Focus on ${input.values}.`,
                keywords: ["innovation", "growth", "efficiency"]
            };
        }

        try {
            // Watson NLU isn't a generative model, so we'll use it to analyze the input keywords/values
            // to suggest related concepts which can inform strategy
            const analyzeParams = {
                text: `${input.industry} brand values: ${input.values}. Target audience: ${input.audience}.`,
                features: {
                    keywords: { limit: 5 },
                    categories: { limit: 3 }
                }
            };

            const analysis = await this.nlu.analyze(analyzeParams);

            const keywords = analysis.result.keywords.map(k => k.text);
            const categories = analysis.result.categories.map(c => c.label);

            return {
                strategy: ` leverage key market segments: ${categories.join(', ')}. Emphasize core strengths in ${keywords.join(', ')}.`,
                keywords: keywords
            };

        } catch (error) {
            console.error('Error generating strategy with Watson:', error);
            throw new Error('Failed to generate strategy');
        }
    }
}

module.exports = new WatsonService();
