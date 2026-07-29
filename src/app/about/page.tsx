import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Building2, Users, Trophy, Target, ArrowRight, ShieldCheck, Gem, Briefcase } from "lucide-react";

export const metadata = {
  title: "About Us | Re One Stop Page",
  description: "Learn more about Re One Stop Page, your complete real estate partner.",
};

export default function AboutPage() {
  const stats = [
    { icon: Building2, count: "5,000+", label: "Premium Properties", desc: "Curated listings across the country" },
    { icon: Users, count: "10,000+", label: "Happy Clients", desc: "Families and businesses served" },
    { icon: Trophy, count: "15+", label: "Years Experience", desc: "Industry-leading expertise" },
    { icon: Target, count: "12", label: "Major Cities", desc: "Expanding our footprint globally" },
  ];

  const values = [
    { icon: ShieldCheck, title: "Trust & Transparency", desc: "Every transaction is an open book. We believe in building relationships through absolute honesty." },
    { icon: Gem, title: "Premium Quality", desc: "We curate only the finest properties, ensuring that our listings meet the highest standards of luxury." },
    { icon: Briefcase, title: "Expert Guidance", desc: "Our experienced agents provide unmatched market insights to help you make the best decisions." },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative pt-32 pb-40 lg:pt-48 lg:pb-56 overflow-hidden">
          <div className="absolute inset-0 bg-primary z-0">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-5 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 backdrop-blur-md border border-accent/30 text-accent text-sm font-bold mb-8 uppercase tracking-widest">
              Who We Are
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
              Redefining <span className="text-accent italic">Real Estate</span> <br className="hidden md:block"/> Excellence.
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
              Your trusted partner in navigating the complex world of real estate. We make buying, selling, and renting seamless, transparent, and rewarding.
            </p>
          </div>
        </div>

        {/* Stats Section - Floating over the hero */}
        <div className="max-w-7xl mx-auto px-5 relative z-20 -mt-24 lg:-mt-32 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgb(0,0,0,0.07)] border border-line/50 hover:-translate-y-2 transition-transform duration-300 group">
                <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-accent group-hover:text-primary transition-colors duration-300">
                  <stat.icon className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-4xl font-bold text-primary mb-2">{stat.count}</h3>
                <p className="font-bold text-slate-800 mb-1">{stat.label}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Story Section */}
        <div className="max-w-7xl mx-auto px-5 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl">
              <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80" alt="Our Team" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-3xl shadow-xl border border-line hidden md:block max-w-[280px]">
              <div className="flex gap-1 text-accent mb-3">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                ))}
              </div>
              <p className="font-bold text-primary italic">"The most professional real estate agency we've ever worked with."</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <h4 className="text-accent font-bold tracking-wider uppercase text-sm mb-3">Our Story</h4>
              <h2 className="font-serif text-4xl lg:text-5xl font-bold text-primary leading-tight">
                A Legacy of Trust & Excellence
              </h2>
            </div>
            <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-light">
              <p>
                Founded with a vision to revolutionize the real estate experience, Re One Stop Page has grown from a small local agency into a comprehensive property platform. We recognized early on that clients were tired of bouncing between different specialists.
              </p>
              <p>
                That's why we built a unified ecosystem. Whether you're a first-time homebuyer, a business looking for warehouse space, or an investor seeking prime commercial land, our platform and dedicated experts provide everything you need under one roof.
              </p>
            </div>
            <Link href="/properties" className="inline-flex items-center gap-2 bg-primary text-white font-bold py-4 px-8 rounded-xl hover:bg-accent hover:text-primary transition-all duration-300 group">
              <span>Explore Properties</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-slate-50 py-24 border-t border-line">
          <div className="max-w-7xl mx-auto px-5">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-serif text-4xl font-bold text-primary mb-6">Our Core Values</h2>
              <p className="text-lg text-slate-600">The principles that guide every interaction, negotiation, and decision we make at Re One Stop Page.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((val, idx) => (
                <div key={idx} className="bg-white p-10 rounded-3xl border border-line shadow-sm hover:shadow-xl transition-shadow duration-300">
                  <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-accent mb-6">
                    <val.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4 font-serif">{val.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative py-24 bg-primary overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="max-w-4xl mx-auto px-5 text-center relative z-10">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
              Ready to find your perfect property?
            </h2>
            <Link href="/contact" className="inline-block bg-accent text-primary font-bold py-4 px-10 rounded-xl hover:bg-white transition-colors duration-300 text-lg shadow-[0_0_40px_rgba(212,175,55,0.4)]">
              Contact Our Experts
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
