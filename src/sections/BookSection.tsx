import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "motion/react";
import * as THREE from "three";
import {
  BookOpen,
  GraduationCap,
  ArrowDown,
  Volume2,
  VolumeX,
  Layers,
  Compass,
  HelpCircle,
  Check,
  ArrowRight,
  Eye,
  Sun,
  Activity,
  MousePointer,
  RotateCcw,
  Sliders,
  Sparkles,
  ClipboardCheck,
  User,
  ShieldCheck,
  Locate,
  Hash,
} from "lucide-react";
import Lighting from "../components/Book/Lighting";
import Book from "../components/Book/Book";

// Sync active visual content states
const SECTION_METADATA = [
  {
    id: 0,
    range: [0.0, 0.15],
    title: "IISPPR Core Manual",
    topic: "WELCOME PORTAL",
    duration: "Academic Vol 1.0",
    description:
      "Welcome to the world-renowned credentialing manual tailored for Olympic sports therapists and elite chiropractors. Open the manual to begin your interactive training.",
    highlights: [
      "Global sports academy credentialing",
      "Master classes by Olympic therapists",
      "Real-world pro-club rotations",
    ],
    stats: { trainees: "5K+", placement: "98.2%", centers: "14+" },
    chapterNum: "Cover",
  },
  {
    id: 1,
    range: [0.15, 0.35],
    title: "Inside Cover Profile",
    topic: "00 / ESTABLISHED FOR EXCELLENCE",
    duration: "Global Entry Portal",
    description:
      "International Institute of Sports Physiotherapy & Rehabilitation. Dive into advanced sports medicine, evidence-based systems, and professional athletic science under Olympic mentors.",
    highlights: [
      "Globally recognized certifications",
      "Evidence-based clinical curricula",
      "Real-world pro-athlete residencies",
    ],
    stats: { alumni: "5K+", placement: "98.2%", centers: "14+" },
    chapterNum: "Intro",
  },
  {
    id: 2,
    range: [0.35, 0.55],
    title: "Biomechanics & Gait Vectors",
    topic: "01 / PIONEERING KINEMATICS",
    duration: "MODULE 1 STUDY",
    description:
      "A comprehensive investigation of human gait, ground forces, joint load vectors, and biological feedback loops. Learn to evaluate sports movements in high resolution.",
    highlights: [
      "3D force plates profiling",
      "High-speed joint kinematic markers",
      "Integrated muscle firing loops",
    ],
    stats: { hours: "160 Hrs", modules: "4 Core", exam: "Practical" },
    chapterNum: "Ch. 1",
  },
  {
    id: 3,
    range: [0.55, 0.75],
    title: "Fellowship Competency",
    topic: "02 / CLINICAL CHECKPOINTS",
    duration: "MODULE 2 STUDY",
    description:
      "The crown jewel fellowship program for ambitious sports therapists. Equips you with deep-dive athletic programming, advanced dry needling, and sports trauma interventions.",
    highlights: [
      "Comprehensive muscle reloading",
      "Dynamic athletic taping master class",
      "Emergency pitch-side trauma drills",
    ],
    stats: { duration: "12 Months", alumni: "1.2K+", ranking: "#1 Asia" },
    chapterNum: "Ch. 2",
  },
  {
    id: 4,
    range: [0.75, 0.9],
    title: "Dry Needling & HVLA Spine Adjusts",
    topic: "03 / CLINICAL INTERVENTIONS",
    duration: "MODULE 3 STUDY",
    description:
      "Become a certified IDN practitioner. Perfect needle placement accuracy along deep muscular triggers to release high-stress neural clusters and optimize tissue lengths. Master core high velocity manipulation adjustments.",
    highlights: [
      "Superficial myofascial grids",
      "Segmental pain pathways modeling",
      "Hands-on needle guidance labs",
    ],
    stats: { labs: "12 Manual", models: "Cadaveric", level: "Advanced" },
    chapterNum: "Ch. 3",
  },
  {
    id: 5,
    range: [0.9, 1.0],
    title: "Admissions & Alumni Portal",
    topic: "04 / SECURE SERVICE DESIGN",
    duration: "Admissions Open",
    description:
      "Ready to accelerate your sports medicine career? Connect with our admissions advisory team to secure your fellowship seat, download syllabus pamphlets, or speak with sports coaches.",
    highlights: [
      "Direct installment tuition plans",
      "Dedicated career placement cell",
      "Global alumni networking groups",
    ],
    stats: { seatsLeft: "5 Seats", startDate: "August 12", intake: "Semi-annual" },
    chapterNum: "Admissions",
  },
];

export default function BookSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bookWheelRef = useRef<HTMLDivElement>(null);

  // Experience state overrides
  const [controlMode, setControlMode] = useState<"scroll" | "manual">("manual");
  const [cameraPreset, setCameraPreset] = useState<"flat" | "cinematic" | "zoom" | "side">(
    "cinematic"
  );
  const [lightingPreset, setLightingPreset] = useState<"cinematic" | "clinical" | "cozy">(
    "cinematic"
  );
  const [mouseParallax, setMouseParallax] = useState(true);
  const [ambientSound, setAmbientSound] = useState(true);

  // Navigation progression calculations
  const [scrollPct, setScrollPct] = useState(0);
  const [manualPct, setManualPct] = useState(0);
  const [smoothPct, setSmoothPct] = useState(0);
  const [hoveringBook, setHoveringBook] = useState(false);
  const [activeSegment, setActiveSegment] = useState(SECTION_METADATA[0]);

  // Joint Kinematics variables (Chapter 1)
  const [jointAngle, setJointAngle] = useState(45);
  const [loadBW, setLoadBW] = useState(1.5);

  // Competency tracker (Chapter 2)
  const [competencies, setCompetencies] = useState<boolean[]>([true, false, false, false]);

  // Dry needling / HVLA spine simulation variables (Chapter 3)
  const [activeSubTab, setActiveSubTab] = useState<"needle" | "hvla">("needle");
  const [selectedMuscleGrid, setSelectedMuscleGrid] = useState<string | null>("Trapezius");
  const [needleLogs, setNeedleLogs] = useState<string>(
    "Needle grid set. Select a trigger point to stimulate biomechanical LTR."
  );
  const [selectedVertebrae, setSelectedVertebrae] = useState<string>("C5");
  const [thrustLogs, setThrustLogs] = useState<string>(
    "Vertebrae calibrated. Press physical trigger to apply precise high-velocity adjustment."
  );
  const [isThrustFx, setIsThrustFx] = useState(false);

  // Fellowship admission certificate variables (Chapter 4)
  const [studentName, setStudentName] = useState("");
  const [licenseID, setLicenseID] = useState("");
  const [specialtyField, setSpecialtyField] = useState("Sports Physiotherapy");
  const [residencyCamp, setResidencyCamp] = useState("Olympic Training Centers");
  const [verificationFormSubmitted, setVerificationFormSubmitted] = useState(false);
  const [diplomaSerial, setDiplomaSerial] = useState("");

  // Sound generator
  const playFlipAudio = () => {
    if (!ambientSound) return;
    try {
      const oscContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const gain = oscContext.createGain();
      const oscNode = oscContext.createOscillator();

      oscNode.type = "triangle";
      oscNode.frequency.setValueAtTime(260, oscContext.currentTime);
      oscNode.frequency.exponentialRampToValueAtTime(8, oscContext.currentTime + 0.16);

      gain.gain.setValueAtTime(0.04, oscContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.0, oscContext.currentTime + 0.16);

      oscNode.connect(gain);
      gain.connect(oscContext.destination);

      oscNode.start();
      oscNode.stop(oscContext.currentTime + 0.18);
    } catch (e) {
      // Safe fail for browser policy restrictions
    }
  };

  // Automatic gorgeous epic entrance transition triggers when page finishes mounting
  useEffect(() => {
    // Start closed at manualPct = 0
    // Wait for the slow majestic 3D rotational camera alignment, then gently open the book to page 0.25 (chapter 1 gateway)
    const timer = setTimeout(() => {
      setManualPct(0.25);
    }, 3800);

    return () => clearTimeout(timer);
  }, []);

  // Tactile screen scrolling over the 3D book flips its pages smoothly
  useEffect(() => {
    const el = bookWheelRef.current;
    if (!el) return;

    const handleWheelOnBook = (e: WheelEvent) => {
      // Direct manual page adjustments with fine-tuned precision
      e.preventDefault();
      const direction = e.deltaY > 0 ? 1 : -1;
      const step = 0.012; // fine-tuned gentle page-flip sensitivity for a slower, smoother feel
      setManualPct((prev) => {
        const next = Math.max(0, Math.min(1, prev + direction * step));
        return next;
      });
    };

    el.addEventListener("wheel", handleWheelOnBook, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheelOnBook);
    };
  }, []);

  // Trapezius pop sound helper
  const playThrustSound = () => {
    if (!ambientSound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Low bass thud + high snap
      const bassOsc = audioCtx.createOscillator();
      const lowGain = audioCtx.createGain();
      bassOsc.type = "sine";
      bassOsc.frequency.setValueAtTime(110, audioCtx.currentTime);
      bassOsc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.22);
      lowGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      lowGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.22);
      bassOsc.connect(lowGain);
      lowGain.connect(audioCtx.destination);
      bassOsc.start();
      bassOsc.stop(audioCtx.currentTime + 0.24);

      const snapNode = audioCtx.createOscillator();
      const snapGain = audioCtx.createGain();
      snapNode.type = "sawtooth";
      snapNode.frequency.setValueAtTime(450, audioCtx.currentTime);
      snapNode.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.08);
      snapGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      snapGain.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 0.08);
      snapNode.connect(snapGain);
      snapGain.connect(audioCtx.destination);
      snapNode.start();
      snapNode.stop(audioCtx.currentTime + 0.09);
    } catch (e) {
      // Safe fail
    }
  };

  // Monitor scroll progression
  useEffect(() => {
    const handleScroll = () => {
      if (controlMode !== "scroll" || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrolled = -rect.top;
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable > 0) {
        const pct = Math.min(Math.max(scrolled / totalScrollable, 0), 1);
        setScrollPct(pct);
        // Automatically sync manualPct in real-time when the user scrolls the overall viewport
        if (!hoveringBook) {
          setManualPct(pct);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [controlMode, hoveringBook]);

  // Set smooth interpolation loop
  useEffect(() => {
    let frameId: number;
    
    // We only want to animate if smoothPct is out of sync with targetPct
    const targetPct = controlMode === "scroll"
      ? (hoveringBook ? manualPct : scrollPct)
      : manualPct;
      
    const tolerance = 0.001;
    if (Math.abs(targetPct - smoothPct) < tolerance) {
      if (smoothPct !== targetPct) {
        setSmoothPct(targetPct);
      }
      return;
    }

    const updateInterpolation = () => {
      setSmoothPct((prev) => {
        const target = controlMode === "scroll"
          ? (hoveringBook ? manualPct : scrollPct)
          : manualPct;
        const delta = target - prev;
        if (Math.abs(delta) < tolerance) {
          return target;
        }
        return prev + delta * 0.14; // highly optimized buttery smooth factor
      });
      frameId = requestAnimationFrame(updateInterpolation);
    };

    frameId = requestAnimationFrame(updateInterpolation);
    return () => cancelAnimationFrame(frameId);
  }, [scrollPct, manualPct, controlMode, hoveringBook, smoothPct]);

  // Keep manualPct synced with scroll progress when not hovering
  useEffect(() => {
    if (!hoveringBook && controlMode === "scroll") {
      setManualPct(scrollPct);
    }
  }, [hoveringBook, scrollPct, controlMode]);

  // Keep active segment in sync
  useEffect(() => {
    const matched =
      SECTION_METADATA.find((m) => smoothPct >= m.range[0] && smoothPct <= m.range[1]) ||
      SECTION_METADATA[SECTION_METADATA.length - 1];

    if (matched && matched.id !== activeSegment.id) {
      setActiveSegment(matched);
      playFlipAudio();
    }
  }, [smoothPct, activeSegment, ambientSound]);

  // Handle section clicking or navigation button triggers
  const handleJumpToPct = (pct: number) => {
    if (controlMode === "scroll" && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const targetY = window.scrollY + rect.top + pct * (rect.height - window.innerHeight);
      window.scrollTo({ top: targetY, behavior: "smooth" });
    } else {
      setManualPct(pct);
    }
  };

  const handleNextPage = () => {
    const currentIndex = SECTION_METADATA.findIndex((m) => m.id === activeSegment.id);
    if (currentIndex < SECTION_METADATA.length - 1) {
      const nextMeta = SECTION_METADATA[currentIndex + 1];
      const targetPct = (nextMeta.range[0] + nextMeta.range[1]) / 2;
      handleJumpToPct(targetPct);
    }
  };

  const handlePrevPage = () => {
    const currentIndex = SECTION_METADATA.findIndex((m) => m.id === activeSegment.id);
    if (currentIndex > 0) {
      const prevMeta = SECTION_METADATA[currentIndex - 1];
      const targetPct = (prevMeta.range[0] + prevMeta.range[1]) / 2;
      handleJumpToPct(targetPct);
    }
  };

  // Kinematics calculations helper
  const quadEMG = Math.round(Math.min(100, jointAngle * 0.65 + loadBW * 12.0));
  const shearNL = (jointAngle * loadBW * 0.16).toFixed(1);
  const isLoadCritical = jointAngle > 85 && loadBW > 2.2;

  // Joint checkboxes
  const handleToggleCompetency = (index: number) => {
    const updated = [...competencies];
    updated[index] = !updated[index];
    setCompetencies(updated);
    playFlipAudio();
  };
  const countChecked = competencies.filter(Boolean).length;
  const progressPercent = Math.round((countChecked / competencies.length) * 100);

  // Dry needle trigger calculations
  const needleTriggers: Record<string, { depth: number; target: string; desc: string }> = {
    Trapezius: {
      depth: 25,
      target: "Superficial spinal accessory pathways",
      desc: "Local twitch feedback successful. Restored cervical posture metrics.",
    },
    Infraspinatus: {
      depth: 20,
      target: "Rotator cuff trigger system C6",
      desc: "Fascial knot dispersed. Gained +14 degrees of internal glenohumeral rotation.",
    },
    "Levator Scapula": {
      depth: 30,
      target: "Deep sub-scapular neural grid",
      desc: "Neuromuscular fatigue released. Immediate pain intensity dropped from scale 8 to 2.",
    },
    Rhomboids: {
      depth: 15,
      target: "Medial scapular thoracic boarder",
      desc: "Twitch response triggered. Rhomboid tension loop restored.",
    },
  };

  const handleNeedleGridFocus = (mName: string) => {
    setSelectedMuscleGrid(mName);
    playFlipAudio();
    const data = needleTriggers[mName];
    if (data) {
      setNeedleLogs(
        `Stimulating ${mName}... Applied depth: ${data.depth}mm gauge. Target: ${data.target}. Outcome: ${data.desc}`
      );
    }
  };

  // Spine thrust simulation
  const handleSpinalThrustApply = () => {
    playThrustSound();
    setIsThrustFx(true);
    setTimeout(() => setIsThrustFx(false), 800);
    const speed = (4.8 + Math.random() * 2.0).toFixed(1);
    const release = Math.round(85 + Math.random() * 14);
    setThrustLogs(
      `SMART-THRUST SUCCESSFUL! Vertebrae ${selectedVertebrae} stabilized. Peak Speed: ${speed} m/s. Depth limit: 3.2mm. Spinal restriction release: ${release}%. Tissue feedback: Optimal.`
    );
  };

  // Admission generator
  const handlePrintEligibility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !licenseID) return;
    playFlipAudio();
    const serial = "IISPPR-" + Math.floor(100000 + Math.random() * 900000);
    setDiplomaSerial(serial);
    setVerificationFormSubmitted(true);
  };

  // Generate a multi-layered SVG-based drifting starfield for infinite cinematic space depth
  const starField = useMemo(() => {
    const layers = [
      { id: "back", count: 45, opacityRange: [0.15, 0.45], sizeRange: [0.6, 1.2] },
      { id: "mid", count: 32, opacityRange: [0.4, 0.72], sizeRange: [1.2, 1.8] },
      { id: "fore", count: 16, opacityRange: [0.55, 0.95], sizeRange: [1.8, 2.8] },
    ];

    return layers.map((layer) => {
      const stars = Array.from({ length: layer.count }, (_, i) => {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]) + layer.sizeRange[0];
        const opacity =
          Math.random() * (layer.opacityRange[1] - layer.opacityRange[0]) + layer.opacityRange[0];
        const pulseDelay = Math.random() * 8;
        const pulseDuration = 4 + Math.random() * 5;

        // Soft visual tint variations: pure white, medical sky-blue, bright warmth
        const tints = ["#FFFFFF", "#FFFFFF", "#E0F2FE", "#FCF8F2"];
        const color =
          layer.id === "fore" ? tints[Math.floor(Math.random() * tints.length)] : "#FFFFFF";

        // Certain foreground stars shimmer as fine-detail 4-pointed sparkle vectors
        const isShimmerStyle = layer.id === "fore" && Math.random() > 0.65;

        return {
          id: `${layer.id}-${i}`,
          x,
          y,
          size,
          opacity,
          pulseDelay: `${pulseDelay}s`,
          pulseDuration: `${pulseDuration}s`,
          color,
          isShimmerStyle,
        };
      });

      return {
        id: layer.id,
        stars,
      };
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${
        controlMode === "scroll" ? "h-[320vh]" : "min-h-screen overflow-x-hidden pb-12"
      } bg-[#010203] text-white select-none scroll-smooth`}
    >
      {/* 3D Atmospheric Depth: Ambient Aurora Glows & Kinetic SVG Starfield */}
      <div className={`${controlMode === "scroll" ? "fixed h-screen" : "absolute h-full"} w-full inset-0 overflow-hidden pointer-events-none z-0`}>
        {/* Soft clinical blue floating aurora */}
        <div className="absolute top-[-10%] left-[15%] w-[45rem] h-[45rem] rounded-full bg-gradient-to-tr from-[#00b4d8] to-transparent opacity-[0.06] blur-[150px] animate-float-slow" />

        {/* Soft biomechanics green floating aurora */}
        <div className="absolute bottom-[-15%] right-[10%] w-[50rem] h-[50rem] rounded-full bg-gradient-to-tr from-[#10b981] to-transparent opacity-[0.05] blur-[160px] animate-float-slower" />

        {/* Soft luxury gold academic floating aurora */}
        <div className="absolute top-[35%] right-[25%] w-[35rem] h-[35rem] rounded-full bg-gradient-to-tr from-[#E0A82E] to-transparent opacity-[0.04] blur-[130px] animate-float-slowest" />

        {/* SVG-based Kinetic Starfield System */}
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full opacity-65"
        >
          {starField.map((layer) => {
            const driftClass =
              layer.id === "back"
                ? "animate-star-drift-back"
                : layer.id === "mid"
                  ? "animate-star-drift-mid"
                  : "animate-star-drift-fore";

            return (
              <g key={layer.id} className={driftClass}>
                {layer.stars.map((star) => {
                  const cx = star.x * 10;
                  const cy = star.y * 10;

                  if (star.isShimmerStyle) {
                    const r = star.size * 1.5;
                    return (
                      <path
                        key={star.id}
                        d={`M ${cx} ${cy - r * 2.2} L ${cx + r * 0.5} ${cy - r * 0.5} L ${cx + r * 2.2} ${cy} L ${cx + r * 0.5} ${cy + r * 0.5} L ${cx} ${cy + r * 2.2} L ${cx - r * 0.5} ${cy + r * 0.5} L ${cx - r * 2.2} ${cy} L ${cx - r * 0.5} ${cy - r * 0.5} Z`}
                        fill={star.color}
                        opacity={star.opacity}
                        className="animate-star-twinkle origin-center"
                        style={
                          {
                            "--twinkle-duration": star.pulseDuration,
                            transformBox: "fill-box",
                            transformOrigin: "center",
                            animationDelay: star.pulseDelay,
                          } as React.CSSProperties
                        }
                      />
                    );
                  }

                  return (
                    <circle
                      key={star.id}
                      cx={cx}
                      cy={cy}
                      r={star.size}
                      fill={star.color}
                      opacity={star.opacity}
                      className="animate-star-twinkle origin-center"
                      style={
                        {
                          "--twinkle-duration": star.pulseDuration,
                          transformBox: "fill-box",
                          transformOrigin: "center",
                          animationDelay: star.pulseDelay,
                        } as React.CSSProperties
                      }
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Premium Cinematic Atmospheric Background Overlay */}
      <div className={`${controlMode === "scroll" ? "fixed h-screen" : "absolute h-full"} w-full inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(1,2,3,0.96)_95%)] pointer-events-none z-10`} />

      {/* Grid Alignment Matrix Lines with radial fade for incredible depth */}
      <div className={`${controlMode === "scroll" ? "fixed h-screen" : "absolute h-full"} w-full inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] pointer-events-none z-10 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]`} />

      {/* Classy, Calm, and Breathtaking Centered Celestial Body (Upgraded Massive Supernova & Golden Ringed Orbital Engine) */}
      <div className={`${controlMode === "scroll" ? "fixed top-1/2" : "absolute top-1/2"} left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] sm:w-[48rem] sm:h-[48rem] md:w-[68rem] md:h-[68rem] lg:w-[86rem] lg:h-[86rem] xl:w-[100rem] xl:h-[100rem] opacity-[0.62] transition-opacity duration-1000 mix-blend-screen pointer-events-none z-12 select-none animate-celestial-pulse`}>
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Highly Radiant Volumetric Stellar Glow with richer colors */}
            <radialGradient id="nebula-core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.95" />
              <stop offset="15%" stopColor="#FFF2C6" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#E0A82E" stopOpacity="0.75" />
              <stop offset="55%" stopColor="#00b4d8" stopOpacity="0.4" />
              <stop offset="78%" stopColor="#10b981" stopOpacity="0.18" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            {/* Glowing active core emitter */}
            <radialGradient id="star-emitter" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="30%" stopColor="#FFFDF4" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#E0A82E" stopOpacity="0.75" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            {/* Radiant golden metallic layout metric rings */}
            <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#00b4d8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#E0A82E" stopOpacity="0.75" />
            </linearGradient>
          </defs>

          {/* Massively Expanded Giant Stellar Halo */}
          <circle cx="200" cy="200" r="195" fill="url(#nebula-core-glow)" />

          {/* Kinetic Precision Metric System Overlay Rings */}
          <g className="animate-celestial-rotate origin-center">
            {/* Primary outer orbital ring */}
            <circle
              cx="200"
              cy="200"
              r="140"
              stroke="url(#ring-grad)"
              strokeWidth="0.8"
              strokeDasharray="4 15"
              opacity="0.65"
            />

            {/* Fine academic tick ring */}
            <circle
              cx="200"
              cy="200"
              r="120"
              stroke="#E0A82E"
              strokeWidth="0.5"
              strokeDasharray="1 9"
              opacity="0.55"
            />

            {/* Core alignment diagnostic circle */}
            <circle
              cx="200"
              cy="200"
              r="85"
              stroke="#00b4d8"
              strokeWidth="0.4"
              strokeDasharray="50 10"
              opacity="0.4"
            />

            {/* Spectacular luxury academic crosshairs flare wings */}
            <path
              d="M 200 15 L 204 150 L 385 200 L 204 250 L 200 385 L 196 250 L 15 200 L 196 150 Z"
              fill="url(#ring-grad)"
              opacity="0.25"
            />

            {/* Diagonal tracking line guides */}
            <path
              d="M 200 200 L 305 305 M 200 200 L 95 95 M 200 200 L 305 95 M 200 200 L 95 305"
              stroke="#00b4d8"
              strokeWidth="0.5"
              strokeDasharray="2 6"
              opacity="0.38"
            />

            {/* Highlighted orientation pointers */}
            <circle cx="200" cy="50" r="2.5" fill="#FFF9E6" opacity="0.9" />
            <circle cx="200" cy="350" r="2.5" fill="#FFF9E6" opacity="0.9" />
            <circle cx="50" cy="200" r="2.5" fill="#FFF9E6" opacity="0.9" />
            <circle cx="350" cy="200" r="2.5" fill="#FFF9E6" opacity="0.9" />
          </g>

          {/* Opposite Rotating Energy Loop Layer */}
          <g
            className="origin-center"
            style={{
              animation: "celestial-slow-rotate 120s linear infinite reverse",
            }}
          >
            <circle
              cx="200"
              cy="200"
              r="105"
              stroke="#00b4d8"
              strokeWidth="0.7"
              strokeDasharray="15 8"
              opacity="0.5"
            />
            <circle
              cx="200"
              cy="200"
              r="76"
              stroke="#10b981"
              strokeWidth="0.5"
              strokeDasharray="3 3"
              opacity="0.45"
            />
          </g>

          {/* Heart Star Core Emitter */}
          <circle cx="200" cy="200" r="55" fill="url(#star-emitter)" />
          <circle
            cx="200"
            cy="200"
            r="18"
            fill="#FFFFFF"
            className="animate-pulse"
            style={{ animationDuration: "4s" }}
          />
        </svg>
      </div>

      {/* STICKY/FIXED MAIN VIEWPORT DECK CONTAINER - Fits exactly 100vh for pristine first frame */}
      <div
        className={`${controlMode === "scroll" ? "fixed block" : "relative"} top-0 left-0 w-full h-screen overflow-hidden px-2 md:px-6 pt-15 sm:pt-17 pb-2.5 md:pb-3.5 z-20 flex flex-col justify-between`}
      >
        {/* TOP DECK BANNER COMPONENT */}
        <header className="flex flex-col lg:flex-row items-center justify-between border border-slate-800/80 bg-[#03060b]/95 shadow-[0_8px_32px_rgba(0,0,0,0.85)] backdrop-blur-lg p-1 md:p-1.5 rounded-xl gap-1.5 lg:gap-3 z-40 select-none w-full">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-md bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] p-[1px]">
              <div className="bg-[#03060b] p-1 rounded-md">
                <Activity className="w-3.5 h-3.5 text-[#10b981] animate-pulse" />
              </div>
            </div>
            <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider text-white">
              <span className="hidden sm:inline">Interactive 3D Viewport </span>Controls &
              Calibration
            </span>
          </div>

          {/* DYNAMIC METRIC STATUS FLOATER */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 md:gap-3 text-[9px] md:text-[10px] font-mono w-full lg:w-auto">
            {/* Camera Options selection */}
            <div className="flex items-center space-x-1 bg-black/80 border border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.5)] rounded-lg p-0.5">
              <span
                className="text-gray-300 font-bold px-1.5 flex items-center gap-1"
                title="Camera Preset"
              >
                <Eye className="w-3.5 h-3.5 text-[#00b4d8]" />{" "}
                <span className="hidden sm:inline text-gray-200">Cam:</span>
              </span>
              {(["flat", "cinematic", "zoom", "side"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setCameraPreset(mode);
                    playFlipAudio();
                  }}
                  className={`px-2 py-1 rounded cursor-pointer text-[8px] md:text-[9px] font-extrabold tracking-wide uppercase transition-all duration-150 ${
                    cameraPreset === mode
                      ? "bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] text-black font-black shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {mode === "cinematic" ? "cine" : mode}
                </button>
              ))}
            </div>

            {/* Lighting Selection */}
            <div className="flex items-center space-x-1 bg-black/80 border border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.5)] rounded-lg p-0.5">
              <span
                className="text-gray-300 font-bold px-1.5 flex items-center gap-1"
                title="Lighting Preset"
              >
                <Sun className="w-3.5 h-3.5 text-[#10b981]" />{" "}
                <span className="hidden sm:inline text-gray-200">Light:</span>
              </span>
              {(["cinematic", "clinical", "cozy"] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => {
                    setLightingPreset(style);
                    playFlipAudio();
                  }}
                  className={`px-2 py-1 rounded cursor-pointer text-[8px] md:text-[9px] font-extrabold tracking-wide uppercase transition-all duration-150 ${
                    lightingPreset === style
                      ? "bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] text-black font-black shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {style === "cinematic" ? "cine" : style}
                </button>
              ))}
            </div>

            {/* Mode selection (Scroll vs manual) */}
            <div className="flex items-center space-x-1 bg-black/80 border border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.5)] rounded-lg p-0.5">
              <span
                className="text-gray-300 font-bold px-1.5 flex items-center gap-1"
                title="Control Mode"
              >
                <Sliders className="w-3.5 h-3.5 text-[#10b981]" />{" "}
                <span className="hidden sm:inline text-gray-200">Mode:</span>
              </span>
              <button
                onClick={() => {
                  setControlMode("scroll");
                  playFlipAudio();
                }}
                className={`px-2 py-1 rounded cursor-pointer text-[8px] md:text-[9px] font-extrabold tracking-wide uppercase transition-all duration-150 ${
                  controlMode === "scroll"
                    ? "bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] text-black shadow-[0_0_8px_rgba(16,185,129,0.3)] font-black"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                Scroll
              </button>
              <button
                onClick={() => {
                  setControlMode("manual");
                  playFlipAudio();
                }}
                className={`px-2 py-1 rounded cursor-pointer text-[8px] md:text-[9px] font-extrabold tracking-wide uppercase transition-all duration-150 ${
                  controlMode === "manual"
                    ? "bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] text-black shadow-[0_0_8px_rgba(16,185,129,0.3)] font-black"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                Manual
              </button>
            </div>

            {/* Mouse Parallax selector */}
            <div className="flex items-center bg-[#03060b] border border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.5)] rounded-lg p-0.5">
              <button
                onClick={() => {
                  setMouseParallax(!mouseParallax);
                  playFlipAudio();
                }}
                className="px-2.5 py-1 rounded cursor-pointer text-[8px] md:text-[9px] text-gray-200 hover:text-white hover:bg-white/10 flex items-center gap-1.5 font-extrabold transition-all duration-150 uppercase tracking-wide"
              >
                <span
                  className={`w-2 h-2 rounded-full ${mouseParallax ? "bg-green-400 shadow-[0_0_6px_#22c55e]" : "bg-red-500 shadow-[0_0_6px_#ef4444]"}`}
                />
                <span>Parallax: {mouseParallax ? "On" : "Off"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* MAIN BODY AREA WITH DUAL PANELS & 3D SYSTEM */}
        <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-6 items-center my-1.5 md:my-3 lg:my-4 overflow-hidden relative">
          {/* THE MIDDLE / BACKGROUND 3D CANVAS BOARD */}
          <div
            ref={bookWheelRef}
            onMouseEnter={() => setHoveringBook(true)}
            onMouseLeave={() => setHoveringBook(false)}
            className="col-span-1 lg:col-span-8 h-[40vh] md:h-[46vh] lg:h-full rounded-2xl relative w-full pointer-events-auto overflow-hidden"
          >
            {/* Subtle table desk texture visualizer block below the book group */}
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#010203]/40 to-transparent border-t border-slate-800/80 pointer-events-none" />

            <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto">
              <Canvas
                shadows={{ type: THREE.PCFShadowMap }}
                camera={{ position: [0, 0, 3.4], fov: 40 }}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                dpr={[1.5, 3]}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                style={{ pointerEvents: "auto" }}
              >
                <Lighting preset={lightingPreset} />
                <Book
                  scrollProgress={smoothPct}
                  cameraPreset={cameraPreset}
                  mouseParallax={mouseParallax}
                  onSwipe={(direction) => {
                    if (direction === "next") {
                      handleNextPage();
                    } else {
                      handlePrevPage();
                    }
                  }}
                />
              </Canvas>
            </div>

            {/* Ambient sound trigger */}
            <div className="absolute right-4 bottom-4 z-20 flex items-center space-x-2">
              <div className="bg-black/95 border border-slate-800 backdrop-blur-md rounded-xl p-1 px-2.5 text-[9px] font-mono text-gray-200 uppercase flex items-center gap-1.5 shadow-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                Preserve Vector Quality [HD]
              </div>
            </div>

            {/* TITLE WATERMARK CENTERED WHEN CLOSED */}
            <AnimatePresence>
              {smoothPct < 0.15 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="absolute left-1/2 top-[20%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-30 w-full max-w-lg px-4"
                >
                  <h1 className="text-3xl md:text-5xl font-black tracking-[0.16em] bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] bg-clip-text text-transparent drop-shadow-[0_4px_14px_rgba(0,0,0,0.85)] uppercase font-sans">
                    IISPPR
                  </h1>
                  <p className="font-mono text-[9px] md:text-xs text-gray-400 tracking-[0.3em] uppercase mt-2.5 font-bold">
                    Olympic Clinical Manual Showcase
                  </p>
                  <div className="w-12 h-1 bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] mx-auto mt-3 rounded-full animate-pulse" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* THE RIGHT SIDEBAR: Progress & Chapter Selector Dashboard */}
          <div className="col-span-1 lg:col-span-4 flex flex-col pointer-events-auto z-30 font-sans h-auto justify-center">
            <div className="w-full flex flex-col space-y-3.5 bg-[#03060b]/35 border border-slate-800/40 backdrop-blur-md p-4 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.65)] text-slate-100">
              {/* Overall Progress Stat Bar */}
              <div className="space-y-1 pb-1.5 border-b border-slate-800/60">
                <div className="flex justify-between items-center text-[10px] font-mono tracking-wider font-extrabold text-gray-400">
                  <span>FELLOWSHIP DIRECTORY PROGRESS</span>
                  <span className="text-[#10b981]">{Math.round(smoothPct * 100)}%</span>
                </div>
                {/* Custom Gradient Progress Bar */}
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div
                    className="h-full bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] transition-all duration-300"
                    style={{ width: `${smoothPct * 100}%` }}
                  />
                </div>
              </div>

              {/* Chapter index selector title */}
              <div className="flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5 text-[#00b4d8] animate-spin" style={{ animationDuration: "12s" }} />
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-[#E0A82E] uppercase">
                  Interactive Chapter Index
                </span>
              </div>

              {/* Interactive Chapters List */}
              <div className="space-y-2">
                {SECTION_METADATA.map((meta, idx) => {
                  const isActive = activeSegment.id === idx;
                  const isCompleted = idx < activeSegment.id;
                  const midPct = (meta.range[0] + meta.range[1]) / 2;

                  return (
                    <button
                      key={meta.id}
                      onClick={() => handleJumpToPct(midPct)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                        isActive
                          ? "bg-[#03060b]/70 border-[#10b981]/50 shadow-[0_4px_16px_rgba(16,185,129,0.12)] text-white"
                          : "bg-black/20 border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/10 text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className={`font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                          isActive
                            ? "bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30"
                            : "bg-slate-950 text-gray-500"
                        }`}>
                          0{idx + 1}
                        </span>
                        <div className="space-y-0.5">
                          <span className={`block font-bold tracking-tight ${isActive ? "text-white" : "text-gray-300"}`}>
                            {meta.title}
                          </span>
                          <span className="block text-[8px] font-mono uppercase text-gray-500">
                            {meta.chapterNum} • {meta.topic.replace(/^\d+\s*\/\s*/, "")}
                          </span>
                        </div>
                      </div>

                      {/* Right Indicator Status Icon */}
                      <div className="shrink-0">
                        {isCompleted ? (
                          <div className="bg-[#10b981]/15 text-[#10b981] p-0.5 rounded-full border border-[#10b981]/25">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : isActive ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#E0A82E] animate-pulse" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Section Diagnostic Meta */}
              <div className="bg-black/35 border border-slate-900/50 p-2.5 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[8px] font-mono text-gray-500">
                  <span>RESIDENCY STATUS</span>
                  <span className="text-[#00b4d8] font-bold">MONITOR ACTIVE</span>
                </div>
                <span className="block text-[9px] font-mono text-gray-400 italic">
                  *Flip chapters manually above or through bottom medical console guides.
                </span>
              </div>
            </div>
          </div>

          {/* HIDDEN OLD SECTION CONTAINER TO PREVENT SYNTAX BRACKET CONFLICTS */}
          <div className="hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSegment.id}
                initial={{ opacity: 0, x: 25, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -25, filter: "blur(6px)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full h-full flex flex-col space-y-3 bg-[#03060b]/30 border border-slate-800/50 backdrop-blur-md p-4 md:p-5 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.65)] max-h-full lg:max-h-[82vh] overflow-y-auto text-slate-100"
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono tracking-widest text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/25 px-2.5 py-1 rounded font-bold">
                      {activeSegment.duration}
                    </span>
                    <span className="block text-[9px] font-mono tracking-wider font-bold text-gray-400 uppercase pt-2">
                      {activeSegment.topic}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-bold text-gray-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                    0{activeSegment.id + 1}
                  </span>
                </div>

                {/* Main page details */}
                <div className="space-y-2">
                  <h3 className="text-lg md:text-xl font-extrabold tracking-tight bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] bg-clip-text text-transparent font-sans leading-tight">
                    {activeSegment.title}
                  </h3>
                  <p className="text-[11px] text-gray-300 leading-relaxed font-sans pt-1">
                    {activeSegment.description}
                  </p>
                </div>

                {/* Highlights List */}
                {activeSegment.highlights.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <h4 className="text-[9px] uppercase font-mono tracking-widest text-gray-500 font-bold">
                      MANUAL CHECKINGS
                    </h4>
                    <div className="space-y-1.5">
                      {activeSegment.highlights.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start space-x-2 text-[10px] text-gray-300 font-mono"
                        >
                          <Check className="w-3.5 h-3.5 text-[#10b981] mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DYNAMIC INTERACTIVE SIMULATORS WIDGETS */}
                <div className="border-t border-slate-800 pt-3.5">
                  {/* HERO PORTAL CARD SIMULATOR (id: 0 or 1) */}
                  {(activeSegment.id === 0 || activeSegment.id === 1) && (
                    <div className="space-y-3 bg-black/40 border border-slate-800 rounded-xl p-3.5 text-center text-white shadow-md">
                      <GraduationCap className="w-8 h-8 text-[#10b981] mx-auto animate-bounce" />
                      <div>
                        <h4 className="text-xs font-bold bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] bg-clip-text text-transparent font-mono uppercase tracking-wider">
                          IISPPR Fellowship Matrix
                        </h4>
                        <p className="text-[9.5px] text-gray-300 leading-relaxed mt-1 font-mono">
                          You are currently viewing the introductory gateway. Flip to Chapter 1, 2,
                          or 3 to inspect live diagnostics!
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-t border-slate-800 pt-2 text-center text-white">
                        <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                          <span className="block text-[8px] text-gray-400 font-mono">ALUMNI</span>
                          <span className="text-xs font-bold font-sans text-white">5,000+</span>
                        </div>
                        <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                          <span className="block text-[8px] text-gray-400 font-mono">
                            STABILITY
                          </span>
                          <span className="text-xs font-bold font-sans text-white">99.8%</span>
                        </div>
                        <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                          <span className="block text-[8px] text-gray-400 font-mono">RANK</span>
                          <span className="text-xs font-bold font-sans text-[#E0A82E]">#01</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* KINEMATICS SIMULATOR (id: 2 - Ch. 1) */}
                  {activeSegment.id === 2 && (
                    <div className="bg-black/40 border border-slate-800 rounded-xl p-4 space-y-3.5 shadow-xl font-mono text-white">
                      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                        <Activity className="w-4 h-4 text-[#10b981]" />
                        <span className="bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] bg-clip-text text-transparent text-[10px] font-bold uppercase tracking-wide">
                          Gait & Muscle Vector Engine
                        </span>
                      </div>

                      {/* Flexion Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-gray-300">
                          <span>Joint Flexion Angle</span>
                          <span className="text-[#10b981] font-bold">{jointAngle}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="135"
                          value={jointAngle}
                          onChange={(e) => {
                            setJointAngle(parseInt(e.target.value));
                            playFlipAudio();
                          }}
                          className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-[#10b981]"
                        />
                      </div>

                      {/* Force Plate Weight multiplier Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-gray-300">
                          <span>Ground Force Vector</span>
                          <span className="text-[#10b981] font-bold">{loadBW}x BW</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="3.5"
                          step="0.1"
                          value={loadBW}
                          onChange={(e) => {
                            setLoadBW(parseFloat(e.target.value));
                            playFlipAudio();
                          }}
                          className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-[#10b981]"
                        />
                      </div>

                      {/* Computed telemetry calculations */}
                      <div className="grid grid-cols-2 gap-2 text-[9.5px] pt-1">
                        <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-0.5">
                          <span className="text-gray-400 text-[8px] block">
                            ACL PATENCY STRESS:
                          </span>
                          <span
                            className={`font-bold ${isLoadCritical ? "text-red-400 animate-pulse" : "text-[#10b981]"}`}
                          >
                            {shearNL} Nm
                          </span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-0.5">
                          <span className="text-gray-400 text-[8px] block">QUADRICEPS EMG:</span>
                          <span className="font-bold text-white">{quadEMG}%</span>
                        </div>
                      </div>

                      {/* Critical warning alerts */}
                      <AnimatePresence>
                        {isLoadCritical && (
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-red-950/70 border border-red-500/30 text-red-300 rounded-lg p-2 text-center text-[9px] font-bold leading-tight"
                          >
                            ⚠️ CRITICAL VECTOR: HIGH SHEAR JOINT STRESS COMPRESSING ANTERIOR
                            CRUCIATE REFLEXES!
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* INTERACTIVE COMPLETION CHECKPOINTS (id: 3 - Ch. 2) */}
                  {activeSegment.id === 3 && (
                    <div className="bg-black/40 border border-slate-800 rounded-xl p-4 space-y-3.5 shadow-xl font-mono text-white">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] bg-clip-text text-transparent text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                          <ClipboardCheck className="w-4 h-4 text-[#10b981]" /> Trainee Checklist
                        </span>
                        <span className="text-[10px] bg-[#10b981]/10 border border-[#10b981]/30 px-2 py-0.5 text-[#10b981] rounded font-bold">
                          {progressPercent}% Met
                        </span>
                      </div>

                      <div className="space-y-2">
                        {[
                          "Athletic Rigid K-Taping (WK-1)",
                          "Spinal Joint HVLA Mobilizations (WK-4)",
                          "Superficial Needling Grids (WK-7)",
                          "Pitch-Side Emergency Airway Drills (WK-11)",
                        ].map((label, idx) => (
                          <label
                            key={idx}
                            className="flex items-center space-x-2.5 bg-slate-950 hover:bg-slate-950/80 p-2 rounded border border-slate-800 text-[10px] text-gray-300 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={competencies[idx]}
                              onChange={() => handleToggleCompetency(idx)}
                              className="accent-[#10b981] rounded block"
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>

                      {/* Custom feedback string based on competencies matched */}
                      <p className="text-[9px] text-gray-300 text-center italic mt-1 leading-relaxed">
                        {progressPercent === 100
                          ? "Mastery achieved! Clinical requirements for Orthopaedic Fellowship fully certified."
                          : "Requirements: Check off essential trainees modules to generate completion report."}
                      </p>
                    </div>
                  )}

                  {/* INTERACTIVE DRY NEEDLING & SPIN THRUST (id: 4 - Ch. 3) */}
                  {activeSegment.id === 4 && (
                    <div className="bg-black/40 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl font-mono text-white">
                      {/* Sub tab toggler inside the page panel */}
                      <div className="flex bg-slate-950 border border-slate-800/80 rounded-lg p-1 text-[9.5px] font-bold">
                        <button
                          onClick={() => {
                            setActiveSubTab("needle");
                            playFlipAudio();
                          }}
                          className={`flex-1 py-1.5 rounded cursor-pointer ${
                            activeSubTab === "needle"
                              ? "bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] text-black font-extrabold shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                              : "text-gray-400"
                          }`}
                        >
                          Dry Needling Grid
                        </button>
                        <button
                          onClick={() => {
                            setActiveSubTab("hvla");
                            playFlipAudio();
                          }}
                          className={`flex-1 py-1.5 rounded cursor-pointer ${
                            activeSubTab === "hvla"
                              ? "bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] text-black font-extrabold shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                              : "text-gray-400"
                          }`}
                        >
                          HVLA Spinal Thrust
                        </button>
                      </div>

                      {activeSubTab === "needle" ? (
                        <div className="space-y-3">
                          <span className="block text-[8.5px] text-gray-400 uppercase">
                            Target Trigger Point (Tap to needle-insert)
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {["Trapezius", "Infraspinatus", "Levator Scapula", "Rhomboids"].map(
                              (m) => (
                                <button
                                  key={m}
                                  onClick={() => handleNeedleGridFocus(m)}
                                  className={`p-2 rounded text-[10px] text-center border font-bold cursor-pointer transition-all ${
                                    selectedMuscleGrid === m
                                      ? "bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] text-black shadow-[0_0_8px_rgba(16,185,129,0.2)] border-transparent"
                                      : "bg-slate-950/40 border-slate-800 hover:border-white/20 text-gray-300"
                                  }`}
                                >
                                  {m}
                                </button>
                              )
                            )}
                          </div>

                          {/* Live simulator logs output */}
                          <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg text-[9.5px] leading-relaxed text-[#10b981] min-h-[50px] font-bold">
                            {needleLogs}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <span className="block text-[8.5px] text-gray-400 uppercase">
                            Calibrate Target Vertebrae Focus
                          </span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {["C5", "T2", "L4"].map((block) => (
                              <button
                                key={block}
                                onClick={() => {
                                  setSelectedVertebrae(block);
                                  playFlipAudio();
                                  setThrustLogs(
                                    `Vertebrae calibrated to ${block}. Position aligned. Prepared to apply manipulation speed.`
                                  );
                                }}
                                className={`p-1.5 text-[9.5px] text-center border font-bold cursor-pointer rounded ${
                                  selectedVertebrae === block
                                    ? "bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E]/30 text-white border-transparent"
                                    : "bg-slate-950/40 border-slate-800 text-gray-400"
                                }`}
                              >
                                {block}
                              </button>
                            ))}
                          </div>

                          {/* Dynamic Thrust Button Trigger */}
                          <button
                            onClick={handleSpinalThrustApply}
                            className="w-full bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] text-black font-extrabold text-[10px] tracking-widest uppercase p-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 px-4 shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-lg"
                          >
                            <Locate className="w-3.5 h-3.5" /> APPLY ADJUSTMENT THRUST
                          </button>

                          {/* Live action logs output */}
                          <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg text-[9.5px] leading-relaxed text-[#10b981] min-h-[50px] font-bold">
                            {thrustLogs}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FELLOWSHIP ADMISSION FORMS (id: 5 - Chapter 4) */}
                  {activeSegment.id === 5 && (
                    <div className="space-y-3 text-slate-100">
                      {!verificationFormSubmitted ? (
                        <form
                          onSubmit={handlePrintEligibility}
                          className="bg-[#03060b]/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-[0_12px_45px_rgba(0,0,0,0.8)] font-mono"
                        >
                          <div className="text-center border-b border-slate-800 pb-2">
                            <span className="text-[10px] font-bold bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] bg-clip-text text-transparent uppercase tracking-wider">
                              Diploma Registration Intake
                            </span>
                          </div>

                          {/* Full Name field */}
                          <div className="space-y-1">
                            <label className="text-[8px] text-gray-400 uppercase block font-bold">
                              Clinician Full Name
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Dr. Manoj Kumar"
                              value={studentName}
                              onChange={(e) => setStudentName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs p-2 text-white focus:outline-none focus:border-[#10b981]"
                            />
                          </div>

                          {/* Professional ID License field */}
                          <div className="space-y-1">
                            <label className="text-[8px] text-gray-400 uppercase block font-bold">
                              LPT License / Board ID
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="LPT-74839-IND"
                              value={licenseID}
                              onChange={(e) => setLicenseID(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs p-2 text-white focus:outline-none focus:border-[#10b981]"
                            />
                          </div>

                          {/* Specialization selection */}
                          <div className="space-y-1">
                            <label className="text-[8px] text-gray-400 uppercase block font-bold">
                              Specialization Wing
                            </label>
                            <select
                              value={specialtyField}
                              onChange={(e) => setSpecialtyField(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs p-2 text-white focus:outline-none focus:border-[#10b981]"
                            >
                              <option value="Sports Physiotherapy">
                                Sports Physiotherapy (FSR)
                              </option>
                              <option value="Osteopathic Adjustments">
                                Osteopathic Adjustments
                              </option>
                              <option value="Clinical Kinematics">
                                Clinical Kinematics (gait force)
                              </option>
                            </select>
                          </div>

                          {/* Primary residency choice */}
                          <div className="space-y-1">
                            <label className="text-[8px] text-gray-400 uppercase block font-bold">
                              Residency Rotation
                            </label>
                            <select
                              value={residencyCamp}
                              onChange={(e) => setResidencyCamp(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs p-2 text-white focus:outline-none focus:border-[#10b981]"
                            >
                              <option value="Olympic Training Centers">
                                Olympic Training Centers
                              </option>
                              <option value="Premier League Football Academy">
                                Premier League Football Academy
                              </option>
                              <option value="Elite Sports Rehabilitation Clinics">
                                Elite Sports Rehabilitation Clinics
                              </option>
                            </select>
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] text-black font-extrabold text-[10px] tracking-widest uppercase p-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 mt-1 shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:shadow-lg"
                          >
                            VERIFY & PRINT CERTIFICATE <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      ) : (
                        <div className="bg-[#03060b]/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-[0_12px_45px_rgba(0,0,0,0.8)] font-mono text-center">
                          <Check className="w-8 h-8 text-[#10b981] mx-auto animate-pulse" />
                          <h4 className="text-xs font-bold text-[#10b981] uppercase tracking-widest">
                            VERIFIED CERTIFIED
                          </h4>
                          <p className="text-[10px] text-gray-400 leading-relaxed">
                            Form matching verified board licensing index. Eligibility certificate
                            ready for print setup.
                          </p>
                          <button
                            onClick={() => {
                              setVerificationFormSubmitted(false);
                              playFlipAudio();
                            }}
                            className="text-[9px] hover:text-[#E0A82E] text-[#10b981] underline uppercase block mx-auto cursor-pointer font-bold"
                          >
                            Create New Entry Profile
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Foot indicators */}
                <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-[8px] text-gray-500 font-mono">
                  <span>SECURE MD-DECK PROTOCOL</span>
                  <span>SYSTEM FEEDBACK: 99.9% ACCURACY</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM HUD CONTROLLER: Prev/Next chevron flip buttons, sound controls, and story progress bars */}
        <footer className="flex flex-col md:flex-row items-center justify-between border border-slate-800 bg-[#03060b]/90 backdrop-blur-md p-1 px-2 sm:p-1.5 rounded-xl z-40 select-none gap-1.5">
          {/* Previous/Next gold-rim click page flips */}
          <div className="flex items-center space-x-2 text-[10px] font-mono">
            <button
              onClick={handlePrevPage}
              disabled={activeSegment.id === 0}
              className={`px-2.5 py-1 rounded-md border text-[9px] md:text-[10px] uppercase font-bold tracking-wider cursor-pointer flex items-center gap-1 transition-all ${
                activeSegment.id === 0
                  ? "border-white/5 text-gray-500 cursor-not-allowed bg-transparent"
                  : "border-slate-800 text-white bg-slate-900/60 hover:border-[#10b981] hover:text-[#10b981]"
              }`}
            >
              ← Prev
            </button>

            {/* Pagination Bullet Indicators */}
            <div className="flex items-center space-x-1.5 px-1.5">
              {SECTION_METADATA.map((meta, idx) => {
                const isActive = activeSegment.id === idx;
                const midPct = (meta.range[0] + meta.range[1]) / 2;
                return (
                  <button
                    key={meta.id}
                    onClick={() => handleJumpToPct(midPct)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      isActive
                        ? "w-5 bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                        : "w-1.5 bg-gray-600 hover:bg-gray-400"
                    }`}
                    title={meta.chapterNum}
                  />
                );
              })}
            </div>

            <button
              onClick={handleNextPage}
              disabled={activeSegment.id === SECTION_METADATA.length - 1}
              className={`px-2.5 py-1 rounded-md border text-[9px] md:text-[10px] uppercase font-bold tracking-wider cursor-pointer flex items-center gap-1 transition-all ${
                activeSegment.id === SECTION_METADATA.length - 1
                  ? "border-white/5 text-gray-500 cursor-not-allowed bg-transparent"
                  : "border-[#10b981] text-[#10b981] bg-[#10b981]/10 hover:bg-[#10b981] hover:text-black hover:font-bold"
              }`}
            >
              Next →
            </button>
          </div>

          {/* Scrolling instructions HUD guide helper banner */}
          <div className="flex items-center space-x-1.5 text-[8px] md:text-[9px] font-mono border border-slate-800/60 bg-slate-950/80 px-2.5 py-1 rounded-lg text-gray-400 max-w-xs md:max-w-md shadow-inner text-center md:text-left">
            <HelpCircle className="w-3.5 h-3.5 text-[#00b4d8] shrink-0 animate-pulse" />
            <span className="leading-snug">
              <strong className="text-gray-200 mr-0.5 font-extrabold uppercase">Scroll on book</strong> to flip. <strong className="text-gray-200 mx-0.5 font-extrabold uppercase">Scroll on right card</strong> to read details below.
            </span>
          </div>

          {/* Sound Controls & Global Cover Returner */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAmbientSound(!ambientSound)}
              className={`flex items-center justify-center w-7.5 h-7.5 border rounded-lg backdrop-blur-md transition-all cursor-pointer ${
                ambientSound
                  ? "bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981]"
                  : "bg-slate-950/40 border-slate-800 text-gray-400"
              }`}
              title={
                ambientSound
                  ? "Mute interactive audio turn ticks"
                  : "Unmute interactive audio turn ticks"
              }
            >
              {ambientSound ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={() => handleJumpToPct(0.0)}
              className="px-2.5 py-1 text-[9px] text-white hover:text-[#10b981] font-mono border border-slate-800 rounded-lg bg-slate-900/40 hover:bg-slate-950/40 hover:border-[#10b981]/40 transition-all uppercase tracking-wider font-bold cursor-pointer"
            >
              Close Cover
            </button>
          </div>
        </footer>
      </div>

      {/* ACTIVE MODULE DEEP STUDY WORKSTATION PANELS - sit below the first-frame fold */}
      <div className={`w-full max-w-7xl mx-auto px-4 md:px-8 z-40 relative transition-all duration-300 ${
        controlMode === "scroll" ? "mt-[102vh] pb-32 mb-16" : "mt-8 pb-20 mb-10"
      }`}>
        <AnimatePresence mode="wait">
            <motion.div
              key={activeSegment.id}
              initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#03060b]/45 border border-slate-800/60 backdrop-blur-md p-6 md:p-10 rounded-3xl text-slate-100 shadow-[0_24px_60px_rgba(0,0,0,0.85)]"
            >
              {/* Left Column: Title, description, checklists and commentary */}
              <div className="col-span-1 lg:col-span-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-[10.5px] font-mono tracking-widest text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/25 px-3 py-1.5 rounded font-bold">
                        {activeSegment.duration}
                      </span>
                      <span className="text-[11px] font-mono tracking-wider font-bold text-gray-400 uppercase">
                        {activeSegment.topic}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#E0A82E] bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
                      MODULE 0{activeSegment.id + 1}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] bg-clip-text text-transparent font-sans">
                    {activeSegment.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-200 leading-relaxed font-sans font-medium">
                    {activeSegment.description}
                  </p>
                </div>

                {/* Highlights List */}
                {activeSegment.highlights.length > 0 && (
                  <div className="space-y-3.5 border-t border-slate-800/60 pt-4">
                    <h4 className="text-[10px] uppercase font-mono tracking-widest text-gray-400 font-bold">
                      MANUAL CHECKINGS
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pb-2">
                      {activeSegment.highlights.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start space-x-2.5 text-xs text-gray-300 font-mono"
                        >
                          <Check className="w-4.5 h-4.5 text-[#10b981] mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Academic & Research Insight Card - Fills space beautifully and adds elite research content */}
                <div className="p-4 rounded-xl border border-dashed border-[#10b981]/35 bg-black/60 space-y-2 mt-4">
                  <div className="flex items-center space-x-1.5 text-[10px] text-[#10b981] font-mono font-bold uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                    <span>Clinical Insight & Research Directives</span>
                  </div>
                  <p className="text-xs text-gray-300 font-mono leading-relaxed">
                    {activeSegment.id === 0 && (
                      "COGNITIVE STIPULATION: The entrance portal registers licensing matrices to confirm athletic eligibility metrics. Pre-qualifying clinicians are evaluated under direct board criteria before entry."
                    )}
                    {activeSegment.id === 1 && (
                      "FOUNDATIONAL DECK: Sports medicine operations require high-precision biomechanics logs. The credential system integrates historic clinical portfolios to secure professional placement channels."
                    )}
                    {activeSegment.id === 2 && (
                      "KINEMATICS REPORTING: When the ground force plate records high load cycles (> 2.8x BW), the safe-zone parameter activates a live bio-feedback alarm to mitigate ACL shearing hazards."
                    )}
                    {activeSegment.id === 3 && (
                      "COMPETENCY AUDIT: Completion marks direct entry credentials into the IISPPR registration files. Candidates must execute athletic taping and spinal mobilization with 100% manual accuracy."
                    )}
                    {activeSegment.id === 4 && (
                      "INTERVENTION DRILLS: Dry Needling (IDN) alters nervous signaling to optimize twitch response. High-Velocity Low-Amplitude (HVLA) manipulators must secure vertebral lock values before thrust pressure."
                    )}
                    {activeSegment.id === 5 && (
                      "GRADUATION STANDARDS: Certified members acquire global licensing clearance. The digitally registered diploma is stamped on the secure blockchain ledger, proving elite osteopathic rotation completion."
                    )}
                  </p>
                </div>
              </div>

              {/* Right Column: Dynamic Interactive Simulators */}
              <div className="col-span-1 lg:col-span-6 border-t lg:border-t-0 lg:border-l border-slate-800/60 pt-5 lg:pt-0 lg:pl-6 flex flex-col justify-center">
                {/* HERO PORTAL CARD SIMULATOR (id: 0 or 1) */}
                {(activeSegment.id === 0 || activeSegment.id === 1) && (
                  <div className="space-y-4 bg-black/50 border border-slate-800/80 rounded-2xl p-5 text-center text-white shadow-xl">
                    <GraduationCap className="w-10 h-10 text-[#10b981] mx-auto animate-bounce" />
                    <div>
                      <h4 className="text-sm font-bold bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] bg-clip-text text-transparent font-mono uppercase tracking-widest">
                        IISPPR Fellowship Matrix
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed mt-2 font-mono">
                        Welcome to the Elite Athletic Residency. Use the controls below to advance through chapters or click in the interactive index!
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 border-t border-slate-800/60 pt-3 text-center text-white">
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                        <span className="block text-[9px] text-gray-400 font-mono">ALUMNI</span>
                        <span className="text-sm font-bold font-sans text-white">5,000+</span>
                      </div>
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                        <span className="block text-[9px] text-gray-400 font-mono">
                          STABILITY
                        </span>
                        <span className="text-sm font-bold font-sans text-white">99.8%</span>
                      </div>
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                        <span className="block text-[9px] text-gray-400 font-mono">RANK</span>
                        <span className="text-sm font-bold font-sans text-[#E0A82E]">#01</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* KINEMATICS SIMULATOR (id: 2 - Ch. 1) */}
                {activeSegment.id === 2 && (
                  <div className="bg-black/50 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-xl font-mono text-white">
                    <div className="flex items-center space-x-2 border-b border-slate-800/60 pb-2.5">
                      <Activity className="w-5 h-5 text-[#10b981]" />
                      <span className="bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] bg-clip-text text-transparent text-xs font-bold uppercase tracking-wider">
                        Gait & Muscle Vector Engine
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Flexion Slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-[#00b4d8] font-bold">
                          <span>Joint Flexion</span>
                          <span>{jointAngle}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="135"
                          value={jointAngle}
                          onChange={(e) => {
                            setJointAngle(parseInt(e.target.value));
                            playFlipAudio();
                          }}
                          className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-[#00b4d8]"
                        />
                      </div>

                      {/* Force Plate Weight multiplier Slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-[#E0A82E] font-bold">
                          <span>Ground Force</span>
                          <span>{loadBW}x BW</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="3.5"
                          step="0.1"
                          value={loadBW}
                          onChange={(e) => {
                            setLoadBW(parseFloat(e.target.value));
                            playFlipAudio();
                          }}
                          className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-[#E0A82E]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 space-y-1">
                        <span className="text-gray-400 text-[9px] block">
                          ACL PATENCY STRESS:
                        </span>
                        <span
                          className={`font-bold text-sm ${isLoadCritical ? "text-red-400 animate-pulse" : "text-[#10b981]"}`}
                        >
                          {shearNL} Nm
                        </span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 space-y-1">
                        <span className="text-gray-400 text-[9px] block">QUADRICEPS EMG:</span>
                        <span className="font-bold text-sm text-white">{quadEMG}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* INTERACTIVE COMPLETION CHECKPOINTS (id: 3 - Ch. 2) */}
                {activeSegment.id === 3 && (
                  <div className="bg-black/50 border border-slate-800/60 rounded-2xl p-5 space-y-4 shadow-xl font-mono text-white">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                      <span className="bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] bg-clip-text text-transparent text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <ClipboardCheck className="w-5 h-5 text-[#10b981]" /> Trainee Checklist
                      </span>
                      <span className="text-[10px] bg-[#10b981]/15 border border-[#10b981]/35 px-2.5 py-1 text-[#10b981] rounded font-bold animate-pulse">
                        {progressPercent}% Complete
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        "Athletic Rigid K-Taping (WK-1)",
                        "Spinal HVLA Mobilization (WK-4)",
                        "Superficial Needling (WK-7)",
                        "Pitch Emergency Airway (WK-11)",
                      ].map((label, idx) => (
                        <label
                          key={idx}
                          className="flex items-center space-x-2.5 bg-slate-950 hover:bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 text-xs text-gray-300 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={competencies[idx]}
                            onChange={() => handleToggleCompetency(idx)}
                            className="accent-[#10b981] rounded block cursor-pointer w-4 h-4"
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>

                    <p className="text-[10px] text-gray-400 text-center italic mt-1 leading-relaxed">
                      {progressPercent === 100
                        ? "Mastery achieved! Clinical requirements for Orthopaedic Fellowship fully certified."
                        : "Requirements: Check off trainee modules to generate completion certificate criteria."}
                    </p>
                  </div>
                )}

                {/* INTERACTIVE DRY NEEDLING & SPIN THRUST (id: 4 - Ch. 3) */}
                {activeSegment.id === 4 && (
                  <div className="bg-black/50 border border-slate-800/60 rounded-2xl p-4.5 space-y-4 shadow-xl font-mono text-white">
                    {/* Sub tab toggler inside the page panel */}
                    <div className="flex bg-slate-950 border border-slate-800/40 rounded-lg p-1 text-[10px] font-bold">
                      <button
                        onClick={() => {
                          setActiveSubTab("needle");
                          playFlipAudio();
                        }}
                        className={`flex-1 py-1.5 rounded cursor-pointer transition-all ${
                          activeSubTab === "needle"
                            ? "bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] text-black font-extrabold shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        Dry Needling Grid
                      </button>
                      <button
                        onClick={() => {
                          setActiveSubTab("hvla");
                          playFlipAudio();
                        }}
                        className={`flex-1 py-1.5 rounded cursor-pointer transition-all ${
                          activeSubTab === "hvla"
                            ? "bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] text-black font-extrabold shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        HVLA Spinal Thrust
                      </button>
                    </div>

                    {activeSubTab === "needle" ? (
                      <div className="space-y-3.5">
                        <span className="block text-[9px] text-gray-400 uppercase tracking-wider font-bold">
                          Target Trigger Point (Tap to inject)
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          {["Trapezius", "Infraspinatus", "Levator", "Rhomboids"].map(
                            (m) => (
                              <button
                                key={m}
                                onClick={() => handleNeedleGridFocus(m)}
                                className={`p-2.5 rounded-lg text-xs text-center border font-bold cursor-pointer transition-all ${
                                  selectedMuscleGrid === m
                                    ? "bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] text-black shadow-[0_0_8px_rgba(16,185,129,0.2)] border-transparent"
                                    : "bg-slate-950/40 border-slate-800 text-gray-300 hover:border-slate-700 hover:bg-slate-900/20"
                                }`}
                              >
                                {m}
                              </button>
                            )
                          )}
                        </div>

                        {/* Live simulator logs output */}
                        <div className="bg-slate-950/60 border border-slate-800/60 p-3 rounded-lg text-xs text-[#10b981] min-h-[50px] font-bold leading-relaxed">
                          {needleLogs}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        <span className="block text-[9px] text-gray-400 uppercase tracking-wider font-bold">
                          Calibrate Target Vertebrae Focus
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {["C5", "T2", "L4"].map((block) => (
                            <button
                              key={block}
                              onClick={() => {
                                setSelectedVertebrae(block);
                                playFlipAudio();
                                setThrustLogs(
                                  `Vertebrae calibrated to ${block}. Position aligned. Prepared to apply manipulation speed.`
                                );
                              }}
                              className={`p-2 text-xs text-center border font-bold cursor-pointer rounded-lg transition-all ${
                                selectedVertebrae === block
                                  ? "bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E]/30 text-white border-transparent shadow-sm"
                                  : "bg-slate-950/40 border-slate-800 text-gray-400 hover:border-slate-700"
                              }`}
                            >
                              {block}
                            </button>
                          ))}
                        </div>

                        {/* Dynamic Thrust Button Trigger */}
                        <button
                          onClick={handleSpinalThrustApply}
                          className="w-full bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] text-black font-extrabold text-[11px] tracking-widest uppercase p-3 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-lg"
                        >
                          <Locate className="w-4.5 h-4.5" /> APPLY ADJUSTMENT THRUST
                        </button>

                        {/* Live action logs output */}
                        <div className="bg-slate-950/60 border border-slate-800/60 p-3 rounded-lg text-xs text-[#10b981] min-h-[50px] font-bold leading-relaxed">
                          {thrustLogs}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* FELLOWSHIP ADMISSION FORMS (id: 5 - Chapter 4) */}
                {activeSegment.id === 5 && (
                  <div className="space-y-3.5 text-slate-100 font-mono">
                    {!verificationFormSubmitted ? (
                      <form
                        onSubmit={handlePrintEligibility}
                        className="bg-black/50 border border-slate-800/60 rounded-2xl p-5 space-y-3.5 shadow-2xl"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Full Name field */}
                          <div className="space-y-1.5">
                            <label className="text-[9px] text-gray-400 uppercase block font-bold">
                              Clinician Full Name
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Dr. Manoj Kumar"
                              value={studentName}
                              onChange={(e) => setStudentName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs p-2.5 text-white focus:outline-none focus:border-[#10b981]"
                            />
                          </div>

                          {/* Professional ID License field */}
                          <div className="space-y-1.5">
                            <label className="text-[9px] text-[#11b981] uppercase block font-bold">
                              LPT Board ID License
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="LPT-74839-IND"
                              value={licenseID}
                              onChange={(e) => setLicenseID(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs p-2.5 text-white focus:outline-none focus:border-[#10b981]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Specialization selection */}
                          <div className="space-y-1.5">
                            <label className="text-[9px] text-gray-400 uppercase block font-bold">
                              Specialization Wing
                            </label>
                            <select
                              value={specialtyField}
                              onChange={(e) => setSpecialtyField(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs p-2.5 text-white focus:outline-none"
                            >
                              <option value="Sports Physiotherapy">Sports Physiotherapy</option>
                              <option value="Osteopathic Adjustments">Osteopathic Adjustments</option>
                              <option value="Clinical Kinematics">Clinical Kinematics</option>
                            </select>
                          </div>

                          {/* Primary residency choice */}
                          <div className="space-y-1.5">
                            <label className="text-[9px] text-gray-400 uppercase block font-bold">
                              Residency Rotation
                            </label>
                            <select
                              value={residencyCamp}
                              onChange={(e) => setResidencyCamp(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs p-2.5 text-white focus:outline-none"
                            >
                              <option value="Olympic Training Centers">Olympic Centers</option>
                              <option value="Premier League Football Academy">Football Academy</option>
                              <option value="Elite Sports Rehabilitation Clinics">Rehab Clinics</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] text-black font-extrabold text-[11px] tracking-widest uppercase p-3 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 shadow-md hover:shadow-lg"
                        >
                          VERIFY & GENERATE CREDENTIALS <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                    ) : (
                      <div className="bg-black/50 border border-slate-800/60 rounded-2xl p-5 space-y-3 text-center text-white">
                        <Check className="w-8 h-8 text-[#10b981] mx-auto animate-pulse" />
                        <h4 className="text-sm font-bold text-[#10b981] uppercase tracking-widest">
                          BOARD VERIFICATION GRANTED
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Your licensure checks out. Registering credentials to security stamp below.
                        </p>
                        <button
                          onClick={() => {
                            setVerificationFormSubmitted(false);
                            playFlipAudio();
                          }}
                          className="text-xs hover:text-[#E0A82E] text-[#10b981] underline uppercase cursor-pointer block mx-auto font-bold"
                        >
                          Reset Registry Entry Form
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      {/* RENDER VERIFIED DIPLOMA CERTIFICATE AT THE END */}
      <AnimatePresence>
        {verificationFormSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-lg select-none"
          >
            {/* Elegant luxury certificate board container */}
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-2xl bg-[#03060b]/95 text-white p-8 rounded-3xl border-2 border-slate-800 shadow-[0_0_60px_rgba(16,185,129,0.15)] bg-[radial-gradient(circle_at_center,rgba(0,180,216,0.08)_0%,transparent_80%)] overflow-hidden"
            >
              {/* Outer double border line */}
              <div className="absolute inset-5 border border-slate-800 pointer-events-none rounded-2xl" />

              {/* Watermark crest behind */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                <span className="text-[240px]">✚</span>
              </div>

              {/* Header details */}
              <div className="text-center space-y-2 mt-4 relative z-10 font-sans">
                <span className="bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] bg-clip-text text-transparent text-2xl font-black tracking-[0.2em] block">
                  IISPPR ACADEMY
                </span>
                <span className="text-[9px] font-mono text-gray-200 uppercase tracking-[0.35em] block font-bold">
                  INTERNATIONAL SPORTS PHYSIOTHERAPY & REHABILITATION
                </span>
                <div className="w-20 h-[1.2px] bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] mx-auto mt-3" />
              </div>

              {/* Main certificate text body content */}
              <div className="text-center my-8 space-y-5 relative z-10 font-sans">
                <span className="text-gray-300 text-xs italic tracking-widest block font-mono">
                  This academic credentialing file verifies that:
                </span>
                <h3 className="text-xl font-black tracking-wide text-white uppercase underline decoration-[#10b981] decoration-2 underline-offset-8">
                  {studentName}
                </h3>
                <span className="text-gray-300 text-[11px] leading-relaxed block font-mono">
                  has officially registered their clinical ID/License:{" "}
                  <span className="text-white font-bold">{licenseID}</span> and completed all
                  interactive 3D manual requirements set by the examination board parameters.
                </span>

                <span className="text-gray-300 text-xs block font-mono leading-relaxed px-6">
                  Therefore, IISPPR Academy authorizes active direct enrollment candidateship into
                  the official twelve-months:
                </span>

                <h4 className="bg-gradient-to-r from-[#00b4d8] via-[#10b981] to-[#E0A82E] bg-clip-text text-transparent text-lg font-mono font-black tracking-widest uppercase">
                  FELLOWSHIP IN {specialtyField}
                </h4>

                <span className="text-gray-300 text-[11px] leading-relaxed block font-mono font-bold">
                  Rotation Specialty Allocation:{" "}
                  <span className="text-[#10b981]">{residencyCamp}</span>
                </span>
              </div>

              {/* Lower credentials grid details */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-6 relative z-10 font-mono text-[9px]">
                <div className="text-left space-y-1">
                  <span className="text-gray-300 block text-[8px] font-mono">
                    DIPLOMA REGISTRATION NO:
                  </span>
                  <span className="text-[#11b981] font-bold block text-[10px]">
                    {diplomaSerial}
                  </span>
                  <span className="text-gray-300 block text-[8px] font-mono">
                    ISSUED TIME REFERENCE:
                  </span>
                  <span className="text-white block text-[10px] font-mono">
                    {new Date().toISOString()}
                  </span>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-gray-300 block text-[8px] font-mono">
                    IISPPR REGISTRY STAMP:
                  </span>
                  <span className="text-white font-bold block text-[10px]">
                    VERIFIED ONLINE [✓]
                  </span>
                  <span className="text-gray-300 block text-[8px] font-mono">
                    MEMBER COUNSEL SIGNATURE:
                  </span>
                  <span className="text-[#10b981] font-bold block italic font-serif text-[11px]">
                    Dr. Olympic Mentor
                  </span>
                </div>
              </div>

              {/* Form Close button */}
              <div className="text-center mt-8 relative z-10">
                <button
                  onClick={() => {
                    setVerificationFormSubmitted(false);
                    playFlipAudio();
                  }}
                  className="bg-transparent hover:bg-white/5 border border-white/20 hover:border-[#10b981] text-gray-300 hover:text-white font-mono text-[10px] tracking-widest uppercase py-2 px-6 rounded-lg cursor-pointer transition-colors"
                >
                  Return to Manual Study
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POP THRUST SCREEN FLASH EFFECT */}
      <AnimatePresence>
        {isThrustFx && (
          <motion.div
            initial={{ opacity: 0.65 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[99] pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
