import React, { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Zap, Users, Layers } from "lucide-react";

function Welcome() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Main content */}
      <div
        className={`max-w-6xl mx-auto px-6 py-32 text-center transition-all duration-700 ${
          loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          <span className="text-indigo-600">Sync</span>Space
        </h1>

        <p className="text-xl md:text-2xl text-slate-600 mb-6">
          A modern collaboration platform for high-performing teams
        </p>

        <p className="text-base md:text-lg text-slate-500 max-w-3xl mx-auto mb-12">
          Communicate clearly, automate workflows, and keep teams aligned —
          all in one secure platform.
        </p>

        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => (window.location.href = "/login")}
            className="group inline-flex items-center gap-2 px-8 py-3 rounded-xl 
                       bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-md"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </button>
          </div>

        <div className="my-20 h-px w-full bg-slate-200" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
          <Feature icon={<ShieldCheck />} title="Secure" desc="Enterprise-grade data protection." />
          <Feature icon={<Zap />} title="Fast" desc="Optimized for smooth performance." />
          <Feature icon={<Users />} title="Collaborative" desc="Built for modern teams." />
          <Feature icon={<Layers />} title="Automated" desc="Smart workflow automation." />
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="text-indigo-600 mt-1">{icon}</div>
      <div>
        <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

export default Welcome;