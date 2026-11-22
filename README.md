# ASTRA 2026: Satellite Coastal Flood Risk, Warning & NavIC Rescue Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-astra--2026--coastal--navic.vercel.app-00dfa2?style=for-the-badge&logo=vercel&logoColor=black)](https://astra-2026-coastal-navic.vercel.app/)
[![ASTRA 2026](https://img.shields.io/badge/ASTRA-2026-0284c7?style=for-the-badge&logo=spacex&logoColor=white)](https://github.com/chaitanya1906/astra-2026-coastal-navic.git)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![ISRO NavIC](https://img.shields.io/badge/ISRO-NavIC%20Relay-f59e0b?style=for-the-badge)](https://www.isro.gov.in/)

An interactive, mission-grade 3D Earth digital twin unifying Earth Observation, Space-Based Disaster Management, and Satellite/NavIC Emergency Communication. Designed to visualize coastal inundation risks, simulate cellular infrastructure failure during extreme cyclones, and demonstrate direct-to-satellite rescue routing via India's NavIC constellation.

🌐 **Live Application:** [https://astra-2026-coastal-navic.vercel.app/](https://astra-2026-coastal-navic.vercel.app/)  
📂 **Source Repository:** [https://github.com/chaitanya1906/astra-2026-coastal-navic.git](https://github.com/chaitanya1906/astra-2026-coastal-navic.git)  
🎬 **Demo Video:** [`demo/DEMO_VIDEO.mp4`](demo/DEMO_VIDEO.mp4) (Tracked with Git LFS)

---

## 🎯 Central Theme & Interdisciplinary Domains

* **Domain 02: Earth Observation & Satellite Applications**  
  Multi-spectral satellite data, digital elevation models (DEM), and live coastal swell telemetry from the Open-Meteo Marine API across 100+ global coastal cities.
* **Domain 03: Space-Based Disaster Management**  
  Deterministic AI inundation modeling and real-time cellular tower failure prediction based on storm surge depth and terrain elevation.
* **Domain 04: Satellite Communication, Navigation & Connectivity**  
  Off-grid emergency messaging protocol emulating ISRO NavIC L5 (1176.45 MHz) / S-Band emergency distress packets and offshore rescue vessel routing.

---

## 🚀 Key Features

1. **Mission-Grade 3D Earth Globe:**
   - Real NASA Blue Marble day/night albedo textures, normal bump maps, and realistic atmospheric Fresnel rim glow.
   - Exact -23.4° axial tilt with mathematically aligned equirectangular $(lat, lng) \rightarrow (x, y, z)$ projection.
   - Rotation-locked surface markers and 4 physical 3D satellites in realistic inclined orbits with live tracking beams.

2. **Global Coastal Dataset & Live Marine Telemetry:**
   - Curated geospatial database containing 100+ vulnerable coastal cities, deltas, and islands across all continents.
   - Live integration with the Open-Meteo Marine & Flood API (real-time wave height, wind, and swell metrics) with automatic offline fallback.
   - Click-to-inspect raycasting with smart nearest-coastal-hub spatial snapping.

3. **AI Flood & Outage Prediction Engine:**
   - Deterministic multi-factor logistic regression model estimating flood risk score (0-100%), water depth, and cell blackout probability.
   - Interactive surge slider simulating real-time progression from normal status to total communication blackout.

4. **NavIC Satellite Emergency SOS:**
   - One-click off-grid distress beacon generating encrypted NavIC emergency packets with citizen count, risk tier, and GPS fix.
   - Overhead NavIC satellite locks a direct optical beam to ground zero, plotting dynamic 3D rescue routes for Coast Guard vessels.

5. **Borderless Floating HUD:**
   - Minimalist, glassmorphic floating UI that keeps the 3D globe unobstructed.
   - Non-clipping fixed search dropdown, compact top-left branding, and an interactive 3-step bottom story dock.

---

## 📂 Project Structure

```
├── demo/
│   └── DEMO_VIDEO.mp4             # High-definition platform walkthrough video (Git LFS)
├── docs/
│   ├── ARCHITECTURE.md            # In-depth architectural blueprint covering Domains 02, 03 & 04
│   └── DEMO_WALKTHROUGH.md        # Step-by-step user guide matching the demo recording
├── public/
│   └── textures/                  # Real NASA Earth day, night, bump, and cloud textures
├── src/
│   ├── components/
│   │   ├── TopNav.tsx             # Fixed search dropdown (100+ hubs) & quick-pick chips
│   │   ├── RightDrawer.tsx        # Borderless floating coastal telemetry & NavIC SOS control
│   │   └── BottomDock.tsx         # 3-Step Guided Storyline & storm surge simulation slider
│   ├── data/
│   │   ├── globalCoastalDataset.ts# Geospatial database of 100+ coastal hubs with spatial lookup
│   │   ├── globeOutlines.ts       # 3D geographic boundaries & coastline vector coordinates
│   │   └── worldCountries.ts      # Coordinate conversion utilities
│   ├── scene/
│   │   ├── createEarthTextures.ts # Texture loader with automatic procedural Canvas fallbacks
│   │   ├── getFresnelMat.ts       # Custom atmospheric rim glow shader
│   │   └── getStarfield.ts        # 2,000-point deep space background generator
│   ├── services/
│   │   └── liveCoastalFeed.ts     # Open-Meteo Marine API client with in-memory caching
│   ├── simulation/
│   │   ├── aiFloodModel.ts        # Logistic regression inundation & tower failure engine
│   │   ├── navicRelay.ts          # NavIC L5/S-Band packet synthesis & rescue router
│   │   └── disasterRescueModel.ts # Legacy simulation state compatibility
│   ├── types/
│   │   └── lucide.d.ts            # Type declarations for UI icons
│   ├── App.tsx                    # Main WebGL coordinator & 3D animation loop
│   └── main.tsx                   # React 18 DOM entry point
├── .gitattributes                 # Git LFS configuration for MP4 and large binary media
├── .gitignore                     # Git ignore rules (node_modules, dist, cache)
├── package.json                   # Dependencies, homepage, and scripts
├── vercel.json                    # Vercel SPA routing rules
└── vite.config.ts                 # Vite build configuration
```

---

## 🛠️ Setup & Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Git](https://git-scm.com/) and [Git LFS](https://git-lfs.github.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/chaitanya1906/astra-2026-coastal-navic.git
   cd astra-2026-coastal-navic
   ```

2. **Pull Git LFS assets (Demo Video):**
   ```bash
   git lfs pull
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Launch development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🌐 Live Data & Fallback Strategy

* **Primary Hydrological Data:** Fetched in real time from Open-Meteo Marine API (`https://marine-api.open-meteo.com/v1/marine`) using the user-selected or clicked $(lat, lng)$. No API key required.
* **Resilient Offline Fallback:** If internet access is unavailable or response times exceed 2,500ms, the platform seamlessly switches to pre-built baseline elevation and wave data from `globalCoastalDataset.ts` with zero interruption or error dialogues.

---

## 🤝 Acknowledgments & Space Mission Alignments
- **ISRO (Indian Space Research Organisation):** NavIC / IRNSS constellation standards, Bhuvan, MOSDAC, and VEDAS disaster management frameworks.
- **NASA Earth Observatory:** Visible Earth Blue Marble imagery textures.
- **Open-Meteo:** Open-access marine and oceanographic weather models.
- **Vercel:** Production hosting at [https://astra-2026-coastal-navic.vercel.app/](https://astra-2026-coastal-navic.vercel.app/).
