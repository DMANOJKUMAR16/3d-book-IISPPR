import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { IISPPR_BOOK_CONTENT } from "../../data/bookContent";
import Cover from "./Cover";
import { drawPageTexture } from "./textureGenerator";

interface BookProps {
  scrollProgress: number; // Controlled by active scroll position or manual state override
  cameraPreset: "flat" | "cinematic" | "zoom" | "side";
  mouseParallax: boolean;
  onSwipe?: (direction: "next" | "prev") => void;
}

interface PageChildProps {
  width: number;
  height: number;
  isBack: boolean;
  texture: THREE.CanvasTexture;
  flipProgress: number;
}

/**
 * Single face of a page leaf that implements dynamic paper curvature
 * and shadow normal reconstruction during the page-turn animation.
 */
function PageChild({ width, height, isBack, texture, flipProgress }: PageChildProps) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Track parameters in a mutable React ref to seamlessly bind with Three's compilation loop
  const uniformsRef = useRef({
    uFlipProgress: { value: flipProgress },
    uWidth: { value: width },
  });

  // Keep uniforms directly synchronized on props changing
  useEffect(() => {
    uniformsRef.current.uFlipProgress.value = flipProgress;
  }, [flipProgress]);

  return (
    <mesh
      position={[width / 2, 0, isBack ? -0.0008 : 0.0008]}
      rotation={isBack ? [0, Math.PI, 0] : [0, 0, 0]}
      castShadow
      receiveShadow
    >
      {/* High-segment grid plane to render super-smooth geometric warping */}
      <planeGeometry args={[width, height, 32, 2]} />
      <meshStandardMaterial
        ref={materialRef}
        map={texture}
        roughness={0.35}
        metalness={0.0}
        emissive="#FFFFFF"
        emissiveMap={texture}
        emissiveIntensity={0.85}
        side={THREE.FrontSide}
        transparent={false}
        onBeforeCompile={(shader) => {
          // Bind custom uniform floats to the shader instance
          shader.uniforms.uFlipProgress = uniformsRef.current.uFlipProgress;
          shader.uniforms.uWidth = uniformsRef.current.uWidth;

          shader.vertexShader =
            `
            uniform float uFlipProgress;
            uniform float uWidth;
          ` + shader.vertexShader;

          // 1. Core Vertex Shader: Dynamic Normal Manipulation (lighting shadows correction)
          shader.vertexShader = shader.vertexShader.replace(
            "#include <beginnormal_vertex>",
            `
            #include <beginnormal_vertex>
            {
              float progress = uFlipProgress;
              // Compute coordinate from hinge/spine (0.0) to outer page edge (1.0)
              float t = ${isBack ? "(uWidth * 0.5 - position.x)" : "(position.x + uWidth * 0.5)"} / uWidth;
              
              if (t > 0.0) {
                // Bell curve showing turning amplitude (reaches maximum at half-turn)
                float bendIntensity = sin(progress * 3.14159265);
                
                // Analytical tangent slope derivative: d(curlZ)/dt
                float dCurlZ_dt = -0.6 * bendIntensity * t + 0.31 * bendIntensity * cos(t * 6.28);
                float dCurlZ_dx = dCurlZ_dt / uWidth;
                ${isBack ? "dCurlZ_dx = -dCurlZ_dx;" : ""} // invert slope coordinate on flips for back-material
                
                // Recalculate normal perpendicular vector to the curved surface tangent vector
                objectNormal = normalize(vec3(-dCurlZ_dx, 0.0, 1.0));
              }
            }
            `
          );

          // 2. Core Vertex Shader: Vertex Curvature Displacement mapping
          shader.vertexShader = shader.vertexShader.replace(
            "#include <begin_vertex>",
            `
            #include <begin_vertex>
            {
              float progress = uFlipProgress;
              float t = ${isBack ? "(uWidth * 0.5 - position.x)" : "(position.x + uWidth * 0.5)"} / uWidth;
              
              if (t > 0.0) {
                float bendIntensity = sin(progress * 3.14159265);
                
                // Dynamic paper curl roll formula
                float curlZ = -0.28 * bendIntensity * pow(t, 2.0);
                curlZ += 0.045 * bendIntensity * sin(t * 6.28);
                
                // Dimensional shrinkage: pulls vertices closer to spine conserving sheet area as it curls
                float pullX = -0.035 * bendIntensity * pow(t, 3.0);
                ${isBack ? "pullX = -pullX;" : ""} // Invert horizontal tension direction on backside face
                
                transformed.z += curlZ;
                transformed.x += pullX;
              }
            }
            `
          );
        }}
      />
    </mesh>
  );
}

interface PageLeafProps {
  width: number;
  height: number;
  rotationY: number;
  frontTexture: THREE.CanvasTexture | null;
  backTexture: THREE.CanvasTexture | null;
  zIndex?: number;
}

/**
 * Reusable dynamic layout paper sheet hinged on the spine (x = 0 coordinate)
 */
function PageLeaf({
  width,
  height,
  rotationY,
  frontTexture,
  backTexture,
  zIndex = 0,
}: PageLeafProps) {
  // Extract bounded flipProgress state between [0.0, 1.0]
  const flipProgress = Math.max(0, Math.min(1, -rotationY / Math.PI));

  return (
    <group position={[0, 0, zIndex]} rotation={[0, rotationY, 0]}>
      {/* FRONT PAGE FACE */}
      {frontTexture && (
        <PageChild
          width={width}
          height={height}
          isBack={false}
          texture={frontTexture}
          flipProgress={flipProgress}
        />
      )}

      {/* BACK PAGE FACE */}
      {backTexture && (
        <PageChild
          width={width}
          height={height}
          isBack={true}
          texture={backTexture}
          flipProgress={flipProgress}
        />
      )}
    </group>
  );
}

export default function Book({ scrollProgress, cameraPreset, mouseParallax, onSwipe }: BookProps) {
  const outerGroupRef = useRef<THREE.Group>(null);
  const bookGroupRef = useRef<THREE.Group>(null);
  const { camera, size, gl } = useThree();
  const introProgressRef = useRef(0);

  // Unified Swipe and Touch-Drag Gestures Page Turning Handler
  useEffect(() => {
    const canvasEl = gl.domElement;
    if (!canvasEl) return;

    let startX = 0;
    let startY = 0;
    let isSwiping = false;

    const handlePointerDown = (e: PointerEvent) => {
      // Ignore right/middle clicks
      if (e.button !== 0 && e.pointerType === "mouse") return;
      startX = e.clientX;
      startY = e.clientY;
      isSwiping = true;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isSwiping) return;
      isSwiping = false;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // Threshold to detect dominant horizontal swipe (and ignore minor vertical shakes)
      if (Math.abs(deltaX) > 40 && Math.abs(deltaY) < 100) {
        if (deltaX < 0) {
          onSwipe?.("next");
        } else {
          onSwipe?.("prev");
        }
      }
    };

    canvasEl.addEventListener("pointerdown", handlePointerDown, { passive: true });
    canvasEl.addEventListener("pointerup", handlePointerUp, { passive: true });

    return () => {
      canvasEl.removeEventListener("pointerdown", handlePointerDown);
      canvasEl.removeEventListener("pointerup", handlePointerUp);
    };
  }, [gl, onSwipe]);

  // Book physical dimensions
  const width = 1.35;
  const height = 1.95;
  const thickness = 0.024;
  const spineWidth = 0.045;

  // Render static cache textures
  const [textures, setTextures] = useState<THREE.CanvasTexture[]>([]);

  useEffect(() => {
    const list: THREE.CanvasTexture[] = [];
    IISPPR_BOOK_CONTENT.forEach((page, idx) => {
      const canvas = document.createElement("canvas");
      canvas.width = 2048;
      canvas.height = 2896;

      const isLeft = idx % 2 === 0;
      drawPageTexture(canvas, page, isLeft);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = 16;
      list.push(tex);
    });
    setTextures(list);

    return () => {
      list.forEach((t) => t.dispose());
    };
  }, []);

  // Determine active double-spread ranges
  let leftPageIndex = -1;
  let rightPageIndex = -1;
  let turningPageIndex = -1;
  let turningRotationY = 0;
  let frontCoverRot = 0;
  const backCoverRot = 0; // Back cover stays flat at 0 on the right side!

  const progress = scrollProgress;

  if (progress < 0.15) {
    // Cover fully closed in standard view
    frontCoverRot = 0;
    leftPageIndex = -1;
    rightPageIndex = -1;
    turningPageIndex = -1;
  } else if (progress >= 0.15 && progress < 0.5) {
    // Front cover opening (0.15 to 0.30) and lying flat on Spread 1 (0.30 to 0.50)
    if (progress < 0.3) {
      const r = (progress - 0.15) / 0.15;
      frontCoverRot = -r * Math.PI;
      leftPageIndex = -1;
      rightPageIndex = 0; // Page 0 visible as cover swings
      turningPageIndex = -1;
    } else {
      frontCoverRot = -Math.PI;
      leftPageIndex = 0;
      rightPageIndex = 1;
      turningPageIndex = -1;
    }
  } else if (progress >= 0.5 && progress < 0.71) {
    // Turning Spread 1 (Page 0 & 1) -> Spread 2 (Page 2 & 3) at transition 0.50 to 0.58
    if (progress < 0.58) {
      const r = (progress - 0.5) / 0.08;
      frontCoverRot = -Math.PI;
      leftPageIndex = 0;
      rightPageIndex = 3;
      turningPageIndex = 1;
      turningRotationY = -r * Math.PI;
    } else {
      frontCoverRot = -Math.PI;
      leftPageIndex = 2;
      rightPageIndex = 3;
      turningPageIndex = -1;
    }
  } else if (progress >= 0.71 && progress < 0.87) {
    // Turning Spread 2 (Page 2 & 3) -> Spread 3 (Page 4 & 5) at transition 0.71 to 0.78
    if (progress < 0.78) {
      const r = (progress - 0.71) / 0.07;
      frontCoverRot = -Math.PI;
      leftPageIndex = 2;
      rightPageIndex = 5;
      turningPageIndex = 3;
      turningRotationY = -r * Math.PI;
    } else {
      frontCoverRot = -Math.PI;
      leftPageIndex = 4;
      rightPageIndex = 5;
      turningPageIndex = -1;
    }
  } else {
    // Turning Spread 3 (Page 4 & 5) -> Spread 4 (Page 6 & 7) at transition 0.87 to 0.93
    if (progress < 0.93) {
      const r = (progress - 0.87) / 0.06;
      frontCoverRot = -Math.PI;
      leftPageIndex = 4;
      rightPageIndex = 7;
      turningPageIndex = 5;
      turningRotationY = -r * Math.PI;
    } else {
      frontCoverRot = -Math.PI;
      leftPageIndex = 6;
      rightPageIndex = 7;
      turningPageIndex = -1;
    }
  }

  useFrame((state) => {
    if (!bookGroupRef.current || !outerGroupRef.current) return;

    // Increment initial intro progress smoothly towards 1.0
    if (introProgressRef.current < 1.0) {
      // 0.0045 is approximately 220 frames at 60 FPS (~3.6 seconds) of smooth cinematic alignment
      introProgressRef.current = Math.min(1.0, introProgressRef.current + 0.0045);
    }
    const easeIntro = 1 - Math.pow(1 - introProgressRef.current, 4); // Quartic ease-out for ultra smooth slow settling

    const t = state.clock.getElapsedTime();

    // Fluid biological slow floating motions
    const floatY = Math.sin(t * 0.4) * 0.04;
    const floatRotZ = Math.cos(t * 0.3) * 0.005;

    // Optional mouse parallax coordinates
    const mx = mouseParallax ? state.pointer.x : 0;
    const my = mouseParallax ? state.pointer.y : 0;

    const isMobile = size.width < 768;

    // Define target configurations according to selected active camera preset
    let targetCamX = 0.0;
    let targetCamY = isMobile ? 0.55 : 0.45;
    let targetCamZ = 3.4;

    let targetBookX = 0.0;
    let targetBookY = isMobile ? 0.35 : 0.04;

    let targetRotX = -0.22; // opposite rotation! top pivot back!
    let targetRotY = 0.0;
    let targetRotZ = floatRotZ;
    let targetScale = isMobile ? 0.72 : 1.15;

    // 1. Position book horizontally depending on if cover is closed or open
    // Open covers shift targetBookX slightly to center it beautifully in the layout
    if (progress < 0.15) {
      targetBookX = 0.0;
      targetScale = isMobile ? 1.0 : 1.35;
    } else if (progress >= 0.15 && progress < 0.3) {
      const ratio = (progress - 0.15) / 0.15;
      targetBookX = THREE.MathUtils.lerp(0.0, isMobile ? 0.0 : 0.05, ratio);
      targetScale = THREE.MathUtils.lerp(isMobile ? 1.0 : 1.35, isMobile ? 0.72 : 1.15, ratio);
    } else {
      targetBookX = isMobile ? 0.0 : 0.05;
    }

    // 2. Adjust coefficients based on active Camera Preset Choice
    switch (cameraPreset) {
      case "flat":
        // Perfectly flat, top-down-like view with 100% readability
        targetCamZ = isMobile ? 2.8 : 2.6; // closer to make content visible more
        targetCamY = isMobile ? 0.35 : 0.25; // higher
        targetRotX = -0.05; // very slight opposite slant
        targetRotY = 0.0;
        targetRotZ = 0.0;
        break;
      case "zoom":
        // Tight, up-close study view focusing closely on details
        targetCamZ = isMobile ? 1.95 : 1.75; // closer
        targetCamY = isMobile ? 0.45 : 0.35; // higher
        targetBookX = isMobile ? 0.0 : 0.05; // beautifully centered for extreme focus
        targetRotX = -0.12; // opposite rotation! tilted back!
        targetRotY = -0.02;
        break;
      case "side":
        // Immersive studio reading table tilt angle
        targetCamZ = isMobile ? 3.5 : 3.2; // closer
        targetCamY = isMobile ? 0.75 : 0.65; // higher
        targetRotX = -0.36; // opposite rotation! tilted back!
        targetRotY = -0.25;
        targetRotZ = 0.02;
        break;
      case "cinematic":
      default:
        // Premium 3D perspective with continuous mouse coordinate responses
        targetCamZ = isMobile ? 3.6 : 3.1; // closer
        targetCamY = isMobile ? 0.65 : 0.55; // higher
        targetRotX = -0.26 - my * 0.05; // opposite rotation! top pivot back!
        targetRotY = 0.0 + mx * 0.07;
        break;
    }

    // Blend standard camera/book coordinate systems with dramatic intro values
    // Severe closed book rotated state at start:
    const startRotX = -1.15; // diagonal display tilt
    const startRotY = -1.8; // closed leather binding & thick pages side edge detail
    const startRotZ = 0.2; // elegant tilt
    const startScale = isMobile ? 0.36 : 0.58;
    const startBookY = isMobile ? 0.68 : 0.38;

    targetRotX = THREE.MathUtils.lerp(startRotX, targetRotX, easeIntro);
    targetRotY = THREE.MathUtils.lerp(startRotY, targetRotY, easeIntro);
    targetRotZ = THREE.MathUtils.lerp(startRotZ, targetRotZ, easeIntro);
    targetScale = THREE.MathUtils.lerp(startScale, targetScale, easeIntro);
    targetBookY = THREE.MathUtils.lerp(startBookY, targetBookY, easeIntro);

    // Camera positions lerp and lookAt target setup
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.08);
    camera.lookAt(new THREE.Vector3(targetBookX * 0.5, bookGroupRef.current.position.y, 0));

    // Book position translations
    bookGroupRef.current.position.x = THREE.MathUtils.lerp(
      bookGroupRef.current.position.x,
      targetBookX,
      0.08
    );
    bookGroupRef.current.position.y = THREE.MathUtils.lerp(
      bookGroupRef.current.position.y,
      targetBookY + floatY,
      0.08
    );

    // Apply orientation angles to the parent container
    outerGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      outerGroupRef.current.rotation.x,
      targetRotX,
      0.08
    );
    outerGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      outerGroupRef.current.rotation.y,
      targetRotY,
      0.08
    );
    outerGroupRef.current.rotation.z = THREE.MathUtils.lerp(
      outerGroupRef.current.rotation.z,
      targetRotZ,
      0.08
    );

    // Dynamic scale zooms
    const activeScale = THREE.MathUtils.lerp(outerGroupRef.current.scale.x, targetScale, 0.08);
    outerGroupRef.current.scale.setScalar(activeScale);
  });

  if (textures.length === 0) return null;

  return (
    <group ref={outerGroupRef}>
      {/* Decorative floating therapeutic particles */}
      <Sparkles
        count={60}
        scale={[4.2, 3.5, 3.2]}
        size={2.6}
        speed={0.4}
        color="#E0A82E"
        opacity={0.4}
      />
      <Sparkles
        count={40}
        scale={[4.8, 4.0, 3.8]}
        size={2.0}
        speed={0.5}
        color="#123A73"
        opacity={0.3}
      />

      <group ref={bookGroupRef}>
        {/* FRONT LEATHER COVER */}
        <Cover
          width={width}
          height={height}
          thickness={0.022}
          rotationY={frontCoverRot}
          isFront={true}
          accentColor="#E0A82E"
        />

        {/* METALLIC SPINE AT HEART PIN */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[spineWidth, height - 0.015, thickness * 0.75]} />
          <meshStandardMaterial color="#060914" roughness={0.55} metalness={0.25} />
        </mesh>

        {/* STATIC LEFT SPREAD SHEET UNDERLAY */}
        {leftPageIndex !== -1 && (
          <PageLeaf
            width={width - 0.018}
            height={height - 0.04}
            rotationY={-Math.PI}
            frontTexture={null}
            backTexture={textures[leftPageIndex]}
            zIndex={0.001}
          />
        )}

        {/* STATIC RIGHT SPREAD SHEET UNDERLAY */}
        {rightPageIndex !== -1 && (
          <PageLeaf
            width={width - 0.018}
            height={height - 0.04}
            rotationY={0}
            frontTexture={textures[rightPageIndex]}
            backTexture={null}
            zIndex={0.0015}
          />
        )}

        {/* FLYING FOLDER TURNING CURRENT SHEET */}
        {turningPageIndex !== -1 && (
          <PageLeaf
            width={width - 0.018}
            height={height - 0.04}
            rotationY={turningRotationY}
            frontTexture={textures[turningPageIndex]}
            backTexture={textures[turningPageIndex + 1]}
            zIndex={0.003}
          />
        )}

        {/* RIGID BACK LEATHER COVER BOUND */}
        <Cover
          width={width}
          height={height}
          thickness={0.022}
          rotationY={backCoverRot}
          isFront={false}
          accentColor="#123A73"
        />
      </group>
    </group>
  );
}
