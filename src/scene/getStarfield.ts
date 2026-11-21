import * as THREE from 'three';

interface StarfieldOptions {
  numStars?: number;
}

/**
 * Creates an immersive 3D spherical starfield point cloud.
 */
export default function getStarfield({ numStars = 2000 }: StarfieldOptions = {}) {
  function randomSpherePoint() {
    const radius = 80 + Math.random() * 30;
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    return {
      pos: new THREE.Vector3(x, y, z),
      hue: 0.6 + (Math.random() - 0.5) * 0.2,
      minDist: radius,
    };
  }

  const verts: number[] = [];
  const colors: number[] = [];

  for (let i = 0; i < numStars; i++) {
    const p = randomSpherePoint();
    verts.push(p.pos.x, p.pos.y, p.pos.z);
    const col = new THREE.Color().setHSL(p.hue, 0.4, Math.random() * 0.5 + 0.5);
    colors.push(col.r, col.g, col.b);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  // Circular star texture
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 16, 16);
  const texture = new THREE.CanvasTexture(canvas);

  const mat = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    map: texture,
    transparent: true,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  return points;
}
