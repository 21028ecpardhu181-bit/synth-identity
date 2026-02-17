const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load .env explicitly for local testing of this service file
require('dotenv').config({ path: path.join(__dirname, '../.env') });

class StableDiffusionService {
    constructor() {
        this.apiKey = process.env.STABLE_DIFFUSION_API_KEY;
        this.engineId = 'stable-diffusion-xl-1024-v1-0';
        this.apiHost = 'https://api.stability.ai';
    }

    async generateBrandVisuals(input) {
        if (!this.apiKey) {
            console.warn('Stable Diffusion API key missing. Using Pollinations.ai fallback.');
            const logoPrompt = `Minimalist Logo for ${input.industry}, ${input.values}, simple, vector style, white background`;
            const moodPrompt = `Mood board for ${input.industry}, ${input.tone}`;
            return {
                logoUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(logoPrompt)}?width=1024&height=1024&nologo=true`,
                moodboardUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(moodPrompt)}?width=1024&height=1024&nologo=true`
            };
        }

        try {
            const responses = await Promise.all([
                this.generateImage(`Minimalist Logo for ${input.industry}, ${input.values}, simple, vector style, white background`),
                this.generateImage(`Mood board for ${input.industry} brand, ${input.tone}, ${input.colors ? input.colors.join(', ') : ''}, continuous pattern`)
            ]);

            return {
                logoUrl: responses[0],
                moodboardUrl: responses[1]
            };

        } catch (error) {
            console.error('Error with Stability AI, falling back to Pollinations:', error.message);
            const logoPrompt = `Minimalist Logo for ${input.industry}, ${input.values}`;
            const moodPrompt = `Mood board for ${input.industry}`;
            return {
                logoUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(logoPrompt)}?width=1024&height=1024&nologo=true`,
                moodboardUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(moodPrompt)}?width=1024&height=1024&nologo=true`
            };
        }
    }

    async generateImage(prompt) {
        const response = await axios.post(
            `${this.apiHost}/v1/generation/${this.engineId}/text-to-image`,
            {
                text_prompts: [{ text: prompt }],
                cfg_scale: 7,
                height: 1024,
                width: 1024,
                samples: 1,
                steps: 30,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
            }
        );

        if (response.status !== 200) {
            throw new Error(`Non-200 response: ${response.statusText}`);
        }

        // Stability AI returns base64 images
        const base64Image = response.data.artifacts[0].base64;
        return `data:image/png;base64,${base64Image}`;
    }
}

module.exports = new StableDiffusionService();
