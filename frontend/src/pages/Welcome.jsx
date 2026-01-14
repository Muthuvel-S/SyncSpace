import React, { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Users, Zap } from "lucide-react";

function Welcome() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden font-sans">
      
      {/* Background gradients */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-3xl" />
      </div>

      {/* Main container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* LEFT CONTENT */}
        <div
          className={`transition-all duration-700 ${
            loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
          }`}
        >
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Work smarter with  
            <span className="block text-indigo-400">SyncSpace</span>
          </h1>

          <p className="text-lg text-slate-300 max-w-xl mb-10">
            A next-generation collaboration platform built for speed, security,
            and high-performance teams.
          </p>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => (window.location.href = "/login")}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition shadow-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>

            <span className="text-sm text-slate-400">
              No credit card required
            </span>
          </div>

          {/* Trust indicators */}
          <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg">
            <Feature icon={<ShieldCheck />} text="Secure by design" />
            <Feature icon={<Zap />} text="Lightning fast" />
            <Feature icon={<Users />} text="Team focused" />
          </div>
        </div>

        {/* RIGHT VISUAL PANEL */}
        <div
          className={`transition-all duration-700 ${
            loaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
          }`}
        >
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            
            <div className="h-4 w-20 bg-indigo-500 rounded mb-6" />

            <div className="space-y-4">
              <div className="h-4 bg-slate-700 rounded w-3/4" />
              <div className="h-4 bg-slate-700 rounded w-full" />
              <div className="h-4 bg-slate-700 rounded w-5/6" />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="h-24 rounded-lg bg-indigo-500/20" />
              <div className="h-24 rounded-lg bg-cyan-500/20" />
            </div>

            <p className="mt-6 text-sm text-slate-400">
              Live workspace preview
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Small reusable feature block */
function Feature({ icon, text }) {
  return (
    <div className="flex items-center gap-2 text-slate-300 text-sm">
      <span className="text-indigo-400">{icon}</span>
      {text}
    </div>
  );
}

export default Welcome;
