# 🏟️ Stadium Assistant (Live Queue & Help)

A real-time, lightweight mobile assistant designed to help stadium attendees navigate large crowds and find the fastest routes during major events.

## 🚀 The Problem
Large stadium events are often chaotic. Attendees waste significant time standing in long lines for entry gates, food stalls, and washrooms, often missing key moments of the game. Information about accessible routes or medical help is also hard to find in a rush.

## ✨ Main Features
- **Live Queue Monitoring:** Real-time status updates (Low/Medium/High) for all stadium facilities.
- **Visual Status Board:** A simple oval stadium heatmap showing traffic levels at a glance.
- **AI Match Day Pro-Tips:** Smart, 1-sentence recommendations on where to go right now to save time.
- **Multi-Language Support:** Quickly toggle between **English** and **Hindi**.
- **Mobile-First Design:** Clean, simple interface for use in crowded environments.

### For Attendees (Fan Side)
- **Quick Shortcuts:** One-tap buttons for "Find My Gate", "Food Near Me", or "ADA Routes".
- **Explore Tab:** Detailed list of all locations with live wait times.
- **Help & Safety:** Dedicated pins for First Aid, Security, and Senior Assistance.

### For Stadium Staff (Admin Side)
- **PIN Protected Access:** Secure staff-only dashboard (Demo PIN: `1234`).
- **Live Updates:** Quickly update person counts and status tags for specific zones.
- **Unified Management:** Category-specific views for managing Gates, Food, and Safety points.

## 🤖 AI Usage
The app uses **Gemini 2.0 Flash** to analyze current crowd data across all zones and generate a helpful "Pro-tip" for the user. It identifies the least crowded entry points or food stalls and provides direct advice in the user's chosen language.

## 🛠 Tech Stack
- **Frontend:** React + Vite
- **Styling:** Tailwind CSS + Framer Motion (Animations)
- **Backend:** Node.js + Express (In-memory storage)
- **Icons:** Lucide React
- **AI:** Google Gemini API

## 📦 Local Setup (GitHub)

1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd stadium-assistant
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set Environment Variables:**
   Create a `.env` file in the root and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## 🏃 Run Steps (Baby Steps)

1. **Start the development server:**
   ```bash
   npm run dev
   ```
2. **Open the App:**
   Go to `http://localhost:3000` in your browser.

## 🧪 How to Test
1. **Fan View:** Browse the home page, toggle between English/Hindi, and check the "Explore" or "Live Updates" tabs.
2. **Admin Access:** Click the **"Admin Access"** button in the top right.
3. **Login:** Enter the demo PIN: `1234`.
4. **Update Data:** Change the status of a Food Plaza from "High" to "Low".
5. **Verify:** Switch back to Fan View to see the live update reflected on the heatmap and AI pro-tip.
