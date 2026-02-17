import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, Check, Copy, RotateCcw, Download, Loader2 } from "lucide-react";

type BrandInput = {
  industry: string;
  audience: string;
  values: string;
  keywords: string;
  tone: string;
};

type BrandResult = {
  names: string[];
  taglines: string[];
  description: string;
  colors: { hex: string; name: string }[];
  voiceTraits: string[];
  socialPost: string;
  bio: string;
  strategy?: string;
  keywords?: string[];
  logoUrl?: string;
  moodboardUrl?: string;
  sentiment?: string;
  confidence?: number;
  brandStory?: string;
};

const tones = ["Professional", "Playful", "Bold", "Minimalist", "Friendly", "Luxurious"];

const STEPS = ["Industry", "Audience", "Values", "Tone", "Generate"];

const GeneratorPage = () => {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<BrandInput>({ industry: "", audience: "", values: "", keywords: "", tone: "Professional" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BrandResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const canProceed = () => {
    if (step === 0) return input.industry.trim().length > 0;
    if (step === 1) return input.audience.trim().length > 0;
    if (step === 2) return input.values.trim().length > 0;
    return true;
  };

  const generate = async () => {
    setLoading(true);
    try {
      // Connect to the backend
      const response = await fetch('http://localhost:8000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        throw new Error('Failed to generate brand');
      }

      const backendResult: BrandResult = await response.json();
      setResult(backendResult);

      // Save to localStorage (optional backup)
      const saved = JSON.parse(localStorage.getItem("brandforge_projects") || "[]");
      saved.push({ input, result: backendResult, createdAt: new Date().toISOString() });
      localStorage.setItem("brandforge_projects", JSON.stringify(saved));

    } catch (error) {
      console.error("Generation error:", error);
      // Fallback or alert user
      alert("Failed to connect to the backend. Ensure the server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  if (result) {
    return (
      <div className="min-h-screen px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <button
              onClick={() => { setResult(null); setStep(0); }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Start Over
            </button>
          </div>

          <motion.h1
            className="text-3xl md:text-5xl font-bold mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Your Brand is <span className="text-gradient-neon">Ready</span>
          </motion.h1>

          <div className="space-y-8 max-w-6xl mx-auto">

            {/* 1. Brand Identity Header Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Brand Names (Enhanced) */}
              <ResultCard title="Brand Names" delay={0.1}>
                <div className="grid grid-cols-2 gap-3 h-full content-start max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {result.names.map((n, i) => (
                    <button
                      key={n}
                      onClick={() => copyText(n, n)}
                      className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/10 hover:from-primary/20 hover:to-purple-500/20 border border-white/10 hover:border-primary/50 text-foreground p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex flex-col items-center justify-center min-h-[100px]"
                    >
                      <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 group-hover:text-primary transition-colors mb-1">{n}</span>
                      {copied === n ? <Check className="w-4 h-4 text-green-400 absolute top-2 right-2" /> : <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 absolute top-2 right-2 transition-opacity" />}
                    </button>
                  ))}
                </div>
              </ResultCard>

              {/* Color Palette (Enhanced) */}
              <ResultCard title="Color Palette" delay={0.2}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 h-full">
                  {result.colors.map((c, i) => (
                    <button
                      key={c.hex + i}
                      onClick={() => copyText(c.hex, c.hex)}
                      className="group relative flex flex-col rounded-xl overflow-hidden border border-white/10 transition-all hover:scale-105 shadow-sm"
                    >
                      <div
                        className="flex-1 min-h-[80px] w-full"
                        style={{ background: c.hex }}
                      />
                      <div className="bg-card/50 p-2 text-center backdrop-blur-sm">
                        <p className="text-xs font-semibold truncate">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono uppercase opacity-70 group-hover:opacity-100">{c.hex}</p>
                      </div>
                      {copied === c.hex && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Check className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </ResultCard>
            </div>

            {/* 2. Strategy & Messaging Grid */}
            <div className="grid lg:grid-cols-3 gap-6">

              {/* Taglines */}
              <div className="lg:col-span-1">
                <ResultCard title="Taglines" delay={0.3}>
                  <div className="space-y-3">
                    {result.taglines.map((t, i) => (
                      <div
                        key={i}
                        onClick={() => copyText(t, `tag-${i}`)}
                        className="bg-secondary/20 hover:bg-secondary/40 border-l-4 border-primary p-4 rounded-r-xl cursor-pointer transition-colors relative group"
                      >
                        <p className="italic text-lg text-foreground/90 font-serif leading-snug">"{t}"</p>
                        <span className="text-[10px] text-muted-foreground mt-2 block opacity-0 group-hover:opacity-100 transition-opacity">Click to copy</span>
                        {copied === `tag-${i}` && <Check className="w-4 h-4 text-primary absolute top-2 right-2" />}
                      </div>
                    ))}
                  </div>
                </ResultCard>
              </div>

              {/* Social Post Mockup */}
              <div className="lg:col-span-2">
                <ResultCard title="Social Media Content" delay={0.4}>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Mockup */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm max-w-sm mx-auto w-full">
                      <div className="flex items-center gap-3 p-3 border-b border-border/50 bg-muted/20">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500" />
                        <div>
                          <div className="font-bold text-xs">Your Brand</div>
                          <div className="text-[10px] text-muted-foreground">Sponsored • Just now</div>
                        </div>
                      </div>
                      <div className="p-4 bg-background text-sm leading-relaxed whitespace-pre-wrap font-sans min-h-[120px]">
                        {result.socialPost}
                      </div>
                      <div className="px-4 py-2 bg-muted/30 border-t border-border/50 flex justify-between text-muted-foreground text-xs">
                        <span>2.4k Likes</span>
                        <span>42 Comments</span>
                      </div>
                      <button
                        onClick={() => copyText(result.socialPost, "social")}
                        className="w-full py-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium flex items-center justify-center gap-2"
                      >
                        {copied === "social" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy Caption
                      </button>
                    </div>

                    {/* Bio & Voice */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Brand Bio</h4>
                        <div className="p-3 bg-secondary/20 rounded-lg text-sm leading-relaxed border border-secondary/30 relative group cursor-pointer" onClick={() => copyText(result.bio, "bio")}>
                          {result.bio}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                            {copied === "bio" ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Voice Tone</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.voiceTraits.map((v) => (
                            <span key={v} className="px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-md text-xs font-medium text-primary uppercase tracking-wider">{v}</span>
                          ))}
                        </div>
                      </div>
                      {result.sentiment && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">AI Sentiment Analysis</h4>
                          <div className="flex items-center gap-3 p-2 border border-border rounded-lg bg-card/50">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-medium">{result.sentiment}</span>
                            {result.confidence && <span className="text-xs text-muted-foreground ml-auto">{(result.confidence * 100).toFixed(0)}% Match</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </ResultCard>
              </div>
            </div>



            {/* Brand Story */}
            {result.brandStory && (
              <ResultCard title="Brand Vision & Story" delay={0.5}>
                <div className="relative group cursor-pointer" onClick={() => copyText(result.brandStory || "", "story")}>
                  <p className="text-lg leading-relaxed text-muted-foreground font-light italic border-l-4 border-primary/50 pl-6 py-2">
                    "{result.brandStory}"
                  </p>
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {copied === "story" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
              </ResultCard>
            )}

            {/* 3. Visual Identity (Large) */}
            {(result.logoUrl || result.moodboardUrl) && (
              <ResultCard title="Visual Identity System" delay={0.6}>
                <div className="grid md:grid-cols-5 gap-6">
                  {/* Logo - Takes 2 cols */}
                  {result.logoUrl && (
                    <div className="md:col-span-2 space-y-3 group">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-muted-foreground">Logo Concept</h4>
                        <a href={result.logoUrl} download="logo-concept.png" target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-primary hover:underline"><Download className="w-3 h-3" /> Save</a>
                      </div>
                      <div className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm aspect-square flex items-center justify-center p-8 group-hover:shadow-md transition-shadow">
                        <img src={result.logoUrl} alt="Generated Logo" className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    </div>
                  )}

                  {/* Moodboard - Takes 3 cols */}
                  {result.moodboardUrl && (
                    <div className="md:col-span-3 space-y-3 group">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-muted-foreground">Brand Mood Board</h4>
                        <a href={result.moodboardUrl} download="moodboard.png" target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-primary hover:underline"><Download className="w-3 h-3" /> Save</a>
                      </div>
                      <div className="relative overflow-hidden rounded-2xl border border-border bg-black/5 shadow-sm h-full min-h-[300px] group-hover:shadow-md transition-shadow">
                        <img src={result.moodboardUrl} alt="Mood Board" className="w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-500" />
                      </div>
                    </div>
                  )}
                </div>
              </ResultCard>
            )}

            {/* 4. Strategy Full Width */}
            {result.strategy && (
              <ResultCard title="Strategic Positioning" delay={0.7}>
                <div className="p-6 bg-gradient-to-tr from-secondary/10 to-transparent border border-border rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                  </div>
                  <p className="text-lg leading-relaxed text-foreground/90 font-light relative z-10">{result.strategy}</p>
                  {result.keywords && (
                    <div className="mt-4 flex flex-wrap gap-2 relative z-10">
                      {result.keywords.map(k => (
                        <span key={k} className="text-xs font-mono text-primary/70 bg-primary/5 px-2 py-1 rounded">#{k}</span>
                      ))}
                    </div>
                  )}
                </div>
              </ResultCard>
            )}
          </div>

          <motion.div className="text-center mt-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify({ input, result }, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `brand-kit-${Date.now()}.json`;
                a.click();
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow-green hover:scale-105 transition-transform"
            >
              <Download className="w-5 h-5" /> Download Brand Kit
            </button>
          </motion.div>
        </div>
      </div >
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Back link */}
      <div className="w-full max-w-2xl mb-8">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      {/* Progress */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono transition-colors duration-300 ${i <= step ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`hidden sm:block w-12 lg:w-20 h-px transition-colors duration-300 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          {STEPS.map((s) => <span key={s}>{s}</span>)}
        </div>
      </div>

      {/* Form */}
      <div className="w-full max-w-2xl glass rounded-2xl p-8 min-h-[300px] flex flex-col">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <StepPanel key="industry" title="What industry is your brand in?">
              <input
                value={input.industry}
                onChange={(e) => setInput({ ...input, industry: e.target.value })}
                placeholder="e.g. Technology, Fashion, Healthcare..."
                className="w-full p-4 bg-muted rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
            </StepPanel>
          )}
          {step === 1 && (
            <StepPanel key="audience" title="Who is your target audience?">
              <input
                value={input.audience}
                onChange={(e) => setInput({ ...input, audience: e.target.value })}
                placeholder="e.g. Young professionals, Small business owners..."
                className="w-full p-4 bg-muted rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
            </StepPanel>
          )}
          {step === 2 && (
            <StepPanel key="values" title="What are your brand values & keywords?">
              <textarea
                value={input.values}
                onChange={(e) => setInput({ ...input, values: e.target.value })}
                placeholder="e.g. Innovation, Sustainability, Trust..."
                rows={3}
                className="w-full p-4 bg-muted rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground placeholder:text-muted-foreground resize-none"
                autoFocus
              />
              <input
                value={input.keywords}
                onChange={(e) => setInput({ ...input, keywords: e.target.value })}
                placeholder="Keywords (comma separated): modern, bold, eco..."
                className="w-full mt-3 p-4 bg-muted rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground placeholder:text-muted-foreground"
              />
            </StepPanel>
          )}
          {step === 3 && (
            <StepPanel key="tone" title="Choose your brand tone">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tones.map((t) => (
                  <button
                    key={t}
                    onClick={() => setInput({ ...input, tone: t })}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${input.tone === t ? "border-primary bg-primary/10 text-primary neon-glow-green" : "border-border glass text-muted-foreground hover:text-foreground hover:border-muted-foreground"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </StepPanel>
          )}
          {step === 4 && (
            <StepPanel key="generate" title="Ready to generate your brand?">
              <div className="glass rounded-lg p-4 space-y-2 text-sm text-muted-foreground mb-6">
                <p><span className="text-foreground font-medium">Industry:</span> {input.industry}</p>
                <p><span className="text-foreground font-medium">Audience:</span> {input.audience}</p>
                <p><span className="text-foreground font-medium">Values:</span> {input.values}</p>
                <p><span className="text-foreground font-medium">Tone:</span> {input.tone}</p>
              </div>
              <button
                onClick={generate}
                disabled={loading}
                className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow-green hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> AI is generating your brand...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Generate Brand</>
                )}
              </button>
            </StepPanel>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between mt-auto pt-6">
            <button onClick={prev} disabled={step === 0} className="flex items-center gap-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={next} disabled={!canProceed()} className="flex items-center gap-2 text-primary hover:text-primary/80 disabled:opacity-30 transition-colors font-medium">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const StepPanel = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.25 }}
  >
    <h2 className="text-2xl font-bold mb-6">{title}</h2>
    {children}
  </motion.div>
);

const ResultCard = ({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) => (
  <motion.div
    className="glass rounded-xl p-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <h3 className="text-lg font-semibold mb-4 text-gradient-neon inline-block">{title}</h3>
    {children}
  </motion.div>
);

export default GeneratorPage;
