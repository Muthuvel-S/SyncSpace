import React, { useEffect, useState } from "react";

const text = "SyncSpace";
const REDIRECT_TIME = 2000; // ms (match animation duration)

function Welcome() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);

    const timer = setTimeout(() => {
      window.location.href = "/login"; // change route if needed
    }, REDIRECT_TIME);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden">
      <h1 className="flex text-5xl md:text-6xl font-bold tracking-tight">
        {text.split("").map((char, index) => (
          <span
            key={index}
            className={`inline-block transition-all duration-700 ease-out
              ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
            `}
            style={{
              transitionDelay: `${index * 120}ms`,
              color: index < 4 ? "#4f46e5" : "inherit", // Sync = indigo
            }}
          >
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
}

export default Welcome;

