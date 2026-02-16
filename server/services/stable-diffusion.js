const axios = require('axios');
const fs = require('fs');
const path = require('path');

class StableDiffusionService {
    constructor() {
        this.apiKey = process.env.STABLE_DIFFUSION_API_KEY;
        this.engineId = 'stable-diffusion-v1-6';
        this.apiHost = 'https://api.stability.ai';
    }

    async generateBrandVisuals(input) {
        if (!this.apiKey) {
            console.warn('Stable Diffusion API key missing.');
            return {
                logoUrl: "https://placehold.co/400x400/1A1F3A/00FF88?text=Future+Brand",
                moodboard: "https://placehold.co/800x400/0F172A/0EA5E9?text=Brand+Mood"
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
            console.error('Error generating visuals with Stable Diffusion:', error.response ? error.response.data : error.message);
            return {
                logoUrl: "https://placehold.co/400x400/1A1F3A/00FF88?text=Gen+Failed",
                moodboard: "https://placehold.co/800x400/0F172A/0EA5E9?text=Gen+Failed"
            };
        }
    }

    async generateImage(prompt) {
        const response = await axios.post(
            `${this.apiHost}/v1/generation/${this.engineId}/text-to-image`,
            {
                text_prompts: [{ text: prompt }],
                cfg_scale: 7,
                height: 512,
                width: 512,
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
