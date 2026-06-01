import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

interface CoverProps {
  width: number;
  height: number;
  thickness: number;
  rotationY: number; // Controlled by parent scroll/drag interpolation
  isFront: boolean;
  accentColor: string;
}

export default function Cover({
  width,
  height,
  thickness,
  rotationY,
  isFront,
  accentColor,
}: CoverProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    // Generate an absolutely premium, extremely high-resolution layout texture for the cover
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1448;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const w = canvas.width;
      const h = canvas.height;

      // Deep luxury clinical blue-black background with subtle noise grain/sheen
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#0B2D5C");
      grad.addColorStop(0.5, "#061B3B");
      grad.addColorStop(1, "#020814");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Procedural fine gold leather micro-grains
      ctx.fillStyle = "rgba(224, 168, 46, 0.015)";
      for (let i = 0; i < 7000; i++) {
        const rx = Math.random() * w;
        const ry = Math.random() * h;
        const size = Math.random() * 2;
        ctx.fillRect(rx, ry, size, size);
      }

      // Elegant double golden foil border
      ctx.strokeStyle = "rgba(224, 168, 46, 0.45)";
      ctx.lineWidth = 4;
      ctx.strokeRect(36, 36, w - 72, h - 72);

      ctx.strokeStyle = "rgba(224, 168, 46, 0.25)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(48, 48, w - 96, h - 96);

      // Filigree corners
      const drawCorner = (cx: number, cy: number, dx: number, dy: number) => {
        ctx.strokeStyle = "rgba(224, 168, 46, 0.65)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy + dy * 45);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + dx * 45, cy);
        ctx.stroke();
      };
      drawCorner(36, 36, 1, 1);
      drawCorner(w - 36, 36, -1, 1);
      drawCorner(36, h - 36, 1, -1);
      drawCorner(w - 36, h - 36, -1, -1);

      if (isFront) {
        // Monospaced premium header tag
        ctx.fillStyle = "#E0A82E"; // Vintage Gold
        ctx.font = '500 18px "JetBrains Mono", monospace';
        ctx.textAlign = "center";
        ctx.fillText("IISPPR CLINICAL FELLOWSHIPS", w / 2, 215);

        // Divider
        ctx.fillStyle = "rgba(224, 168, 46, 0.3)";
        ctx.fillRect(w / 2 - 140, 240, 280, 2.5);

        // High-end elegant display headings
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "#E0A82E";
        ctx.shadowBlur = 12;
        ctx.font = 'bold 64px "Space Grotesk", sans-serif';
        ctx.fillText("IISPPR", w / 2, 385);
        ctx.fillText("ACADEMY", w / 2, 460);
        ctx.shadowBlur = 0; // reset shadow

        // Golden circular crest watermark with leaf laurels
        const ccx = w / 2;
        const ccy = h * 0.54;
        ctx.strokeStyle = "rgba(224, 168, 46, 0.5)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ccx, ccy, 135, 0, Math.PI * 2);
        ctx.stroke();

        // Outer layout circle
        ctx.strokeStyle = "rgba(224, 168, 46, 0.15)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ccx, ccy, 150, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#E0A82E";
        ctx.font = "bold 55px sans-serif";
        ctx.fillText("✚", ccx, ccy + 18);

        // Subtitle and credentials details
        ctx.fillStyle = "rgba(224, 168, 46, 0.7)";
        ctx.font = '600 14px "JetBrains Mono", monospace';
        ctx.fillText("SPORTS PHYSIOTHERAPY & KINEMATICS", w / 2, h * 0.75);

        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.font = '400 16px "Inter", sans-serif';
        ctx.fillText("ACTIVE CLINICAL DEVELOPMENT SYSTEM", w / 2, h - 215);
        ctx.fillText("FELLOWSHIPS, WORKSHOPS & CASE REVIEWS", w / 2, h - 185);

        ctx.fillStyle = "#E0A82E";
        ctx.font = '600 19px "JetBrains Mono", monospace';
        ctx.fillText("AUTHENTIC CLINICAL MANUAL", w / 2, h - 110);
      } else {
        // Back cover configuration
        const ccx = w / 2;
        const ccy = h / 2 - 40;

        ctx.strokeStyle = "rgba(224, 168, 46, 0.25)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(ccx, ccy, 80, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(224, 168, 46, 0.35)";
        ctx.font = "bold 34px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("✚", ccx, ccy + 13);

        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        ctx.font = 'bold 24px "Space Grotesk", sans-serif';
        ctx.fillText("IISPPR ACADEMY", w / 2, h * 0.64);

        ctx.fillStyle = "rgba(212, 163, 115, 0.25)";
        ctx.font = '400 14px "JetBrains Mono", monospace';
        ctx.fillText("INTERNATIONAL SPORTS MANUAL SYSTEMS", w / 2, h * 0.69);
        ctx.fillText("MANUAL REGISTERED PATENT. SECURE SYLLABUS AT", w / 2, h * 0.72);
        ctx.fillStyle = "#E0A82E";
        ctx.fillText("IISPPRACTHERAPIST.COM", w / 2, h * 0.75);
      }
    }

    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.colorSpace = THREE.SRGBColorSpace;
    canvasTexture.minFilter = THREE.LinearFilter;
    canvasTexture.generateMipmaps = false;
    setTexture(canvasTexture);

    return () => {
      canvasTexture.dispose();
    };
  }, [isFront]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotationY;
      if (isFront) {
        groupRef.current.position.z = thickness * 0.51 * Math.cos(rotationY);
      }
    }
  }, [rotationY, isFront, thickness]);

  const xOffset = width / 2;

  return (
    <group
      ref={groupRef}
      position={[0, 0, isFront ? thickness * 0.51 * Math.cos(rotationY) : -thickness * 0.51]}
    >
      <mesh position={[xOffset, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, thickness]} />

        {/* materials attach mapping:
            0: Right, 1: Left, 2: Top, 3: Bottom, 4: Front, 5: Back */}
        <meshStandardMaterial
          attach="material-4"
          map={texture || undefined}
          roughness={0.2}
          metalness={0.16}
        />
        <meshStandardMaterial attach="material-5" color="#010512" roughness={0.4} />
        <meshStandardMaterial
          attach="material-0"
          color="#E0A82E" // Luxury Gold edges for pages feel
          roughness={0.18}
          metalness={0.85}
        />
        <meshStandardMaterial
          attach="material-1"
          color="#E0A82E"
          roughness={0.18}
          metalness={0.85}
        />
        <meshStandardMaterial
          attach="material-2"
          color="#E0A82E"
          roughness={0.18}
          metalness={0.85}
        />
        <meshStandardMaterial
          attach="material-3"
          color="#E0A82E"
          roughness={0.18}
          metalness={0.85}
        />
      </mesh>
    </group>
  );
}
