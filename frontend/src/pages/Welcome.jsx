import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const text = "SyncSpace";
const REDIRECT_TIME = 3000;

function Welcome() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setShow(true);

    const timer = setTimeout(() => {
      const token = localStorage.getItem("token");

      if (token) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }, REDIRECT_TIME);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden">
      <h1 className="flex text-5xl md:text-6xl font-bold tracking-tight">
        {text.split("").map((char, index) => (
          <span
            key={index}
            className={`inline-block transition-all duration-700 ease-out ${
              show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{
              transitionDelay: `${index * 120}ms`,
              color: index < 4 ? "#4f46e5" : "inherit",
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
