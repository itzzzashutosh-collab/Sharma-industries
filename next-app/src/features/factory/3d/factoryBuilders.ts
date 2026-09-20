import * as THREE from 'three';
import { DivisionConfig, PLANT_PILLARS, DIVISIONS } from '../data/factoryData';

// Material Cache to minimize draw calls and GPU memory on 2GB AMD card
const matCache = new Map<string, THREE.Material>();

export function mat(
  color: string | number,
  opts: {
    rough?: number;
    metal?: number;
    emissive?: string | number;
    ei?: number;
    transparent?: boolean;
    opacity?: number;
    depthWrite?: boolean;
    side?: THREE.Side;
  } = {}
) {
  const key = `${color}_${JSON.stringify(opts)}`;
  if (!matCache.has(key)) {
    matCache.set(
      key,
      new THREE.MeshStandardMaterial({
        color: color,
        roughness: opts.rough ?? 0.65,
        metalness: opts.metal ?? 0.08,
        depthWrite: opts.depthWrite ?? (opts.transparent ? false : true),
        side: opts.side ?? THREE.FrontSide,
        ...(opts.emissive ? { emissive: opts.emissive, emissiveIntensity: opts.ei ?? 1 } : {}),
        ...(opts.transparent ? { transparent: true, opacity: opts.opacity ?? 0.5 } : {})
      })
    );
  }
  return matCache.get(key)!;
}

// Rounded box geometry cache
const geoCache = new Map<string, THREE.BufferGeometry>();
export function rboxGeo(w: number, d: number, h: number, r: number = 0.25): THREE.BufferGeometry {
  const key = `${w}_${d}_${h}_${r}`;
  if (geoCache.has(key)) return geoCache.get(key)!;

  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d);
  s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);

  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 4 });
  g.rotateX(-Math.PI / 2); // extrude upwards along Y
  geoCache.set(key, g);
  return g;
}

export function rbox(
  w: number,
  d: number,
  h: number,
  color: string | number,
  r: number = 0.25,
  opts: any = {}
) {
  const m = new THREE.Mesh(rboxGeo(w, d, h, r), mat(color, opts));
  m.castShadow = false;
  m.receiveShadow = false;
  return m;
}

// Texture Loader for Swatch Primary Logo
const textureLoader = new THREE.TextureLoader();
let cachedLogoTexture: THREE.Texture | null = null;
export function getLogoTexture(): THREE.Texture {
  if (!cachedLogoTexture) {
    cachedLogoTexture = textureLoader.load('/logos/swatch_paints_logo_primary.png');
    cachedLogoTexture.colorSpace = THREE.SRGBColorSpace;
  }
  return cachedLogoTexture;
}

/**
 * Creates 2D text label sprite for 3D world billboard
 */
export function makeTextSprite(
  text: string,
  sub: string = '',
  color: string = '#ffffff',
  bgColor: string = 'rgba(15, 23, 42, 0.92)'
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 460;
  canvas.height = 140;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(8, 8, 444, 124, 18);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Status dot
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(36, 48, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(text, 54, 56);

  if (sub) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 20px sans-serif';
    ctx.fillText(sub, 54, 98);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(5.2, 1.6, 1);
  return sprite;
}

/**
 * Real glowing PC Monitor Screen Texture tailored to each specific division
 */
const screenTexCache = new Map<string, THREE.CanvasTexture>();
export function getMonitorScreenTexture(
  title: string,
  color: string,
  type: 'chart' | 'code' | 'crm' = 'chart',
  divId?: string
): THREE.CanvasTexture {
  const key = `${title}_${color}_${type}_${divId || 'default'}`;
  if (screenTexCache.has(key)) return screenTexCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 300;
  const ctx = canvas.getContext('2d')!;

  // Deep tech background
  ctx.fillStyle = '#070b14';
  ctx.fillRect(0, 0, 512, 300);

  // Top header window bar
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 38);

  // Window control dots
  ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(18, 19, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(34, 19, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(50, 19, 5, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(`SWATCH OS • ${title.toUpperCase()} TELEMETRY`, 72, 24);

  if (type === 'chart') {
    // Grid lines
    ctx.strokeStyle = '#172033';
    ctx.lineWidth = 1.5;
    for (let y = 60; y < 280; y += 38) {
      ctx.beginPath(); ctx.moveTo(25, y); ctx.lineTo(485, y); ctx.stroke();
    }

    // Dynamic metrics based on division
    if (divId === 'sales') {
      // Sales Chart
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('₹690.00 / BAG (40% DEALER MARGIN)', 30, 75);
      ctx.fillStyle = '#10b981';
      ctx.font = '13px monospace';
      ctx.fillText('MRP ₹1,150 • Sonu Kumar: ₹430 Floor Tier', 30, 96);

      // Candlestick / Bars
      const bars = [60, 90, 110, 85, 140, 170, 190, 210];
      bars.forEach((b, i) => {
        const bx = 45 + i * 54;
        ctx.fillStyle = color;
        ctx.fillRect(bx, 260 - b, 32, b);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText(`${b}b`, bx + 5, 255 - b);
      });
    } else if (divId === 'ops') {
      // Operations Chart
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('110 KU VISCOSITY • 250 BAGS/DAY', 30, 75);
      ctx.fillStyle = '#10b981';
      ctx.font = '13px monospace';
      ctx.fillText('Batch #B26-09 PASS • Quartz Flow Continuous', 30, 96);

      // Sine wave chart
      ctx.strokeStyle = color;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let x = 30; x < 480; x += 10) {
        const y = 180 + Math.sin(x * 0.04) * 35;
        if (x === 30) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (divId === 'finance') {
      // Finance Stack
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('₹635 LANDED COST • ₹55 NET PROFIT', 30, 75);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '13px monospace';
      ctx.fillText('Base ₹450 + Freight ₹30 + Rep ₹72 + ₹50 Token', 30, 96);

      // Stacked Bar
      const segs = [
        { label: 'Base', val: 450, col: '#3b82f6' },
        { label: 'Freight', val: 30, col: '#0284c7' },
        { label: 'Sales', val: 72, col: '#f59e0b' },
        { label: 'Token', val: 50, col: '#10b981' },
        { label: 'Net', val: 55, col: '#22c55e' }
      ];
      let startX = 30;
      segs.forEach((s) => {
        const w = (s.val / 657) * 440;
        ctx.fillStyle = s.col;
        ctx.fillRect(startX, 150, w, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        if (w > 28) ctx.fillText(s.label, startX + 4, 175);
        startX += w;
      });
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText('Company Net Margin Retention: 8.0% | Dealer Margin: 40.0%', 30, 230);
    } else {
      // Standard division graph
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`${title.toUpperCase()} COMMAND CONSOLE`, 30, 75);
      ctx.fillStyle = color;
      ctx.font = '13px monospace';
      ctx.fillText('Autonomous AI Loop • Real-Time Synchronization', 30, 96);

      ctx.strokeStyle = color;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      const pts = [220, 200, 180, 190, 150, 130, 140, 110, 90, 70];
      pts.forEach((p, idx) => {
        const px = 40 + idx * 45;
        if (idx === 0) ctx.moveTo(px, p);
        else ctx.lineTo(px, p);
      });
      ctx.stroke();
    }
  } else if (type === 'code') {
    const codeColors = ['#38bdf8', '#a855f7', '#34d399', '#f59e0b', '#ec4899', '#94a3b8'];
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`// AI SUBSYSTEM: ${title.toUpperCase()}`, 30, 64);

    for (let i = 0; i < 8; i++) {
      const ly = 90 + i * 22;
      ctx.fillStyle = '#475569';
      ctx.font = '12px monospace';
      ctx.fillText(String(i + 1).padStart(2, '0'), 25, ly);

      const indent = i % 3 === 1 ? 40 : i % 3 === 2 ? 65 : 20;
      const col = codeColors[i % codeColors.length];
      ctx.fillStyle = col;
      ctx.fillRect(50 + indent, ly - 9, 65 + ((i * 47) % 190), 8);

      if (i % 2 === 0) {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(180 + indent, ly - 9, 45, 8);
      }
    }
    // Blinking cursor simulation
    ctx.fillStyle = color;
    ctx.fillRect(60, 266, 10, 15);
  } else {
    // Quota Gauge & CRM
    ctx.fillStyle = color;
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('QUOTA: 200 BAGS / MO', 30, 85);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('Target Quota Floor • Territory Locked', 30, 112);

    ctx.fillStyle = '#1e293b';
    ctx.roundRect(30, 145, 440, 26, 13);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.roundRect(30, 145, 340, 26, 13);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('77% ACHIEVED (154 / 200 BAGS)', 90, 163);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  screenTexCache.set(key, texture);
  return texture;
}

/**
 * Factory Main Floor Plate with safety lines, roadways, and entrance billboard
 */
export function makeFloorPlate(): THREE.Group {
  const group = new THREE.Group();

  // 1. Concrete Plant Foundation Slab (96m x 116m)
  const slab = rbox(96, 116, 1.2, '#1e293b', 2.0);
  slab.position.y = -0.6;
  group.add(slab);

  // Top surface tile
  const topTile = rbox(94, 114, 0.2, '#0f172a', 1.8);
  topTile.position.y = 0.05;
  group.add(topTile);

  // 2. Yellow Safety Walkway Lines
  const hLine = rbox(84, 2.4, 0.05, '#f59e0b', 0.2);
  hLine.position.set(0, 0.1, 6);
  group.add(hLine);

  const hLine2 = rbox(84, 2.0, 0.05, '#f59e0b', 0.2);
  hLine2.position.set(0, 0.1, -10);
  group.add(hLine2);

  const vLine = rbox(2.2, 90, 0.05, '#f59e0b', 0.2);
  vLine.position.set(0, 0.1, -5);
  group.add(vLine);

  // 3. Plant Main Gate Entrance Signboard with Swatch Logo
  const gateSign = new THREE.Group();
  gateSign.position.set(0, 0, 56);

  const p1 = rbox(0.8, 0.8, 8, '#334155');
  p1.position.set(-10, 4, 0);
  const p2 = rbox(0.8, 0.8, 8, '#334155');
  p2.position.set(10, 4, 0);
  gateSign.add(p1, p2);

  // Banner Board
  const banner = rbox(22, 1.2, 4.2, '#0284c7', 0.5);
  banner.position.set(0, 7, 0);
  gateSign.add(banner);

  // Logo on Billboard
  const logoMat = new THREE.MeshBasicMaterial({ map: getLogoTexture(), transparent: true });
  const logoMesh = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.6), logoMat);
  logoMesh.position.set(0, 7, 0.65);
  gateSign.add(logoMesh);

  group.add(gateSign);
  return group;
}

/**
 * HIGH-END EXECUTIVE CABIN WITH FULL PC BATTLESTATION
 * Open-front cutaway so everything inside (desk, dual glowing monitors, tower, chair, leader) is 100% visible!
 */
export function makeExecutiveCabin(division: DivisionConfig): THREE.Group {
  const cabin = new THREE.Group();
  cabin.name = `cabin_${division.id}`;

  const w = 16;
  const d = 14;
  const h = 5.2;

  // 1. Plinth Floor with Division Color Accent
  const floorPlinth = rbox(w, d, 0.4, division.floorColor, 0.6);
  floorPlinth.position.y = 0.2;
  cabin.add(floorPlinth);

  // Border Accent Line
  const border = rbox(w + 0.3, d + 0.3, 0.15, division.themeColor, 0.7);
  border.position.y = 0.08;
  cabin.add(border);

  // Designer Area Rug under the desk
  const rug = rbox(9.5, 7.5, 0.06, '#0f172a', 0.3);
  rug.position.set(0, 0.43, -1.5);
  const rugAccent = rbox(9.1, 7.1, 0.08, division.themeColor, 0.25, { opacity: 0.25, transparent: true });
  rugAccent.position.set(0, 0.44, -1.5);
  cabin.add(rug, rugAccent);

  // 2. Pillars & Back Wall (Acoustic Slats)
  const pillarMat = mat('#334155', { metal: 0.8, rough: 0.3 });
  const pw = 0.4;
  const corners = [
    [-w / 2 + pw, -d / 2 + pw],
    [w / 2 - pw, -d / 2 + pw],
    [-w / 2 + pw, d / 2 - pw],
    [w / 2 - pw, d / 2 - pw]
  ];
  corners.forEach(([cx, cz]) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(pw, h, pw), pillarMat);
    col.position.set(cx, h / 2, cz);
    cabin.add(col);
  });

  // Solid Decorative Back Wall
  const backWall = rbox(w - 0.4, 0.3, h, '#1e293b', 0.1);
  backWall.position.set(0, h / 2, -d / 2 + 0.15);
  cabin.add(backWall);

  // Framed Swatch Canvas Artwork on back wall
  const artFrame = rbox(6.2, 0.1, 2.4, division.themeColor, 0.1);
  artFrame.position.set(0, 3.4, -d / 2 + 0.35);
  const artMat = new THREE.MeshBasicMaterial({ map: getLogoTexture(), transparent: true });
  const artCanvas = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 1.8), artMat);
  artCanvas.position.set(0, 3.4, -d / 2 + 0.42);
  cabin.add(artFrame, artCanvas);

  // Bookshelf / Credenza behind the desk along the back wall
  const credenza = rbox(11, 1.4, 1.8, '#0f172a', 0.2);
  credenza.position.set(0, 0.9, -d / 2 + 1.2);
  cabin.add(credenza);

  // Books & Swatch paint sample cans on credenza
  [-4, -2.5, 2.5, 4].forEach((bx, bIdx) => {
    const book = rbox(0.8, 0.9, 1.1, bIdx % 2 === 0 ? division.themeColor : '#38bdf8', 0.05);
    book.position.set(bx, 2.35, -d / 2 + 1.2);
    cabin.add(book);

    const miniCan = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.7, 10), mat(division.themeColor));
    miniCan.position.set(bx + 0.8, 2.15, -d / 2 + 1.2);
    cabin.add(miniCan);
  });

  // Side Glass Half-Walls (Height 1.6m, crystal clear with depthWrite: false)
  const glassMat = mat(division.themeColor, {
    transparent: true,
    opacity: 0.14,
    rough: 0.1,
    metal: 0.3,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const leftGlass = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, d - 1.0), glassMat);
  leftGlass.position.set(-w / 2 + 0.2, 0.8 + 0.4, 0);
  const leftRail = rbox(0.2, d - 1.0, 0.12, '#475569');
  leftRail.position.set(-w / 2 + 0.2, 2.45, 0);
  cabin.add(leftGlass, leftRail);

  const rightGlass = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, d - 1.0), glassMat);
  rightGlass.position.set(w / 2 - 0.2, 0.8 + 0.4, 0);
  const rightRail = rbox(0.2, d - 1.0, 0.12, '#475569');
  rightRail.position.set(w / 2 - 0.2, 2.45, 0);
  cabin.add(rightGlass, rightRail);

  // 3. ULTRA-DETAILED EXECUTIVE DESK SETUP
  const deskGroup = new THREE.Group();
  deskGroup.position.set(0, 0, -0.8);

  // Desk Tabletop (Walnut finish, height = 1.9m)
  const deskTop = rbox(7.6, 3.4, 0.22, '#451a03', 0.15, { rough: 0.4 });
  deskTop.position.y = 1.9;
  deskGroup.add(deskTop);

  // Desk Steel Frame Legs
  const legMat = mat('#334155', { metal: 0.8 });
  const lLegL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.9, 3.0), legMat);
  lLegL.position.set(-3.5, 0.95, 0);
  const lLegR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.9, 3.0), legMat);
  lLegR.position.set(3.5, 0.95, 0);
  deskGroup.add(lLegL, lLegR);

  // Modesty Panel
  const modesty = rbox(6.8, 0.1, 1.2, '#1e293b');
  modesty.position.set(0, 1.3, 1.4);
  deskGroup.add(modesty);

  // Leather Desk Mat / Mousepad
  const pad = rbox(5.2, 2.2, 0.04, '#09090b', 0.1);
  pad.position.set(0, 2.03, 0);
  deskGroup.add(pad);

  // RGB Backlight Strip along desk rear
  const rgbStrip = rbox(7.0, 0.1, 0.05, division.themeColor, 0.02, { emissive: division.themeColor, ei: 0.9 });
  rgbStrip.position.set(0, 2.05, 1.6);
  deskGroup.add(rgbStrip);

  // 4. DUAL GLOWING MONITORS SETUP
  // Heavy Aluminum Dual-Arm Monitor Stand
  const standBase = rbox(1.2, 0.8, 0.08, '#475569');
  standBase.position.set(0, 2.05, 0.9);
  const standPole = rbox(0.2, 0.2, 1.4, '#475569');
  standPole.position.set(0, 2.7, 0.9);
  deskGroup.add(standBase, standPole);

  // Primary 34" Ultra-Wide Monitor (Live Division Telemetry Chart!)
  const mon1Mat = new THREE.MeshBasicMaterial({
    map: getMonitorScreenTexture(division.shortName, division.themeColor, 'chart', division.id)
  });
  const mon1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.9, 0.1), [
    mat('#1e293b'),
    mat('#1e293b'),
    mat('#1e293b'),
    mat('#1e293b'),
    mon1Mat, // Front display
    mat('#1e293b')
  ]);
  mon1.position.set(-1.7, 3.2, 0.75);
  mon1.rotation.y = 0.16; // Angled towards seated user
  deskGroup.add(mon1);

  // Secondary 27" Vertical Monitor (Code / Terminal / CRM Log)
  const mon2Mat = new THREE.MeshBasicMaterial({
    map: getMonitorScreenTexture(division.lead, '#38bdf8', 'code', division.id)
  });
  const mon2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.9, 0.1), [
    mat('#1e293b'),
    mat('#1e293b'),
    mat('#1e293b'),
    mat('#1e293b'),
    mon2Mat,
    mat('#1e293b')
  ]);
  mon2.position.set(1.5, 3.2, 0.75);
  mon2.rotation.y = -0.22; // Angled towards seated user
  deskGroup.add(mon2);

  // Sleek Open Laptop on Left Side of Desk
  const laptopBase = rbox(1.4, 1.0, 0.05, '#cbd5e1', 0.05, { metal: 0.8 });
  laptopBase.position.set(-2.9, 2.04, -0.2);
  const laptopScreen = rbox(1.4, 0.05, 0.95, '#0284c7', 0.05, { emissive: '#0284c7', ei: 0.8 });
  laptopScreen.position.set(-2.9, 2.5, 0.3);
  laptopScreen.rotation.x = -0.2;
  deskGroup.add(laptopBase, laptopScreen);

  // Backlit Keyboard
  const kb = rbox(2.0, 0.7, 0.05, '#1e293b', 0.05, { emissive: division.themeColor, ei: 0.4 });
  kb.position.set(0, 2.06, -0.3);
  deskGroup.add(kb);

  // Ergonomic Mouse
  const mouse = rbox(0.25, 0.4, 0.06, '#38bdf8', 0.05);
  mouse.position.set(1.3, 2.06, -0.3);
  deskGroup.add(mouse);

  // Glowing High-End Desktop Tower PC under desk
  const tower = rbox(0.9, 1.8, 1.6, '#0f172a', 0.1);
  tower.position.set(2.8, 0.8, 0.2);
  const towerGlass = rbox(0.05, 1.6, 1.4, division.themeColor, 0.05, { emissive: division.themeColor, ei: 0.8 });
  towerGlass.position.set(2.35, 0.8, 0.2);
  deskGroup.add(tower, towerGlass);

  // Steaming Coffee Mug
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.35, 10), mat('#ffffff'));
  mug.position.set(2.2, 2.2, -0.8);
  deskGroup.add(mug);

  // Desk Task Lamp with Warm Light
  const lampBase = rbox(0.4, 0.4, 0.05, '#475569');
  lampBase.position.set(-3.2, 2.05, 0.8);
  const lampPole = rbox(0.08, 0.08, 1.1, '#475569');
  lampPole.position.set(-3.2, 2.6, 0.8);
  const lampShade = rbox(0.8, 0.35, 0.15, '#f59e0b', 0.05, { emissive: '#f59e0b', ei: 0.9 });
  lampShade.position.set(-2.9, 3.1, 0.5);
  lampShade.rotation.z = -0.3;
  deskGroup.add(lampBase, lampPole, lampShade);

  // 5. LUXURY HIGH-BACK EXECUTIVE SWIVEL CHAIR
  const chairGroup = new THREE.Group();
  chairGroup.position.set(0, 0, -1.8);

  // Chrome 5-Star Caster Base
  const cBase = rbox(1.4, 1.4, 0.1, '#94a3b8', 0.3, { metal: 0.9 });
  cBase.position.y = 0.2;
  const cStem = rbox(0.2, 0.2, 0.7, '#64748b', 0.1, { metal: 0.9 });
  cStem.position.y = 0.6;
  chairGroup.add(cBase, cStem);

  // Thick Padded Seat Cushion
  const cSeat = rbox(1.7, 1.7, 0.35, division.themeColor, 0.2);
  cSeat.position.y = 1.1;
  chairGroup.add(cSeat);

  // High-Back Leather Backrest with Headrest
  const cBack = rbox(1.6, 0.25, 2.1, '#0f172a', 0.2);
  cBack.position.set(0, 2.2, -0.75);
  const headrest = rbox(1.0, 0.2, 0.5, division.themeColor, 0.15);
  headrest.position.set(0, 3.3, -0.75);
  chairGroup.add(cBack, headrest);

  // Padded Armrests
  const armL = rbox(0.2, 1.0, 0.6, '#334155');
  armL.position.set(-0.9, 1.5, -0.1);
  const armR = rbox(0.2, 1.0, 0.6, '#334155');
  armR.position.set(0.9, 1.5, -0.1);
  chairGroup.add(armL, armR);

  deskGroup.add(chairGroup);
  cabin.add(deskGroup);

  // Potted Ficus in Corner
  const plantPot = rbox(1.4, 1.4, 1.4, '#cbd5e1', 0.5);
  plantPot.position.set(-w / 2 + 1.8, 0.7, d / 2 - 2.0);
  const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.3, 6, 6), mat('#10b981'));
  leaves.position.set(-w / 2 + 1.8, 2.0, d / 2 - 2.0);
  cabin.add(plantPot, leaves);

  // 6. Overhead Division Nameplate (Elevated and crystal clear!)
  const nameplate = makeTextSprite(division.shortName, `${division.lead} (Chief)`, division.themeColor);
  nameplate.position.set(0, h + 1.2, 0);
  cabin.add(nameplate);

  // Set world 3D position
  cabin.position.set(division.cabinPos[0], division.cabinPos[1], division.cabinPos[2]);
  return cabin;
}

/**
 * Grand Central AI Boardroom where the 7 Division Leads meet & debate
 */
export function makeBoardroom(): THREE.Group {
  const boardroom = new THREE.Group();
  boardroom.name = 'boardroom';
  boardroom.position.set(PLANT_PILLARS.boardroom.pos[0], PLANT_PILLARS.boardroom.pos[1], PLANT_PILLARS.boardroom.pos[2]);

  const bw = 24;
  const bd = 16;

  // 1. Mahogany Executive Podium Base
  const floor = rbox(bw, bd, 0.4, '#1e1b4b', 1.2);
  floor.position.y = 0.2;
  boardroom.add(floor);

  // Blue Neon Halo Outline
  const halo = rbox(bw + 0.4, bd + 0.4, 0.1, '#3b82f6', 1.4, { emissive: '#3b82f6', ei: 0.8 });
  halo.position.y = 0.05;
  boardroom.add(halo);

  // 2. Grand Oval Conference Table
  const tableTop = rbox(14, 7, 0.4, '#312e81', 1.8, { metal: 0.4, rough: 0.3 });
  tableTop.position.set(0, 1.6, 0);
  boardroom.add(tableTop);

  // Table Legs
  const tLeg1 = rbox(1.2, 1.2, 1.4, '#1e1b4b');
  tLeg1.position.set(-4, 0.7, 0);
  const tLeg2 = rbox(1.2, 1.2, 1.4, '#1e1b4b');
  tLeg2.position.set(4, 0.7, 0);
  boardroom.add(tLeg1, tLeg2);

  // 3. Central Holographic Projector Disk
  const holoDisk = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.8, 0.2, 16),
    mat('#38bdf8', { emissive: '#38bdf8', ei: 1.2, transparent: true, opacity: 0.85 })
  );
  holoDisk.position.set(0, 1.82, 0);
  boardroom.add(holoDisk);

  // 7 Conference Swivel Chairs around Table
  DIVISIONS.forEach((div) => {
    const chair = new THREE.Group();
    chair.name = `chair_${div.id}`;
    const seat = rbox(1.4, 1.4, 0.3, div.themeColor, 0.3);
    seat.position.y = 1.0;
    const back = rbox(1.4, 0.25, 1.5, '#0f172a', 0.2);
    back.position.set(0, 1.75, 0.6);
    chair.add(seat, back);
    chair.position.set(div.boardroomSeatPos[0], div.boardroomSeatPos[1], div.boardroomSeatPos[2]);
    chair.lookAt(0, 1.5, 0);
    boardroom.add(chair);
  });

  // Wall Presentation Smart Board
  const screenBg = rbox(12, 0.3, 4.5, '#020617', 0.2);
  screenBg.position.set(0, 4.5, -bd / 2 + 0.4);
  const screenGlow = rbox(11.4, 0.1, 4.0, '#38bdf8', 0.1, { emissive: '#38bdf8', ei: 0.4 });
  screenGlow.position.set(0, 4.5, -bd / 2 + 0.6);
  boardroom.add(screenBg, screenGlow);

  // Boardroom Title Sprite
  const title = makeTextSprite('AI EXECUTIVE BOARDROOM', '7-Division Real-Time Standup & Strategy', '#38bdf8');
  title.position.set(0, 7.8, 0);
  boardroom.add(title);

  return boardroom;
}

/**
 * CEO Executive Command Suite overlooking plant
 */
export function makeCeoSuite(): THREE.Group {
  const suite = new THREE.Group();
  suite.name = 'ceo_suite';
  suite.position.set(PLANT_PILLARS.ceoSuite.pos[0], PLANT_PILLARS.ceoSuite.pos[1], PLANT_PILLARS.ceoSuite.pos[2]);

  const sw = 22;
  const sd = 12;
  const sh = 6.2;

  // Raised Platform
  const base = rbox(sw, sd, 0.6, '#0f172a', 0.8);
  base.position.y = 0.3;
  suite.add(base);

  // Gold Trim
  const goldTrim = rbox(sw + 0.2, sd + 0.2, 0.1, '#eab308', 0.8, { emissive: '#eab308', ei: 0.5 });
  goldTrim.position.y = 0.05;
  suite.add(goldTrim);

  // Glass Enclosure
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(sw - 0.4, sh, sd - 0.4),
    mat('#38bdf8', { transparent: true, opacity: 0.12, rough: 0.1, depthWrite: false })
  );
  glass.position.set(0, sh / 2 + 0.4, 0);
  suite.add(glass);

  // Dual Executive Desk for Ashutosh Sir & Suresh Sir
  const cDesk = rbox(10, 3.4, 1.8, '#1e293b', 0.3, { metal: 0.3 });
  cDesk.position.set(0, 1.2, -1.0);
  suite.add(cDesk);

  // 2 Grand Leather Executive Chairs
  const chair1 = rbox(2.0, 2.0, 2.8, '#09090b', 0.3);
  chair1.position.set(-2.5, 1.6, -3.2);
  const chair2 = rbox(2.0, 2.0, 2.8, '#09090b', 0.3);
  chair2.position.set(2.5, 1.6, -3.2);
  suite.add(chair1, chair2);

  // Wall Swatch Logo Board
  const logoWall = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 2.5),
    new THREE.MeshBasicMaterial({ map: getLogoTexture(), transparent: true })
  );
  logoWall.position.set(0, 3.8, -sd / 2 + 0.6);
  suite.add(logoWall);

  // CEO Suite Title
  const ceoSprite = makeTextSprite('👑 CEO COMMAND SUITE', 'Ashutosh Sharma (CEO) • Suresh Sharma (Founder)', '#eab308');
  ceoSprite.position.set(0, sh + 1.2, 0);
  suite.add(ceoSprite);

  return suite;
}

/**
 * Industrial Paint Mixing Silos & Agitators
 */
export function makeMixingSilos(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'mixing_silos';
  group.position.set(0, 0, -22);

  const siloConfigs = [
    { name: 'Rustic Texture Quartz Silo', color: '#f59e0b', x: -6 },
    { name: 'Weatherguard Exterior Vat', color: '#0284c7', x: 0 },
    { name: 'Shine Luxury Emulsion Vat', color: '#10b981', x: 6 }
  ];

  siloConfigs.forEach((s) => {
    const silo = new THREE.Group();
    silo.position.set(s.x, 0, 0);

    // Steel Base Stand
    const stand = rbox(4.2, 4.2, 1.8, '#334155', 0.4);
    stand.position.y = 0.9;
    silo.add(stand);

    // Silo Cylinder Tank
    const tankGeo = new THREE.CylinderGeometry(1.8, 1.8, 6.5, 16);
    const tankMat = mat('#64748b', { metal: 0.85, rough: 0.25 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.y = 5.0;
    silo.add(tank);

    // Conical Top
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.85, 1.6, 16), tankMat);
    cone.position.y = 8.8;
    silo.add(cone);

    // Color Stripe
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(1.82, 1.82, 0.8, 16), mat(s.color));
    stripe.position.y = 5.5;
    silo.add(stripe);

    // Rotating Agitator Shaft on top (animated in loop)
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.2, 8), mat('#e2e8f0', { metal: 0.9 }));
    shaft.position.y = 9.8;
    shaft.name = 'agitator_shaft';
    silo.add(shaft);

    group.add(silo);
  });

  return group;
}

/**
 * Packaging & 25kg Bagging Line with ₹50 Token Hopper
 */
export function makeConveyorLine(): THREE.Group {
  const line = new THREE.Group();
  line.name = 'bagging_conveyor';
  line.position.set(PLANT_PILLARS.baggingLine.pos[0], PLANT_PILLARS.baggingLine.pos[1], PLANT_PILLARS.baggingLine.pos[2]);

  // Conveyor Frame
  const frame = rbox(18, 3.2, 1.4, '#334155', 0.2);
  frame.position.y = 0.7;
  line.add(frame);

  // Belt surface
  const belt = rbox(17.4, 2.6, 0.1, '#0f172a', 0.1);
  belt.position.y = 1.45;
  line.add(belt);

  // Automatic ₹50 Token & Bagging Hopper Machine
  const hopper = rbox(4.5, 4.0, 6.0, '#0284c7', 0.4);
  hopper.position.set(5, 4.4, 0);
  line.add(hopper);

  const hopperLogo = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 1.2),
    new THREE.MeshBasicMaterial({ map: getLogoTexture(), transparent: true })
  );
  hopperLogo.position.set(5, 5.2, 2.05);
  line.add(hopperLogo);

  // Title Sprite
  const sprite = makeTextSprite('25kg BAGGING & CONVEYOR', '₹50 Painters Growth Token Injection', '#f59e0b');
  sprite.position.set(0, 6.5, 0);
  line.add(sprite);

  // 4 Moving 25kg Swatch Rustic Bags (placed on conveyor)
  const bagsGroup = new THREE.Group();
  bagsGroup.name = 'moving_bags';
  for (let i = 0; i < 4; i++) {
    const bag = rbox(1.8, 1.2, 0.7, '#fef08a', 0.18, { rough: 0.8 });
    bag.position.set(-6 + i * 3.8, 1.85, 0);
    bagsGroup.add(bag);
  }
  line.add(bagsGroup);

  return line;
}

/**
 * Senior Chemist Shahrukh bhai's QC & Formulation Lab
 */
export function makeChemistLab(): THREE.Group {
  const lab = new THREE.Group();
  lab.name = 'chemist_lab';
  lab.position.set(PLANT_PILLARS.chemistLab.pos[0], PLANT_PILLARS.chemistLab.pos[1], PLANT_PILLARS.chemistLab.pos[2]);

  // Lab Floor Tile
  const labFloor = rbox(18, 12, 0.3, '#f1f5f9', 0.5);
  labFloor.position.y = 0.15;
  lab.add(labFloor);

  // Stainless Steel Chemistry Testing Table
  const labTable = rbox(12, 4.5, 1.6, '#cbd5e1', 0.2, { metal: 0.6, rough: 0.3 });
  labTable.position.set(0, 0.9, 0);
  lab.add(labTable);

  // Test Tubes & Viscosity Cups
  const flaskMat = mat('#38bdf8', { transparent: true, opacity: 0.7 });
  for (let i = -3; i <= 3; i += 1.5) {
    const flask = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 0.9, 8), flaskMat);
    flask.position.set(i, 2.0, -0.6);
    lab.add(flask);
  }

  // Digital Viscosity Unit
  const viscoUnit = rbox(2.2, 1.8, 1.2, '#1e293b', 0.1);
  viscoUnit.position.set(3.5, 2.1, 0.5);
  const viscoScreen = rbox(1.6, 0.1, 0.7, '#10b981', 0.05, { emissive: '#10b981', ei: 0.9 });
  viscoScreen.position.set(3.5, 2.3, 1.45);
  lab.add(viscoUnit, viscoScreen);

  // Lab Label
  const labSprite = makeTextSprite('QC & FORMULATION LAB', 'Shahrukh bhai (Senior Chemist)', '#10b981');
  labSprite.position.set(0, 5.8, 0);
  lab.add(labSprite);

  return lab;
}

/**
 * Finished Goods Warehouse & Truck Loading Dock
 */
export function makeWarehouseDock(): THREE.Group {
  const dock = new THREE.Group();
  dock.name = 'warehouse_dock';
  dock.position.set(PLANT_PILLARS.warehouseDock.pos[0], PLANT_PILLARS.warehouseDock.pos[1], PLANT_PILLARS.warehouseDock.pos[2]);

  // Dock Concrete Floor
  const dockFloor = rbox(34, 14, 0.5, '#334155', 0.5);
  dockFloor.position.y = 0.25;
  dock.add(dockFloor);

  // Pallets with 25kg Rustic Bags & 20L Pails
  [-10, -5, 5, 10].forEach((px) => {
    // Wooden Pallet
    const pallet = rbox(3.2, 3.2, 0.35, '#78350f');
    pallet.position.set(px, 0.6, 0);
    dock.add(pallet);

    // Stacked Bags or Pails
    if (px < 0) {
      // Stacked 25kg bags
      for (let layer = 0; layer < 3; layer++) {
        const bag = rbox(2.8, 2.8, 0.5, '#fef08a', 0.1);
        bag.position.set(px, 1.1 + layer * 0.55, 0);
        dock.add(bag);
      }
    } else {
      // 20L Pails (cylinders)
      for (let r = -0.8; r <= 0.8; r += 1.6) {
        for (let c = -0.8; c <= 0.8; c += 1.6) {
          const pail = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.55, 1.4, 12), mat('#0284c7'));
          pail.position.set(px + r, 1.4, c);
          dock.add(pail);
        }
      }
    }
  });

  // Industrial Forklift
  const forklift = new THREE.Group();
  forklift.position.set(-13, 0.5, 4);
  const fBody = rbox(2.8, 4.0, 2.2, '#f59e0b', 0.3);
  fBody.position.y = 1.3;
  const fMast = rbox(0.3, 0.3, 3.5, '#1e293b');
  fMast.position.set(0, 2.0, 2.1);
  forklift.add(fBody, fMast);
  dock.add(forklift);

  // Dock Label
  const dockSprite = makeTextSprite('WAREHOUSE & LOGISTICS DOCK', 'Om Prakash Saini (Loading) • Sonu Kumar (B2B Distributor)', '#f59e0b');
  dockSprite.position.set(0, 6.2, 0);
  dock.add(dockSprite);

  return dock;
}

/**
 * HIGH-DETAIL 3D CHARACTER AVATAR (Figurine)
 * Supports realistic Seated (typing at desk) and Standing poses!
 * Includes stored references in avatar.userData for active typing, looking, and breathing animations!
 */
export function makeWorkerAvatar(
  name: string,
  role: string,
  suitColor: string,
  shirtColor: string = '#ffffff',
  hairColor: string = '#1e293b',
  isSeated: boolean = false,
  divisionId?: string
): THREE.Group {
  const avatar = new THREE.Group();
  avatar.name = `avatar_${name.replace(/\s+/g, '_')}`;

  const pantsMat = mat(suitColor);
  const skinMat = mat('#f5c5a3', { rough: 0.75 });
  const eyeMat = mat('#0f172a', { rough: 0.9 });

  if (isSeated) {
    // ---- REALISTIC SEATED POSE (Hips at local (0, 0, 0)) ----
    // Thighs extending horizontally forward (+Z)
    const lThigh = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.42, 1.2), pantsMat);
    lThigh.position.set(-0.35, 0, 0.6);
    const rThigh = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.42, 1.2), pantsMat);
    rThigh.position.set(0.35, 0, 0.6);
    avatar.add(lThigh, rThigh);

    // Calves going straight down (-Y) from knees
    const lCalf = new THREE.Mesh(new THREE.BoxGeometry(0.48, 1.05, 0.48), pantsMat);
    lCalf.position.set(-0.35, -0.55, 1.15);
    const rCalf = new THREE.Mesh(new THREE.BoxGeometry(0.48, 1.05, 0.48), pantsMat);
    rCalf.position.set(0.35, -0.55, 1.15);
    avatar.add(lCalf, rCalf);

    // Shoes resting on floor
    const lShoe = rbox(0.5, 0.7, 0.3, '#09090b', 0.05);
    lShoe.position.set(-0.35, -1.05, 1.3);
    const rShoe = rbox(0.5, 0.7, 0.3, '#09090b', 0.05);
    rShoe.position.set(0.35, -1.05, 1.3);
    avatar.add(lShoe, rShoe);

    // Torso (upright from hips)
    const torso = rbox(1.5, 0.9, 1.8, suitColor, 0.15);
    torso.position.set(0, 0.9, 0);
    avatar.add(torso);

    // Shirt & Tie / Collar visible strip
    const shirt = rbox(0.55, 0.08, 1.2, shirtColor, 0.05);
    shirt.position.set(0, 1.05, 0.46);
    const tie = rbox(0.18, 0.06, 0.8, suitColor || '#ef4444', 0.02);
    tie.position.set(0, 0.9, 0.5);
    avatar.add(shirt, tie);

    // Shoulders
    const lShoulder = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.4), pantsMat);
    lShoulder.position.set(-0.9, 1.45, 0.1);
    const rShoulder = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.4), pantsMat);
    rShoulder.position.set(0.9, 1.45, 0.1);
    avatar.add(lShoulder, rShoulder);

    // Forearms resting horizontally towards keyboard
    const lFore = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 1.2), pantsMat);
    lFore.position.set(-0.7, 0.82, 0.8);
    const rFore = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 1.2), pantsMat);
    rFore.position.set(0.7, 0.82, 0.8);
    avatar.add(lFore, rFore);

    // Hands resting on keyboard
    const lHand = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.35), skinMat);
    lHand.position.set(-0.55, 0.86, 1.45);
    const rHand = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.35), skinMat);
    rHand.position.set(0.55, 0.86, 1.45);
    avatar.add(lHand, rHand);

    // Head
    const head = new THREE.Group();
    head.position.set(0, 2.25, 0);

    const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.0, 0.95), skinMat);
    head.add(headBox);

    // Eyes
    const lEye = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.06), eyeMat);
    lEye.position.set(-0.24, 0.06, 0.49);
    const rEye = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.06), eyeMat);
    rEye.position.set(0.24, 0.06, 0.49);
    head.add(lEye, rEye);

    // Hair
    const hair = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.4, 1.02), mat(hairColor));
    hair.position.y = 0.52;
    head.add(hair);

    // Modern Tech Headset / Glasses Accent
    const headsetBand = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.08, 12), mat('#64748b', { metal: 0.9 }));
    headsetBand.rotation.z = Math.PI / 2;
    headsetBand.position.y = 0.4;
    head.add(headsetBand);

    avatar.add(head);

    // Floating 3D Billboard Tag above head
    const tag = makeTextSprite(name, `${role} • ACTIVE`, '#38bdf8', 'rgba(10, 18, 36, 0.94)');
    tag.scale.set(5.0, 1.5, 1);
    tag.position.set(0, 3.8, 0);
    avatar.add(tag);

    // Store animation handles in userData
    avatar.userData = {
      isSeated: true,
      leftHand: lHand,
      rightHand: rHand,
      leftHandBaseY: 0.86,
      rightHandBaseY: 0.86,
      head: head,
      torso: torso,
      typingPhase: Math.random() * 10,
      name: name,
      divisionId: divisionId
    };

  } else {
    // ---- STANDING / WALKING POSE ----
    // Shoes
    const lShoe = rbox(0.46, 0.7, 0.32, '#09090b', 0.05);
    lShoe.position.set(-0.38, 0.16, 0);
    const rShoe = rbox(0.46, 0.7, 0.32, '#09090b', 0.05);
    rShoe.position.set(0.38, 0.16, 0);
    avatar.add(lShoe, rShoe);

    // Legs
    const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.9, 0.55), pantsMat);
    lLeg.position.set(-0.38, 1.1, 0);
    const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.9, 0.55), pantsMat);
    rLeg.position.set(0.38, 1.1, 0);
    avatar.add(lLeg, rLeg);

    // Torso
    const torso = rbox(1.4, 0.88, 2.1, suitColor, 0.12);
    torso.position.y = 2.75;
    avatar.add(torso);

    // Shirt strip
    const shirt = rbox(0.55, 0.06, 1.4, shirtColor, 0.05);
    shirt.position.set(0, 2.82, 0.45);
    avatar.add(shirt);

    // Arms
    const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.75, 0.45), pantsMat);
    lArm.position.set(-0.96, 2.6, 0);
    const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.75, 0.45), pantsMat);
    rArm.position.set(0.96, 2.6, 0);
    avatar.add(lArm, rArm);

    // Head
    const head = new THREE.Group();
    head.position.y = 4.35;

    const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.88, 1.0, 0.88), skinMat);
    head.add(headBox);

    const lEye = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.06), eyeMat);
    lEye.position.set(-0.22, 0.05, 0.46);
    const rEye = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.06), eyeMat);
    rEye.position.set(0.22, 0.05, 0.46);
    head.add(lEye, rEye);

    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.38, 0.95), mat(hairColor));
    hair.position.y = 0.55;
    head.add(hair);

    avatar.add(head);

    // Tag
    const tag = makeTextSprite(name, `${role} • LIVE`, '#ffffff', 'rgba(10, 18, 36, 0.94)');
    tag.scale.set(5.0, 1.5, 1);
    tag.position.set(0, 6.2, 0);
    avatar.add(tag);

    avatar.userData = {
      isSeated: false,
      leftArm: lArm,
      rightArm: rArm,
      head: head,
      torso: torso,
      name: name,
      divisionId: divisionId
    };
  }

  return avatar;
}

/**
 * Holographic Selection Ring / Spotlight to highlight selected cabin
 */
export function makeSelectionRing(color: string = '#38bdf8'): THREE.Group {
  const ring = new THREE.Group();
  ring.name = 'selection_highlight_ring';

  // Floating animated circular beacon
  const ringGeo = new THREE.RingGeometry(8.2, 8.8, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = -Math.PI / 2;
  ringMesh.position.y = 0.35;
  ring.add(ringMesh);

  // Vertical holographic light cylinder
  const cylGeo = new THREE.CylinderGeometry(8.5, 8.5, 9.0, 24, 1, true);
  const cylMat = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const cylMesh = new THREE.Mesh(cylGeo, cylMat);
  cylMesh.position.y = 4.5;
  ring.add(cylMesh);

  return ring;
}
