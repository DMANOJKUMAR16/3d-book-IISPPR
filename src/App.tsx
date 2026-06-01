import BookSection from "./sections/BookSection";
import { Award, ShieldAlert, GraduationCap, Compass } from "lucide-react";

export default function App() {
  return (
    <div className="bg-[#010203] text-slate-100 font-sans antialiased min-h-screen overflow-x-hidden">
      {/* 1. LUXURY FLOATING HEADER */}
      <header className="fixed top-0 inset-x-0 h-16 bg-[#03060b]/90 border-b border-slate-800/80 backdrop-blur-md z-50 px-6 md:px-12 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.8)] text-white">
        <div className="flex items-center space-x-3">
          <span className="bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] bg-clip-text text-transparent font-black text-xl tracking-[0.12em] font-sans">
            IISPPR
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span className="font-mono text-[10px] text-gray-400 tracking-wider hidden sm:inline">
            3D CLINICAL MANUAL SHOWCASE
          </span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden lg:flex items-center space-x-2 bg-black/50 border border-slate-800 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest">
            <Award className="w-3.5 h-3.5 text-[#10b981]" />
            <span className="bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] bg-clip-text text-transparent font-bold">
              Interactive Fellowship Experience
            </span>
          </div>
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest hidden md:inline">
            Scroll to Navigate
          </span>
        </div>
      </header>

      {/* 2. THE MAIN IMMERSIVE JOURNAL EXPERIENCE */}
      <BookSection />
    </div>
  );
}
