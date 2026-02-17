import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Copy, Loader2, Check } from 'lucide-react';

const ContentForge = () => {
    // State for Product Description
    const [productName, setProductName] = useState('');
    const [productDesc, setProductDesc] = useState('');
    const [productTone, setProductTone] = useState('Premium');
    const [generatedDesc, setGeneratedDesc] = useState<any>(null);
    const [loadingDesc, setLoadingDesc] = useState(false);

    // State for Social & Email
    const [platform, setPlatform] = useState('Instagram');
    const [topic, setTopic] = useState('');
    const [details, setDetails] = useState('');
    const [generatedSocial, setGeneratedSocial] = useState<any>(null);
    const [loadingSocial, setLoadingSocial] = useState(false);

    // Helper for API call
    const generate = async (type: 'description' | 'social-email') => {
        const isDesc = type === 'description';
        const setLoading = isDesc ? setLoadingDesc : setLoadingSocial;
        const setResult = isDesc ? setGeneratedDesc : setGeneratedSocial;

        setLoading(true);
        setResult(null);
        try {
            const payload = isDesc
                ? { type, productName, productDescription: productDesc, tone: productTone }
                : { type, platform, topic, details };

            const response = await fetch('http://localhost:8000/api/forge/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Generation failed');

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <section className="py-32 px-6 relative overflow-hidden bg-gradient-to-b from-background to-background/50">
            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground">Content Forge</h2>
                    <p className="text-muted-foreground text-lg">Generate product descriptions, social posts, and emails that stay on-brand.</p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Card 1: Product Descriptions */}
                    <div className="card-3d glass p-8 rounded-2xl border border-border/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Sparkles className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">Product Descriptions</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">Turn raw product details into consistent, customer-friendly copy.</p>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Product Name (e.g. DietBox)"
                                    className="bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Key Features"
                                    className="bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full"
                                    value={productDesc}
                                    onChange={(e) => setProductDesc(e.target.value)}
                                />
                            </div>

                            <select
                                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                value={productTone}
                                onChange={(e) => setProductTone(e.target.value)}
                            >
                                <option>Premium</option>
                                <option>Playful</option>
                                <option>Minimalist</option>
                                <option>Bold</option>
                            </select>

                            <button
                                onClick={() => generate('description')}
                                disabled={loadingDesc || !productName}
                                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loadingDesc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                Generate Descriptions
                            </button>

                            {generatedDesc && (
                                <div className="mt-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                    <div className="p-4 bg-background/50 rounded-xl border border-border/30 relative group">
                                        <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">Short Description</h4>
                                        <p className="text-sm text-gray-300">{generatedDesc.short || generatedDesc}</p>
                                        <button onClick={() => copyToClipboard(generatedDesc.short)} className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"><Copy className="w-3 h-3" /></button>
                                    </div>
                                    <div className="p-4 bg-background/50 rounded-xl border border-border/30 relative group">
                                        <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">Long Description</h4>
                                        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{generatedDesc.long || "N/A"}</p>
                                        <button onClick={() => copyToClipboard(generatedDesc.long)} className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"><Copy className="w-3 h-3" /></button>
                                    </div>
                                    <div className="p-4 bg-background/50 rounded-xl border border-border/30 relative group">
                                        <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">Key Benefits</h4>
                                        {Array.isArray(generatedDesc.bullets) ? (
                                            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                                                {generatedDesc.bullets.map((b: string, i: number) => (
                                                    <li key={i}>{b}</li>
                                                ))}
                                            </ul>
                                        ) : <p className="text-sm text-gray-300">N/A</p>}
                                        <button onClick={() => copyToClipboard(generatedDesc.bullets?.join('\n'))} className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"><Copy className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card 2: Social & Email */}
                    <div className="card-3d glass p-8 rounded-2xl border border-border/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold">Social & Email</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">Spin up campaigns across channels with a single brief.</p>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <select
                                    className="w-1/3 bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value)}
                                >
                                    <option>Instagram</option>
                                    <option>LinkedIn</option>
                                    <option>Twitter</option>
                                    <option>Email</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Topic (e.g. New Launch)"
                                    className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                            </div>

                            <input
                                type="text"
                                placeholder="Additional Details (e.g. 20% off code)"
                                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                            />

                            <button
                                onClick={() => generate('social-email')}
                                disabled={loadingSocial || !topic}
                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loadingSocial ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                Generate Posts + Email
                            </button>

                            {generatedSocial && (
                                <div className="mt-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                    <div className="p-4 bg-background/50 rounded-xl border border-border/30 relative group">
                                        <h4 className="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider">{platform} Post</h4>
                                        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{generatedSocial.post || generatedSocial}</p>
                                        <button onClick={() => copyToClipboard(generatedSocial.post)} className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"><Copy className="w-3 h-3" /></button>
                                    </div>
                                    <div className="p-4 bg-background/50 rounded-xl border border-border/30 relative group">
                                        <h4 className="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider">Email Content</h4>
                                        <div className="mb-2 p-2 bg-black/20 rounded border border-white/5">
                                            <span className="text-xs text-muted-foreground mr-2">Subject:</span>
                                            <span className="text-sm font-medium">{generatedSocial.email_subject || "N/A"}</span>
                                        </div>
                                        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{generatedSocial.email_body || "N/A"}</p>
                                        <button onClick={() => copyToClipboard(`${generatedSocial.email_subject}\n\n${generatedSocial.email_body}`)} className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"><Copy className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ContentForge;
