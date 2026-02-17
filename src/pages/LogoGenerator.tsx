import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Loader2, Image as ImageIcon, RotateCcw } from "lucide-react";

const LogoGenerator = () => {
    const [prompt, setPrompt] = useState("");
    const [extraDetails, setExtraDetails] = useState("");
    const [loading, setLoading] = useState(false);
    const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt) return;
        setLoading(true);
        setGeneratedLogo(null);

        try {
            // Using the same endpoint but crafting the input to focus on visual generation
            const response = await fetch('http://localhost:3000/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    industry: prompt,
                    audience: "General",
                    values: extraDetails || "Professional, Modern, Minimalist", // Use extra details as values
                    keywords: prompt,
                    tone: "Professional"
                })
            });

            if (!response.ok) throw new Error("Generation failed");

            const data = await response.json();
            if (data.logoUrl) {
                setGeneratedLogo(data.logoUrl);
            } else {
                alert("No logo URL returned. Check backend keys.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to generate logo. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-background text-foreground">
            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
            </div>

            <div className="container max-w-5xl mx-auto px-6 py-12 flex flex-col items-center">
                {/* Header */}
                <div className="w-full flex justify-between items-center mb-16">
                    <Link to="/" className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <div className="p-2 rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="font-medium">Back to Home</span>
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-2xl mx-auto mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Powered Design Studio</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Craft Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Perfect Logo</span>
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Enter your brand name or concept, and our AI will generate professional, high-quality logo concepts in seconds.
                    </p>
                </motion.div>

                {/* Input Section */}
                <div className="w-full max-w-2xl bg-card/50 backdrop-blur-md border border-white/10 rounded-2xl p-2 shadow-2xl mb-12 relative z-10">
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="flex-1 flex flex-col gap-2 p-2">
                            <input
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Brand Name & Industry (e.g. 'EcoFlow - Sustainable Energy')"
                                className="w-full bg-transparent p-3 text-lg outline-none placeholder:text-muted-foreground/50 border-b border-white/5 focus:border-primary/50 transition-colors"
                            />
                            <input
                                value={extraDetails}
                                onChange={(e) => setExtraDetails(e.target.value)}
                                placeholder="Style preferences (e.g. Minimalist, geometric, blue colors)..."
                                className="w-full bg-transparent p-3 text-sm outline-none placeholder:text-muted-foreground/50"
                            />
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !prompt}
                            className="md:w-32 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 shadow-lg shadow-primary/25"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            <span>{loading ? "Creating..." : "Generate"}</span>
                        </button>
                    </div>
                </div>

                {/* Result Section */}
                <div className="w-full max-w-4xl min-h-[400px] flex items-center justify-center">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4 text-muted-foreground animate-pulse">
                            <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <p>Designing your logo concept...</p>
                        </div>
                    ) : generatedLogo ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-3xl p-8 shadow-2xl border border-white/20 max-w-lg w-full relative group"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500 rounded-t-3xl" />

                            <div className="aspect-square w-full flex items-center justify-center mb-6 bg-gray-50 rounded-xl border border-gray-100 p-8">
                                <img src={generatedLogo} alt="Generated Logo" className="w-full h-full object-contain" />
                            </div>

                            <div className="flex gap-4">
                                <a
                                    href={generatedLogo}
                                    download="logo-concept.png"
                                    className="flex-1 bg-black text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
                                >
                                    <ImageIcon className="w-4 h-4" /> Download PNG
                                </a>
                                <button
                                    onClick={handleGenerate}
                                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium transition-colors"
                                    title="Regenerate"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="text-center text-muted-foreground opacity-30 flex flex-col items-center">
                            <div className="w-32 h-32 rounded-3xl border-2 border-dashed border-current mb-4 flex items-center justify-center">
                                <ImageIcon className="w-12 h-12" />
                            </div>
                            <p>Your creation will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LogoGenerator;
