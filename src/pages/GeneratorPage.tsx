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
      alert("Failed to connect to the backend. Ensure the server is running on port 3000.");
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

          <div className="space-y-8">
            {/* Brand Names */}
            <ResultCard title="Brand Names" delay={0}>
              <div className="flex flex-wrap gap-3">
                {result.names.map((n) => (
                  <button key={n} onClick={() => copyText(n, n)} className="px-4 py-2 glass rounded-lg hover:neon-glow-green transition-all text-lg font-semibold flex items-center gap-2">
                    {n} {copied === n ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                  </button>
                ))}
              </div>
            </ResultCard>

            {/* Taglines */}
            <ResultCard title="Taglines" delay={0.1}>
              <div className="space-y-3">
                {result.taglines.map((t, i) => (
                  <div key={i} onClick={() => copyText(t, `tag-${i}`)} className="p-3 glass rounded-lg cursor-pointer hover:neon-glow-blue transition-all flex justify-between items-center">
                    <span className="italic text-muted-foreground">"{t}"</span>
                    {copied === `tag-${i}` ? <Check className="w-4 h-4 text-primary shrink-0" /> : <Copy className="w-3 h-3 text-muted-foreground shrink-0" />}
                  </div>
                ))}
              </div>
            </ResultCard>

            {/* Colors */}
            <ResultCard title="Color Palette" delay={0.2}>
              <div className="flex flex-wrap gap-4">
                {result.colors.map((c) => (
                  <button key={c.hex} onClick={() => copyText(c.hex, c.hex)} className="group text-center">
                    <div className="w-16 h-16 rounded-xl mb-2 border border-border group-hover:scale-110 transition-transform" style={{ background: c.hex }} />
                    <span className="text-xs text-muted-foreground">{c.name}</span>
                    <br />
                    <span className="text-xs font-mono text-muted-foreground">{c.hex}</span>
                  </button>
                ))}
              </div>
            </ResultCard>

            {/* Description */}
            <ResultCard title="Brand Description" delay={0.3}>
              <p className="text-muted-foreground leading-relaxed">{result.description}</p>
              <button onClick={() => copyText(result.description, "desc")} className="mt-3 text-sm text-primary flex items-center gap-1 hover:underline">
                {copied === "desc" ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </ResultCard>

            {/* Voice */}
            <ResultCard title="Brand Voice" delay={0.4}>
              <div className="flex flex-wrap gap-2">
                {result.voiceTraits.map((v) => (
                  <span key={v} className="px-3 py-1 glass rounded-full text-sm text-primary">{v}</span>
                ))}
              </div>
            </ResultCard>

            {/* Social Post */}
            <ResultCard title="Sample Social Post" delay={0.5}>
              <div className="p-4 glass rounded-lg">
                <p className="text-muted-foreground text-sm">{result.socialPost}</p>
              </div>
              <button onClick={() => copyText(result.socialPost, "social")} className="mt-3 text-sm text-primary flex items-center gap-1 hover:underline">
                {copied === "social" ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </ResultCard>

            {/* Bio */}
            <ResultCard title="Brand Bio" delay={0.6}>
              <p className="text-muted-foreground">{result.bio}</p>
              <button onClick={() => copyText(result.bio, "bio")} className="mt-3 text-sm text-primary flex items-center gap-1 hover:underline">
                {copied === "bio" ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </ResultCard>

            {/* Strategy */}
            {result.strategy && (
              <ResultCard title="Brand Strategy" delay={0.7}>
                <p className="text-muted-foreground">{result.strategy}</p>
              </ResultCard>
            )}

            {/* Visual Identity */}
            {(result.logoUrl || result.moodboardUrl) && (
              <ResultCard title="Visual Identity" delay={0.8}>
                <div className="grid md:grid-cols-2 gap-4">
                  {result.logoUrl && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">Logo Concept</h4>
                      <img src={result.logoUrl} alt="Generated Logo" className="w-full rounded-lg border border-border bg-white" />
                    </div>
                  )}
                  {result.moodboardUrl && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">Mood Board</h4>
                      <img src={result.moodboardUrl} alt="Mood Board" className="w-full rounded-lg border border-border" />
                    </div>
                  )}
                </div>
              </ResultCard>
            )}

            {/* Sentiment Analysis */}
            {result.sentiment && (
              <ResultCard title="Tone Analysis (AI)" delay={0.9}>
                <div className="flex items-center gap-4">
                  <div className="glass px-4 py-2 rounded-lg text-primary font-semibold border border-primary/20">
                    {result.sentiment}
                  </div>
                  {result.confidence && (
                    <div className="text-sm text-muted-foreground">
                      Confidence: {(result.confidence * 100).toFixed(0)}%
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
      </div>
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
