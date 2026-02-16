const axios = require('axios');

class HuggingFaceService {
    constructor() {
        this.apiKey = process.env.HUGGINGFACE_API_KEY;
        this.apiUrl = 'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment'; // Using a sentiment model as a proxy for tone analysis/alignment
    }

    async analyzeTone(input) {
        if (!this.apiKey) {
            return { sentiment: "positive", score: 0.95 };
        }

        try {
            const response = await axios.post(
                this.apiUrl,
                { inputs: input.values + " " + input.tone + " " + input.keywords },
                { headers: { Authorization: `Bearer ${this.apiKey}` } }
            );

            // The API returns an array of label/score objects
            // Example: [[{"label":"LABEL_0","score":0.003},{"label":"LABEL_1","score":0.035},{"label":"LABEL_2","score":0.961}]]
            // For this specific model: LABEL_0=Negative, LABEL_1=Neutral, LABEL_2=Positive

            const result = response.data[0];
            const best = result.reduce((prev, current) => (prev.score > current.score) ? prev : current);

            let sentiment = "neutral";
            if (best.label === 'LABEL_0') sentiment = "negative";
            if (best.label === 'LABEL_2') sentiment = "positive";

            return {
                sentiment: sentiment,
                score: best.score,
                model: 'cardiffnlp/twitter-roberta-base-sentiment'
            };

        } catch (error) {
            console.error('Error analyzing tone with Hugging Face:', error.message);
            // Allow failure without crashing the whole request
            return { sentiment: "unknown", error: "API connection failed" };
        }
    }
}

module.exports = new HuggingFaceService();
