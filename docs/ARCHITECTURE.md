# System Architecture: ASTRA 2026 Space Platform

**ASTRA 2026: Satellite Coastal Flood Risk, Warning & NavIC Rescue Platform** combines three key space exploration domains into a single mission-grade interactive 3D digital twin:

1. **Domain 02:** Earth Observation & Satellite Applications
2. **Domain 03:** Space-Based Disaster Management
3. **Domain 04:** Satellite Communication, Navigation & Connectivity (ISRO NavIC / IRNSS)

---

## 🏛️ High-Level System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │               ORBITAL SATELLITE TIER                   │
                    │  • EO Constellation (Oceansat-3, Sentinel Radar SAR)  │
                    │  • NavIC Constellation (IRNSS Geosynchronous Beacons)  │
                    └─────────────────────────┬──────────────────────────────┘
                                              │ Live RF / Uplink / Downlink
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                             SPACE-BASED INTELLIGENCE ENGINE                                │
│                                                                                            │
│   [Domain 02: Earth Observation]          [Domain 03: Disaster Model]                     │
│   • Open-Meteo Marine Hydrological Feed   • Logistic Inundation Regression Model           │
│   • Global 100+ Coastal Hubs Dataset      • Cell Tower Drowning Probability Threshold      │
│   • Topographical Elevation Modeling      • Risk Classification (Normal/Moderate/Extreme)  │
└─────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                              │ Trigger SOS / Off-Grid State
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│               [Domain 04: Satellite Communication, Navigation & Connectivity]              │
│   • NavIC L5 (1176.45 MHz) & S-band (2492.028 MHz) Emergency Beacon Dispatch               │
│   • Structured Encrypted Distress Packet Generation (Coordinates, Risk Level, ID)          │
│   • Coast Guard Autonomous Rescue Vector Generation & Waypoint Routing                     │
└─────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                              │ Telemetry & Vector Binding
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 MISSION-GRADE 3D WEB CLIENT                                │
│   • Three.js WebGL Earth with -23.4° Axial Tilt & Equirectangular Sphere UV                │
│   • Real NASA Blue Marble Surface, Bump, Cloud Layer & Night City Illuminations            │
│   • Floating Borderless HUD (TopNav search, RightDrawer telemetry, BottomDock story mode)   │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛰️ Domain Breakdown & Technical Implementation

### 1. Domain 02: Earth Observation & Satellite Applications
* **Geospatial Coastal Mapping:** High-resolution multi-spectral optical and SAR satellite imagery (Sentinel, Oceansat-3, CartoSAT-3) modeled through a curated database of 100+ vulnerable coastal hubs worldwide.
* **Topography & Elevation:** Each hub incorporates digital elevation model (DEM) metrics to accurately evaluate vulnerable sea walls, coastal plains, and delta communities.
* **Live Marine Telemetry:** Integration with Open-Meteo Marine API (`src/services/liveCoastalFeed.ts`) fetching real-time wave heights, swell data, and meteorological conditions with sub-second fallback to pre-built high-resolution dataset entries.

### 2. Domain 03: Space-Based Disaster Management
* **Deterministic AI Inundation Engine:** `src/simulation/aiFloodModel.ts` executes a multi-factor logistic regression model factoring in:
  - Simulated / Live storm surge height ($w_{\text{surge}} = 1.85$)
  - Terrain elevation ($w_{\text{elev}} = -1.45$)
  - Proximity to shoreline ($w_{\text{shore}} = 1.15$)
  - Settlement & infrastructure density ($w_{\text{infra}} = 0.65$)
* **Infrastructure Resilience Modeling:** Simulates cellular base transceiver station (BTS) submergence. When surge exceeds local elevation thresholds, cellular infrastructure fails, switching the grid state to `Total Blackout (0 Bars)`.

### 3. Domain 04: Satellite Communication & NavIC Off-Grid Relay
* **ISRO NavIC Architecture:** When terrestrial networks fail, the application initiates an off-grid satellite emergency communication protocol via NavIC (`src/simulation/navicRelay.ts`).
* **Emergency Messaging Protocol:**
  - **Frequencies:** NavIC L5 (1176.45 MHz) and S-Band (2492.028 MHz) short-message service (SMS).
  - **Packet Structure:** Encrypted timestamp, geodetic coordinates, AI flood severity tier, citizen count, and emergency priority rating.
* **Autonomous Search & Rescue (SAR):** Once a distress packet is locked, an orbital downlink establishes a direct line-of-sight rescue beam from the geostationary NavIC satellite down to the ground coordinates, calculating real-time offshore vessel waypoints and rescue ETA.

---

## 🎨 3D Graphics & Spatial Alignment
* **Equirectangular SphereGeometry:** Strict spherical mapping ($R=1.0$, 96 horizontal segments, 64 vertical segments) ensures 100% precision between geographic coordinates $(lat, lng)$ and Three.js 3D vectors.
* **Rotation-Locked Beacons:** All surface pins, cellular tower status markers, and flood beacons are anchored directly to the rotating Earth mesh rather than the parent coordinate system, eliminating visual drift during orbital spin.
* **Real-time Raycasting:** High-performance intersection testing lets users click anywhere on Earth to instantly snap to the nearest coastal hub with distance calculations and ocean proximity detection.
