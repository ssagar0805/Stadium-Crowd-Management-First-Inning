# 🏟️ Q-Assistant: Stadium Ground Control

A high-fidelity, real-time command-and-control platform designed for stadium operations and fan navigation. This application bridges the gap between stadium staff and attendees, providing a live telemetry-driven experience to minimize congestion and maximize safety.

## 🚀 The Mission
Major sporting events face "The Surge" — where thousands of fans collide at gates, concessions, and exits simultaneously. **Q-Assistant** provides a live "Digital Twin" of the stadium, allowing staff to manage flow and fans to find the path of least resistance.

## ✨ Core Capabilities
- **Digital Twin Telemetry:** An interactive stadium heatmap that visualizes crowd density across North, South, East, West, and Pavilion sectors.
- **AI Strategy Advisor:** Powered by **Gemini 2.0 Flash**, the app analyzes live node data to generate tactical advice (e.g., "Shift to Gate 4—North entry is currently at 90% capacity").
- **Ground Control Dashboard:** A command center for staff to register "Strategy Nodes" (concessions, gates, washrooms) and update live intel.
- **Visual Intel (POD):** Staff can capture and upload live photos of crowd levels for visual verification of telemetry data.
- **Global Deployment:** Full native support for English and Hindi (हिन्दी) to serve diverse fanbases.

### 🛡️ For Operations (Staff View)
- **Node Management:** Register, update, or purge monitoring assets across the venue.
- **Live Ops Intel:** Add detailed telemetry observations (notes) to specific nodes.
- **Density Controls:** Real-time adjustment of person counts and status levels (Clear, Buffer, Heavy).
- **History Tracking:** Visual "Time-stack" showing exactly when a node was last updated.

### 🎫 For Attendees (Fan View)
- **Live Venue Map:** A high-contrast visual guide to stadium congestion.
- **Smart Shortcuts:** Instant routing to "Sustenance" (Food), "Hygiene" (Washrooms), or "Response" (Help) nodes.
- **ADA & Safety Priority:** Dedicated visibility for accessible routes and emergency medical nodes.

## 🤖 AI Engine
The application leverages the **Google GenAI SDK** to turn raw numbers into human-centric advice. By feeding the current state of all nodes into Gemini, it identifies patterns that a human might miss — like a ripple effect from a crowded gate to a nearby food plaza.

## 🛠 Tech Stack
- **Interface:** React 18 + Vite (Mobile-First Architecture)
- **Motion:** Framer Motion for tactical HUD animations and staggered transitions.
- **Styling:** Tailwind CSS (Modern Slate & Brand Orange palette).
- **Intelligence:** Google Gemini API (Flash 2.0).
- **Backend:** Node.js + Express (Real-time JSON synchronization).

## 🏃 Quick Start

1. **Install dependencies:** `npm install`
2. **Environment:** Add `GEMINI_API_KEY` to your secrets.
3. **Launch:** `npm run dev`
4. **Access:** Open `http://localhost:3000`.

## 🧪 Operational Testing
1. **Intelligence Check:** Switch to Hindi and witness the AI advisor translate tactical advice in real-time.
2. **Command Override:** Enter **Admin Access** (PIN: `1234`) and change the status of a gate to "High".
3. **Verification:** Observe the global stadium map switch that node to a red "Critical" alert state instantly.
