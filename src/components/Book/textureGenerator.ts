import { PageData } from "../../types";

/**
 * Maps original neon or bright accent colors to premium, high-contrast, rich ink colors
 * suitable for rendering text and detailed clinical figures on clean warm ivory paper.
 */
function getContrastAccent(origColor: string): string {
  const c = origColor.toUpperCase();
  if (c === "#DFB24F") return "#92400E"; // Deep rich bronze/gold amber
  if (c === "#38BDF8") return "#0369A1"; // Professional deep medical blue
  if (c === "#F43F5E") return "#BE123C"; // Deep medical crimson ruby
  if (c === "#E2E8F0") return "#334155"; // Slate charcoal ink
  if (c === "#A855F7") return "#6B21A8"; // Royal orchid deep purple
  if (c === "#10B981") return "#065F46"; // Rich therapeutic forest green
  if (c === "#F97316") return "#C2410C"; // Deep clinical burnt rust orange
  return "#0F172A"; // Ultimate dense charcoal fallback
}

/**
 * Redesigned, pixel-perfect text wrapping with proportional formatting
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

/**
 * Draws professional clinical, orthopedic, and biomechanical vector graphics.
 * Rebuilt for high-contrast presentation on organic light paper backgrounds.
 */
function drawScientificVisualizer(
  ctx: CanvasRenderingContext2D,
  type: string,
  cx: number,
  cy: number,
  color: string,
  w: number
) {
  ctx.save();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = color;

  // Draw radial grid lines underneath (soft black for premium contrast)
  ctx.strokeStyle = "rgba(15, 23, 42, 0.05)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let r = 25; r <= 80; r += 25) {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  }
  ctx.stroke();

  // Draw horizontal axes
  ctx.beginPath();
  ctx.moveTo(cx - 100, cy);
  ctx.lineTo(cx + 100, cy);
  ctx.moveTo(cx, cy - 80);
  ctx.lineTo(cx, cy + 80);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;

  if (type === "IISPPR CREST") {
    // Elegant Crest Emblem
    ctx.beginPath();
    ctx.moveTo(cx, cy - 45);
    ctx.bezierCurveTo(cx + 40, cy - 45, cx + 45, cy - 10, cx + 45, cy + 15);
    ctx.quadraticCurveTo(cx + 45, cy + 45, cx, cy + 60);
    ctx.quadraticCurveTo(cx - 45, cy + 45, cx - 45, cy + 15);
    ctx.bezierCurveTo(cx - 45, cy - 10, cx - 40, cy - 45, cx, cy - 45);
    ctx.stroke();

    // Inner Crest Emblem details
    ctx.strokeStyle = "rgba(15, 23, 42, 0.2)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy - 5, 28, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 24px "Inter"';
    ctx.textAlign = "center";
    ctx.fillText("✚", cx, cy + 4);

    ctx.font = 'bold 9px "JetBrains Mono"';
    ctx.fillText("IISPPR", cx, cy - 15);
    ctx.fillText("EST.2018", cx, cy + 24);
  } else if (type === "FORCE PLATES & 3D GAIT") {
    // 3D Isometric Gait Force Vector Plot
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - 60, cy + 20);
    ctx.lineTo(cx, cy + 45);
    ctx.lineTo(cx + 60, cy + 20);
    ctx.lineTo(cx, cy - 5);
    ctx.closePath();
    ctx.stroke();

    // Volumetric loading bar representation
    ctx.fillStyle = "rgba(15, 23, 42, 0.03)";
    ctx.fill();

    // Vertical shear vector line
    const grad = ctx.createLinearGradient(cx, cy + 25, cx, cy - 65);
    grad.addColorStop(0, "rgba(15, 23, 42, 0.1)");
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, color);

    ctx.strokeStyle = grad;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 25);
    ctx.lineTo(cx, cy - 60);
    ctx.stroke();

    // Flow arrow
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 55);
    ctx.lineTo(cx, cy - 70);
    ctx.lineTo(cx + 8, cy - 55);
    ctx.closePath();
    ctx.fill();

    // Ground reaction ripple rings
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 25, 45, 15, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy + 25, 25, 8, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
    ctx.font = '600 11px "JetBrains Mono"';
    ctx.fillText("VECTOR F_z = 2.45 BW", cx - 60, cy - 40);
  } else if (type === "FELLOWSHIP SYLLABUS") {
    // Advanced spiderweb diagnostic spider chart
    const pointsCount = 6;
    const rMax = 65;
    ctx.strokeStyle = "rgba(15, 23, 42, 0.08)";
    ctx.lineWidth = 1;

    // Outer grid polygons
    for (let r = 20; r <= rMax; r += 20) {
      ctx.beginPath();
      for (let i = 0; i < pointsCount; i++) {
        const theta = (i * 2 * Math.PI) / pointsCount - Math.PI / 2;
        ctx.lineTo(cx + r * Math.cos(theta), cy + r * Math.sin(theta));
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Axes lines
    ctx.beginPath();
    for (let i = 0; i < pointsCount; i++) {
      const theta = (i * 2 * Math.PI) / pointsCount - Math.PI / 2;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + rMax * Math.cos(theta), cy + rMax * Math.sin(theta));
    }
    ctx.stroke();

    // Actual kinesiometric performance overlay
    const valMap = [0.95, 0.8, 0.85, 0.7, 0.9, 0.75];
    ctx.beginPath();
    for (let i = 0; i < pointsCount; i++) {
      const theta = (i * 2 * Math.PI) / pointsCount - Math.PI / 2;
      const actR = rMax * valMap[i];
      ctx.lineTo(cx + actR * Math.cos(theta), cy + actR * Math.sin(theta));
    }
    ctx.closePath();
    ctx.fillStyle = `${color}28`; // Translucent overlay
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Bullet nodes on points
    ctx.fillStyle = color;
    for (let i = 0; i < pointsCount; i++) {
      const theta = (i * 2 * Math.PI) / pointsCount - Math.PI / 2;
      const actR = rMax * valMap[i];
      ctx.beginPath();
      ctx.arc(cx + actR * Math.cos(theta), cy + actR * Math.sin(theta), 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
    ctx.font = 'bold 8px "JetBrains Mono"';
    ctx.fillText("BIO-LOAD", cx - 75, cy - 48);
    ctx.fillText("STRETCH", cx + 45, cy - 48);
    ctx.fillText("FORCE", cx + 70, cy + 10);
  } else if (type === "TRIGGER POINT SYSTEMS") {
    // Interlinked skeletal neural muscle networks
    ctx.strokeStyle = "rgba(15, 23, 42, 0.1)";
    ctx.lineWidth = 1;
    const joints = [
      { x: cx - 45, y: cy + 30, node: "TrP-1" },
      { x: cx - 15, y: cy - 35, node: "Core-0" },
      { x: cx + 45, y: cy + 25, node: "TrP-2" },
      { x: cx + 15, y: cy - 15, node: "Acx-B" },
      { x: cx - 5, y: cy + 10, node: "TrP-3" },
    ];

    // Connecting mesh
    ctx.beginPath();
    ctx.moveTo(joints[0].x, joints[0].y);
    for (let i = 1; i < joints.length; i++) {
      ctx.lineTo(joints[i].x, joints[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(joints[1].x, joints[1].y);
    ctx.lineTo(joints[4].x, joints[4].y);
    ctx.moveTo(joints[0].x, joints[0].y);
    ctx.lineTo(joints[3].x, joints[3].y);
    ctx.stroke();

    joints.forEach((j) => {
      // Draw target indicator
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(j.x, j.y, 11, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(j.x, j.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
      ctx.font = '600 9px "JetBrains Mono"';
      ctx.fillText(j.node, j.x + 15, j.y + 4);
    });
  } else if (type === "JOINT MANIPULATION") {
    // High-Velocity Orthopaedic Joint Articulation
    ctx.strokeStyle = "rgba(15, 23, 42, 0.1)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 75, 45, Math.PI / 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 40, -Math.PI / 4, (3 * Math.PI) / 4);
    ctx.stroke();

    // Arrows on rotation vector
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx + 40, cy + 12);
    ctx.lineTo(cx + 28, cy + 28);
    ctx.lineTo(cx + 48, cy + 25);
    ctx.closePath();
    ctx.fill();

    // Concentric bone sockets (clean ink fill on ivory)
    ctx.fillStyle = "#E2E8F0";
    ctx.beginPath();
    ctx.arc(cx - 25, cy - 10, 11, 0, Math.PI * 2);
    ctx.arc(cx + 25, cy + 10, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 25, cy - 10);
    ctx.lineTo(cx + 25, cy + 10);
    ctx.stroke();

    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.font = '600 10px "JetBrains Mono"';
    ctx.fillText("THRUST SPEED: 5.2m/s", cx - 72, cy - 40);
  } else if (type === "RETURNING SCHEDULE") {
    // Re-injury index vs. Training Weeks Load Chart
    ctx.strokeStyle = "rgba(15, 23, 42, 0.1)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 75, cy + 45);
    ctx.lineTo(cx + 75, cy + 45); // X-axis
    ctx.moveTo(cx - 75, cy - 45);
    ctx.lineTo(cx - 75, cy + 45); // Y-axis
    ctx.stroke();

    const heights = [22, 38, 55, 68, 85];
    const bw = 16;
    const gap = 12;
    const sx = cx - (heights.length * (bw + gap)) / 2;

    for (let i = 0; i < heights.length; i++) {
      const x = sx + i * (bw + gap);
      const h = heights[i];
      const y = cy + 45 - h;

      // Draw beautiful dynamic bar
      ctx.fillStyle = i === heights.length - 1 ? color : `${color}25`;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(x, y, bw, h, [4, 4, 0, 0]);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
      ctx.font = '600 9px "JetBrains Mono"';
      ctx.fillText(`WK${i + 1}`, x, cy + 58);
    }

    // Progression curve line overlay (dense slate dark)
    ctx.strokeStyle = "#0F172A";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sx + bw / 2, cy + 45 - heights[0]);
    for (let i = 1; i < heights.length; i++) {
      ctx.lineTo(sx + i * (bw + gap) + bw / 2, cy + 45 - heights[i]);
    }
    ctx.stroke();
  } else if (type === "PRO CHAMPIONS LOGO" || type === "IISPPR SPORTS EMBLEM") {
    // Kinetic Athletic Running Node Model
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    // Head
    ctx.fillStyle = "#0F172A";
    ctx.beginPath();
    ctx.arc(cx - 15, cy - 36, 8, 0, Math.PI * 2);
    ctx.fill();

    // Thoracic spine
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 28);
    ctx.lineTo(cx - 3, cy - 5);

    // Dynamic front arm
    ctx.lineTo(cx + 25, cy - 8);
    ctx.moveTo(cx - 15, cy - 28);

    // Flexed back arm
    ctx.lineTo(cx - 36, cy - 20);

    // Front sprinting thigh and calf
    ctx.moveTo(cx - 3, cy - 5);
    ctx.lineTo(cx + 12, cy + 20);
    ctx.lineTo(cx + 36, cy + 25);

    // Back leg extension
    ctx.moveTo(cx - 3, cy - 5);
    ctx.lineTo(cx - 24, cy + 18);
    ctx.lineTo(cx - 14, cy + 42);

    ctx.stroke();

    // Node Joints
    ctx.fillStyle = color;
    const pts = [
      { x: cx - 3, y: cy - 5 },
      { x: cx + 12, y: cy + 20 },
      { x: cx - 24, y: cy + 18 },
    ];
    pts.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
    ctx.font = 'bold 9px "JetBrains Mono"';
    ctx.fillText("LOAD DISTRIBUTION MAP", cx - 64, cy + 60);
  }

  ctx.restore();
}

/**
 * Draws the complete page layout on a high-contrast luxury, warm ivory linen paper texture.
 */
export function drawPageTexture(canvas: HTMLCanvasElement, page: PageData, isLeftPage: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const physicalW = canvas.width;
  const physicalH = canvas.height;

  // Render high-contrast pristine pure white base background across the full physical resolution
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, physicalW, physicalH);

  // Use a beautifully configured baseline layout resolution (1024x1448) for crisp, proportional scaling
  const w = 1024;
  const h = 1448;

  ctx.save();
  ctx.scale(physicalW / w, physicalH / h);

  // Volumetric subtle technical background grid lines in ink-tone opacity (extremely subtle)
  ctx.strokeStyle = "rgba(15, 23, 42, 0.015)";
  ctx.lineWidth = 1;
  const spacing = 40;
  ctx.beginPath();
  for (let x = 0; x < w; x += spacing) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y < h; y += spacing) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  // Elegant luxury bounding clinical margin frames
  ctx.strokeStyle = "rgba(15, 23, 42, 0.07)";
  ctx.lineWidth = 2.5;
  const pad = 60;
  ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

  // Soft spine gradient shadow depending on page orientation
  const shadowGrad = ctx.createLinearGradient(isLeftPage ? w - 50 : 0, 0, isLeftPage ? w : 50, 0);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.28)");
  shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.1)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(isLeftPage ? w - 50 : 0, 0, 50, h);

  // Map to beautiful high-contrast deep ink colors for elite legibility
  const inkColor = getContrastAccent(page.accentColor);

  // Page Header Metadata
  ctx.fillStyle = inkColor;
  ctx.beginPath();
  ctx.arc(pad + 15, pad + 38, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.fillText(page.category || "IISPPR MANUAL", pad + 32, pad + 45);

  ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillText(
    isLeftPage ? "INTERNATIONAL MEDICAL FELLOWSHIP" : "CLINICAL PERFORMANCE SYSTEMS",
    w - pad - 340,
    pad + 44
  );

  // Segment rule line
  ctx.strokeStyle = "rgba(15, 23, 42, 0.09)";
  ctx.beginPath();
  ctx.moveTo(pad + 10, pad + 70);
  ctx.lineTo(w - pad - 10, pad + 70);
  ctx.stroke();

  // High-contrast Main Title in rich charcoal black ink
  ctx.fillStyle = "#0A0F1D";
  ctx.font = 'bold 50px "Space Grotesk", sans-serif';
  const startY = pad + 150;
  ctx.fillText(page.title, pad + 20, startY);

  // Subtitle
  ctx.fillStyle = inkColor;
  ctx.font = 'italic 500 24px "Space Grotesk", sans-serif';
  ctx.fillText(page.subtitle || "", pad + 20, startY + 48);

  // Paragraph Summary Text
  ctx.fillStyle = "#2D3748"; // Dense readable dark grey slate
  ctx.font = '400 19px "Inter", sans-serif';
  const bodyY = startY + 110;
  const wrappedEndY = wrapText(ctx, page.description, pad + 20, bodyY, w - pad * 2 - 40, 30);

  // Interactive bullet points list drawn inside clean micro-cards
  if (page.bullets && page.bullets.length > 0) {
    let bulletY = wrappedEndY + 20;
    ctx.font = '400 17px "Inter", sans-serif';
    page.bullets.forEach((bullet) => {
      // Clean high-contrast card border & fill
      ctx.fillStyle = "rgba(15, 23, 42, 0.02)";
      ctx.strokeStyle = "rgba(15, 23, 42, 0.05)";
      ctx.lineWidth = 1;
      const ch = 44;
      ctx.beginPath();
      ctx.roundRect(pad + 20, bulletY - 26, w - pad * 2 - 40, ch, 6);
      ctx.fill();
      ctx.stroke();

      // Colored bullet ring in contrast accent
      ctx.fillStyle = inkColor;
      ctx.beginPath();
      ctx.arc(pad + 45, bulletY - 4, 4, 0, Math.PI * 2);
      ctx.fill();

      // Bullet text
      ctx.fillStyle = "#1A202C"; // Solid visibility
      ctx.fillText(bullet.replace("● ", ""), pad + 68, bulletY);
      bulletY += 54;
    });
  }

  // Draw Procedural Orthopaedic or Sports Kinematics Drawing on bottom
  drawScientificVisualizer(ctx, page.imageText || "IISPPR CREST", w / 2, h - 225, inkColor, w);

  // Footer Rule line
  ctx.strokeStyle = "rgba(15, 23, 42, 0.08)";
  ctx.beginPath();
  ctx.moveTo(pad + 10, h - pad - 60);
  ctx.lineTo(w - pad - 10, h - pad - 60);
  ctx.stroke();

  // Page Numbers in ink style
  ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
  ctx.font = '600 16px "JetBrains Mono", monospace';
  const no = (page.id + 1).toString().padStart(2, "0");
  ctx.fillText(`CLINICAL FILE [ REF #0${no} ]`, pad + 20, h - pad - 26);
  ctx.fillText("IISPPR EDUCATION SYSTEMS © 2026", w - pad - 310, h - pad - 26);

  // If enrollment CTA represents
  if (page.ctaText) {
    const ctaW = 240;
    const ctaH = 46;
    const ctaX = w / 2 - ctaW / 2;
    const ctaY = h - pad - 140;

    ctx.shadowColor = "rgba(15, 23, 42, 0.15)";
    ctx.shadowBlur = 12;
    ctx.fillStyle = inkColor;
    ctx.beginPath();
    ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 23);
    ctx.fill();
    ctx.shadowBlur = 0; // reset shadow

    ctx.fillStyle = "#FFFFFF"; // White text on filled deep label
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.textAlign = "center";
    ctx.fillText(page.ctaText, w / 2, ctaY + 28);
    ctx.textAlign = "left";
  }

  ctx.restore();
}
