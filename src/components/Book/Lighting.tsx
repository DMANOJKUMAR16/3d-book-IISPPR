import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface LightingProps {
  preset: "cinematic" | "clinical" | "cozy";
}

export default function Lighting({ preset }: LightingProps) {
  const spotlightRef = useRef<THREE.SpotLight>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);

  // Soft orbital sways in light angle to keep specular highlights dynamic
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (spotlightRef.current) {
      spotlightRef.current.position.x = 2 + 5 * Math.sin(t * 0.35);
      spotlightRef.current.position.y = 9 + 1.5 * Math.cos(t * 0.25);
    }
    if (pointLightRef.current) {
      pointLightRef.current.intensity =
        preset === "cozy" ? 1.1 + 0.15 * Math.sin(t * 0.7) : 1.4 + 0.25 * Math.sin(t * 0.5);
    }
  });

  // Choose lighting parameters based on active preset
  let ambientIntensity = 0.55;
  let mainSpotColor = "#FAFAFA"; // Soft clean daylight white
  let mainSpotIntensity = 4.5;

  let fillLightColor = "#E2E8F0"; // Clear neutral slate fill
  let fillLightIntensity = 1.4;

  let backGlowColor = "#2563EB"; // Deep elegant glow
  let backGlowIntensity = 1.6;

  switch (preset) {
    case "clinical":
      // Bright forensic surgical diagnostics white light
      ambientIntensity = 0.75;
      mainSpotColor = "#FFFFFF"; // Pure surgical white
      mainSpotIntensity = 5.0;
      fillLightColor = "#E0F2FE"; // Extremely soft clinical sky-blue
      fillLightIntensity = 1.6;
      backGlowColor = "#0284C7"; // Diagnostic cyan glow
      backGlowIntensity = 1.3;
      break;
    case "cozy":
      // Elegant cozy study warmth (cream-champagne tones instead of mud orange)
      ambientIntensity = 0.52;
      mainSpotColor = "#FCF8F2"; // Warm clean ivory white
      mainSpotIntensity = 4.0;
      fillLightColor = "#E6DFD3"; // Soft parchment champagne fill
      fillLightIntensity = 1.1;
      backGlowColor = "#451a03"; // Cozy cedar wood hearth glow
      backGlowIntensity = 0.9;
      break;
    case "cinematic":
    default:
      // High-contrast studio spotlight
      ambientIntensity = 0.58;
      mainSpotColor = "#FAFAFA"; // Crisp daylight spot
      mainSpotIntensity = 4.6;
      fillLightColor = "#CBD5E1"; // Subtle soft silver/chalk fill
      fillLightIntensity = 1.3;
      backGlowColor = "#1D4ED8"; // Deep ambient sapphire blue
      backGlowIntensity = 1.7;
      break;
  }

  return (
    <>
      {/* Soft global diffuse background fill */}
      <ambientLight intensity={ambientIntensity} />

      {/* Cinematic Primary Shadow Spotlight */}
      <spotLight
        ref={spotlightRef}
        position={[3, 9, 5]}
        angle={0.46}
        penumbra={0.8}
        intensity={mainSpotIntensity}
        color={mainSpotColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00008}
      />

      {/* Contrasting Fill Rim Light */}
      <directionalLight
        position={[-7, -3, 3]}
        intensity={fillLightIntensity}
        color={fillLightColor}
      />

      {/* Volumetric Soft Backlight */}
      <pointLight
        ref={pointLightRef}
        position={[0, 0.5, -4.5]}
        intensity={backGlowIntensity}
        distance={14}
        color={backGlowColor}
      />

      {/* Overhead High-clarity Soft White light */}
      <directionalLight position={[0, 7, 1]} intensity={1.2} color="#FFFFFF" />
    </>
  );
}
