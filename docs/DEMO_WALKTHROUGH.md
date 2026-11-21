# Demo Walkthrough: ASTRA 2026 Interactive Experience

This guide provides a step-by-step walkthrough of the **ASTRA 2026** platform to replicate the experience demonstrated in our official demo video (`demo/DEMO_VIDEO.mp4`).

---

## 🎬 Demo Video
- **Location:** [`demo/DEMO_VIDEO.mp4`](../demo/DEMO_VIDEO.mp4)
- **Content:** Full screen recording showing global 3D Earth exploration, real-time coastal hazard analysis, mobile network blackout triggering, and NavIC satellite emergency beacon rescue dispatch.

---

## 🕹️ Interactive 3-Step Guided Storyline

### Step 1: Satellite Flood Watch
1. **Action:** Launch the platform or click **Step 1 — Flood Watch** in the bottom dock.
2. **Visual Feedback:**
   - 3D Earth renders with full Blue Marble surface textures, atmospheric rim glow, and orbiting satellite constellations.
   - Coastal cities display **Amber Warning Beacons** indicating baseline vulnerability.
   - The TopNav displays active connectivity to the live Open-Meteo Marine feed or 100+ coastal hubs.
   - RightDrawer telemetry shows normal coastal conditions, 4G/5G mobile connectivity, and sea swell data.

### Step 2: Storm Surge & Mobile Blackout
1. **Action:** Click **Step 2 — Storm & Blackout** in the bottom dock or drag the **Storm Surge** slider above `2.0m`.
2. **Visual Feedback:**
   - Coastal hazard indicators transition to **Pulsing Rose/Red**, signifying severe inundation depth ($+3.8\text{m}$).
   - Terrestrial cell towers submerge and fail: the mobile status flips to **`0 Bars — Dead`** (`Total Blackout`).
   - The phone and right-hand telemetry alert the user that terrestrial networks are completely non-functional.

### Step 3: NavIC Satellite Off-Grid Rescue
1. **Action:** Click **SEND NAVIC SATELLITE SOS** in the RightDrawer or select **Step 3 — NavIC Rescue** in the bottom dock.
2. **Visual Feedback:**
   - A bright **Cyan Satellite Beam** fires directly from the orbiting NavIC satellite down to the ground survivor coordinates.
   - A 3D dashed rescue route vector appears along the coastline linking an offshore Coast Guard vessel to the stranded community.
   - Telemetry confirms encrypted packet transmission over **NavIC L5 (1176.45 MHz)**, with live rescue ETA calculations.

---

## 🔍 Interactive Globe Inspection & Exploration
* **Country Quick-Picks:** Click any chip in the top navigation (India, Bangladesh, Netherlands, USA, Japan, Brazil, Indonesia) to trigger a smooth camera flight to that coastline.
* **100+ Global Search:** Open the search dropdown at the top right, search for any coastal city (e.g. *Miami*, *Rotterdam*, *Jakarta*, *Alexandria*, *Sydney*), and focus instantly.
* **Click-to-Inspect Any Coordinate:** Click anywhere on the 3D globe. The system performs an instantaneous spatial lookup via `findNearestCoastalHub()`:
  - If clicked on land/coastline: Snaps to the local coastal hub with exact geodetic coordinates, elevation, and population data.
  - If clicked in open ocean: Identifies the position as an open-sea point and routes off-grid distress metrics to the nearest coastal disaster relief hub.
