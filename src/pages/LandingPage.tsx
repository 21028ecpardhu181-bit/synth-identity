import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Palette, Type, Image, FileText, Sparkles } from "lucide-react";

const Hero = () => (
  <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
    {/* Radial glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
    <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[100px] pointer-events-none" />

    <div className="relative z-10 max-w-5xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>AI-Powered Brand Automation</span>
        </div>
      </motion.div>

      <motion.h1
        className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
      >
        Build Your Brand
        <br />
        <span className="text-gradient-neon">With AI</span>
      </motion.h1>

      <motion.p
        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        Generate brand names, taglines, color palettes, and marketing content — all powered by advanced AI in seconds.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.45 }}
      >
        <Link
          to="/generator"
          className="group relative px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow-green hover:scale-105 transition-transform duration-300"
        >
          Start Generating
          <Zap className="inline-block ml-2 w-5 h-5 group-hover:animate-pulse" />
        </Link>
        <a
          href="#features"
          className="px-8 py-4 glass rounded-lg text-foreground font-medium hover:bg-muted/50 transition-colors"
        >
          See Features
        </a>
      </motion.div>
    </div>
  </section>
);

const features = [
  { icon: Type, title: "Brand Identity", desc: "AI generates unique names, taglines, and descriptions for your brand.", color: "text-primary" },
  { icon: Palette, title: "Color Palettes", desc: "Smart color schemes based on psychology and your brand values.", color: "text-secondary" },
  { icon: FileText, title: "Content Writing", desc: "Marketing copy, social posts, bios — written by AI instantly.", color: "text-neon-cyan" },
  { icon: Image, title: "Visual Assets", desc: "Social media templates with your brand applied automatically.", color: "text-primary" },
  { icon: Sparkles, title: "Brand Voice", desc: "Define your tone and personality with AI-guided brand voice.", color: "text-secondary" },
  { icon: Zap, title: "Instant Export", desc: "Download all assets and save your brand projects locally.", color: "text-neon-cyan" },
];

const Features = () => (
  <section id="features" className="py-32 px-6">
    <div className="max-w-6xl mx-auto">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          Everything You Need to <span className="text-gradient-neon">Brand</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          From identity to assets, our AI handles the entire branding pipeline.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className="glass rounded-xl p-6 hover:neon-glow-green transition-shadow duration-500 group cursor-default"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <f.icon className={`w-8 h-8 ${f.color} mb-4 group-hover:scale-110 transition-transform`} />
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-muted-foreground text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const steps = [
  { num: "01", title: "Tell Us About Your Brand", desc: "Industry, audience, values, and keywords." },
  { num: "02", title: "AI Generates Everything", desc: "Names, colors, content, and assets — in seconds." },
  { num: "03", title: "Customize & Export", desc: "Refine results and download your brand kit." },
];

const HowItWorks = () => (
  <section className="py-32 px-6">
    <div className="max-w-4xl mx-auto">
      <motion.h2
        className="text-3xl md:text-5xl font-bold text-center mb-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        How It <span className="text-gradient-neon">Works</span>
      </motion.h2>

      <div className="space-y-8">
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            className="flex items-start gap-6 glass rounded-xl p-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            <span className="text-4xl font-bold text-gradient-neon font-mono shrink-0">{s.num}</span>
            <div>
              <h3 className="text-xl font-semibold mb-1">{s.title}</h3>
              <p className="text-muted-foreground">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="text-center mt-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <Link
          to="/generator"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow-green hover:scale-105 transition-transform duration-300"
        >
          Start Building Your Brand <Zap className="w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  </section>
);

const LandingPage = () => (
  <div className="relative">
    <Hero />
    <Features />
    <HowItWorks />
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm">
        <p>© 2026 BrandForge AI. All rights reserved.</p>
      </div>
    </footer>
  </div>
);

export default LandingPage;
