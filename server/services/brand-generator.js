const watson = require('./ibm-watson');
const gemini = require('./gemini');
const huggingface = require('./huggingface');
const stableDiffusion = require('./stable-diffusion');
const db = require('../database');

class BrandGenerator {
    async generate(input) {
        console.log('Starting brand generation for input:', input);

        try {
            // Execute services in parallel where possible
            const [strategy, creative, toneAnalysis, visuals] = await Promise.all([
                watson.generateStrategy(input),
                gemini.generateCreativeCopy(input),
                huggingface.analyzeTone(input),
                stableDiffusion.generateBrandVisuals(input),
            ]);

            const result = {
                names: creative.names || [`${input.industry}X`, `Neo${input.industry}`, 'BrandArc'],
                taglines: creative.taglines || [creative.tagline, "Innovating the future.", `Your ${input.industry} partner.`],
                description: creative.description || "A revolutionary brand.",
                colors: creative.colors ? creative.colors.map((c, i) => ({ hex: c, name: `Brand Color ${i + 1}` })) : [
                    { hex: "#00FF88", name: "Electric Mint" },
                    { hex: "#0EA5E9", name: "Sky Circuit" },
                    { hex: "#1A1F3A", name: "Deep Space" }
                ],
                voiceTraits: [input.tone, toneAnalysis.sentiment, "Forward-thinking"],
                socialPost: creative.socialPost || `Excited to launch our new ${input.industry} brand!`,
                bio: creative.bio || `Building the future of ${input.industry}.`,
                strategy: strategy.strategy,
                keywords: strategy.keywords,
                logoUrl: visuals.logoUrl,
                moodboardUrl: visuals.moodboardUrl
            };

            // Persist to database
            const stmt = db.prepare('INSERT INTO projects (input, result) VALUES (?, ?)');
            const info = stmt.run(JSON.stringify(input), JSON.stringify(result));

            console.log('Brand generation completed and saved with ID:', info.lastInsertRowid);
            return { id: info.lastInsertRowid, ...result };

        } catch (error) {
            console.error('Brand generation failed:', error);
            throw error;
        }
    }
}

module.exports = new BrandGenerator();
