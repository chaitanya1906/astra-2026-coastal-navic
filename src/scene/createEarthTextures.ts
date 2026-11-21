import * as THREE from 'three';
import { WORLD_OUTLINES } from '../data/globeOutlines';

/**
 * Creates fallback textures procedurally if network/file texture loading fails
 */
export function createFallbackProceduralTextures() {
  const width = 2048;
  const height = 1024;

  // 1. BASE EARTH FALLBACK
  const baseCanvas = document.createElement('canvas');
  baseCanvas.width = width;
  baseCanvas.height = height;
  const baseCtx = baseCanvas.getContext('2d')!;

  const oceanGrad = baseCtx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#04172e');
  oceanGrad.addColorStop(0.5, '#061e38');
  oceanGrad.addColorStop(1, '#04172e');
  baseCtx.fillStyle = oceanGrad;
  baseCtx.fillRect(0, 0, width, height);

  // Coastlines
  baseCtx.fillStyle = '#1e3d29';
  baseCtx.strokeStyle = '#38bdf8';
  baseCtx.lineWidth = 1.5;
  WORLD_OUTLINES.forEach((outline) => {
    baseCtx.beginPath();
    outline.points.forEach(([lat, lng], idx) => {
      const x = ((lng + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      if (idx === 0) baseCtx.moveTo(x, y);
      else baseCtx.lineTo(x, y);
    });
    baseCtx.fill();
    baseCtx.stroke();
  });

  // 2. RADAR SCAN / FLOOD INTERACTION TEXTURE
  const altCanvas = document.createElement('canvas');
  altCanvas.width = width;
  altCanvas.height = height;
  const altCtx = altCanvas.getContext('2d')!;
  altCtx.drawImage(baseCanvas, 0, 0);

  altCtx.fillStyle = 'rgba(14, 165, 233, 0.35)';
  altCtx.fillRect(0, 0, width, height);
  altCtx.strokeStyle = '#f59e0b';
  altCtx.lineWidth = 4;
  WORLD_OUTLINES.forEach((outline) => {
    altCtx.beginPath();
    outline.points.forEach(([lat, lng], idx) => {
      const x = ((lng + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      if (idx === 0) altCtx.moveTo(x, y);
      else altCtx.lineTo(x, y);
    });
    altCtx.stroke();
  });

  // 3. NIGHT LIGHTS FALLBACK
  const lightsCanvas = document.createElement('canvas');
  lightsCanvas.width = width;
  lightsCanvas.height = height;
  const lightsCtx = lightsCanvas.getContext('2d')!;
  lightsCtx.fillStyle = '#000000';
  lightsCtx.fillRect(0, 0, width, height);
  lightsCtx.fillStyle = '#fde68a';
  WORLD_OUTLINES.forEach((outline) => {
    outline.points.forEach(([lat, lng]) => {
      const x = ((lng + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      lightsCtx.beginPath();
      lightsCtx.arc(x, y, 2.5, 0, Math.PI * 2);
      lightsCtx.fill();
    });
  });

  // 4. CLOUDS FALLBACK
  const cloudsCanvas = document.createElement('canvas');
  cloudsCanvas.width = width;
  cloudsCanvas.height = height;
  const cloudCtx = cloudsCanvas.getContext('2d')!;
  cloudCtx.clearRect(0, 0, width, height);
  for (let i = 0; i < 40; i++) {
    const cx = (Math.sin(i * 153.25) * 0.5 + 0.5) * width;
    const cy = (Math.cos(i * 87.13) * 0.4 + 0.5) * height;
    const rx = 100 + (i % 8) * 30;
    const ry = 35 + (i % 6) * 14;
    const grad = cloudCtx.createRadialGradient(cx, cy, 10, cx, cy, rx);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    cloudCtx.fillStyle = grad;
    cloudCtx.beginPath();
    cloudCtx.ellipse(cx, cy, rx, ry, i * 0.25, 0, Math.PI * 2);
    cloudCtx.fill();
  }

  const baseTexture = new THREE.CanvasTexture(baseCanvas);
  baseTexture.colorSpace = THREE.SRGBColorSpace;
  const altTexture = new THREE.CanvasTexture(altCanvas);
  altTexture.colorSpace = THREE.SRGBColorSpace;
  const lightsTexture = new THREE.CanvasTexture(lightsCanvas);
  lightsTexture.colorSpace = THREE.SRGBColorSpace;
  const cloudsTexture = new THREE.CanvasTexture(cloudsCanvas);
  cloudsTexture.colorSpace = THREE.SRGBColorSpace;

  return { baseTexture, altTexture, lightsTexture, cloudsTexture };
}

/**
 * Loads real equirectangular NASA / Blue Marble Earth textures with robust offline/procedural fallback
 */
export function loadRealisticEarthTextures(): {
  dayTexture: THREE.Texture;
  bumpTexture: THREE.Texture;
  nightTexture: THREE.Texture;
  cloudsTexture: THREE.Texture;
  radarAltTexture: THREE.Texture;
} {
  const fallbacks = createFallbackProceduralTextures();
  const loader = new THREE.TextureLoader();

  // Load real day texture
  const dayTexture = loader.load(
    '/textures/earth_day.jpg',
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      tex.needsUpdate = true;
    },
    undefined,
    () => {
      console.warn('Using procedural fallback for day texture');
    }
  );
  dayTexture.colorSpace = THREE.SRGBColorSpace;

  // Load real bump/topography map
  const bumpTexture = loader.load(
    '/textures/earth_bump.png',
    (tex) => {
      tex.needsUpdate = true;
    },
    undefined,
    () => {
      console.warn('Using default for bump texture');
    }
  );

  // Load real night lights texture
  const nightTexture = loader.load(
    '/textures/earth_night.jpg',
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
    },
    undefined,
    () => {
      console.warn('Using procedural fallback for night texture');
    }
  );
  nightTexture.colorSpace = THREE.SRGBColorSpace;

  // Load real cloud texture
  const cloudsTexture = loader.load(
    '/textures/earth_clouds.png',
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
    },
    undefined,
    () => {
      console.warn('Using procedural fallback for clouds texture');
    }
  );
  cloudsTexture.colorSpace = THREE.SRGBColorSpace;

  return {
    dayTexture,
    bumpTexture,
    nightTexture,
    cloudsTexture,
    radarAltTexture: fallbacks.altTexture,
  };
}
