import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import getFresnelMat from './scene/getFresnelMat';
import getStarfield from './scene/getStarfield';
import { loadRealisticEarthTextures } from './scene/createEarthTextures';
import { WORLD_OUTLINES } from './data/globeOutlines';

import {
  CoastalLocation,
  GLOBAL_COASTAL_DATASET,
  findNearestCoastalHub,
} from './data/globalCoastalDataset';
import { fetchLiveMarineData, LiveMarineData } from './services/liveCoastalFeed';
import { predictCoastalRisk, AIPredictionResult } from './simulation/aiFloodModel';
import { buildNavICEmergencyPacket, NavICEmergencyPacket } from './simulation/navicRelay';

import { TopNav } from './components/TopNav';
import { RightDrawer } from './components/RightDrawer';
import { BottomDock } from './components/BottomDock';

// ─── Exact latLng → Three.js Vector3 formula aligned with SphereGeometry UV ─────────────────────────
function latLngToVector3(lat: number, lng: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

// ─── Inverse formula: Three.js local Vector3 → (lat, lng) ────────────────────────────────────────────
function vector3ToLatLng(v: THREE.Vector3): { lat: number; lng: number } {
  const radius = v.length();
  const lat = 90 - (Math.acos(v.y / radius) * 180) / Math.PI;
  const lng = ((Math.atan2(v.z, -v.x) * 180) / Math.PI) - 180;
  return { lat, lng: lng < -180 ? lng + 360 : lng };
}

// ─── Default location: India (Puri Coast) ───────────────────────────────────────────────────────────
const DEFAULT_LOCATION: CoastalLocation =
  GLOBAL_COASTAL_DATASET.find((l) => l.id === 'in-puri') ?? GLOBAL_COASTAL_DATASET[0];

const DEFAULT_MARINE: LiveMarineData = {
  isLive: false,
  waveHeightMeters: null,
  windSpeedKmh: null,
  seaTemperatureC: null,
  source: 'Pre-Built Global Coastal Dataset',
  fetchedAt: '--',
};

export function App() {
  const mountRef = useRef<HTMLDivElement>(null);

  // ── Application State ──────────────────────────────────────────────────────────────────────────────
  const [selectedLocation, setSelectedLocation] = useState<CoastalLocation>(DEFAULT_LOCATION);
  const [isOpenOceanClick, setIsOpenOceanClick] = useState(false);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [liveMarine, setLiveMarine] = useState<LiveMarineData>(DEFAULT_MARINE);
  const [manualSurgeMeters, setManualSurgeMeters] = useState<number>(0.5);
  const [sosTriggered, setSosTriggered] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // ── AI Flood & Outage Prediction (runs on every state change) ─────────────────────────────────────
  const aiPrediction: AIPredictionResult = useMemo(() => {
    return predictCoastalRisk({
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      elevationMeters: selectedLocation.elevationMeters,
      surgeMeters: manualSurgeMeters,
      shorelineDistanceKm: 1.8,
      infrastructureDensity: 0.85,
    });
  }, [selectedLocation, manualSurgeMeters]);

  // ── NavIC Emergency Packet (derived from AI + SOS state) ──────────────────────────────────────────
  const navicPacket: NavICEmergencyPacket = useMemo(() => {
    return buildNavICEmergencyPacket(
      selectedLocation.lat,
      selectedLocation.lng,
      selectedLocation.city,
      aiPrediction,
      sosTriggered || currentStep === 3
    );
  }, [selectedLocation, aiPrediction, sosTriggered, currentStep]);

  // ── Derive guided step from surge level ────────────────────────────────────────────────────────────
  const derivedStep: 1 | 2 | 3 = (() => {
    if (currentStep === 3 || sosTriggered) return 3;
    if (manualSurgeMeters >= 2.0) return 2;
    return 1;
  })();

  // ── Fetch live marine data whenever selected location changes ─────────────────────────────────────
  useEffect(() => {
    setLiveMarine(DEFAULT_MARINE);
    fetchLiveMarineData(selectedLocation.lat, selectedLocation.lng).then(setLiveMarine);
  }, [selectedLocation.lat, selectedLocation.lng]);

  // ── Bridging ref so Three.js animation loop can read latest React state ───────────────────────────
  const appStateRef = useRef<{
    selectedLocation: CoastalLocation;
    aiPrediction: AIPredictionResult;
    navicPacket: NavICEmergencyPacket;
    manualSurgeMeters: number;
    autoRotate: boolean;
    pendingFocusLocation: CoastalLocation | null;
    targetCamPos: THREE.Vector3 | null;
    targetLookAt: THREE.Vector3 | null;
    currentLookAt: THREE.Vector3;
    setSelectedLocation: (loc: CoastalLocation) => void;
    setClickedCoords: (coords: { lat: number; lng: number } | null) => void;
    setIsOpenOceanClick: (v: boolean) => void;
  }>({
    selectedLocation: DEFAULT_LOCATION,
    aiPrediction,
    navicPacket,
    manualSurgeMeters,
    autoRotate: true,
    pendingFocusLocation: null,
    targetCamPos: null,
    targetLookAt: null,
    currentLookAt: new THREE.Vector3(0, 0, 0),
    setSelectedLocation,
    setClickedCoords,
    setIsOpenOceanClick,
  });

  // Keep ref in sync with React state
  useEffect(() => {
    appStateRef.current.selectedLocation = selectedLocation;
    appStateRef.current.aiPrediction = aiPrediction;
    appStateRef.current.navicPacket = navicPacket;
    appStateRef.current.manualSurgeMeters = manualSurgeMeters;
    appStateRef.current.setSelectedLocation = setSelectedLocation;
    appStateRef.current.setClickedCoords = setClickedCoords;
    appStateRef.current.setIsOpenOceanClick = setIsOpenOceanClick;

    // Every time selectedLocation changes, trigger a smooth camera focus
    appStateRef.current.autoRotate = false;
    appStateRef.current.pendingFocusLocation = selectedLocation;
  }, [selectedLocation, aiPrediction, navicPacket, manualSurgeMeters]);

  // ── Handlers ───────────────────────────────────────────────────────────────────────────────────────
  const handleSelectLocation = (loc: CoastalLocation) => {
    setSelectedLocation(loc);
    setIsOpenOceanClick(false);
    setClickedCoords(null);
    setSosTriggered(false);
    setCurrentStep(1);
    setManualSurgeMeters(0.5);
  };

  const handleSendSos = () => {
    setSosTriggered(true);
    setCurrentStep(3);
  };

  const handleStepClick = (step: 1 | 2 | 3) => {
    setCurrentStep(step);
    if (step === 1) { setManualSurgeMeters(0.5); setSosTriggered(false); }
    else if (step === 2) { setManualSurgeMeters(3.8); setSosTriggered(false); }
    else { setManualSurgeMeters(4.5); setSosTriggered(true); }
  };

  // ── Three.js Scene Setup ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 2. SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020308);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0.35, 2.5);

    // 3. ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.25;
    controls.maxDistance = 6.0;
    controls.enablePan = false;

    controls.addEventListener('start', () => {
      appStateRef.current.autoRotate = false;
    });

    // 4. EARTH GROUP — -23.4° axial tilt
    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = (-23.4 * Math.PI) / 180;
    scene.add(earthGroup);

    // 5. GEOMETRIES — SphereGeometry for perfect equirectangular UV alignment
    const earthGeo = new THREE.SphereGeometry(1.0, 96, 64);
    const lightsGeo = new THREE.SphereGeometry(1.001, 96, 64);
    const cloudsGeo = new THREE.SphereGeometry(1.004, 96, 64);
    const glowGeo = new THREE.SphereGeometry(1.015, 64, 48);

    // 6. REALISTIC TEXTURES
    const { dayTexture, bumpTexture, nightTexture, cloudsTexture } = loadRealisticEarthTextures();

    // 7. EARTH MESH
    const earthMat = new THREE.MeshStandardMaterial({
      map: dayTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.035,
      roughness: 0.75,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // 8. LIGHTING
    const sunlight = new THREE.DirectionalLight(0xfff8e7, 2.2);
    sunlight.position.set(3, 2, 4);
    scene.add(sunlight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-3, -1, -2);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x0f172a, 0.75);
    scene.add(hemiLight);

    // 9. NIGHT CITY LIGHTS
    const lightsMat = new THREE.MeshBasicMaterial({
      map: nightTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const lightsMesh = new THREE.Mesh(lightsGeo, lightsMat);
    earthMesh.add(lightsMesh);

    // 10. CLOUDS
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    earthMesh.add(cloudsMesh);

    // 11. FRESNEL ATMOSPHERIC GLOW
    const fresnelMat = getFresnelMat({ rimHex: 0x38bdf8, facingHex: 0x000000 });
    const glowMesh = new THREE.Mesh(glowGeo, fresnelMat);
    earthGroup.add(glowMesh);

    // 12. STARFIELD
    const stars = getStarfield({ numStars: 2000 });
    scene.add(stars);

    // 13. COUNTRY BORDERS (attached to earthMesh for lockstep rotation)
    const countryBordersGroup = new THREE.Group();
    earthMesh.add(countryBordersGroup);

    WORLD_OUTLINES.forEach((outline) => {
      const pts: THREE.Vector3[] = [];
      outline.points.forEach(([lat, lng]) => {
        const [x, y, z] = latLngToVector3(lat, lng, 1.0025);
        pts.push(new THREE.Vector3(x, y, z));
      });
      const borderGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const borderMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.65,
      });
      const borderLine = new THREE.Line(borderGeo, borderMat);
      countryBordersGroup.add(borderLine);
    });

    // 14. 3D ORBITING SATELLITES & ORBITAL RINGS
    const satelliteRingsGroup = new THREE.Group();
    earthGroup.add(satelliteRingsGroup);

    const ringRadii = [1.52, 1.72, 1.95];
    const ringTilts = [
      { x: 0.25, z: 0.4 },
      { x: -0.35, z: -0.2 },
      { x: 0.5, z: -0.5 },
    ];

    ringRadii.forEach((r, idx) => {
      const ringGeo = new THREE.BufferGeometry();
      const segments = 128;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r));
      }
      ringGeo.setFromPoints(pts);
      const ringLine = new THREE.Line(
        ringGeo,
        new THREE.LineBasicMaterial({
          color: idx === 0 ? 0x00f0ff : idx === 1 ? 0x38bdf8 : 0xf59e0b,
          transparent: true,
          opacity: 0.35,
        })
      );
      ringLine.rotation.x = ringTilts[idx].x;
      ringLine.rotation.z = ringTilts[idx].z;
      satelliteRingsGroup.add(ringLine);
    });

    function createSatelliteMesh(busColor: number) {
      const sat = new THREE.Group();
      const bus = new THREE.Mesh(
        new THREE.BoxGeometry(0.065, 0.065, 0.1),
        new THREE.MeshStandardMaterial({ color: busColor, metalness: 0.9, roughness: 0.2 })
      );
      sat.add(bus);

      const dish = new THREE.Mesh(
        new THREE.ConeGeometry(0.045, 0.035, 12, 1, true),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.15, side: THREE.DoubleSide })
      );
      dish.position.y = 0.055;
      dish.rotation.x = Math.PI;
      sat.add(dish);

      const panelGeo = new THREE.BoxGeometry(0.18, 0.06, 0.005);
      const panelMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.95, roughness: 0.1 });
      const panelL = new THREE.Mesh(panelGeo, panelMat);
      panelL.position.x = 0.14;
      sat.add(panelL);
      const panelR = new THREE.Mesh(panelGeo, panelMat);
      panelR.position.x = -0.14;
      sat.add(panelR);

      return sat;
    }

    const satellites = [
      { mesh: createSatelliteMesh(0xf59e0b), radius: 1.52, speed: 0.5, tilt: ringTilts[0], phase: 0.0 },
      { mesh: createSatelliteMesh(0x38bdf8), radius: 1.52, speed: 0.5, tilt: ringTilts[0], phase: Math.PI },
      { mesh: createSatelliteMesh(0x10b981), radius: 1.72, speed: 0.38, tilt: ringTilts[1], phase: 1.2 },
      { mesh: createSatelliteMesh(0xec4899), radius: 1.95, speed: 0.28, tilt: ringTilts[2], phase: 2.8 },
    ];
    satellites.forEach((sat) => earthGroup.add(sat.mesh));

    // Rescue beam (satellite → SOS pin)
    const beamGeo1 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const beamMat1 = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.9 });
    const rescueBeam1 = new THREE.Line(beamGeo1, beamMat1);
    earthGroup.add(rescueBeam1);

    // Radar sweep beam
    const beamGeo2 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const beamMat2 = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
    const radarBeam2 = new THREE.Line(beamGeo2, beamMat2);
    earthGroup.add(radarBeam2);

    // 15. SURFACE MARKERS GROUP (child of earthMesh for lockstep rotation)
    const surfaceMarkersGroup = new THREE.Group();
    earthMesh.add(surfaceMarkersGroup);

    // Rescue route vector on globe surface
    const rescueRouteGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const rescueRouteMat = new THREE.LineDashedMaterial({
      color: 0x00f0ff,
      dashSize: 0.02,
      gapSize: 0.01,
      transparent: true,
      opacity: 0.95,
    });
    const rescueRouteLine = new THREE.Line(rescueRouteGeo, rescueRouteMat);
    surfaceMarkersGroup.add(rescueRouteLine);

    function createGroundBeacon(
      pos: THREE.Vector3,
      colorHex: number,
      stemHeight: number,
      pulseScale: number = 1.0,
      showRings: boolean = true
    ) {
      const beaconGroup = new THREE.Group();
      beaconGroup.position.copy(pos);
      const normal = pos.clone().normalize();
      beaconGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      if (showRings) {
        const ringMesh = new THREE.Mesh(
          new THREE.RingGeometry(0.007 * pulseScale, 0.015 * pulseScale, 16),
          new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.85, depthWrite: false })
        );
        ringMesh.rotation.x = Math.PI / 2;
        beaconGroup.add(ringMesh);
      }

      const stemMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.002, 0.002, stemHeight, 6),
        new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.9, depthWrite: false })
      );
      stemMesh.position.y = stemHeight / 2;
      beaconGroup.add(stemMesh);

      const tipMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.005 * pulseScale, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff, depthWrite: false })
      );
      tipMesh.position.y = stemHeight;
      beaconGroup.add(tipMesh);

      return beaconGroup;
    }

    // 16. CLICK-TO-INSPECT — drag discrimination + nearest coastal hub lookup
    const raycaster = new THREE.Raycaster();
    const clickCoord = new THREE.Vector2();
    let pointerDownTime = 0;
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerDown = (e: MouseEvent) => {
      pointerDownTime = performance.now();
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: MouseEvent) => {
      const elapsed = performance.now() - pointerDownTime;
      const dx = Math.abs(e.clientX - pointerDownPos.x);
      const dy = Math.abs(e.clientY - pointerDownPos.y);
      if (elapsed > 400 || dx > 5 || dy > 5) return;

      clickCoord.x = (e.clientX / window.innerWidth) * 2 - 1;
      clickCoord.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(clickCoord, camera);
      const intersects = raycaster.intersectObject(earthMesh, false);

      if (intersects.length > 0) {
        appStateRef.current.autoRotate = false;

        const hitWorld = intersects[0].point.clone();
        const hitLocal = hitWorld.clone();
        earthMesh.worldToLocal(hitLocal);

        const { lat, lng } = vector3ToLatLng(hitLocal);
        const { location, isOpenOcean } = findNearestCoastalHub(lat, lng);

        // Update React state through refs
        appStateRef.current.setClickedCoords({ lat, lng });
        appStateRef.current.setIsOpenOceanClick(isOpenOcean);
        appStateRef.current.setSelectedLocation(location);

        // Trigger camera focus to clicked coastal hub
        const [lx, ly, lz] = latLngToVector3(location.lat, location.lng, 1.0);
        const localPoint = new THREE.Vector3(lx, ly, lz);
        earthMesh.updateMatrixWorld(true);
        const worldPoint = localPoint.clone();
        earthMesh.localToWorld(worldPoint);
        const worldNormal = worldPoint.clone().normalize();
        appStateRef.current.targetCamPos = worldNormal.clone().multiplyScalar(2.35);
        appStateRef.current.targetLookAt = worldPoint.clone().multiplyScalar(0.05);
      }
    };

    renderer.domElement.addEventListener('mousedown', handlePointerDown);
    renderer.domElement.addEventListener('mouseup', handlePointerUp);

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 17. ANIMATION LOOP
    let animId: number;
    const clock = new THREE.Clock();

    function animate() {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle auto-spin before first user interaction
      if (appStateRef.current.autoRotate) {
        earthMesh.rotation.y += 0.0007;
        cloudsMesh.rotation.y += 0.0004;
      }

      // Handle pending camera focus to a newly selected location
      if (appStateRef.current.pendingFocusLocation) {
        const loc = appStateRef.current.pendingFocusLocation;
        appStateRef.current.pendingFocusLocation = null;

        const [lx, ly, lz] = latLngToVector3(loc.lat, loc.lng, 1.0);
        const localPoint = new THREE.Vector3(lx, ly, lz);
        earthMesh.updateMatrixWorld(true);
        const worldPoint = localPoint.clone();
        earthMesh.localToWorld(worldPoint);
        const worldNormal = worldPoint.clone().normalize();
        appStateRef.current.targetCamPos = worldNormal.clone().multiplyScalar(2.35);
        appStateRef.current.targetLookAt = worldPoint.clone().multiplyScalar(0.05);
      }

      // Smooth camera lerp
      if (appStateRef.current.targetCamPos) {
        camera.position.lerp(appStateRef.current.targetCamPos, 0.06);
        if (appStateRef.current.targetLookAt) {
          appStateRef.current.currentLookAt.lerp(appStateRef.current.targetLookAt, 0.06);
          controls.target.copy(appStateRef.current.currentLookAt);
        }
        if (camera.position.distanceTo(appStateRef.current.targetCamPos) < 0.015) {
          appStateRef.current.targetCamPos = null;
        }
      }

      // Animate satellites
      satellites.forEach((sat, idx) => {
        const theta = elapsedTime * sat.speed + sat.phase;
        const rawPos = new THREE.Vector3(Math.cos(theta) * sat.radius, 0, Math.sin(theta) * sat.radius);
        rawPos.applyAxisAngle(new THREE.Vector3(1, 0, 0), sat.tilt.x);
        rawPos.applyAxisAngle(new THREE.Vector3(0, 0, 1), sat.tilt.z);
        sat.mesh.position.copy(rawPos);
        sat.mesh.lookAt(new THREE.Vector3(0, 0, 0));
        sat.mesh.rotation.y += 0.01 * (idx + 1);
      });

      // ── Surface markers (re-built each frame inside earthMesh) ──────────────────────────────────
      const loc = appStateRef.current.selectedLocation;
      const currentAi = appStateRef.current.aiPrediction;
      const currentNavic = appStateRef.current.navicPacket;
      const surgeM = appStateRef.current.manualSurgeMeters;

      surfaceMarkersGroup.clear();
      surfaceMarkersGroup.add(rescueRouteLine); // keep rescue line in group

      // SOS pin at selected coastal hub
      const [sx, sy, sz] = latLngToVector3(loc.lat, loc.lng, 1.004);
      const sosPosLocal = new THREE.Vector3(sx, sy, sz);

      const pulse = 1.0 + Math.sin(elapsedTime * 6) * 0.25;
      const isRescueActive = currentNavic.rescueStatus === 'Rescue Vessel Dispatched';
      const sosColor = isRescueActive ? 0x00f0ff : currentAi.blackoutActive ? 0xf43f5e : 0xf59e0b;
      const sosBeacon = createGroundBeacon(sosPosLocal, sosColor, 0.065, pulse, true);
      surfaceMarkersGroup.add(sosBeacon);

      // Flood zone markers at ± lat/lng offset to show inundation spread
      const floodOffsets = [
        [loc.lat + 0.4, loc.lng + 0.3],
        [loc.lat - 0.5, loc.lng + 0.6],
        [loc.lat + 0.2, loc.lng - 0.4],
        [loc.lat - 0.3, loc.lng - 0.5],
      ];
      const isFlooded = surgeM >= loc.elevationMeters;
      floodOffsets.forEach(([flat, flng]) => {
        const [fx, fy, fz] = latLngToVector3(flat, flng, 1.004);
        const fp = new THREE.Vector3(fx, fy, fz);
        const fb = createGroundBeacon(fp, isFlooded ? 0xf43f5e : 0xf59e0b, 0.03, 0.9, true);
        surfaceMarkersGroup.add(fb);
      });

      // Mobile tower status markers
      const towerOffsets = [
        [loc.lat + 0.15, loc.lng + 0.12],
        [loc.lat - 0.18, loc.lng + 0.2],
        [loc.lat + 0.1, loc.lng - 0.22],
      ];
      towerOffsets.forEach(([tlat, tlng]) => {
        const [tx, ty, tz] = latLngToVector3(tlat, tlng, 1.004);
        const tp = new THREE.Vector3(tx, ty, tz);
        const tb = createGroundBeacon(tp, currentAi.blackoutActive ? 0xf43f5e : 0x10b981, 0.025, 0.8, false);
        surfaceMarkersGroup.add(tb);
      });

      // Rescue route when NavIC is active
      if (currentNavic.distressBeaconActive) {
        const [rx, ry, rz] = latLngToVector3(
          currentNavic.rescueRouteWaypoint.lat,
          currentNavic.rescueRouteWaypoint.lng,
          1.006
        );
        const rescueVesselPos = new THREE.Vector3(rx, ry, rz);
        const vesselBeacon = createGroundBeacon(rescueVesselPos, 0x00f0ff, 0.04, 1.0, true);
        surfaceMarkersGroup.add(vesselBeacon);

        const rPosAttr = rescueRouteGeo.attributes.position as THREE.BufferAttribute;
        rPosAttr.setXYZ(0, rescueVesselPos.x, rescueVesselPos.y, rescueVesselPos.z);
        rPosAttr.setXYZ(1, sosPosLocal.x, sosPosLocal.y, sosPosLocal.z);
        rPosAttr.needsUpdate = true;
        rescueRouteLine.visible = true;
      } else {
        rescueRouteLine.visible = false;
      }

      // Convert SOS pin to earthGroup space for satellite beams
      const sosPosWorld = sosPosLocal.clone();
      earthMesh.localToWorld(sosPosWorld);
      const earthGroupLocalTarget = sosPosWorld.clone();
      earthGroup.worldToLocal(earthGroupLocalTarget);

      // NavIC rescue satellite → SOS beacon beam
      const navicSatPos = satellites[0].mesh.position;
      const posAttr1 = beamGeo1.attributes.position as THREE.BufferAttribute;
      posAttr1.setXYZ(0, navicSatPos.x, navicSatPos.y, navicSatPos.z);
      posAttr1.setXYZ(1, earthGroupLocalTarget.x, earthGroupLocalTarget.y, earthGroupLocalTarget.z);
      posAttr1.needsUpdate = true;
      rescueBeam1.visible = currentNavic.satelliteRelayLocked;

      // Radar satellite → country center beam
      const [gx, gy, gz] = latLngToVector3(loc.lat, loc.lng, 1.004);
      const countryCenterLocal = new THREE.Vector3(gx, gy, gz);
      const countryCenterWorld = countryCenterLocal.clone();
      earthMesh.localToWorld(countryCenterWorld);
      const earthGroupRadarTarget = countryCenterWorld.clone();
      earthGroup.worldToLocal(earthGroupRadarTarget);

      const radarSatPos = satellites[2].mesh.position;
      const posAttr2 = beamGeo2.attributes.position as THREE.BufferAttribute;
      posAttr2.setXYZ(0, radarSatPos.x, radarSatPos.y, radarSatPos.z);
      posAttr2.setXYZ(1, earthGroupRadarTarget.x, earthGroupRadarTarget.y, earthGroupRadarTarget.z);
      posAttr2.needsUpdate = true;
      radarBeam2.visible = true;

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // CLEANUP
    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('mousedown', handlePointerDown);
      renderer.domElement.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
      earthGeo.dispose();
      lightsGeo.dispose();
      cloudsGeo.dispose();
      glowGeo.dispose();
      earthMat.dispose();
      lightsMat.dispose();
      cloudsMat.dispose();
      fresnelMat.dispose();
    };
  }, []);

  // ── JSX ────────────────────────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative w-screen h-screen bg-[#020308] select-none overflow-hidden font-sans">
      {/* THREE.JS CANVAS */}
      <div ref={mountRef} className="w-full h-full" />

      {/* TOP NAV — global search + quick picks + live status */}
      <TopNav
        selectedLocation={selectedLocation}
        onSelectLocation={handleSelectLocation}
        liveMarine={liveMarine}
      />

      {/* RIGHT DRAWER — location telemetry, AI risk, SOS button */}
      <RightDrawer
        location={selectedLocation}
        isOpenOceanClick={isOpenOceanClick}
        clickedCoords={clickedCoords}
        aiPrediction={aiPrediction}
        navicPacket={navicPacket}
        liveMarine={liveMarine}
        onSendSos={handleSendSos}
      />

      {/* BOTTOM DOCK — 3-step guide + surge slider */}
      <BottomDock
        currentStep={derivedStep}
        surgeMeters={manualSurgeMeters}
        onChangeSurge={(val) => {
          setManualSurgeMeters(val);
          if (val >= 2.0 && currentStep === 1) setCurrentStep(2);
        }}
        onClickStep={handleStepClick}
        mobileStatus={aiPrediction.cellNetworkStatus}
        navicStatus={navicPacket.rescueStatus}
      />
    </div>
  );
}

export default App;
