"use client";

import { useRef, useState, useEffect } from "react";

export default function UploadBox() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [text, setText] = useState("");

  /* =========================
     ANIMATED SCORE STATE
  ========================= */
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const target = result?.score ?? 0;

    let start = 0;
    setAnimatedScore(0);

    const interval = setInterval(() => {
      start += 1;

      if (start >= target) {
        start = target;
        clearInterval(interval);
      }

      setAnimatedScore(start);
    }, 15);

    return () => clearInterval(interval);
  }, [result]);

  /**
   * SAFE PDF PARSER
   */
  const extractPdfText = async (file: File) => {
    const mod = await import("react-pdftotext");
    const pdfToText = mod.default;
    return await pdfToText(file);
  };

  const handleFile = async (file: File) => {
    try {
      setLoading(true);
      setError("");
      setResult(null);
      setFileName(file.name);

      const extractedText = await extractPdfText(file);
      setText(extractedText || "");

      if (!extractedText || extractedText.trim().length < 20) {
        setError("Could not extract enough text from PDF.");
        return;
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: extractedText,
          fileName: file.name,
          jobDescription,
        }),
      });

      const data = await res.json();

      if (!data?.success) {
        setError(data?.error || "Analysis failed.");
        return;
      }

      setResult(data?.result || null);
    } catch (err: any) {
      setError(err?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const getScoreStyle = (score: number = 0) => {
    if (score < 50) {
      return {
        text: "text-red-400",
        color: "#ef4444",
      };
    }

    if (score < 75) {
      return {
        text: "text-yellow-300",
        color: "#facc15",
      };
    }

    return {
      text: "text-green-400",
      color: "#22c55e",
    };
  };

  const scoreValue = result?.score ?? 0;
  const style = getScoreStyle(scoreValue);

  /* =========================
     CIRCLE CONFIG (FIXED)
  ========================= */
  const radius = 85;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;

  const progress = (animatedScore / 100) * circumference;

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* UPLOAD BOX */}
      <div
        onClick={() => inputRef.current?.click()}
        className="group relative border border-white/10 bg-white/5 backdrop-blur-2xl rounded-[32px] p-12 text-center cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:border-purple-500/40 hover:shadow-[0_0_100px_rgba(139,92,246,0.25)] overflow-hidden"
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          accept="application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        <h2 className="text-3xl font-bold">Upload Your CV</h2>

        <p className="text-gray-400 mt-4 text-lg">
          AI-powered ATS resume analysis platform
        </p>

        {fileName && (
          <div className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-300">
            ✓ {fileName}
          </div>
        )}

        {loading && (
          <p className="mt-4 text-cyan-300 animate-pulse">
            Analyzing CV...
          </p>
        )}
      </div>

      {/* JOB DESCRIPTION */}
      <div className="mt-8 bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl">
        <h3 className="text-xl font-semibold mb-3">Job Description</h3>

        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full h-48 bg-black/30 border border-white/10 rounded-3xl p-5 text-white outline-none resize-none"
        />
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-300 p-5 rounded-3xl">
          {error}
        </div>
      )}

      {/* RESULT */}
      {result && (
        <div className="mt-10 space-y-8">

          {/* SCORE CARD */}
          <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-xl p-12">

            <div className="flex flex-col items-center">

              {/* CIRCLE SCORE */}
              <div className="relative w-52 h-52 flex items-center justify-center">

                <svg className="absolute w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={stroke}
                    fill="none"
                  />

                  <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke={style.color}
                    strokeWidth={stroke}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    style={{
                      transition: "stroke-dashoffset 0.25s ease",
                      filter: `drop-shadow(0 0 8px ${style.color})`,
                    }}
                  />
                </svg>

                {/* TEXT */}
                <div className="text-center">
                  <div className={`text-6xl font-black ${style.text}`}>
                    {animatedScore}
                  </div>
                  <div className="text-sm tracking-widest text-gray-400 mt-2">
                    ATS SCORE
                  </div>
                </div>
              </div>

              <p className="mt-8 text-gray-300 max-w-2xl text-center text-lg">
                {result?.summary || ""}
              </p>
            </div>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            <div className="bg-white/5 border border-white/10 rounded-[32px] p-7">
              <h3 className="text-2xl font-semibold mb-6">Role Detection</h3>
              <div className="text-3xl font-bold text-cyan-300">
                {result?.role || "-"}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[32px] p-7">
              <h3 className="text-2xl font-semibold mb-6">Seniority</h3>
              <div className="text-3xl font-bold text-purple-300">
                {result?.seniority || "-"}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[32px] p-7">
              <h3 className="text-2xl font-semibold mb-6">Experience</h3>
              <div className="text-3xl font-bold text-green-300">
                {result?.experienceYears ?? 0} Years
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[32px] p-7">
              <h3 className="text-2xl font-semibold mb-6">Job Match</h3>
              <div className="text-3xl font-bold text-yellow-300">
                %{result?.jobMatchScore ?? 0}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[32px] p-7">
              <h3 className="text-2xl font-semibold mb-6">Career Insights</h3>

              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Top Role</p>
                  <p className="text-xl font-bold text-cyan-300">
                    {result?.careerInsights?.topRole || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Level</p>
                  <p className="text-xl font-bold text-purple-300">
                    {result?.careerInsights?.level || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Domain</p>
                  <p className="text-xl font-bold text-green-300">
                    {result?.careerInsights?.domain || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[32px] p-7">
              <h3 className="text-2xl font-semibold mb-6">Certificates</h3>

              <div className="flex flex-wrap gap-3">
                {(result?.certificates || []).length ? (
                  result.certificates.map((c: string, i: number) => (
                    <span key={i} className="px-4 py-2 rounded-full bg-cyan-500/15 text-cyan-300">
                      {c}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400">No certificates detected</p>
                )}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[32px] p-7 xl:col-span-2">
              <h3 className="text-2xl font-semibold mb-6">Skills Detected</h3>

              <div className="flex flex-wrap gap-3">
                {(result?.skills || []).map((s: string, i: number) => (
                  <span key={i} className="px-4 py-2 rounded-full bg-green-500/15 text-green-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[32px] p-7">
              <h3 className="text-2xl font-semibold mb-6">Strengths</h3>

              <ul className="space-y-3">
                {(result?.strengths || []).map((s: string, i: number) => (
                  <li key={i} className="text-green-300">✓ {s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[32px] p-7">
              <h3 className="text-2xl font-semibold mb-6">Weaknesses</h3>

              {(result?.weaknesses && result.weaknesses.length > 0) ? (
                <ul className="space-y-3">
                  {result.weaknesses.map((s: string, i: number) => (
                    <li key={i} className="text-red-300">✗ {s}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-300">
                  Great! Your CV looks strong.
                </p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-16 border-t border-white/10 pt-10 pb-12">
        <div className="flex flex-col md:flex-row justify-between gap-10">

          <div>
            <h3 className="text-xl font-bold text-white">
              ATS Resume Analyzer
            </h3>

            <p className="text-gray-400 mt-3 max-w-md">
              AI-powered CV analysis that helps you pass ATS filters,
              improve your resume, and increase interview chances.
            </p>

            <button
              onClick={() => inputRef.current?.click()}
              className="mt-6 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold hover:scale-105 transition"
            >
              Upload Another CV
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-gray-300">
            <a target="_blank" href="https://github.com/UfukDemrel" className="hover:text-white">GitHub</a>
            <a target="_blank" href="https://www.linkedin.com/in/ufuk-demirel-1a6058389/" className="hover:text-white">LinkedIn</a>
            <a target="_blank" href="https://x.com/demrelufuk" className="hover:text-white">Twitter</a>
            <a target="_blank" href="https://www.instagram.com/demrelufuk" className="hover:text-white">Instagram</a>
            <a target="_blank" href="https://www.youtube.com/@demrelufuk" className="hover:text-white">YouTube</a>
            <a target="_blank" href="https://www.udemy.com/user/ufuk-demirel-6/" className="hover:text-white">Udemy</a>
          </div>
        </div>

        <div className="mt-10 flex justify-between text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} ATS Analyzer</p>
          <p className="text-cyan-400">Built for developers & job seekers</p>
        </div>
      </div>
    </div>
  );
}