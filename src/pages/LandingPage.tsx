import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Zap, Palette, Type, Image, FileText, Sparkles,
  ArrowRight, Check, Brain, Wand2, MessageSquare,
  BarChart3, Star, ChevronRight, Globe, Shield, Layers
} from "lucide-react";

const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: easeOut }
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.6, delay: i * 0.1, ease: easeOut }
  }),
};

/* ─── 3D Floating Shape ─── */
const FloatingShape = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div
    className={`absolute rounded-full opacity-60 blur-sm ${className}`}
    style={{
      background: "linear-gradient(135deg, hsl(185 80% 45% / 0.15), hsl(220 80% 55% / 0.1))",
      ...style,
    }}
  />
);

/* ─── Morphing Blob ─── */
const MorphBlob = ({ className }: { className?: string }) => (
  <div
    className={`absolute ${className}`}
    style={{
      background: "linear-gradient(135deg, hsl(185 80% 80% / 0.3), hsl(260 70% 80% / 0.2))",
      animation: "morph 8s ease-in-out infinite",
      width: "300px",
      height: "300px",
    }}
  />
);

/* ─── Navbar ─── */
const Navbar = () => (
  <motion.nav
    className="fixed top-0 left-0 right-0 z-50 glass-strong"
    initial={{ y: -80 }}
    animate={{ y: 0 }}
    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
  >
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground">BrandForge<span className="text-primary">.ai</span></span>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
        <a href="#features" className="hover:text-foreground transition-colors">Features</a>
        <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
        
      </div>
      <Link
        to="/generator"
        className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold cyan-glow hover:scale-105 transition-transform"
      >
        Get Started Free
      </Link>
    </div>
  </motion.nav>
);

/* ─── Hero ─── */
const Hero = () => (
  <section className="relative min-h-screen flex items-center justify-center px-6 pt-16 overflow-hidden bg-gradient-hero">
    {/* 3D floating elements */}
    <FloatingShape className="w-72 h-72 float-3d top-20 -left-20" />
    <FloatingShape className="w-48 h-48 float-3d-delayed top-40 right-10" />
    <FloatingShape className="w-56 h-56 float-3d-slow bottom-32 left-1/3" />
    <MorphBlob className="top-1/4 right-1/4" />

    {/* Orbiting ring */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/10 rotate-3d pointer-events-none" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-primary/5 rotate-3d pointer-events-none" style={{ animationDirection: "reverse", animationDuration: "30s" }} />

    <div className="relative z-10 max-w-5xl mx-auto text-center">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          AI-Powered Branding Platform
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </motion.div>

      <motion.h1
        className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[0.95] tracking-tight mb-6 text-foreground"
        variants={fadeUp} initial="hidden" animate="visible" custom={1}
      >
        Build Brands That
        <br />
        <span className="text-gradient-cyan">Stand Out</span>
      </motion.h1>

      <motion.p
        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        variants={fadeUp} initial="hidden" animate="visible" custom={2}
      >
        Generate brand names, logos, color palettes, content, and sentiment analysis — all automated with cutting-edge AI.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
        variants={fadeUp} initial="hidden" animate="visible" custom={3}
      >
        <Link
          to="/generator"
          className="group relative px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl cyan-glow-strong hover:scale-105 transition-all duration-300 text-lg"
        >
          Start For Free
          <Zap className="inline-block ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
        </Link>
        <a
          href="#features"
          className="px-8 py-4 rounded-xl border border-border text-foreground font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          See How It Works
        </a>
      </motion.div>

      {/* Floating 3D preview card */}
      <motion.div
        className="mt-16 mx-auto max-w-3xl"
        variants={scaleIn} initial="hidden" animate="visible" custom={5}
      >
        <div className="card-3d glass-strong rounded-2xl p-1 cyan-glow">
          <div className="rounded-xl bg-muted/30 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-accent" />
              <div className="w-3 h-3 rounded-full bg-primary/40" />
              <span className="ml-3 text-xs text-muted-foreground font-mono">brandforge.ai/generator</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["Brand Identity", "Logo Design", "Color Palette"].map((label, i) => (
                <div key={label} className="rounded-lg bg-card p-4 text-center border border-border/50">
                  <div className="w-10 h-10 rounded-lg bg-accent mx-auto mb-2 flex items-center justify-center">
                    {[<Type className="w-5 h-5 text-primary" />, <Image className="w-5 h-5 text-primary" />, <Palette className="w-5 h-5 text-primary" />][i]}
                  </div>
                  <p className="text-xs font-medium text-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

/* ─── Features ─── */
const features = [
  {
    icon: Type,
    title: "Brand Name Generation",
    desc: "AI creates unique, memorable brand names tailored to your industry, audience, and values.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Image,
    title: "Logo Creation",
    desc: "Generate professional logos with AI, customize styles, colors, and export in multiple formats.",
    gradient: "from-secondary to-blue-accent",
  },
  {
    icon: FileText,
    title: "Content Automation",
    desc: "Auto-generate social posts, marketing copy, bios, and email templates in your brand voice.",
    gradient: "from-blue-accent to-purple-accent",
  },
  {
    icon: BarChart3,
    title: "Sentiment Analysis",
    desc: "Analyze your brand messaging tone and sentiment to ensure the right emotional connection.",
    gradient: "from-purple-accent to-primary",
  },
  {
    icon: Brain,
    title: "Branding Assistant",
    desc: "An AI co-pilot that guides you through every step of building a cohesive brand identity.",
    gradient: "from-primary to-purple-accent",
  },
  {
    icon: Palette,
    title: "Smart Color Palettes",
    desc: "Psychology-driven color schemes that align with your brand values and target audience.",
    gradient: "from-secondary to-primary",
  },
];

const Features = () => (
  <section id="features" className="py-32 px-6 bg-gradient-section relative overflow-hidden">
    <FloatingShape className="w-96 h-96 float-3d -top-32 -right-32 opacity-30" />

    <div className="max-w-7xl mx-auto relative z-10">
      <motion.div
        className="text-center mb-20"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-4">
          <Layers className="w-3.5 h-3.5" />
          FEATURES
        </div>
        <h2 className="text-4xl md:text-6xl font-extrabold mb-4 text-foreground">
          Everything to Build
          <br />
          <span className="text-gradient-cyan">Your Brand</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Five powerful AI modules working together to create your complete brand identity.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className="card-3d glass rounded-2xl p-6 group cursor-default"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={i}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
              <f.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">{f.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── How It Works ─── */
const steps = [
  { num: "01", title: "Describe Your Brand", desc: "Tell us about your industry, audience, and brand personality.", icon: MessageSquare },
  { num: "02", title: "AI Generates Everything", desc: "Our AI creates names, logos, colors, content, and voice guidelines.", icon: Wand2 },
  { num: "03", title: "Customize & Launch", desc: "Refine your brand kit, export assets, and launch with confidence.", icon: Zap },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-32 px-6 relative overflow-hidden">
    <MorphBlob className="bottom-0 left-0 opacity-20" />

    <div className="max-w-5xl mx-auto relative z-10">
      <motion.div
        className="text-center mb-20"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-4">
          <ChevronRight className="w-3.5 h-3.5" />
          HOW IT WORKS
        </div>
        <h2 className="text-4xl md:text-6xl font-extrabold text-foreground">
          Three Steps to
          <br />
          <span className="text-gradient-cyan">Your Brand</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            className="card-3d glass rounded-2xl p-8 text-center relative"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={i}
          >
            <div className="text-6xl font-extrabold text-gradient-cyan opacity-20 absolute top-4 right-6 font-mono">{s.num}</div>
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5">
              <s.icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">{s.title}</h3>
            <p className="text-muted-foreground text-sm">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── CTA ─── */
const CTA = () => (
  <section className="py-32 px-6 relative overflow-hidden">
    <MorphBlob className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />

    <motion.div
      className="max-w-3xl mx-auto text-center relative z-10"
      variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
    >
      <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-foreground">
        Ready to Build Your
        <br />
        <span className="text-gradient-cyan">Dream Brand?</span>
      </h2>
      <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
        Join thousands of entrepreneurs using AI to create powerful, memorable brands in minutes.
      </p>
      <Link
        to="/generator"
        className="inline-flex items-center gap-2 px-10 py-5 bg-primary text-primary-foreground font-bold rounded-xl cyan-glow-strong hover:scale-105 transition-all duration-300 text-lg"
      >
        Start Generating <ArrowRight className="w-5 h-5" />
      </Link>
    </motion.div>
  </section>
);

/* ─── Footer ─── */
const Footer = () => (
  <footer className="py-12 px-6 border-t border-border">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-foreground">BrandForge<span className="text-primary">.ai</span></span>
      </div>
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <a href="#features" className="hover:text-foreground transition-colors">Features</a>
        <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Privacy</span>
        <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Privacy</span>
        <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Terms</span>
      </div>
      <p className="text-xs text-muted-foreground">© 2026 BrandForge AI. All rights reserved.</p>
    </div>
  </footer>
);

/* ─── Page ─── */
const LandingPage = () => (
  <div className="relative">
    <Navbar />
    <Hero />
    <Features />
    <HowItWorks />
    <CTA />
    <CTA />
    <Footer />
  </div>
);

export default LandingPage;
