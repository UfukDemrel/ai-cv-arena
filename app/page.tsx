import UploadBox from "@/components/UploadBox";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#05070f] text-white relative overflow-hidden flex flex-col items-center">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0">
        <div className="absolute top-[-200px] left-1/2 w-[600px] h-[600px] bg-purple-600/30 blur-[120px]" />
        <div className="absolute bottom-[-200px] right-1/2 w-[600px] h-[600px] bg-cyan-500/20 blur-[120px]" />
      </div>

      {/* HEADER */}
      <div className="relative z-10 text-center mt-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
          AI CV Analyzer
        </h1>

        <p className="text-gray-400 mt-3 text-sm md:text-base">
          Upload your CV and get instant ATS scoring with AI-powered insights
        </p>
      </div>

      {/* UPLOAD */}
      <div className="relative z-10 w-full flex justify-center mt-12 px-4">
        <UploadBox />
      </div>

      {/* FOOTER SMALL BRAND */}
      <div className="relative z-10 mt-auto mb-6 text-gray-600 text-xs">
        Built for modern hiring workflows
      </div>

    </div>
  );
}