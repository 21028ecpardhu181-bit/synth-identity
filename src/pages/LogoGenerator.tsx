import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Loader2, Image as ImageIcon } from "lucide-react";

const LogoGenerator = () => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    const generateLogo = async () => {
        if (!prompt) return;
        setLoading(true);
        try {
            // Reusing the same backend endpoint but we will construct a partial input 
            // object that triggers visual generation.
            // Ideally, we should have a dedicated endpoint, but for now we piggyback on existing.
            const response = await fetch('http://localhost:8000/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    industry: prompt, // Using prompt as industry to drive the generation
                    audience: "General",
                    values: "Modern, Creative",
                    keywords: prompt,
                    tone: "Professional"
                })
            });

            if (!response.ok) throw new Error("Failed to generate");

            const data = await response.json();
            setLogoUrl(data.logoUrl);

        } catch (error) {
            console.error("Logo generation failed:", error);
            alert("Failed to generate logo. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen px-6 py-12 flex flex-col items-center">
            <div className="w-full max-w-4xl mb-12 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back Home
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl text-center mb-12"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
                    <Sparkles className="w-4 h-4" />
                    AI Logo Creator
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    Design Your <span className="text-gradient-cyan">Logo</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                    Enter a prompt or your brand name, and our AI will generate a unique concept for you.
                </p>
            </motion.div>

            <div className="w-full max-w-xl glass rounded-2xl p-8 mb-12">
                <div className="flex gap-4">
                    <input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your logo idea (e.g. 'Minimalist tech startup logo with a fox icon')..."
                        className="flex-1 p-4 bg-muted rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                        onKeyDown={(e) => e.key === "Enter" && generateLogo()}
                    />
                    <button
                        onClick={generateLogo}
                        disabled={loading || !prompt}
                        className="px-6 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {logoUrl && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-2xl p-4 max-w-xl w-full"
                >
                    <div className="aspect-square w-full bg-black/20 rounded-xl overflow-hidden flex items-center justify-center relative group">
                        <img src={logoUrl} alt="Generated Logo" className="w-full h-full object-contain" />
                        <a
                            href={logoUrl}
                            download="logo.png"
                            className="absolute bottom-4 right-4 px-4 py-2 bg-black/70 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            Download
                        </a>
                    </div>
                </motion.div>
            )}

            {!logoUrl && !loading && (
                <div className="text-center opacity-30 mt-12">
                    <ImageIcon className="w-24 h-24 mx-auto mb-4" />
                    <p>Your logo will appear here</p>
                </div>
            )}

        </div>
    );
};

export default LogoGenerator;
