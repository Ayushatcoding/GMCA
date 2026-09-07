import { useMutation } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Brain,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Crown,
  Lightbulb,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Palette,
  Phone,
  Quote,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api";
import type { Enquiry, EnquiryCreate } from "@/lib/types";

const WHATSAPP_URL = "https://wa.me/919953048933";

const navItems = [
  ["home", "Home"],
  ["about", "About"],
  ["coaches", "Coaches"],
  ["programs", "Programs"],
  ["fees", "Fees"],
  ["tournaments", "Tournaments"],
  ["testimonials", "Testimonials"],
  ["gallery", "Gallery"],
  ["contact", "Contact"],
] as const;

const benefits: Array<{ title: string; description: string; Icon: LucideIcon }> = [
  { title: "Concentration", description: "Builds deep focus and a calmer attention span.", Icon: Target },
  { title: "Memory Power", description: "Strengthens pattern recognition and recall.", Icon: Brain },
  { title: "Calculation", description: "Practises thinking several moves ahead.", Icon: Calculator },
  { title: "Imagination", description: "Makes future positions visible before they happen.", Icon: Lightbulb },
  { title: "Confidence", description: "Encourages brave decisions and resilient learning.", Icon: Award },
  { title: "Planning", description: "Turns big goals into thoughtful next steps.", Icon: CalendarDays },
  { title: "Creativity", description: "Leaves room for fresh ideas and surprising tactics.", Icon: Palette },
  { title: "Judgement", description: "Develops balanced choices under pressure.", Icon: Scale },
  { title: "Time Management", description: "Teaches children to use every moment wisely.", Icon: Clock3 },
  { title: "Responsibility", description: "Makes ownership and reflection part of every game.", Icon: ShieldCheck },
];

const programs: Array<{ title: string; description: string; Icon: LucideIcon }> = [
  { title: "Beginner Classes", description: "Learn piece movement, essential rules, early tactics, and the joy of a first complete game.", Icon: BookOpen },
  { title: "Group Classes", description: "Interactive sessions that make room for friendly competition, discussion, and game analysis.", Icon: Users },
  { title: "Kids Classes", description: "A welcoming, age-aware introduction to chess that keeps curiosity and confidence growing.", Icon: Sparkles },
  { title: "Professional / Advanced Chess", description: "For players ready to deepen their strategic thinking, preparation, and competitive habits.", Icon: Trophy },
  { title: "Weekend Classes", description: "A practical option for families balancing school, activities, and consistent chess practice.", Icon: CalendarDays },
];

const reviews = [
  { name: "Anjali Jaitly", text: "We have had a wonderful experience with both Suchitra Ma'am and Amarendra sir. They provide professional training with their personal touch to each individual's game. Overall quite satisfied with their approach and highly recommended them." },
  { name: "Abhinav Jain", text: "Excellent trainers, headed by a great coach in Mr. Amrendra. I can see my son become really good at chess in a fairly short span of time — all thanks to Mr. Amrendra and his team. They ensure that every student is involved in the class and they pay attention individually." },
  { name: "Shivangi Arora", text: "Genius mind chess academy provides a very well planned course structure for beginners in chess. Both Amrinder sir and Suchitra mam are brilliant. Their approach towards chess is logical and my kid has started loving the game." },
  { name: "Dipali Anand Puri", text: "Excellent academy... both my kids have taken coaching from amrender sir... he's quite dedicated and focused... his interest in chess has improved and overall concentration has also improved a lot." },
  { name: "Ankit Kumar", text: "One of the Best chess Academy in Noida. They have nice learning environment... Coaches interact with each and every students on regular basis." },
];

const galleryItems = [
  { title: "Students discovering the board", alt: "Chess pieces arranged for a classroom lesson", src: "https://images.unsplash.com/photo-1720548168939-0f41625c2906?auto=format&fit=crop&w=1000&q=82" },
  { title: "A game in progress", alt: "Chess pieces beside a chess board", src: "https://images.unsplash.com/photo-1601232871543-befc33c7914e?auto=format&fit=crop&w=1000&q=82" },
  { title: "Board-side coaching", alt: "Chess board ready for analysis", src: "https://images.unsplash.com/photo-1632137366039-ba08c5ed24d3?auto=format&fit=crop&w=1000&q=82" },
  { title: "Tournament focus", alt: "Chess pieces on a blue chess board", src: "https://images.unsplash.com/photo-1617146415166-b08ef27dc931?auto=format&fit=crop&w=1000&q=82" },
];

const initialForm: EnquiryCreate = { name: "", phone: "", program: "", message: "" };

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function Logo({ compact = false, testId }: { compact?: boolean; testId: string }) {
  return (
    <img
      src={compact ? "/gmca-emblem.webp" : "/gmca-logo.webp"}
      alt="Genius Mind Chess Academy official logo"
      className={compact ? "h-11 w-11 object-contain" : "h-14 w-auto max-w-[216px] object-contain"}
      data-testid={testId}
    />
  );
}

function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  const slug = slugify(eyebrow);
  return (
    <div className="max-w-2xl" data-testid={`section-intro-${slug}`}>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#014DFF]" data-testid={`section-eyebrow-${slug}`}>{eyebrow}</p>
      <h2 className="gmca-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl" data-testid={`section-heading-${slug}`}>{title}</h2>
      <p className="mt-4 text-base leading-8 text-slate-600" data-testid={`section-description-${slug}`}>{description}</p>
    </div>
  );
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState<EnquiryCreate>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const enquiryMutation = useMutation({
    mutationFn: (payload: EnquiryCreate) => apiPost<Enquiry>("/enquiries", payload),
    onSuccess: () => {
      setSubmitted(true);
      setForm(initialForm);
      toast.success("Your enquiry is with the GMCA team.");
    },
  });

  useEffect(() => {
    const sections = navItems.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActiveSection(entry.target.id)),
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const goTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(false);
    enquiryMutation.mutate(form);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-slate-950" data-testid="academy-site">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl" data-testid="site-header">
        <div className="mx-auto flex h-[5.25rem] max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#home" onClick={() => goTo("home")} className="flex items-center gap-3" data-testid="brand-home-link">
            <span className="hidden sm:block"><Logo testId="header-full-logo-image" /></span>
            <span className="sm:hidden"><Logo compact testId="header-mobile-emblem-image" /></span>
            <span className="hidden border-l border-slate-200 pl-3 text-sm font-bold leading-tight text-[#014DFF] lg:block" data-testid="brand-short-name">GMCA<br /><span className="font-normal text-slate-500">Noida · Est. 2011</span></span>
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation" data-testid="desktop-navigation">
            {navItems.map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={() => goTo(id)} className={`rounded-full px-3 py-2 text-xs font-bold transition-colors duration-200 ${activeSection === id ? "bg-blue-50 text-[#014DFF]" : "text-slate-600 hover:bg-slate-50 hover:text-[#014DFF]"}`} data-testid={`nav-link-${id}`}>
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href="#contact" onClick={() => goTo("contact")} className="hidden rounded-full bg-[#014DFF] px-4 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(1,77,255,0.2)] transition-transform duration-200 hover:-translate-y-0.5 sm:inline-flex" data-testid="header-book-trial-button">Book a Trial</a>
            <button type="button" onClick={() => setMenuOpen((open) => !open)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors hover:border-[#014DFF] hover:text-[#014DFF] lg:hidden" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} data-testid="mobile-menu-toggle">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 pb-5 pt-2 shadow-xl lg:hidden" data-testid="mobile-navigation">
            {navItems.map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={() => goTo(id)} className={`block border-b border-slate-100 py-3 text-sm font-bold ${activeSection === id ? "text-[#014DFF]" : "text-slate-700"}`} data-testid={`mobile-nav-link-${id}`}>{label}</a>
            ))}
            <a href="#contact" onClick={() => goTo("contact")} className="mt-4 flex justify-center rounded-full bg-[#014DFF] px-4 py-3 text-sm font-bold text-white" data-testid="mobile-book-trial-button">Book a Trial Class</a>
          </div>
        )}
      </header>

      <main>
        <section id="home" className="gmca-section relative overflow-hidden bg-white pt-32" data-testid="home-section">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[#F8FAFC] lg:block" aria-hidden="true" />
          <div className="gmca-board-pattern absolute right-[-8rem] top-28 hidden h-96 w-96 rounded-full opacity-70 lg:block" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-12 sm:px-8 lg:grid-cols-[1.03fr_.97fr] lg:gap-16 lg:pb-16">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-[#014DFF]" data-testid="home-establishment-badge"><Crown size={14} /> Promoting chess since 2011</div>
              <h1 className="gmca-heading max-w-3xl text-4xl font-bold leading-[1.07] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl" data-testid="home-headline">Building young minds through <span className="text-[#014DFF]">strategic chess.</span></h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg" data-testid="home-subheadline">Genius Mind Chess Academy helps students grow through thoughtful coaching, meaningful practice, and the confidence to make their next move.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row" data-testid="home-cta-group">
                <a href="#contact" onClick={() => goTo("contact")} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#014DFF] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(1,77,255,0.22)] transition-transform duration-200 hover:-translate-y-1" data-testid="hero-book-trial-button">Book a Trial Class <ChevronRight size={17} /></a>
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition-colors duration-200 hover:border-[#014DFF] hover:text-[#014DFF]" data-testid="hero-whatsapp-button"><MessageCircle size={17} /> Enquire on WhatsApp</a>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 pt-5 text-xs font-bold text-slate-500" data-testid="home-trust-bar">
                <span className="inline-flex items-center gap-1.5 text-slate-700" data-testid="trust-google-rating"><Star size={14} className="fill-[#014DFF] text-[#014DFF]" /> 4.8★ Google Rating (43 reviews)</span>
                <span data-testid="trust-established">Est. 2011</span>
                <span data-testid="trust-community">1.9K+ Facebook Community</span>
              </div>
            </div>
            <div className="relative min-h-[25rem] rounded-[2rem] border border-blue-100 bg-[#F8FAFC] p-5 sm:p-8" data-testid="home-logo-feature">
              <div className="gmca-board-pattern absolute inset-0 rounded-[2rem] opacity-50" aria-hidden="true" />
              <div className="relative flex h-full flex-col items-center justify-center rounded-[1.4rem] border border-white bg-white/85 px-6 py-10 shadow-[0_24px_70px_rgba(15,23,42,0.1)] backdrop-blur-sm">
                <div className="gmca-float flex h-48 w-48 items-center justify-center rounded-full bg-white shadow-[0_20px_45px_rgba(1,77,255,0.16)] ring-8 ring-blue-50 sm:h-56 sm:w-56" data-testid="hero-emblem-container"><Logo compact testId="hero-emblem-image" /></div>
                <p className="gmca-heading mt-8 text-center text-2xl font-bold text-slate-900" data-testid="hero-logo-caption">Where every move builds a mind</p>
                <p className="mt-2 text-center text-sm leading-6 text-slate-500" data-testid="hero-logo-supporting-copy">Group or individual training for Beginner, Intermediate, and Advanced players.</p>
              </div>
            </div>
          </div>
          <div className="relative mx-auto grid max-w-7xl gap-5 px-5 pb-20 sm:px-8 lg:grid-cols-[1.2fr_.8fr]" data-testid="home-preview-strip">
            <Card className="border-slate-200 bg-white shadow-sm" data-testid="home-testimonial-preview-card"><CardContent className="p-6 sm:p-7"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#014DFF]" data-testid="home-testimonial-preview-label">Parents say</p><a href="#testimonials" onClick={() => goTo("testimonials")} className="text-xs font-bold text-slate-500 hover:text-[#014DFF]" data-testid="home-testimonial-preview-link">Read all reviews <ChevronRight className="inline" size={14} /></a></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><div className="relative border-l-2 border-[#014DFF] pl-4" data-testid="home-quote-one"><Quote className="absolute -left-1 top-[-9px] bg-white text-[#014DFF]" size={17} /><p className="text-sm leading-6 text-slate-700">“Professional training with their personal touch to each individual's game.”</p><p className="mt-2 text-xs font-bold text-slate-500">— Anjali Jaitly</p></div><div className="relative border-l-2 border-slate-200 pl-4" data-testid="home-quote-two"><p className="text-sm leading-6 text-slate-700">“They pay attention individually.”</p><p className="mt-2 text-xs font-bold text-slate-500">— Abhinav Jain</p></div></div></CardContent></Card>
            <Card className="gmca-shimmer border-[#014DFF]/20 bg-[#014DFF] text-white shadow-[0_14px_30px_rgba(1,77,255,0.18)]" data-testid="home-tournament-preview-card"><CardContent className="p-6 sm:p-7"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-100" data-testid="home-tournament-preview-label"><Trophy size={15} /> Every Saturday</div><h2 className="gmca-heading mt-3 text-2xl font-bold" data-testid="home-tournament-preview-title">Weekly Online Chess Tournament</h2><p className="mt-2 text-sm leading-6 text-blue-100" data-testid="home-tournament-preview-copy">Rapid Swiss League · 10+10 · 3–5 rounds on Lichess.org</p><a href="#tournaments" onClick={() => goTo("tournaments")} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white hover:text-blue-100" data-testid="home-tournament-preview-link">View tournament details <ChevronRight size={16} /></a></CardContent></Card>
          </div>
        </section>

        <section id="about" className="gmca-section border-t border-slate-200 bg-[#F8FAFC] py-20 sm:py-28" data-testid="about-section">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionIntro eyebrow="About GMCA" title="A thoughtful start. A stronger next move." description="GMCA (Genius Mind Chess Academy) was formed in 2011 for the promotion of chess. We provide chess training in group or individual settings at all levels — Beginner, Intermediate, and Advanced. We also organize chess tournaments to provide a competitive environment for our students." />
            <div className="mt-16 grid gap-6 lg:grid-cols-[.82fr_1.18fr] lg:items-start">
              <div className="rounded-3xl bg-[#014DFF] p-7 text-white sm:p-9" data-testid="about-why-chess-intro"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><Crown size={25} /></div><h3 className="gmca-heading mt-8 text-3xl font-bold" data-testid="why-chess-heading">Why chess?</h3><p className="mt-4 text-sm leading-7 text-blue-100" data-testid="why-chess-copy">A chessboard gives young minds a safe place to think, decide, adapt, and try again. Those habits travel far beyond the game.</p><div className="mt-10 grid grid-cols-2 gap-3 text-xs font-bold text-white sm:grid-cols-3 lg:grid-cols-2"><span className="rounded-xl border border-white/20 bg-white/10 px-3 py-3" data-testid="why-chess-tag-thinking">Think clearly</span><span className="rounded-xl border border-white/20 bg-white/10 px-3 py-3" data-testid="why-chess-tag-decide">Decide bravely</span><span className="rounded-xl border border-white/20 bg-white/10 px-3 py-3" data-testid="why-chess-tag-grow">Grow steadily</span></div></div>
              <div className="grid gap-3 sm:grid-cols-2" data-testid="benefits-grid">{benefits.map(({ title, description, Icon }) => <Card key={title} className="border-slate-200 bg-white transition-transform duration-200 hover:-translate-y-1 hover:border-blue-200" data-testid={`benefit-card-${title.toLowerCase().replaceAll(" ", "-")}`}><CardContent className="flex gap-4 p-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#014DFF]"><Icon size={19} /></div><div><h3 className="text-sm font-bold text-slate-900" data-testid={`benefit-title-${title.toLowerCase().replaceAll(" ", "-")}`}>{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500" data-testid={`benefit-description-${title.toLowerCase().replaceAll(" ", "-")}`}>{description}</p></div></CardContent></Card>)}</div>
            </div>
          </div>
        </section>

        <section id="coaches" className="gmca-section bg-white py-20 sm:py-28" data-testid="coaches-section">
          <div className="mx-auto max-w-7xl px-5 sm:px-8"><SectionIntro eyebrow="Meet the coaches" title="Guidance with a personal touch" description="The GMCA team creates a focused, encouraging environment for students to keep learning. Official profile details are being collected and will be added here." /><div className="mt-12 grid gap-5 md:grid-cols-2">{[{ name: "Amrendra Kumar", role: "Director & Chess Instructor", slug: "amrendra" }, { name: "Suchitra", role: "Chess Instructor", slug: "suchitra" }].map((coach) => <Card key={coach.slug} className="overflow-hidden border-slate-200 bg-white shadow-sm" data-testid={`coach-card-${coach.slug}`}><CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8"><div className="flex h-32 w-full shrink-0 items-center justify-center rounded-2xl bg-blue-50 sm:h-36 sm:w-36" data-testid={`coach-headshot-placeholder-${coach.slug}`}>{/* Placeholder: official professional headshot needed for this coach. */}<div className="text-center"><Crown className="mx-auto text-[#014DFF]" size={35} /><p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#014DFF]" data-testid={`coach-headshot-label-${coach.slug}`}>Headshot<br />placeholder</p></div></div><div><p className="text-xs font-bold uppercase tracking-[0.17em] text-[#014DFF]" data-testid={`coach-role-${coach.slug}`}>{coach.role}</p><h3 className="gmca-heading mt-2 text-2xl font-bold text-slate-900" data-testid={`coach-name-${coach.slug}`}>{coach.name}</h3><p className="mt-3 text-sm leading-6 text-slate-500" data-testid={`coach-bio-${coach.slug}`}>[Bio and credentials to be added]</p><span className="mt-5 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#014DFF]" data-testid={`coach-placeholder-badge-${coach.slug}`}>Awaiting official profile details</span></div></CardContent></Card>)}</div></div>
        </section>

        <section id="programs" className="gmca-section border-y border-slate-200 bg-[#F8FAFC] py-20 sm:py-28" data-testid="programs-section">
          <div className="mx-auto max-w-7xl px-5 sm:px-8"><SectionIntro eyebrow="Programs" title="Find the right way to learn" description="Choose a format that fits your student and your family. Online and offline chess training are both available." /><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{programs.map(({ title, description, Icon }) => <Card key={title} className="border-slate-200 bg-white transition-transform duration-200 hover:-translate-y-1 hover:border-blue-200" data-testid={`program-card-${slugify(title)}`}><CardContent className="flex h-full flex-col p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#014DFF]"><Icon size={20} /></div><h3 className="mt-5 text-base font-bold text-slate-900" data-testid={`program-title-${slugify(title)}`}>{title}</h3><p className="mt-2 flex-1 text-sm leading-6 text-slate-500" data-testid={`program-description-${slugify(title)}`}>{description}</p><span className="mt-5 inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500" data-testid={`program-format-${slugify(title)}`}>Online + Offline</span></CardContent></Card>)}</div><div className="mt-7 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-sm leading-6 text-slate-700" data-testid="programs-timing-note"><CalendarDays className="mt-0.5 shrink-0 text-[#014DFF]" size={19} /><p><strong>Current schedule:</strong> Batch timings and detailed curriculum available on request — contact us for the current schedule.</p></div></div>
        </section>

        <section id="fees" className="gmca-section bg-white py-20 sm:py-24" data-testid="fees-section">
          <div className="mx-auto max-w-5xl px-5 sm:px-8"><div className="relative overflow-hidden rounded-3xl bg-[#014DFF] px-6 py-10 text-white sm:px-12 sm:py-14" data-testid="fees-card"><div className="gmca-board-pattern absolute inset-0 opacity-10" aria-hidden="true" /><div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between"><div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100" data-testid="fees-eyebrow">Fees & availability</p><h2 className="gmca-heading mt-3 text-3xl font-bold" data-testid="fees-heading">A plan that fits your learning goals</h2><p className="mt-4 text-sm leading-7 text-blue-100" data-testid="fees-message">Fees vary by program and batch. Contact us on WhatsApp for current pricing and available discounts.</p></div><a href={`${WHATSAPP_URL}?text=Hi%20GMCA%2C%20I%20would%20like%20to%20know%20the%20current%20fees.`} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-bold text-[#014DFF] transition-transform duration-200 hover:-translate-y-1" data-testid="fees-whatsapp-button"><MessageCircle size={17} /> Ask on WhatsApp</a></div></div></div>
        </section>

        <section id="tournaments" className="gmca-section bg-[#F8FAFC] py-20 sm:py-28" data-testid="tournaments-section">
          <div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><SectionIntro eyebrow="Play & compete" title="A regular stage for growing players" description="Our recurring tournament gives students a friendly competitive environment to test their preparation and enjoy the game." /><span className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold text-[#014DFF]" data-testid="tournament-recurring-badge"><CalendarDays size={15} /> Every Saturday</span></div><Card className="mt-12 overflow-hidden border-blue-100 bg-white shadow-[0_18px_50px_rgba(1,77,255,0.08)]" data-testid="tournament-card-weekly-online"><CardContent className="grid gap-0 p-0 lg:grid-cols-[.8fr_1.2fr]"><div className="gmca-board-pattern flex min-h-[18rem] flex-col justify-between bg-[#014DFF] p-7 text-white sm:p-10"><div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><Trophy size={25} /></div><p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-blue-100" data-testid="tournament-frequency">Every Saturday</p><h3 className="gmca-heading mt-3 text-3xl font-bold" data-testid="tournament-title">Weekly Online Chess Tournament</h3></div><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-white hover:text-blue-100" data-testid="tournament-registration-button">Register via WhatsApp <ChevronRight size={16} /></a></div><div className="grid gap-6 p-7 sm:grid-cols-2 sm:p-10"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Format</p><p className="mt-2 text-base font-bold text-slate-900" data-testid="tournament-format">Rapid Swiss League</p><p className="mt-1 text-sm text-slate-500" data-testid="tournament-rounds">10+10 timer · 3–5 rounds</p></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Platform</p><p className="mt-2 text-base font-bold text-slate-900" data-testid="tournament-platform">Lichess.org</p></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Entry fee</p><p className="mt-2 text-base font-bold text-slate-900" data-testid="tournament-entry-fee">₹200</p></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Winner cash prize</p><p className="mt-2 text-base font-bold text-slate-900" data-testid="tournament-prize">₹500</p></div><div className="border-t border-slate-100 pt-5 sm:col-span-2"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">How to register</p><p className="mt-2 text-sm leading-6 text-slate-600" data-testid="tournament-registration-copy">Send your full name, Lichess User ID, and payment screenshot via WhatsApp to <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="font-bold text-[#014DFF] hover:underline" data-testid="tournament-whatsapp-number">+91 99530 48933</a></p></div></div></CardContent></Card></div>
        </section>

        <section id="testimonials" className="gmca-section bg-white py-20 sm:py-28" data-testid="testimonials-section">
          <div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><SectionIntro eyebrow="Parent voices" title="Trusted by families in Noida" description="Real words from Google reviewers who have experienced the academy's coaching environment." /><span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-[#014DFF]" data-testid="google-rating-badge"><Star size={14} className="fill-[#014DFF]" /> 4.8★ on Google, based on 43 reviews</span></div><div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{reviews.map((review, index) => <Card key={review.name} className={`border-slate-200 bg-white ${index === 0 ? "lg:row-span-2" : ""}`} data-testid={`testimonial-card-${review.name.toLowerCase().replaceAll(" ", "-")}`}><CardContent className="flex h-full flex-col p-6"><div className="flex gap-1 text-[#014DFF]" data-testid={`testimonial-rating-${index + 1}`}>{Array.from({ length: 5 }).map((_, starIndex) => <Star key={starIndex} size={14} className="fill-current" />)}</div><Quote className="mt-6 text-blue-100" size={27} /><p className="mt-3 flex-1 text-sm leading-7 text-slate-600" data-testid={`testimonial-text-${index + 1}`}>“{review.text}”</p><p className="mt-6 text-sm font-bold text-slate-900" data-testid={`testimonial-author-${index + 1}`}>— {review.name}</p><p className="mt-1 text-xs text-slate-400">Google review</p></CardContent></Card>)}</div></div>
        </section>

        <section id="gallery" className="gmca-section border-y border-slate-200 bg-[#F8FAFC] py-20 sm:py-28" data-testid="gallery-section">
          <div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><SectionIntro eyebrow="Gallery" title="The game, in every kind of moment" description="A visual placeholder gallery for classroom learning, group sessions, and coaching moments. Real academy photos will replace these stock representations." /><span className="inline-flex w-fit rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold text-[#014DFF]" data-testid="gallery-placeholder-badge">Awaiting real academy photos</span></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{galleryItems.map((item, index) => <figure key={item.title} className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white ${index === 0 ? "sm:row-span-2" : ""}`} data-testid={`gallery-card-${index + 1}`}><img src={item.src} alt={item.alt} loading="lazy" className={`h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105 ${index === 0 ? "sm:h-full sm:min-h-[33rem]" : ""}`} data-testid={`gallery-image-${index + 1}`} /><figcaption className="absolute inset-x-3 bottom-3 rounded-xl bg-white/92 px-4 py-3 backdrop-blur-sm"><p className="text-xs font-bold text-slate-900" data-testid={`gallery-title-${index + 1}`}>{item.title}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#014DFF]">Placeholder photo</p></figcaption></figure>)}</div></div>
        </section>

        <section id="contact" className="gmca-section bg-white py-20 sm:py-28" data-testid="contact-section">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-20"><div><SectionIntro eyebrow="Start a conversation" title="Make the next move with GMCA" description="Tell us a little about what you are looking for. The team will help you find the right program or batch." /><div className="mt-10 space-y-5" data-testid="contact-details"><a href="tel:+919953048933" className="flex items-start gap-4 text-slate-700 hover:text-[#014DFF]" data-testid="contact-phone-link"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#014DFF]"><Phone size={18} /></span><span><strong className="block text-sm text-slate-900">Phone / WhatsApp</strong><span className="mt-1 block text-sm">+91 99530 48933</span></span></a><a href="mailto:geniusmindchess@gmail.com" className="flex items-start gap-4 text-slate-700 hover:text-[#014DFF]" data-testid="contact-email-link"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#014DFF]"><Mail size={18} /></span><span><strong className="block text-sm text-slate-900">Email</strong><span className="mt-1 block text-sm">geniusmindchess@gmail.com</span></span></a><div className="flex items-start gap-4" data-testid="contact-hours"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#014DFF]"><Clock3 size={18} /></span><span className="text-sm leading-6 text-slate-600"><strong className="block text-slate-900">Hours</strong>Mon–Thu 3:30 PM – 7:30 PM (Tue/Thu until 5:30 PM)<br />Sat–Sun 10:00 AM – 1:00 PM<br /><span className="font-bold text-slate-900">Friday Closed</span></span></div><div className="flex items-start gap-4" data-testid="contact-location"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#014DFF]"><MapPin size={18} /></span><span className="text-sm leading-6 text-slate-600"><strong className="block text-slate-900">Locations</strong>Multiple locations in Noida — contact us for directions to your nearest branch.</span></div></div><p className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-500" data-testid="hours-confirmation-note">Note: hours conflict between sources — using Google Maps version as default, flagged for owner confirmation.</p></div>
            <Card className="border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]" data-testid="contact-form-card"><CardContent className="p-6 sm:p-8"><div className="mb-7 flex items-start justify-between gap-5"><div><h2 className="gmca-heading text-2xl font-bold text-slate-950" data-testid="contact-form-heading">Enquire about classes</h2><p className="mt-2 text-sm text-slate-500" data-testid="contact-form-helper">Share your details and we’ll get back to you.</p></div><div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#014DFF] sm:flex"><MessageCircle size={20} /></div></div>{submitted && <div className="mb-6 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4" role="status" data-testid="contact-success-message"><CheckCircle2 className="mt-0.5 shrink-0 text-[#014DFF]" size={19} /><div><p className="text-sm font-bold text-slate-900">Thank you — your enquiry has been saved.</p><p className="mt-1 text-xs leading-5 text-slate-600">The GMCA team will be in touch. Prefer a quick chat? WhatsApp is right below.</p></div></div>}{enquiryMutation.isError && <p className="mb-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700" role="alert" data-testid="contact-error-message">We couldn’t save that enquiry just now. Please try again or use WhatsApp.</p>}<form onSubmit={handleSubmit} className="space-y-5" data-testid="contact-form"><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="contact-name">Name</Label><Input id="contact-name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" data-testid="contact-name-input" /></div><div className="space-y-2"><Label htmlFor="contact-phone">Phone</Label><Input id="contact-phone" required type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+91 ..." data-testid="contact-phone-input" /></div></div><div className="space-y-2"><Label htmlFor="contact-program">Program Interested In</Label><select id="contact-program" required value={form.program} onChange={(event) => setForm({ ...form, program: event.target.value })} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-[#014DFF] focus:ring-2 focus:ring-[#014DFF]/20" data-testid="contact-program-select"><option value="" disabled>Select a program</option>{programs.map((program) => <option key={program.title} value={program.title}>{program.title}</option>)}<option value="Not sure yet">Not sure yet</option></select></div><div className="space-y-2"><Label htmlFor="contact-message">Message</Label><Textarea id="contact-message" required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Tell us how we can help..." rows={4} data-testid="contact-message-input" /></div><Button type="submit" disabled={enquiryMutation.isPending} className="h-12 w-full rounded-full bg-[#014DFF] text-sm font-bold text-white hover:bg-[#013FCC]" data-testid="contact-submit-button">{enquiryMutation.isPending ? "Saving enquiry..." : "Send enquiry"}</Button><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-sm font-bold text-[#014DFF] hover:underline" data-testid="contact-whatsapp-link"><MessageCircle size={16} /> Prefer WhatsApp? Chat with us</a></form></CardContent></Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white" data-testid="site-footer"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.2fr_1fr_1fr]"><div><Logo testId="footer-full-logo-image" /><p className="mt-5 max-w-xs text-sm leading-6 text-slate-500" data-testid="footer-tagline-placeholder">[Academy tagline to be added]</p></div><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400" data-testid="footer-links-heading">Explore</p><div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">{navItems.slice(1).map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => goTo(id)} className="text-sm font-bold text-slate-600 hover:text-[#014DFF]" data-testid={`footer-link-${id}`}>{label}</a>)}</div></div><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400" data-testid="footer-connect-heading">Connect</p><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#014DFF]" data-testid="footer-whatsapp-link"><MessageCircle size={16} /> WhatsApp</a><a href="#" onClick={(event) => event.preventDefault()} className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-400" data-testid="footer-facebook-placeholder"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 text-[10px] font-bold text-white">f</span> Facebook <span className="text-[10px]">(link coming soon)</span></a></div></div><div className="border-t border-slate-100"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8"><p data-testid="footer-copyright">© 2026 Genius Mind Chess Academy. Est. 2011.</p><p data-testid="footer-designer-credit">Designed and Created by AYUSH</p></div></div></footer>

      <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_24px_rgba(37,211,102,0.35)] transition-transform duration-200 hover:scale-105" aria-label="Chat with Genius Mind Chess Academy on WhatsApp" data-testid="floating-whatsapp-button"><MessageCircle size={25} /></a>
    </div>
  );
}
