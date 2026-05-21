import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  "Analyzing CV...",
  "Extracting skills...",
  "Parsing certificates...",
  "Building profile...",
  "Finalizing results..."
];

function useTypewriter(text: string, speed = 40) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplay("");

    const interval = setInterval(() => {
      setDisplay(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text]);

  return display;
}

export default function CVAnalyzer() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentText = steps[step];
  const typed = useTypewriter(currentText);

  const startAnalysis = () => {
    setLoading(true);
    setDone(false);
    setStep(0);

    let i = 0;

    intervalRef.current = setInterval(() => {
      i++;
      setStep(i);

      if (i >= steps.length - 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);

        // 🔥 TOPLAM SÜRE: 4 SANİYE SONRA RESULT
        timeoutRef.current = setTimeout(() => {
          setLoading(false);
          setDone(true);
        }, 4000);
      }
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-6"
      >
        CV Analyzer
      </motion.h1>

      {!loading && !done && (
        <button
          onClick={startAnalysis}
          className="px-6 py-3 bg-white text-black rounded-xl font-semibold"
        >
          Start Analysis
        </button>
      )}

      {/* LOADING */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 text-lg text-gray-300"
          >
            {typed}
            <span className="animate-pulse">▍</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESULT */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-10 bg-white text-black p-6 rounded-2xl w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-2">Analysis Complete</h2>

            <p className="text-sm text-gray-600">
              Your CV has been successfully analyzed.
            </p>

            <div className="mt-4 space-y-2">
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-2 bg-black w-3/4 rounded" />
              </div>
              <p className="text-xs text-gray-500">Skill coverage: 75%</p>
            </div>

            <div className="mt-4">
              <p className="font-semibold">Quick Summary</p>
              <p className="text-sm text-gray-600">
                Strong technical background with focus on modern web technologies and QA automation.
              </p>
            </div>

            <button
              onClick={startAnalysis}
              className="mt-4 px-4 py-2 bg-black text-white rounded-lg w-full"
            >
              Re-analyze
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}